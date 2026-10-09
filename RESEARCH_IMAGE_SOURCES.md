# ที่มาของรูปภาพในระบบ Security AI Face Recognition (ฉบับวิจัย)

> ไฟล์นี้สรุปว่ารูปแต่ละกลุ่ม “มาจากไหน ผ่านอะไร เก็บที่ไหน” เพื่อใช้อ้างอิงในงานวิจัย/เล่ม thesis

## 1. สรุปสั้น (ตอบคำถาม “รูปมาจากไหน”)

| กลุ่ม | มาจากไหน | เก็บที่ไหน (frozen) | ใช้ตอนรันอย่างไร |
|---|---|---|---|
| A. รูปกิจกรรมที่เอามาสแกน (~168 รูป) | ขูดครั้งเดียวจากเว็บ `dusit.ac.th` | `src/data/activities.ts` (84 กิจกรรม, static) | browser โหลดไฟล์ `.JPG` ผ่าน `/img-proxy` แล้ววิเคราะห์ในเครื่อง ไม่ได้ต่อ API เขา |
| B. รูปบุคคลเป้าหมาย (1 รูป/ครั้ง) | ผู้ใช้อัปโหลดเอง หรือ URL ตัวอย่าง | ไม่เก็บถาวร (state ใน RAM, `data:` URL) | สกัด descriptor แล้วเทียบ 1:N กับรูปกลุ่ม A |
| C. รูปสอน backend (53 ไฟล์ → ใช้ได้ 51) | เก็บ local ในโปรเจกต์ | `backend/training_data/wichcha_chimploy/` → `backend/face_database.json` | เป็นค่า default ของ target ถ้าผู้ใช้ไม่ส่งรูป B มา |
| D. โมเดล AI (ไม่ใช่รูป) | ดาวน์โหลดครั้งเดียว | `public/models/` + `~/.insightface/models/buffalo_l/` | รัน detection/recognition ในเครื่อง 100% |

**ประโยคใช้อ้างอิงในวิจัย:** “ระบบไม่ได้ดึงข้อมูลสด (live) จาก dusit.ac.th ชุดรูปกิจกรรมถูก scrape ครั้งเดียวแล้วแช่แข็ง (frozen dataset) ใน `activities.ts` สิ่งเดียวที่ขอจาก dusit.ac.th ตอนรันคือไฟล์ภาพผ่าน proxy เพื่อวิเคราะห์ใบหน้า ไม่มีการเชื่อมต่อฐานข้อมูลหรือ API ของมหาวิทยาลัย”

## 2. กลุ่ม A — รูปกิจกรรม (ชุดหลักที่ใช้สแกน)

### 2.1 Pipeline (4 ขั้น)
```
URLDR.Witcha.txt
  → scripts/scrape_activities.js   (fetch HTML + regex หา .jpg ใน /gallery/ /uploads/)
  → src/data/activities.json       (ดิบ)
  → scripts/clean_activities.js    (ตัด placeholder + โลโก้/แบนเนอร์/thumbnail)
  → src/data/activities.ts         (frozen dataset ที่แอปใช้จริง)
```

### 2.2 หลักฐานในโค้ด
- ต้นทาง URL: `URLDR.Witcha.txt` → อ่านโดย `scripts/scrape_activities.js:8`
- กรองเฉพาะรูปกิจกรรม: `scrape_activities.js:44-62` (เอาเฉพาะ `/uploads/` `/gallery/`, ตัด `logo/avatar/banner`)
- ตัดขยะรอบสอง: `scripts/clean_activities.js:21-53` (โลโก้ SDU, ธงชาติ, `-36x32`, `thumbs_`, รูป fallback `uploads/2020/08/1.jpg`)
- ตัด placeholder: `clean_activities.js:12-18` (title `กิจกรรม มหาวิทยาลัยสวนดุสิต (` = fetch ล้มเหลว)
- dataset ปัจจุบัน: **84 กิจกรรม** (`activities.ts` / `activities.json` นับ `"id":` ได้ 84)
- ตอนสแกนตัดเหลือกิจกรรมละ 2 รูป: `src/components/SecurityScanner.tsx:81` (`slice(0, 2)`) → **84×2 = ~168 รูป** ตรงกับที่เอกสารเดิมระบุ

### 2.3 ตอนรันโหลดอย่างไร
- `FaceCanvasOverlay` โหลดรูปผ่าน `proxiedUrl()` → `/img-proxy?url=<encoded>` (`FaceCanvasOverlay.tsx:53`, `vite.config.ts:10`)
- เหตุผล: รูปอยู่ต่าง origin (`dusit.ac.th` vs `localhost:5174`) ถ้าโหลดตรง browser จะติด CORS แล้ว `canvas`/`face-api` อ่าน pixel ไม่ได้ → ให้ Vite dev-server โหลดแทนแล้วส่งต่อ (`access-control-allow-origin: *`, cache 1 วัน)
- ข้อจำกัด: proxy นี้มีเฉพาะ `dev` + `preview` (`vite.config.ts:38-51`) ถ้า build เป็น static hosting ต้องทำ proxy เองที่ nginx/node

