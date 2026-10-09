# 🕵️‍♂️ Detective Face AI (แฟ้มสืบสวนใบหน้าอัจฉริยะ)

> **ระบบสืบค้นและจับคู่ใบหน้าบุคคลระดับลึกจากคลังภาพกิจกรรมมหาวิทยาลัยกว่า 50,000+ ภาพ**  
> ออกแบบธีมกระดานสืบสวนคดี (Detective Evidence Board) ผสานพลัง AI Face Recognition ระดับ State-of-the-Art (InsightFace SCRFD + ArcFace 512-D)

---

## 📸 ภาพตัวอย่างการใช้งานจริง (Screenshots)

### 1. 🔍 กระดานสืบสวน (Detective Evidence Board)
ปักหมุดรูปผู้ต้องสงสัย/บุคคลเป้าหมายได้หลายมุมมอง ปรับเกณฑ์ความเหมือน (Threshold) และเลือกจำนวนหลักฐานที่ต้องการค้นหา AI จะเทียบเวกเตอร์ใบหน้า 512 มิติกับภาพกิจกรรมทั้งมหาวิทยาลัยในเสี้ยววินาที

![Detective Search Board](image/Screenshot%202026-09-15%20131928.png)

---

### 2. 📑 แฟ้มตรวจพิสูจน์หลักฐาน (Evidence Detail & Detection Inspector)
คลิกดูรายละเอียดของหลักฐานแต่ละชิ้น แสดงกรอบพิกัดใบหน้า 🟢 **ใบหน้าเป้าหมาย (Match Target)** และ 🔴 **ใบหน้าผู้อื่นในภาพ (Other Detected Faces)** พร้อมวิเคราะห์เปอร์เซ็นต์ความเหมือนรายบุคคล และลิงก์ไปยังโพสต์กิจกรรมต้นฉบับ

![Evidence Inspector Modal](image/Screenshot%202026-09-15%20131954.png)

---

### 3. 🛡️ โหมดสแกนตรวจจับความปลอดภัยแบบเรียลไทม์ (Security Scanner)
ระบบตรวจจับใบหน้าแบบ Multi-face พร้อมวาด Face Mesh / Landmarks แบบเรียลไทม์

![Real-time Security Scanner](image/Screenshot%202026-09-14%20225738.png)

---

## ✨ ฟีเจอร์เด่น (Key Features)

* **Multi-Angle Target Search**: รองรับการปักหมุดรูปเป้าหมายได้สูงสุด **12 มุมมอง** (หน้าตรง, ด้านข้าง, สวมแว่น, แสงต่างๆ) เพื่อความแม่นยำสูงสุด
* **512-Dimensional Deep Embeddings**: ใช้ InsightFace (ArcFace ResNet-50) สกัดลายเซ็นใบหน้าความแม่นยำสูง แม้ใบหน้าเอียงหรือขนาดเล็ก
* **Ultra-Fast Vector Search**: ค้นหาและคำนวณ Cosine Similarity เทียบกับฐานข้อมูลใบหน้าหลักแสนหน้าได้ภายใน **< 1-2 วินาที**
* **Dynamic Confidence Filtering**: ปรับสไลเดอร์ความเหมือน (Threshold 50% - 99%) พร้อมระบบไฮไลต์เตือนอัตโนมัติหากผลลัพธ์ต่ำกว่าเกณฑ์
* **Visual Face Inspector**: มาร์กกรอบสแกนอัตโนมัติบนภาพหลักฐาน พร้อมจำแนกบุคคลเป้าหมายและบุคคลแวดล้อม
* **High-Performance Turbo Indexer**: รองรับระบบ Multi-threading และ GPU Acceleration (NVIDIA CUDA) ในการดึงและวิเคราะห์ภาพคลังกิจกรรมขนาดใหญ่

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยี (Tech Stack)

### Frontend
* **React 18** + **TypeScript** + **Vite**
* **Tailwind CSS** สำหรับ Custom Detective & Glassmorphism Theme
* **Lucide React** (Icons)
* **HTML5 Canvas** สำหรับการเรนเดอร์พิกัดใบหน้าแบบ Dynamic Bounding Box

### Backend & AI Engine
* **FastAPI** (Python 3.10+) — High-performance RESTful API
* **InsightFace** (`buffalo_l`: SCRFD 10G Detection + ArcFace ResNet-50 512-D Recognition)
* **ONNX Runtime (CUDA Execution Provider)** — เร่งสปีดประมวลผลด้วย GPU
* **OpenCV** + **NumPy** — การจัดการภาพและคำนวณ Cosine Similarity แบบ Vectorized

---

## 🚀 วิธีติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
* **Node.js**: v18.0 ขึ้นไป
* **Python**: v3.10 ขึ้นไป
* **GPU (แนะนำ)**: NVIDIA GPU พร้อม CUDA สำหรับความเร็วสูงสุด (รองรับ CPU fallback อัตโนมัติ)

### 2. ติดตั้ง Dependencies

**ฝั่ง Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**ฝั่ง Frontend:**
```bash
cd ..
npm install
```

### 3. รันระบบ (Run Application)

* **วิธีที่ 1 (อัตโนมัติ):** ดับเบิลคลิกไฟล์ `start_all.bat` (จะเปิดทั้ง Backend และ Frontend พร้อมกัน)
* **วิธีที่ 2 (Manual):**
  ```bash
  # Terminal 1 - Backend (FastAPI)
  cd backend
  python main.py

  # Terminal 2 - Frontend (Vite)
  npm run dev
  ```

เปิดเบราว์เซอร์ไปที่: **`http://localhost:5174`**

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
detective-face-ai/
├── backend/
│   ├── main.py                  # API Server หลัก (FastAPI)
│   ├── build_gallery_index.py   # เครื่องมือสร้างดัชนีใบหน้ากิจกรรม (Turbo Multi-threaded)
│   ├── face_registry.py         # ทะเบียนจัดการใบหน้า
│   └── requirements.txt         # ไลบรารี Python
├── src/
│   ├── components/
│   │   ├── PersonSearch.tsx     # คอมโพเนนต์หลัก: กระดานสืบสวนแฟ้มคดี
│   │   ├── DetailModal.tsx      # โมดอลตรวจหลักฐานเจาะลึก
│   │   └── SecurityScanner.tsx  # ระบบสแกนใบหน้าความปลอดภัย
│   └── data/                    # ข้อมูลกิจกรรมและลิงก์ภาพ
├── image/                       # ภาพตัวอย่าง Screenshots
├── start_all.bat                # สคริปต์คลิกเดียวรันทั้งระบบ
└── README.md
```

---

## 📜 ใบอนุญาต (License)
MIT License - จัดทำขึ้นเพื่อการศึกษาและการวิจัยระบบสืบค้นใบหน้าขนาดใหญ่
