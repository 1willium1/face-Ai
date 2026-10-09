"""
build_gallery_index.py — สกัดใบหน้าจากรูปกิจกรรมทั้งหมด "ครั้งเดียว" แล้วเก็บ
embedding ลง backend/gallery_index.json (pre-index)

หลังจากนี้การค้นหาคน = เทียบเวกเตอร์อย่างเดียว ไม่ต้องโหลดรูปกิจกรรมอีก

วิธีใช้:
  cd backend && python build_gallery_index.py                       # ทุกรูป ทุกกิจกรรม
  cd backend && python build_gallery_index.py --limit-per-activity 2 # กิจกรรมละ 2 รูป (เร็ว, 168 รูป)
  cd backend && python build_gallery_index.py --max-images 50        # ทดสอบ 50 รูปแรก
  cd backend && python build_gallery_index.py --rebuild              # ล้างแล้วเริ่มใหม่

- resume อัตโนมัติ: ข้าม image_url ที่มีใน index แล้ว (รันซ้ำได้ปลอดภัย)
- Ctrl+C หยุดได้ รันต่อคราวหน้าเริ่มจากที่ค้าง
"""
import argparse
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_DATA = os.path.join(HERE, "..", "src", "data")
INDEX_PATH = os.path.join(HERE, "gallery_index.json")

sys.path.insert(0, HERE)
from scanner.detector import FaceDetector


def load_activities():
    acts = []
    for name in ("activities.json", "activities_events.json"):
        p = os.path.join(SRC_DATA, name)
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            print("[index] loaded %d activities from %s" % (len(data), name))
            acts.extend(data)
    return acts


def load_index():
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            idx = json.load(f)
        print("[index] resume: %d images, %d faces already indexed"
              % (idx.get("stats", {}).get("images_indexed", 0),
                 len(idx.get("faces", []))))
        return idx
    return {"version": "1.0", "model": "InsightFace buffalo_l (SCRFD+ArcFace 512-D)",
            "stats": {}, "faces": []}


def save_index(idx):
    faces = idx["faces"]
    imgs = {f["image_url"] for f in faces}
    idx["stats"] = {"images_indexed": len(imgs), "faces_total": len(faces),
                    "built_at": time.strftime("%Y-%m-%d %H:%M:%S")}
    tmp = INDEX_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(idx, f, ensure_ascii=False)
    for attempt in range(5):
        try:
            os.replace(tmp, INDEX_PATH)
            break
        except (PermissionError, OSError):
            time.sleep(0.5)


def download_image(url, timeout=20):
    import urllib.parse
    import numpy as np
    import cv2
    parts = urllib.parse.urlsplit(url)
    clean_path = urllib.parse.quote(urllib.parse.unquote(parts.path))
    encoded_url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, clean_path, parts.query, parts.fragment))
    req = urllib.request.Request(encoded_url, headers={"User-Agent": "Mozilla/5.0"})

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = resp.read()
            arr = np.frombuffer(data, np.uint8)
            return cv2.imdecode(arr, cv2.IMREAD_COLOR)
        except Exception:
            if attempt < 2:
                time.sleep(1.5)
            else:
                raise
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit-per-activity", type=int, default=0,
                    help="กิจกรรมละ N รูป (0 = ทุกรูป)")
    ap.add_argument("--max-images", type=int, default=0, help="จำกัดรูปทั้งหมด (0 = ไม่จำกัด)")
    ap.add_argument("--rebuild", action="store_true", help="ล้าง index แล้วเริ่มใหม่")
    args = ap.parse_args()

    if args.rebuild and os.path.exists(INDEX_PATH):
        os.remove(INDEX_PATH)
        print("[index] cleared old index")

    activities = load_activities()
    if not activities:
        print("[index] no activities found!")
        return

    idx = load_index()
    done_urls = {f["image_url"] for f in idx["faces"]}
    # นับรูปที่เคยพยายามแต่ไม่เจอหน้า (กันโหลดซ้ำรอบหน้า)
    skip_urls = set(idx.get("stats", {}).get("empty_images", []))

    print("[index] loading InsightFace...")
    det = FaceDetector(ctx_id=-1, det_size=(640, 640))
    print("[index] ready.")

    tasks = []
    for act in activities:
        imgs = act.get("images", [])
        if args.limit_per_activity > 0:
            imgs = imgs[:args.limit_per_activity]
        meta = {"activity_id": act.get("id"), "title": act.get("title", ""),
                "date": act.get("date", ""), "where": act.get("where", ""),
                "year": act.get("year")}
        for url in imgs:
            if url not in done_urls and url not in skip_urls:
                tasks.append((url, meta))

    print("[index] Remaining images to process: %d" % len(tasks))
    if not tasks:
        print("[index] All images already indexed!")
        return

    import concurrent.futures
    new_faces = new_imgs = empty_imgs = 0
    t0 = time.time()
    batch_size = 32

    def fetch(item):
        u, m = item
        try:
            im = download_image(u)
            return u, m, im
        except Exception:
            return u, m, None

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
            for i in range(0, len(tasks), batch_size):
                batch = tasks[i:i+batch_size]
                results = list(executor.map(fetch, batch))
                for url, meta, img in results:
                    if img is None:
                        continue
                    try:
                        faces = det.detect(img)
                    except Exception:
                        continue
                    if not faces:
                        skip_urls.add(url)
                        empty_imgs += 1
                    for fc in faces:
                        idx["faces"].append({
                            "image_url": url, "bbox_pct": fc["bbox_pct"],
                            "det_score": fc["det_score"], "embedding": fc["embedding"],
                            **meta,
                        })
                        new_faces += 1
                    new_imgs += 1

                idx.setdefault("stats", {})["empty_images"] = sorted(skip_urls)
                save_index(idx)
                el = time.time() - t0
                speed = (new_imgs + empty_imgs) / max(el, 1)
                print("[TURBO-INDEX] %d imgs (+%d empty), %d faces | %.1f imgs/sec (Total: %d)"
                      % (new_imgs, empty_imgs, new_faces, speed, len(idx["faces"])))

                if args.max_images and (new_imgs + empty_imgs) >= args.max_images:
                    break
    except KeyboardInterrupt:
        print("\n[index] interrupted, saving progress...")

    idx.setdefault("stats", {})["empty_images"] = sorted(skip_urls)
    save_index(idx)
    print("[index] DONE. images=%d faces=%d (this run: +%d imgs, +%d faces)"
          % (idx["stats"]["images_indexed"], idx["stats"]["faces_total"], new_imgs, new_faces))


if __name__ == "__main__":
    main()
