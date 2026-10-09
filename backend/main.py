"""
YOLOv8 AI Face Recognition & Security API v5.0
Uses InsightFace (SCRFD detection + ArcFace recognition) for face analysis.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import tempfile
import shutil
import asyncio
import time
import os
from typing import Optional, List

from face_registry import get_registry

app = FastAPI(title="AI Face Recognition & Security API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load InsightFace (detection + recognition in one call) ──
print("[Server] Loading InsightFace (SCRFD + ArcFace)...")
from scanner.detector import FaceDetector
from scanner.recognizer import FaceRecognizer

_detector = FaceDetector(ctx_id=-1, det_size=(640, 640))
_recognizer = FaceRecognizer(threshold=0.45)
print("[Server] InsightFace loaded!")

# ── Load face database ──
print("[Server] Loading Face Database...")
face_db = get_registry()
print(f"[Server] Face Database: {face_db.get_person_count()} person(s).")

# ── Gallery face index (pre-index ใบหน้าจากรูปกิจกรรมทั้งหมด) ──
# ค้นหาคน = เทียบเวกเตอร์กับ index นี้อย่างเดียว ไม่ต้องโหลดรูปกิจกรรมอีก
import json as _json

GALLERY_INDEX_PATH = os.path.join(os.path.dirname(__file__), "gallery_index.json")
_gallery_cache = {"mtime": 0, "faces": [], "matrix": None}


def _get_gallery_index():
    """โหลด gallery_index.json แบบ cache (โหลดใหม่เมื่อไฟล์เปลี่ยน เช่น build ค้างอยู่)."""
    global _gallery_cache
    try:
        mtime = os.path.getmtime(GALLERY_INDEX_PATH)
    except OSError:
        return [], None
    if mtime != _gallery_cache["mtime"]:
        try:
            with open(GALLERY_INDEX_PATH, "r", encoding="utf-8") as f:
                data = _json.load(f)
            faces = data.get("faces", [])
            mat = None
            if faces:
                vecs = []
                for fc in faces:
                    v = np.asarray(fc.get("embedding", []), dtype=np.float32).ravel()
                    n = float(np.linalg.norm(v))
                    vecs.append(v / n if n > 0 else v)
                mat = np.stack(vecs)
            _gallery_cache = {"mtime": mtime, "faces": faces, "matrix": mat}
            print(f"[Server] Gallery index loaded: {len(faces)} faces.")
        except Exception as e:
            print(f"[Server] Gallery index load failed: {e}")
            return [], None
    return _gallery_cache["faces"], _gallery_cache["matrix"]


# ── Request models ──
class RecognizeFaceRequest(BaseModel):
    url: Optional[str] = None
    image_base64: Optional[str] = None
    threshold: float = 0.45
    # Frontend ส่งมา 2 ฟิลด์นี้ (เดิม backend ไม่รู้จัก -> โดนทิ้ง)
    target_url: Optional[str] = None
    target_image_base64: Optional[str] = None
    target_images_base64: Optional[List[str]] = None
    target_name: Optional[str] = None

    model_config = {"extra": "allow"}


class UrlDetectRequest(BaseModel):
    url: Optional[str] = None
    image_base64: Optional[str] = None


class SearchPersonRequest(BaseModel):
    """ค้นหาบุคคลเป้าหมายในรูปกิจกรรมทั้งหมดผ่าน gallery index (ไม่ต้องโหลดรูปกิจกรรม).
    ส่งรูปเป้าหมายได้หลายมุม (target_images_base64 สูงสุด ~5) ยิ่งหลายมุมยิ่งแม่น."""

    url: Optional[str] = None
    image_base64: Optional[str] = None
    target_url: Optional[str] = None
    target_image_base64: Optional[str] = None
    target_images_base64: Optional[List[str]] = None
    target_name: Optional[str] = None
    threshold: float = 0.45
    top_k: int = 50

    model_config = {"extra": "allow"}


# ── Helper functions ──
def _decode_base64_image(b64: str) -> np.ndarray:
    if ',' in b64 and b64.startswith('data:'):
        b64 = b64.split(',', 1)[1]
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode base64 image")
    return img


def _download_image(url: str) -> np.ndarray:
    import urllib.request
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Cannot decode downloaded image")
    return img


def _load_image(url: Optional[str] = None, image_base64: Optional[str] = None) -> np.ndarray:
    if image_base64:
        return _decode_base64_image(image_base64)
    elif url:
        return _download_image(url)
    else:
        raise ValueError("No image provided")


def _normalize_threshold(t: float) -> float:
    """รับ threshold จาก frontend: สเกล 40-99 (หรือ 0.40-0.99) -> map เป็น cosine similarity 0.20-0.65."""
    try:
        t = float(t)
    except Exception:
        return 0.40
    if t > 1.0:  # 40-99 -> /100
        t = t / 100.0
    # map เชิงเส้น: 0.40 -> 0.22, 0.70 -> 0.35, 0.85 -> 0.45, 0.99 -> 0.60
    t = 0.22 + (max(0.40, min(1.0, t)) - 0.40) / 0.60 * (0.60 - 0.22)
    return max(0.18, min(0.70, t))


def _target_embeddings_override(target_url: Optional[str] = None,
                                target_b64: Optional[str] = None,
                                tta_flip: bool = False):
    """ถ้า frontend ส่งรูปเป้าหมายมาด้วย -> สกัด embedding สด ไม่พึ่ง face_database.json.
    tta_flip=True แถม embedding ของรูปกลับด้าน (test-time augmentation) ช่วยให้ทนมุม/แสงดีขึ้น."""
    try:
        if target_b64:
            img = _decode_base64_image(target_b64)
        elif target_url:
            img = _download_image(target_url)
        else:
            return None
        variants = [img]
        if tta_flip and img is not None:
            try:
                variants.append(cv2.flip(img, 1))
            except Exception:
                pass
        embs = []
        for v in variants:
            faces = _detector.detect(v)
            if not faces:
                continue
            best = max(faces, key=lambda f: f["det_score"])
            embs.append(best["embedding"])
        return embs or None
    except Exception as e:
        print(f"[Server] target override failed: {e}")
        return None


def _collect_target_embeddings(req) -> list:
    """รวม embedding เป้าหมายจาก request (หลายมุม + flip TTA), คืน [] ถ้าไม่มี."""
    override: list = []
    for b in [x for x in (getattr(req, "target_images_base64", None) or []) if x][:15]:
        try:
            e = _target_embeddings_override(None, b, tta_flip=True)
        except Exception:
            e = None
        if e:
            override.extend(e)
    if not override and getattr(req, "target_image_base64", None):
        e = _target_embeddings_override(None, req.target_image_base64, tta_flip=True)
        if e:
            override.extend(e)
    if not override and getattr(req, "target_url", None):
        e = _target_embeddings_override(req.target_url, None, tta_flip=True)
        if e:
            override.extend(e)
    return override


def _process_image(img: np.ndarray, threshold: float = 0.45,
                   override_embeddings=None, override_name: Optional[str] = None) -> dict:
    """
    Full InsightFace pipeline:
    1. Detect all faces (SCRFD)
    2. Extract embeddings (ArcFace)
    3. Count total people
    4. Match against target profile (หรือรูปที่ frontend ส่งมา)
    """
    t0 = time.time()
    threshold = _normalize_threshold(threshold)

    # Step 1+2: Detect faces + extract embeddings (InsightFace does both)
    detected_faces = _detector.detect(img)

    # Step 3: Count people = number of detected faces
    person_count = len(detected_faces)

    # Step 4: Match against target profile
    target = face_db.get_target_profile()
    target_embeddings = list(override_embeddings) if override_embeddings else []
    target_name = (override_name or "").strip() or "Target"
    target_role = ""
    if not target_embeddings and target:
        target_embeddings = target.get("embeddings", [])
        target_name = target.get("name", "Target")
        target_role = target.get("role", "")
    face_matches = []

    if target_embeddings and detected_faces:
        if target_embeddings:
            matches = _recognizer.match_faces(
                detected_faces,
                target_embeddings,
                target_name=target_name,
                threshold=threshold,
            )
            for m in matches:
                face_matches.append({
                    "face_id": m["face_id"],
                    "center_x_pct": m["bbox_pct"]["center_x_pct"],
                    "center_y_pct": m["bbox_pct"]["center_y_pct"],
                    "width_pct": m["bbox_pct"]["width_pct"],
                    "height_pct": m["bbox_pct"]["height_pct"],
                    "is_target": m["is_target"],
                    "match_name": m["name"],
                    "match_role": target_role,
                    "match_confidence": m["confidence"],
                    "similarity": m["similarity"],
                    "det_score": m["det_score"],
                })
        else:
            # No embeddings stored yet
            for i, f in enumerate(detected_faces):
                face_matches.append({
                    "face_id": i + 1,
                    "center_x_pct": f["bbox_pct"]["center_x_pct"],
                    "center_y_pct": f["bbox_pct"]["center_y_pct"],
                    "width_pct": f["bbox_pct"]["width_pct"],
                    "height_pct": f["bbox_pct"]["height_pct"],
                    "is_target": False,
                    "match_name": None,
                    "match_role": None,
                    "match_confidence": 0,
                    "similarity": 0,
                    "det_score": f["det_score"],
                })
    else:
        # No target registered or no faces detected
        for i, f in enumerate(detected_faces):
            face_matches.append({
                "face_id": i + 1,
                "center_x_pct": f["bbox_pct"]["center_x_pct"],
                "center_y_pct": f["bbox_pct"]["center_y_pct"],
                "width_pct": f["bbox_pct"]["width_pct"],
                "height_pct": f["bbox_pct"]["height_pct"],
                "is_target": False,
                "match_name": None,
                "match_role": None,
                "match_confidence": 0,
                "similarity": 0,
                "det_score": f["det_score"],
            })

    matched_count = len([f for f in face_matches if f["is_target"]])
    elapsed_ms = round((time.time() - t0) * 1000)

    return {
        "success": True,
        "person_count": person_count,
        "face_count": len(face_matches),
        "matched_count": matched_count,
        "face_matches": face_matches,
        "processing_ms": elapsed_ms,
        "ai_engines": {
            "face_detection": "InsightFace SCRFD",
            "face_alignment": "InsightFace",
            "face_recognition": "ArcFace (512-D)",
            "matching": "Cosine Similarity",
        },
    }


# ── API Endpoints ──
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "InsightFace AI Face Recognition & Security API",
        "version": "5.0.0",
        "engine": "InsightFace (SCRFD + ArcFace)",
        "face_database": {
            "persons_registered": face_db.get_person_count(),
            "persons": face_db.get_registered_persons(),
        },
    }


@app.get("/face-status")
async def face_status():
    return {
        "success": True,
        "database_loaded": face_db.is_loaded(),
        "persons_count": face_db.get_person_count(),
        "persons": face_db.get_registered_persons(),
    }


@app.get("/gallery-index-status")
async def gallery_index_status():
    """สถานะ pre-index รูปกิจกรรม (ถ้า build ค้างอยู่ ตัวเลขจะค่อยๆ เพิ่ม)."""
    faces, _ = _get_gallery_index()
    images = {f.get("image_url") for f in faces}
    return {
        "success": True,
        "index_built": len(faces) > 0,
        "images_indexed": len(images),
        "faces_total": len(faces),
    }


@app.post("/search-person")
async def search_person(req: SearchPersonRequest):
    """
    ใส่รูปคน 1 รูป -> ค้นทุกใบหน้าที่สกัดไว้ล่วงหน้าใน gallery index
    ไม่ต้องโหลด/สแกนรูปกิจกรรมใหม่ (เร็ว: เทียบเวกเตอร์อย่างเดียว).
    คืนรูปที่เจอเป้าหมาย เรียง confidence มาก -> น้อย (best match ต่อรูป).
    """
    t0 = time.time()
    faces, mat = _get_gallery_index()
    if mat is None or len(faces) == 0:
        return {"success": False, "error": "Gallery index is empty. Run backend/build_gallery_index.py first."}

    # รูปเป้าหมาย: รับได้หลายมุม (flip ทุกรูปเป็น TTA) แล้วเทียบแบบ max
    b64_list = [b for b in (req.target_images_base64 or []) if b][:15]
    if not b64_list and req.target_image_base64:
        b64_list = [req.target_image_base64]
    url_list = ([req.target_url] if req.target_url else []) + \
               (([req.url] if req.url else []) if not b64_list else [])
    if not b64_list and req.image_base64:
        b64_list = [req.image_base64]

    target_vecs = []
    for b in b64_list:
        e = _target_embeddings_override(None, b, tta_flip=True)
        if e:
            target_vecs.extend(e)
    for u in url_list[:2]:
        e = _target_embeddings_override(u, None, tta_flip=True)
        if e:
            target_vecs.extend(e)
    if not target_vecs:
        return {"success": False, "error": "No face detected in target image(s)"}
    T = []
    for emb in target_vecs:
        v = np.asarray(emb, dtype=np.float32).ravel()
        n = float(np.linalg.norm(v))
        T.append(v / n if n > 0 else v)
    T = np.stack(T)  # Mx512

    threshold = _normalize_threshold(req.threshold)
    sims = (mat @ T.T).max(axis=1).tolist()  # max ทั้งหลายมุม+flip = ความเหมือนที่ดีที่สุด

    # เก็บ best match ต่อรูป
    best_per_image: dict = {}
    for fc, s in zip(faces, sims):
        if s < threshold:
            continue
        key = fc.get("image_url")
        prev = best_per_image.get(key)
        if prev is None or s > prev["similarity"]:
            best_per_image[key] = {
                "image_url": key,
                "activity_id": fc.get("activity_id"),
                "title": fc.get("title", ""),
                "date": fc.get("date", ""),
                "where": fc.get("where", ""),
                "year": fc.get("year"),
                "center_x_pct": fc["bbox_pct"]["center_x_pct"],
                "center_y_pct": fc["bbox_pct"]["center_y_pct"],
                "width_pct": fc["bbox_pct"]["width_pct"],
                "height_pct": fc["bbox_pct"]["height_pct"],
                "similarity": round(float(s), 4),
                "match_confidence": round(float(s * 100.0), 2),
                "det_score": fc.get("det_score", 0),
            }

    matches = sorted(best_per_image.values(), key=lambda m: m["similarity"], reverse=True)
    top_k = max(1, min(int(req.top_k or 50), 5000))
    matches = matches[:top_k]
    elapsed_ms = round((time.time() - t0) * 1000)
    return {
        "success": True,
        "target_name": (req.target_name or "").strip() or "Target",
        "target_views": len(target_vecs),
        "threshold_used": threshold,
        "images_searched": len({f.get("image_url") for f in faces}),
        "faces_compared": len(faces),
        "matched_images": len(matches),
        "matches": matches,
        "processing_ms": elapsed_ms,
    }


@app.post("/recognize-face")
async def recognize_face(req: RecognizeFaceRequest):
    """
    Full face recognition pipeline:
    1. Load image (from URL or base64)
    2. InsightFace detects all faces + extracts embeddings
    3. Compare each face against target profile (DB หรือรูปที่ frontend ส่งมา)
    4. Return bounding boxes + match results
    """
    try:
        img = _load_image(url=req.url, image_base64=req.image_base64)
        # รูปเป้าหมายจาก frontend (หลายมุมได้ + flip TTA) สำคัญกว่า DB
        override = _collect_target_embeddings(req)
        loop = asyncio.get_event_loop()
        import functools
        fn = functools.partial(
            _process_image, img, req.threshold,
            override, req.target_name,
        )
        result = await loop.run_in_executor(None, fn)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class RecognizeBatchRequest(BaseModel):
    """สแกนหลายรูปใน request เดียว (การ์ดผลลัพธ์ auto-scan ขึ้นเขียว/แดงทุกใบ)."""
    image_urls: List[str] = []
    target_images_base64: Optional[List[str]] = None
    target_image_base64: Optional[str] = None
    target_url: Optional[str] = None
    target_name: Optional[str] = None
    threshold: float = 0.45
    max_images: int = 20

    model_config = {"extra": "allow"}


@app.post("/recognize-batch")
async def recognize_batch(req: RecognizeBatchRequest):
    """
    สแกนรูปหลายใบเทียบเป้าหมายเดียว: สกัด target embeddings ครั้งเดียว
    แล้วไล่ detect+match ทีละรูป (บน GPU ใบละ ~0.1-0.5 วิ).
    คืน face_matches (เขียว/แดง) ครบทุกรูปที่โหลดได้.
    """
    urls = [u for u in (req.image_urls or []) if u][:max(1, min(int(req.max_images or 20), 30))]
    if not urls:
        return {"success": False, "error": "No image_urls provided"}
    override = _collect_target_embeddings(req)
    loop = asyncio.get_event_loop()
    import functools

    def _one(url: str) -> dict:
        try:
            img = _download_image(url)
            out = _process_image(img, req.threshold, override or None, req.target_name)
            return {"image_url": url, "success": True,
                    "person_count": out.get("person_count", 0),
                    "face_matches": out.get("face_matches", [])}
        except Exception as e:
            return {"image_url": url, "success": False, "error": str(e)[:200]}

    results = []
    for u in urls:
        fn = functools.partial(_one, u)
        results.append(await loop.run_in_executor(None, fn))
    return {"success": True, "results": results}


@app.post("/detect-url")
async def detect_url(req: UrlDetectRequest):
    """Detect faces in an image (count + bounding boxes)."""
    try:
        img = _load_image(url=req.url, image_base64=req.image_base64)
        loop = asyncio.get_event_loop()

        def _detect_only(image):
            t0 = time.time()
            detected = _detector.detect(image)
            elapsed_ms = round((time.time() - t0) * 1000)
            boxes = []
            for i, f in enumerate(detected):
                boxes.append({
                    "face_id": i + 1,
                    "center_x_pct": f["bbox_pct"]["center_x_pct"],
                    "center_y_pct": f["bbox_pct"]["center_y_pct"],
                    "width_pct": f["bbox_pct"]["width_pct"],
                    "height_pct": f["bbox_pct"]["height_pct"],
                    "det_score": f["det_score"],
                    "is_target": False,
                    "match_name": None,
                    "match_confidence": 0,
                })
            return {
                "success": True,
                "person_count": len(boxes),
                "face_count": len(boxes),
                "boxes": boxes,
                "processing_ms": elapsed_ms,
            }

        result = await loop.run_in_executor(None, _detect_only, img)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train-face")
async def train_face(req: RecognizeFaceRequest):
    """
    Register a target face from a single image.
    Detects the face, extracts embedding, stores in database.
    """
    try:
        img = _load_image(url=req.url, image_base64=req.image_base64)
        loop = asyncio.get_event_loop()

        def _register(image):
            detected = _detector.detect(image)
            if not detected:
                return {"success": False, "error": "No face detected in image"}

            # Use the face with highest detection score
            best = max(detected, key=lambda f: f["det_score"])
            embedding = best["embedding"]

            # Get or create target profile
            target = face_db.get_target_profile()
            if target:
                person_id = target["id"]
                face_db.add_embeddings(person_id, [embedding])
            else:
                face_db.register_person(
                    person_id="wichcha_chimploy",
                    name="ดร.วิชชา ฉิมพลี",
                    role="ประธานสภาคณาจารย์และพนักงาน",
                    title="ผู้ช่วยศาสตราจารย์ ดร.",
                    embeddings=[embedding],
                )
                person_id = "wichcha_chimploy"

            return {
                "success": True,
                "person_id": person_id,
                "total_embeddings": face_db.get_person_count(),
                "det_score": round(float(best["det_score"]), 2),
            }

        result = await loop.run_in_executor(None, _register, img)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

