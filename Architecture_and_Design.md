# สถาปัตยกรรมและการออกแบบระบบ Security AI Face Recognition

เอกสารนี้สรุปโครงสร้าง สถาปัตยกรรม และการออกแบบเชิงเทคนิคของระบบ **Security AI Face Recognition** โดยอ้างอิงจากรายละเอียดการพัฒนาระบบและชุดข้อมูลวิจัย

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture)

ระบบถูกออกแบบในลักษณะ **Decoupled Architecture** (แยกส่วน Frontend และ Backend ชัดเจน) โดยรองรับการประมวลผลใบหน้าทั้งแบบ **On-Device / In-Browser AI** (ผ่าน `face-api.js`) และ **Server-side AI** (ผ่าน InsightFace Python API)

```
+-----------------------------------------------------------------------+
|                             FRONTEND                                  |
|  (Vite + React + TypeScript + Tailwind CSS)                           |
|                                                                       |
|  [SecurityScanner Component] <--> [FaceCanvasOverlay Component]        |
|               |                                |                      |
|               v                                v                      |
|      activities.ts (Static)             face-api.js (In-Browser AI)   |
+---------------+--------------------------------+----------------------+
                |                                |
                | (HTTP / Local Proxy)           | (HTTP POST Base64/URL)
                v                                v
+-----------------------------------------------------------------------+
|                   Vite Dev Server (/img-proxy)                        |
|   (ทำหน้าที่แก้ปัญหา CORS ในการดึงภาพจาก dusit.ac.th)                  |
+-----------------------------------------------------------------------+
                                                 |
                                                 v
+-----------------------------------------------------------------------+
|                             BACKEND                                   |
|  (Python FastAPI)                                                     |
|                                                                       |
|  [main.py] <---> [InsightFace Model (SCRFD + ArcFace 512-D)]          |
|                       |                                               |
|                       v                                               |
|              face_database.json (Vector Database)                     |
+-----------------------------------------------------------------------+
```

---

## 2. การแบ่งกลุ่มข้อมูลรูปภาพ (Data Classification)

| กลุ่ม | แหล่งที่มา | สถานที่จัดเก็บ | รูปแบบการนำไปใช้งาน |
| :--- | :--- | :--- | :--- |
| **A. รูปกิจกรรม (Scan Target)** | Web Scraped จาก `dusit.ac.th` | `src/data/activities.ts` (Frozen, 84 กิจกรรม) | ดึงผ่าน `/img-proxy` สแกนหาใบหน้าเทียบกับเป้าหมาย (84x2 = ~168 รูป) |
| **B. รูปบุคคลเป้าหมาย** | ผู้ใช้อัปโหลด / URL ตัวอย่าง | ไม่บันทึกถาวร (RAM / State / Data URL) | สกัด Embedding/Descriptor แบบ Real-time เพื่อเทียบ 1:N |
| **C. รูปสอน Backend** | Local Files (53 ไฟล์) | `backend/training_data/` $ightarrow$ `face_database.json` | ใช้เป็น Target Profile เริ่มต้นเมื่อไม่ได้รับรูป B |
| **D. โมเดล AI** | Downloaded Pre-trained | `public/models/` & `~/.insightface/` | ใช้ในการทำ Face Detection & Recognition |

---

## 3. โครงสร้างและการออกแบบระบบ (System Components)

### 3.1 Data Pipeline & Preprocessing
* **Scraping & Cleaning:** ดึง URL รูปภาพกิจกรรมผ่าน `scrape_activities.js` คัดกรองเฉพาะภาพกิจกรรมจริงใน `/uploads/` และ `/gallery/` จากนั้นใช้ `clean_activities.js` ตัดภาพ Placeholder, Banner, และ Thumbnail ออก
* **Frozen Dataset:** บันทึกผลลัพธ์สุดท้ายเป็น `activities.ts` เพื่อคงสภาพชุดข้อมูลที่แน่นอนสำหรับการทดลองวิจัย
* **Unicode Path Handling:** ในส่วน Backend มีการใช้ `np.fromfile + cv2.imdecode` ใน `train_faces.py` เพื่อรองรับพาธไฟล์ภาษาไทยบนระบบปฏิบัติการ Windows

### 3.2 Frontend Architecture (Client-Side)
* **Framework:** React + TypeScript ร่วมกับ Vite และ Tailwind CSS
* **Core Components:**
  * `SecurityScanner.tsx`: จัดการ State หลักของระบบ, ค่า Confidence Threshold และส่วนควบคุมสแกน
  * `FaceCanvasOverlay.tsx`: แสดงผลภาพ วาด Bounding Box บน HTML5 Canvas และรัน `face-api.js` สำหรับ Browser-side fallback
* **CORS Proxy (`/img-proxy`):** ตั้งค่าใน `vite.config.ts` เพื่อทำหน้าที่เป็น Proxy เซิร์ฟเวอร์ ป้องกันปัญหา Cross-Origin Resource Sharing (CORS) เมื่อดึงภาพจากต่างโดเมนเข้า HTML Canvas

### 3.3 Backend Architecture (Server-Side)
* **Framework:** Python FastAPI
* **AI Model Engine:** 
  * **SCRFD:** ใช้สำหรับการทำ Face Detection (ค้นหาตำแหน่งใบหน้า)
  * **ArcFace (512-D):** สกัดจุดเด่นบนใบหน้าเป็น Vector ขนาด 512 มิติ
* **Face Registry:** จัดเก็บและเปรียบเทียบ Vector ใบหน้าผ่าน `face_database.json`

---

## 4. ขั้นตอนการทำงานของระบบ (Workflow)

```
[เริ่มต้นสแกน]
     │
     ├── 1. ตั้งค่าบุคคลเป้าหมาย (Target)
     │      ├─ เลือกรูปตัวอย่าง / อัปโหลดไฟล์ภาพ
     │      └─ สกัด 512-D Feature Vector
     │
     ├── 2. โหลดภาพกิจกรรม (Dataset A)
     │      ├─ ดึงข้อมูลจาก static file (activities.ts)
     │      └─ โหลดภาพผ่าน /img-proxy เพื่อเลี่ยงปัญหา CORS
     │
     ├── 3. ประมวลผลและตรวจจับใบหน้า (Detection & Matching)
     │      ├─ ตรวจหาใบหน้าทั้งหมดในภาพ
     │      └─ คำนวณ Distance (Euclidean / Cosine Similarity) เทียบกับ Target
     │
     └── 4. แสดงผลลัพธ์ (Visualization)
            └─ วาด Bounding Box + แสดงค่า Confidence Score บน Canvas
```

---

## 5. ข้อพิจารณาด้านวิจัยและจริยธรรม (Research & Ethics)

1. **Dataset Stability:** การใช้ Frozen Dataset ป้องกันปัญหาสวนทางของข้อมูลเมื่อภาพต้นทางบนเว็บไซต์ถูกแก้ไขหรือลบ
2. **PDPA / Privacy:** ไฟล์ `face_database.json` เก็บข้อมูลความสัมพันธ์ชีวมิติ (Biometric Embedding) ไม่ควรเผยแพร่ต่อสาธารณะ
3. **Domain Limitation:** ผลการทดสอบความแม่นยำอิงตามบริบทของภาพกิจกรรมทางการของมหาวิทยาลัย ซึ่งมีลักษณะแสงและมุมกล้องเฉพาะกลุ่ม
