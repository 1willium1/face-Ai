# ที่มาของรูปภาพในระบบ Security AI Face Recognition (ฉบับวิจัย)

> ไฟล์นี้สรุปว่ารูปแต่ละกลุ่ม “มาจากไหน ผ่านอะไร เก็บที่ไหน” เพื่อใช้อ้างอิงในงานวิจัย/เล่ม thesis

## 1. สรุปสั้น (ตอบคำถาม “รูปมาจากไหน”)

| กลุ่ม | มาจากไหน | เก็บที่ไหน (frozen) | ใช้ตอนรันอย่างไร |
|---|---|---|---|
| A. รูปกิจกรรมที่เอามาสแกน (~168 รูป) | ขูดครั้งเดียวจากเว็บ `dusit.ac.th` | `src/data/activities.ts` (84 กิจกรรม, static) | browser โหลดไฟล์ `.JPG` ผ่าน `/img-proxy` แล้ววิเคราะห์ในเครื่อง ไม่ได้ต่อ API เขา |
| B. รูปบุคคลเป้าหมาย (1 รูป/ครั้ง) | ผู้ใช้อัปโหลดเอง หรือ URL ตัวอย่าง | ไม่เก็บถาวร (state ใน RAM, `data:` URL) | สกัด descriptor แล้วเทียบ 1:N กับรูปกลุ่ม A |
| C. รูปสอน backend (53 ไฟล์ → ใช้ได้ 51) | เก็บ local ในโปรเจกต์ | `backend/training_data/kittisak_pattanapaiboon/` → `backend/face_database.json` | เป็นค่า default ของ target ถ้าผู้ใช้ไม่ส่งรูป B มา |
| D. โมเดล AI (ไม่ใช่รูป) | ดาวน์โหลดครั้งเดียว | `public/models/` + `~/.insightface/models/buffalo_l/` | รัน detection/recognition ในเครื่อง 100% |

**ประโยคใช้อ้างอิงในวิจัย:** “ระบบวิเคราะห์ชุดภาพกิจกรรมทางวิชาการและงานวิจัย มหาวิทยาลัยสวนดุสิต (frozen dataset) ใน `activities.ts` โดยเชื่อมต่อการประมวลผลเวกเตอร์ผ่าน InsightFace และ Browser Face-API”

## 2. กลุ่ม A — รูปกิจกรรม (ชุดหลักที่ใช้สแกน)

### 2.1 Pipeline
```
คลังภาพกิจกรรมวิชาการ มหาวิทยาลัยสวนดุสิต (2560 - 2569)
  → src/data/activities.json       (ชุดข้อมูลกิจกรรม)
  → src/data/activities.ts         (TypeScript dataset สำหรับแอปพลิเคชัน)
```

### 2.2 โครงสร้างข้อมูลในโค้ด
- ข้อมูลกิจกรรม: `activities.ts` / `activities.json` ครอบคลุม พ.ศ. 2560–2569
- รูปแบบภาพ: ความละเอียดสูง พร้อมรองรับ Cross-Origin Resource Sharing (CORS)
- การสแกน: ระบบวิเคราะห์พิกัดใบหน้า Bounding Box และคำนวณ Cosine Similarity อัตโนมัติ

### 2.3 การทำงานขณะรันระบบ
- `FaceCanvasOverlay` โหลดรูปผ่าน `proxiedUrl()` → `/img-proxy?url=<encoded>`
- รองรับทั้งการดึงภาพผ่าน Vite proxy และการอ่านภาพตรง (Direct CORS)

## 3. กลุ่ม B — รูปบุคคลเป้าหมาย

- ค่า default: รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ (ผู้อำนวยการศูนย์ AI)
- ผู้ใช้เปลี่ยนได้ 2 ทาง: อัปโหลดไฟล์ภาพตนเองหรือบุคคลเป้าหมาย หรือเลือกภาพจากคลัง
- ส่งไป backend: สกัด 512-D ArcFace Vector Embeddings
- ฝั่ง browser fallback: สกัด descriptor ด้วย `face-api.js` แล้วเทียบ euclidean distance

## 4. กลุ่ม C — รูปสอน backend (face_database.json)

- ต้นทาง: `backend/training_data/kittisak_pattanapaiboon/`
- สอนด้วย: `backend/train_faces.py` → `FaceDetector.detect()` (InsightFace SCRFD+ArcFace 512-D) → เก็บใน `backend/face_database.json` ผ่าน `face_registry.py`
- DB มี target profile (`kittisak_pattanapaiboon`) รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์
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
