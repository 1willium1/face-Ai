"""
Train/Register Face Profile using InsightFace ArcFace.

Reads images from training_data/wichcha_chimploy/
Detects faces + extracts ArcFace 512-D embeddings.
Saves to face_database.json.
"""

import os
import sys
import cv2
import json
import numpy as np
import glob

# Add backend dir to path
sys.path.insert(0, os.path.dirname(__file__))

from scanner.detector import FaceDetector
from face_registry import get_registry

TRAINING_DIR = os.path.join(os.path.dirname(__file__), "training_data", "wichcha_chimploy")
DB_PATH = os.path.join(os.path.dirname(__file__), "face_database.json")

IMAGE_EXTENSIONS = ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.webp']


def collect_images(directory: str) -> list:
    """Collect all image files from the training directory."""
    images = []
    for ext in IMAGE_EXTENSIONS:
        images.extend(glob.glob(os.path.join(directory, ext)))
        images.extend(glob.glob(os.path.join(directory, '**', ext), recursive=True))
    # Deduplicate and sort
    return sorted(list(set(images)))


def imread_unicode(path: str):
    """cv2.imread อ่าน path ไทย (มี2งาน) ไม่ได้ -> ใช้ np.fromfile + imdecode แทน"""
    try:
        data = np.fromfile(path, dtype=np.uint8)
        if data.size == 0:
            return None
        return cv2.imdecode(data, cv2.IMREAD_COLOR)
    except Exception:
        return None


def main():
    print("=" * 60)
    print("  InsightFace ArcFace — Face Registration Training")
    print("=" * 60)

    # Check training directory
    if not os.path.exists(TRAINING_DIR):
        print(f"\n[ERROR] Training directory not found: {TRAINING_DIR}")
        print("Please place face images in this directory.")
        sys.exit(1)

    # Collect images
    image_paths = collect_images(TRAINING_DIR)
    print(f"\n[INFO] Found {len(image_paths)} image(s) in {TRAINING_DIR}")

    if not image_paths:
        print("[ERROR] No images found. Please add images to the training directory.")
        sys.exit(1)

    # Initialize InsightFace detector
    print("\n[INFO] Loading InsightFace (SCRFD + ArcFace)...")
    detector = FaceDetector(ctx_id=-1, det_size=(640, 640))
    print("[OK] InsightFace loaded!")

    # Process each image
    print(f"\n[INFO] Processing {len(image_paths)} images...\n")
    all_embeddings = []
    successful = 0
    failed = 0

    for i, img_path in enumerate(image_paths, 1):
        filename = os.path.basename(img_path)
        print(f"  [{i}/{len(image_paths)}] {filename}...", end=" ")

        try:
            img = imread_unicode(img_path)
            if img is None:
                print("[FAIL] Cannot read image")
                failed += 1
                continue

            faces = detector.detect(img)

            if not faces:
                print("[FAIL] No face detected")
                failed += 1
                continue

            # Use the face with highest detection score
            best = max(faces, key=lambda f: f["det_score"])
            embedding = best["embedding"]
            all_embeddings.append(embedding)
            successful += 1
            print(f"[OK] Face detected (score: {best['det_score']:.2f}%)")

        except Exception as e:
            print(f"[FAIL] Error: {e}")
            failed += 1

    # Report results
    print(f"\n{'=' * 60}")
    print(f"  Results: {successful} successful, {failed} failed")
    print(f"  Total embeddings: {len(all_embeddings)}")
    print(f"{'=' * 60}")

    if not all_embeddings:
        print("\n[ERROR] No embeddings extracted. Cannot create profile.")
        sys.exit(1)

    # Save to database
    print(f"\n[INFO] Saving face profile to {DB_PATH}...")
    registry = get_registry()
    registry.db_path = DB_PATH  # Ensure correct path

    # Register person with all embeddings
    registry.register_person(
        person_id="wichcha_chimploy",
        name="ดร.วิชชา ฉิมพลี",
        role="ประธานสภาคณาจารย์และพนักงาน",
        title="ผู้ช่วยศาสตราจารย์ ดร.",
        embeddings=[emb.tolist() if isinstance(emb, np.ndarray) else emb for emb in all_embeddings],
    )

    print(f"\n[OK] Face profile created successfully!")
    print(f"   Person: Dr.Wichcha Chimploy")
    print(f"   Embeddings: {len(all_embeddings)}")
    print(f"   Model: ArcFace (InsightFace)")
    print(f"   Dimension: 512-D")
    print(f"   Database: {DB_PATH}")


if __name__ == "__main__":
    main()
