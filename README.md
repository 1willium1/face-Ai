# 🕵️‍♂️ SDU Face AI Intelligence — ระบบตรวจสอบและสืบค้นใบหน้าชีวมิติอัจฉริยะ

> **Smart Campus Biometric Intelligence & Activity Tracking Platform**  
> **มหาวิทยาลัยสวนดุสิต (Suan Dusit University)**  
> โครงการพัฒนาระบบสืบค้นและวิเคราะห์อัตลักษณ์ชีวมิติใบหน้าจากคลังภาพกิจกรรมวิชาการและงานวิจัย ผสานพลังสถาปัตยกรรม InsightFace SCRFD + ArcFace 512-D Deep Embeddings พร้อมระบบประมวลผลบนเบราว์เซอร์ความเร็วสูง

---

## 👨‍💻 ข้อมูลผู้พัฒนาโครงงาน (Developer Profile)

* **ชื่อ-นามสกุล:** นายปวีณวัชร์ เหลืองอุทัย (Mr. Paweenwat Lueang-uthai)
* **รหัสนักศึกษา:** 6811011662009 (u68009)
* **หลักสูตร:** วิทยาการคอมพิวเตอร์และเทคโนโลยีดิจิทัล คณะวิทยาศาสตร์และเทคโนโลยี
* **สถาบัน:** มหาวิทยาลัยสวนดุสิต (Suan Dusit University)
* **รายวิชา:** OBE3-4232502 การพัฒนาเว็บแอปพลิเคชันให้มีความมั่นคงปลอดภัย (Web Application Security)
* **บุคคลเป้าหมายต้นแบบ (Target Subject):** รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ (ผู้อำนวยการศูนย์นวัตกรรมปัญญาประดิษฐ์และวิทยาการข้อมูล มหาวิทยาลัยสวนดุสิต)
* **ช่วงปีข้อมูลกิจกรรมในฐานข้อมูล:** พ.ศ. 2560 – 2569

---

## 📸 ภาพตัวอย่างการใช้งานระบบจริง (Screenshots)

### 1. 🔍 กระดานสืบค้นชีวมิติอัจฉริยะ (Biometric Evidence & Target Search Board)
ระบบปักหมุดบุคคลเป้าหมาย รองรับการวิเคราะห์หลายมุมมอง ปรับระดับความคล้ายคลึง (Threshold 50% - 99%) โดย AI จะสกัดเวกเตอร์ใบหน้า 512 มิติ เทียบกับคลังภาพกิจกรรมมหาวิทยาลัยแบบเรียลไทม์

![Biometric Search Board](image/Screenshot%202026-09-15%20131928.png)

---

### 2. 📑 แฟ้มตรวจพิสูจน์พิกัดใบหน้าและเวกเตอร์ (Evidence Inspector & Vector Analysis)
ตรวจสอบรายละเอียดการตรวจจับของแต่ละกิจกรรม แสดงกรอบพิกัดใบหน้าเป้าหมาย 🟢 **(Target Match)** และบุคคลแวดล้อม 🔴 **(Other Detected Faces)** พร้อมวิเคราะห์ค่า Cosine Similarity, เปอร์เซ็นต์ความเชื่อมั่น และเรดาร์กราฟเปรียบเทียบลายเซ็นใบหน้า

![Evidence Inspector Modal](image/Screenshot%202026-09-15%20131954.png)

---

### 3. 🛡️ ระบบสแกนตรวจจับความปลอดภัยแบบเรียลไทม์ (Smart Campus Security Scanner)
ระบบตรวจจับใบหน้าแบบ Multi-face Tracking แสดงจุด Face Landmark Mesh, นับจำนวนบุคคลในพื้นที่ (People Counter) และจำแนกความเสี่ยงแบบอัตโนมัติ

![Real-time Security Scanner](image/Screenshot%202026-09-14%20225738.png)

---

## ✨ ฟีเจอร์เด่นของระบบ (Key Features)

* **512-Dimensional Deep Embeddings:** ใช้ InsightFace (ArcFace ResNet-50) ในการสกัดเวกเตอร์อัตลักษณ์ความแม่นยำสูง แม้ใบหน้าเอียง มีแสงเงา หรือมีขนาดเล็ก
* **Multi-Angle Target Search:** รองรับการเพิ่มภาพบุคคลเป้าหมายได้สูงสุด 12 มุมมอง เพื่อเพิ่มความแม่นยำในการจับคู่
* **Ultra-Fast Vector Matching:** คำนวณ Cosine Similarity บน Vector Index ช่วยให้ได้ผลลัพธ์ภายในเสี้ยววินาที
* **Hybrid Dual-Engine Architecture:**
  - **Primary:** Python FastAPI Backend (InsightFace + ONNX Runtime CUDA Acceleration)
  - **Fallback:** Browser-side Face-API (TensorFlow.js / TinyFaceDetector + Landmark68) ทำงานได้ทันทีแม้ไม่ได้เปิดเซิร์ฟเวอร์หลังบ้าน
* **Dynamic Confidence Filtering:** ปรับระดับเกณฑ์ความเชื่อมั่น (Threshold) ได้อย่างอิสระ พร้อมระบบคัดกรองตามปี พ.ศ. และคำสำคัญ
* **Secure Image Proxy:** ระบบ Vite Dev Proxy สำหรับดึงภาพต่างโดเมน ป้องกันปัญหา CORS และสนับสนุนความปลอดภัยตามมาตรฐาน Web Security

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยี (Tech Stack)

### Frontend
* **Core Framework:** React 18 (TypeScript) + Vite
* **Styling & Theme:** Tailwind CSS + Custom HUD Glassmorphism Dark Theme (`#030712`, `#00d4ff`, `#00ff88`)
* **Icons & Animation:** Lucide React, Framer Motion
* **Canvas Rendering:** HTML5 Canvas สำหรับวาด Bounding Box และ Biometric Targets แบบ Dynamic
* **State Management:** Zustand พร้อม LocalStorage Persistence

### Backend & AI Engine
* **REST API:** FastAPI (Python 3.10+)
* **Face Detection & Recognition:** InsightFace (`buffalo_l`: SCRFD 10G Detection + ArcFace ResNet-50 512-D)
* **Acceleration:** ONNX Runtime, OpenCV, NumPy Vectorized Operations

---

## 🚀 วิธีติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ติดตั้งและรันส่วนหน้าเว็บ (Frontend)
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรันเซิร์ฟเวอร์ Development (Port 5173 / 5174)
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

---

### 2. รันระบบเซิร์ฟเวอร์ AI Backend (ทางเลือกสำหรับโหมด Deep Learning)
```bash
# 1. ไปที่โฟลเดอร์ Backend
cd backend

# 2. ติดตั้งโมเดลและไลบรารี
pip install -r requirements.txt

# 3. รัน FastAPI Server
python main.py
```
*ระบบ Frontend มีระบบ Fallback สามารถทำงานสแกนใบหน้าผ่าน Browser Engine ได้ทันทีแม้ไม่ได้เปิด Backend*

---

## 📄 ลิขสิทธิ์และสิทธิ์การใช้งาน
โครงงานนี้พัฒนาขึ้นเพื่อการศึกษาและการวิจัยในรายวิชาการพัฒนาเว็บแอปพลิเคชันให้มีความมั่นคงปลอดภัย มหาวิทยาลัยสวนดุสิต
จัดทำโดย **นายปวีณวัชร์ เหลืองอุทัย (6811011662009)**