## 3. กลุ่ม B — รูปบุคคลเป้าหมาย

- ค่า default: `SecurityScanner.tsx:25` (URL ตัวอย่าง `AP7A6353_resize.JPG` ของ ดร.วิชชา)
- ผู้ใช้เปลี่ยนได้ 2 ทาง: อัปโหลดไฟล์ (`handleFileUpload`, `SecurityScanner.tsx:60` → `FileReader` เป็น `data:` URL) หรือกดปุ่ม “ใช้รูปตัวอย่าง”
- ส่งไป backend: `data:` → ฟิลด์ `target_image_base64`, `http` → ฟิลด์ `target_url` (`FaceCanvasOverlay.tsx:216-224`) แล้ว backend สกัด embedding สด (`main.py:_target_embeddings_override`) — ไม่ผูกกับชื่อใน DB
- ฝั่ง browser fallback: สกัด descriptor ด้วย `face-api` แล้วเทียบ euclidean distance (`FaceCanvasOverlay.tsx:80-100`, threshold แปลงจากสไลเดอร์ `confidenceToDistance`)

## 4. กลุ่ม C — รูปสอน backend (face_database.json)

- ต้นทาง: `backend/training_data/wichcha_chimploy/` — 53 ไฟล์ (ภาพเดี่ยว + ภาพกิจกรรม `wichcha_activity_1182313_*`)
- สอนด้วย: `backend/train_faces.py` → `FaceDetector.detect()` (InsightFace SCRFD+ArcFace 512-D) → เก็บใน `backend/face_database.json` ผ่าน `face_registry.py`
- ผลรันจริงล่าสุด: **51 สำเร็จ / 2 ล้มเหลว** (หาหน้าไม่เจอ) — DB มี 1 person (`wichcha_chimploy`)
- เกร็ดเทคนิค (ควรเขียนในวิจัย): `cv2.imread` อ่าน path ภาษาไทย (`มี2งาน`) บน Windows ไม่ได้ → ต้องใช้ `np.fromfile + cv2.imdecode` (`train_faces.py:imread_unicode`)
- บทบาทในระบบ: เป็น target default กรณีผู้ใช้ไม่ส่งรูป B มา (`main.py:_process_image` ใช้ `face_db.get_target_profile()` ถ้าไม่มี override)

## 5. วิธีทำซ้ำ (Reproduce) สำหรับผู้ตรวจวิจัย

```bash
# 1. ขูดใหม่ (ต้องมี URLDR.Witcha.txt)
node scripts/scrape_activities.js
# 2. ทำความสะอาด
node scripts/clean_activities.js
# 3. สอนหน้าใหม่ (ใส่รูปใน training_data/<person_id>/ ก่อน)
cd backend && python train_faces.py
# 4. รันระบบ
python main.py            # :8000  เช็ค /face-status
npm run dev               # :5174
```

## 6. ข้อจำกัด + จริยธรรมวิจัย (ควรระบุในเล่ม)

1. **Frozen dataset** — รูปไม่อัปเดตตามเว็บจริง ถ้าเว็บลบ/ย้ายไฟล์ รูปจะโหลดไม่ขึ้น (`imageError` → “ไม่สามารถโหลดภาพได้”)
2. **ลิขสิทธิ์** — ภาพเป็นของมหาวิทยาลัยสวนดุสิต ใช้เพื่อวิจัย/การศึกษา ควรขออนุญาตและอ้าง `sourceUrls` ทุกกิจกรรม
3. **PDPA/ใบหน้า** — ชุดข้อมูลมีใบหน้าบุคคลจริง ห้ามเผยแพร่ `face_database.json` (embedding ย้อนกลับเป็นตัวตนได้) และควรเบลอหน้าในภาพประกอบเล่ม
4. **Bias** — รูปสอนมี 51 embedding จากบุคคลเดียว + รูปกิจกรรมเป็นงานทางการ (แสง/มุมคล้ายกัน) ค่าความแม่นยำที่วัดได้อ้างอิงได้เฉพาะโดเมนนี้
5. **สถิติ `~len*16`** ใน `SecurityScanner.tsx:110` เป็นค่าประเมิน ไม่ใช่ผลนับจริง — อย่าเอาไปเคลมเป็นผลการทดลอง ให้ใช้ `person_count` จาก backend แทน
