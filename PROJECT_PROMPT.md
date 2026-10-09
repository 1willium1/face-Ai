# Master Prompt Specification: Web Application Portfolio & Activity Gallery System
> **คำสั่ง (Master Prompt)** สำหรับการสร้างเว็บแอพพลิเคชันระบบสรุปผลงานและประวัติกิจกรรม ดร.วิชชา ฉิมพลี มหาวิทยาลัยสวนดุสิต ตั้งแต่เริ่มต้นจนสมบูรณ์

---

## 🎯 1. วัตถุประสงค์และเป้าหมายโครงการ (Project Goal)
สร้างเว็บแอพพลิเคชัน **Portfolio & Activity Gallery** สำหรับแสดงประวัติผลงานและการเข้าร่วมกิจกรรมต่างๆ ของ **ดร.วิชชา ฉิมพลี (มหาวิทยาลัยสวนดุสิต)** โดยดึงข้อมูลรูปภาพและรายละเอียดจากเว็บไซต์ `dusit.ac.th` นำมาจัดหมวดหมู่ สร้างระบบฐานข้อมูล จัดเรียงไทม์ไลน์ และมีระบบสไลด์โชว์รูปภาพที่สวยงาม ทันสมัย รองรับการเลือกดูตามปี พ.ศ. และการค้นหา

---

## 🛠️ 2. เทคโนโลยีหลักที่ใช้ (Technology Stack)

### 2.1 Frontend Stack
* **Frontend Framework:** React 18 (TypeScript) + Vite
* **Styling:** Tailwind CSS + Custom CSS (Typography: Google Font 'Prompt')
* **UI Components & Icons:** Lucide React, Framer Motion (Animations)
* **State Management:** Zustand (Global Store + LocalStorage Persistence)
* **Data Storage:** TypeScript Data Module (`src/data/activities.ts`) + Browser LocalStorage (`dr_witcha_activities_v2`)

### 2.2 AI Backend Stack (Python)
* **AI & Object Detection Engine:** Python 3 + FastAPI + Ultralytics YOLOv8 (yolov8n.pt) + OpenCV + NumPy
* **Backend API Endpoints:**
  - `POST http://localhost:8000/detect-people` — อัปโหลดไฟล์รูปภาพ
  - `POST http://localhost:8000/detect-url` — ส่ง URL รูปภาพ
  - `GET http://localhost:8000/` — Health Check
* **Dependencies:** `fastapi`, `uvicorn`, `ultralytics`, `opencv-python`, `numpy`, `python-multipart`

---

## 📋 3. ข้อกำหนดระบบและฟีเจอร์ (System Requirements & Features)

### 3.1 ระบบจัดการฐานข้อมูลและการดึงข้อมูล (Database & Scraping Specifications)
1. **โครงสร้างข้อมูลกิจกรรม (Activity Data Structure):**
   ```typescript
   export interface Activity {
     id: string;          // รหัสกิจกรรมอ้างอิงปีและโพสต์
     images: string[];    // Array ของ URL รูปภาพกิจกรรมทั้งหมด
     date: string;        // วันที่จัดกิจกรรม (เช่น 24 เมษายน 2561)
     year: number;        // ปี พ.ศ. (เช่น 2566)
     title: string;       // ชื่อนวัตกรรม / กิจกรรม / การประชุม
     context: string;     // รายละเอียด/บทสรุปกิจกรรม
     what: string;        // สิ่งที่เกิดขึ้นในกิจกรรม
     where: string;       // สถานที่จัดกิจกรรม
     how: string;         // รูปแบบการดำเนินงาน
     sourceUrls?: string[]; // URL อ้างอิงต้นทาง
   }
   ```
2. **การคัดกรองข้อมูล (Data Cleaning & Quality Control):**
   * กรองเฉพาะกิจกรรมที่เกี่ยวข้องกับ ดร.วิชชา ฉิมพลี และมหาวิทยาลัยสวนดุสิต
   * ตัดรายการที่เป็น Placeholder หรือหน้าที่ดึงข้อมูลไม่สำเร็จทิ้ง
   * กรองรูปภาพขยะออก (เช่น โลโก้เว็บไซต์, แบนเนอร์, ธงชาติ, ไอคอนโซเชียล) ให้เหลือเฉพาะรูปภาพกิจกรรมจริง

### 3.2 การออกแบบ UI/UX และเลย์เอาต์ (Design & Layout Specs)
1. **ธีมและการออกแบบ (Design Aesthetics):**
   * **Hero Section:** ธีมเข้มสไตล์ Glassmorphism (Slate-950) พร้อมแสง Glow Gradient (Blue-600 / Amber-500 blur)
   * **Main Content Area:** การ์ดสีขาวแบบซอฟต์มินิมอลบนพื้น Slate-900 ขอบโค้งมน (`rounded-[36px]`)
   * **Typography:** ฟอนต์ภาษาไทย **Prompt** อ่านง่าย ทันสมัย
2. **ระบบเลย์เอาต์การ์ดกิจกรรม (Compact 2-Column Grid):**
   * จัดเรียงแบบ 2 คอลัมน์ (ซ้าย-ขวา) บนหน้าจอคอมพิวเตอร์ และ 1 คอลัมน์บนมือถือ
   * กระชับ ไร้ช่องว่างสีขาวส่วนเกิน (No wasted whitespace)
3. **ระบบเลื่อนดูรูปภาพ (Image Carousel & Fullscreen Lightbox):**
   * ในการ์ดกิจกรรม: สามารถกดปุ่มลูกศร ซ้าย-ขวา เพื่อเลื่อนดูรูปภาพพรีวิวพร้อม Indicator บอกลำดับรูป
   * เมื่อคลิกการ์ด: เปิด Modal/Lightbox แสดงรูปภาพขนาดใหญ่ความละเอียดสูง พร้อมรายละเอียด What / Where / How 

### 3.3 ระบบค้นหาและตัวกรอง (Filtering & Search)
1. **ตัวกรองปี พ.ศ. (Year Dropdown Filter):**
   * ดร็อปดาวน์เลือกดูตามปี พ.ศ. (เช่น พ.ศ. 2566, 2565, 2564 ฯลฯ) พร้อมบอกจำนวนกิจกรรมในแต่ละปี
   * ตัวเลือก "ทุกปี พ.ศ." สำหรับแสดงภาพรวมทั้งหมด
2. **ช่องค้นหาอัจฉริยะ (Real-time Search Bar):**
   * ค้นหาแบบทันทีจาก ชื่อนวัตกรรม, รายละเอียด, สถานที่ หรือวันที่จัดกิจกรรม

### 3.4 แผงสรุปสถิติและความแม่นยำ (Stat & Accuracy Badges)
แสดงการสรุปผลบน Hero Section:
* **จำนวนกิจกรรมทั้งหมด:** (เช่น 84 กิจกรรม)
* **จำนวนรูปภาพรวม:** (เช่น 2,097 รูปภาพ)
* **ช่วงปี พ.ศ.:** (เช่น พ.ศ. 2556 - 2566)
* **ความแม่นยำข้อมูล (Accuracy Badge):** แสดงอัตราความแม่นยำของรูปภาพและข้อมูลกิจกรรมที่คัดกรองแล้ว (**100%** ไร้รูปขยะ ไร้โลโก้ และไร้ Placeholder)

### 3.5 ระบบปัญญาประดิษฐ์สแกนใบหน้าและสะกดรอยเป้าหมาย (AI Security & Face Scanner)
1. **การอัปโหลดใบหน้าเป้าหมาย / ผู้ต้องสงสัย (Target Face Upload):**
   * รองรับการอัปโหลดไฟล์ภาพใบหน้า (Drag & Drop หรือคลิกเลือกไฟล์) หรือเลือกใช้ภาพตัวอย่าง (ดร.วิชชา ฉิมพลี)
   * ฟิลด์ตั้งชื่อบุคคลเป้าหมายได้
2. **การวาดวงกลมพิกัดและกรอบระบุตัวตน (Face Bounding Box & Target Highlight Overlay):**
   * **🎯 Target Highlight (วงกลมเรืองแสงสีฟ้า-แดง):** วาดวงกลมและเป้า Crosshair ล้อมรอบใบหน้าบุคคลเป้าหมาย/ผู้ต้องสงสัยในรูปกิจกรรม พร้อมระบุเปอร์เซ็นต์ความเชื่อมั่น (Match Confidence %)
   * **⭕ Crowd Face Highlights (วงกลมระบุใบหน้าคนอื่น):** วาดวงกลมล้อมรอบใบหน้าทุกคนที่อยู่ในฝูงชนในภาพกิจกรรม
   * **ข้อจำกัด:** วงกลมต้องวาดที่ตำแหน่ง **ระดับศีรษะ/ใบหน้าคนเท่านั้น** ห้ามวาดบน Laptop, โต๊ะ, ไมค์, ชุดสูท, หรือพื้นหลัง
3. **การนับจำนวนคนในภาพ (People Counter):**
   * คำนวณและแสดงจำนวนคนทั้งหมดที่อยู่ในภาพแต่ละกิจกรรมโดยอัตโนมัติ (เช่น "นับได้ 24 คนในภาพ")
4. **รายงานประวัติสถานที่และเวลาสะกดรอย (Security Intelligence Timeline):**
   * แสดงรายละเอียด **สถานที่จัดงาน (Location / Where)**, **วันที่และปี พ.ศ. (Date / Time)**, **ชื่องานประชุมหรือสัมมนา (Event Title)** ที่ตรวจพบบุคคลเป้าหมายปรากฏตัว
5. **Security Lightbox & Detail View:**
   * คลิกที่ภาพเพื่อเปิดดูภาพขยายความละเอียดสูง พร้อมรายงานสรุปความปลอดภัยประจำกิจกรรม (สถานที่, วันที่, ผลตรวจจับบุคคลเป้าหมาย)
6. **AI Confidence Threshold Slider:**
   * ตัวเลื่อน (Range Slider) ปรับเกณฑ์ความเชื่อมั่นขั้นต่ำ (80% - 99%) ในการตรวจจับ
7. **ระบบค้นหาและกรองภายใน Security Scanner:**
   * ช่องค้นหา (Search) + Dropdown ปี พ.ศ. สำหรับกรองภาพกิจกรรมภายในโหมด Security

### 3.6 ระบบแก้ไขและลบข้อมูล (Editable & Deletable Content System)
1. **การลบรูปภาพ (Photo Deletion):**
   * ทุกรูปภาพสามารถลบออกได้ทีละรูป ผ่านปุ่ม "🗑️ ลบรูปนี้" ภายใน Modal (ยืนยันก่อนลบ)
   * ลำดับรูปจะอัปเดตทันทีหลังลบ
2. **การแก้ไขรายละเอียดกิจกรรม (Activity Detail Editing):**
   * กดปุ่ม "✏️ แก้ไขรายละเอียด" เพื่อเปิดโหมดแก้ไข Inline
   * แก้ไขได้ทุกฟิลด์: **ชื่อกิจกรรม (Title)**, **ปี พ.ศ. (Year)**, **วันที่ (Date)**, **สถานที่ (Where)**, **รายละเอียด (Context)**, **หัวข้อ/วัตถุประสงค์ (What)**, **บทบาท (How)**
   * กด "💾 บันทึกการแก้ไข" เพื่อเซฟลง LocalStorage ถาวร
3. **การลบกิจกรรมทั้งชุด (Activity Deletion):**
   * ปุ่ม "🗑️ ลบกิจกรรมนี้ทั้งหมด" สำหรับลบกิจกรรมออกจากระบบ (พร้อม Dialog ยืนยัน)
4. **Persistent LocalStorage:**
   * ทุกการแก้ไขและการลบจะถูกเก็บใน LocalStorage key `dr_witcha_activities_v2` โดยอัตโนมัติ
   * สามารถรีเซ็ตกลับข้อมูลดั้งเดิมได้ (Reset to Default)

### 3.7 ระบบ Tab สลับโหมดการใช้งาน (Mode Switching)
* **Tab 1: 🖼️ คลังประวัติกิจกรรม (Timeline Gallery)** — แสดง Grid การ์ดกิจกรรม + ค้นหา + กรองปี
* **Tab 2: 🚨 AI สแกนใบหน้า & สะกดรอยผู้ต้องสงสัย (Security AI)** — โหมดความปลอดภัย + อัปโหลดใบหน้า + นับจำนวนคน

---

## 🐍 4. Python Backend — FastAPI + YOLOv8 AI Detection Server

### 4.1 สถาปัตยกรรม (Architecture)
```
┌─────────────────────┐       HTTP POST         ┌─────────────────────────────┐
│   React Frontend    │  ──────────────────────▶ │  Python FastAPI Server      │
│   (Port 5174)       │  { "url": imageUrl }     │  (Port 8000)                │
│                     │ ◀──────────────────────  │  YOLOv8 Model (yolov8n.pt)  │
│   FaceCanvasOverlay │  JSON: boxes[], count    │  OpenCV + NumPy             │
└─────────────────────┘                          └─────────────────────────────┘
```

### 4.2 API Endpoints

#### `GET /` — Health Check
```json
{ "status": "online", "service": "YOLOv8 People Detection Server", "version": "1.0.0" }
```

#### `POST /detect-people` — Upload File Detection
* **Input:** `multipart/form-data` (UploadFile)
* **Output:**
```json
{
  "success": true,
  "person_count": 12,
  "boxes": [
    {
      "raw_xyxy": [x1, y1, x2, y2],
      "confidence": 95.2,
      "center_x_pct": 48.5,
      "center_y_pct": 32.1,
      "width_pct": 12.3,
      "height_pct": 28.7
    }
  ]
}
```

#### `POST /detect-url` — URL-based Detection
* **Input:** `application/json` — `{ "url": "https://example.com/image.jpg" }`
* **Output:** Same format as `/detect-people`

### 4.3 YOLOv8 Detection Configuration
* **Model:** `yolov8n.pt` (Nano — lightweight, auto-downloads on first run)
* **Target Class:** `classes=[0]` (Person only — COCO Class 0)
* **Confidence Threshold:** `conf=0.35`
* **Bounding Box Format:** Relative percentage (0-100%) for responsive CSS overlay rendering

### 4.4 Frontend Integration Logic (`FaceCanvasOverlay.tsx`)
```
1. Component mounts → sends POST to http://localhost:8000/detect-url
2. If Python server responds (200 OK):
   → Render real YOLOv8 bounding boxes + "🤖 YOLOv8 AI REALTIME" badge
3. If Python server offline/timeout (1.2s):
   → Fallback to local head-level face positioning (anatomical estimation)
4. No hanging or infinite loading — 1.2s abort controller ensures fast fallback
```

### 4.5 วิธีติดตั้งและรัน Python Backend
```bash
# 1. เข้าไปที่โฟลเดอร์ backend
cd backend

# 2. ติดตั้งไลบรารี
pip install -r requirements.txt

# 3. รัน FastAPI Server
python main.py
# หรือ: uvicorn main:app --reload --port 8000

# Server จะขึ้นที่: http://localhost:8000
# React Frontend จะตรวจจับ Server อัตโนมัติ
```

---

## 🔧 5. State Management — Zustand Store (`usePortfolioStore`)

### 5.1 Store Interface
```typescript
interface PortfolioStore {
  activitiesList: Activity[];        // Current list (loaded from LocalStorage or default)
  selectedActivity: Activity | null; // Currently open activity in Modal
  isModalOpen: boolean;              // Modal visibility state

  setSelectedActivity: (activity: Activity | null) => void;
  setModalOpen: (isOpen: boolean) => void;

  deleteImage: (activityId: string, imageIndex: number) => void;  // Delete single photo
  updateActivity: (updated: Activity) => void;                     // Edit text details
  deleteActivity: (activityId: string) => void;                    // Delete entire activity
  resetToDefault: () => void;                                      // Restore original data
}
```

### 5.2 LocalStorage Persistence
* **Key:** `dr_witcha_activities_v2`
* **Behavior:** On first load, checks LocalStorage. If data exists, uses it. Otherwise loads from `src/data/activities.ts`.
* **On Edit/Delete:** Automatically saves updated list to LocalStorage.
* **On Reset:** Removes LocalStorage key and reloads original `activities.ts` data.

---

## 🚀 6. Prompt คำสั่งดั้งเดิมสำหรับนำไป Re-generate หรือสร้างใหม่

```text
โปรดสร้างเว็บแอพพลิเคชัน Portfolio & Activity Gallery สำหรับแสดงผลงานและประวัติการเข้าร่วมกิจกรรมของ "ดร.วิชชา ฉิมพลี" มหาวิทยาลัยสวนดุสิต โดยมีรายละเอียดดังนี้:

1. ดึงข้อมูลรูปภาพและรายละเอียดกิจกรรมจาก URL ทั้งหมดของมหาวิทยาลัยสวนดุสิต (dusit.ac.th) นำมาจัดเก็บในฐานข้อมูล JSON / TypeScript โดยมีโครงสร้าง id, title, date, year (พ.ศ.), context, what, where, how และ array ของภาพกิจกรรมทั้งหมด
2. กรองข้อมูลเฉพาะกิจกรรมจริงของ ดร.วิชชา ฉิมพลี และตัดรูปภาพขยะ เช่น โลโก้ แบนเนอร์ หรือไฟล์รูปย่อยที่ไม่เกี่ยวข้องออก ให้เหลือเฉพาะรูปภาพกิจกรรมคุณภาพสูง
3. ดีไซน์หน้าเว็บให้มีความสวยงาม พรีเมียม Modern สไตล์ Glassmorphism
   - Hero Section ด้านบนเป็นสีมืด Slate-950 พร้อมแสง Glow และ Stat Badges แสดงจำนวนกิจกรรม, รูปภาพรวม, ช่วงปี พ.ศ. และค่าความแม่นยำ Accuracy (%)
   - ส่วนเนื้อหาจัดเรียงแบบ Grid 2 คอลัมน์ ซ้าย-ขวา กระชับพอดี ไม่เว้นช่องว่างสีขาวเกินจำเป็น
4. ทำระบบ Dropdown เลือกดูตามปี พ.ศ. และช่องค้นหา (Search Bar) แบบ Real-time
5. ในการ์ดกิจกรรมแต่ละใบ ต้องสามารถกดเลื่อนดูรูปภาพย่อยได้ (Image Carousel Slider) และกดคลิกเพื่อดูรูปใหญ่พร้อมรายละเอียดกิจกรรมทั้งหมดได้ใน Popup / Modal
6. ภาพในหน้ารายละเอียดต้องสามารถลบออกได้ทุกรูป รวมถึงแก้ไขรายละเอียดข้อความทุกฟิลด์ได้ (Title, Date, Year, Where, Context, What, How) โดยบันทึกลง LocalStorage ถาวร
7. มีระบบ AI Security Scanner สำหรับอัปโหลดรูปบุคคลเป้าหมาย แล้วสแกนตรวจจับในภาพกิจกรรมทั้งหมด วาดวงกลมรอบใบหน้า นับจำนวนคน บอกสถานที่ และเวลา
8. เชื่อมต่อกับ Python FastAPI + YOLOv8 Backend (http://localhost:8000) เพื่อใช้ AI จริงในการตรวจจับบุคคล หากไม่มี Backend ให้ fallback ไปใช้ระบบประมาณตำแหน่งใบหน้าอัตโนมัติ
```

---

## 📁 7. โครงสร้างไฟล์ในโครงการ (Project Structure)
```text
DR.Witcha/
├── PROJECT_PROMPT.md                # ไฟล์ Master Prompt / Specification เล่มนี้
├── index.html                       # HTML Entry Point
├── package.json                     # Project Dependencies (React 18, Vite, Zustand, etc.)
├── vite.config.ts                   # Vite Configuration
├── tailwind.config.js               # Tailwind CSS Configuration
├── tsconfig.json                    # TypeScript Configuration
│
├── backend/                         # 🐍 Python AI Backend
│   ├── main.py                      # FastAPI Server + YOLOv8 Detection API
│   └── requirements.txt             # Python Dependencies
│
├── scripts/                         # Data Pipeline Scripts
│   ├── scrape_activities.js         # สคริปต์ดึงข้อมูลจากเว็บ dusit.ac.th
│   └── clean_activities.js          # สคริปต์กรองและทำความสะอาดข้อมูล
│
└── src/
    ├── App.tsx                      # Main App Component & Router
    ├── main.tsx                     # React Entry Point
    ├── index.css                    # Global Styles
    │
    ├── components/
    │   ├── ActivityCard.tsx          # การ์ดกิจกรรม + Image Carousel Slider
    │   ├── DetailModal.tsx           # Modal แสดงรูปใหญ่ + แก้ไข/ลบรูปภาพ/ลบกิจกรรม
    │   ├── FaceCanvasOverlay.tsx     # SVG Overlay วงกลมใบหน้า + YOLOv8 Integration
    │   ├── SecurityScanner.tsx       # หน้า AI Security Scanner (Upload + Scan Grid)
    │   ├── Timeline.tsx              # เลย์เอาต์ Grid 2 คอลัมน์ + Dropdown & Search
    │   └── Empty.tsx                 # Empty State Component
    │
    ├── data/
    │   └── activities.ts             # ฐานข้อมูลกิจกรรม + TypeScript Interface (84 activities)
    │
    ├── pages/
    │   └── Home.tsx                  # หน้าแรก: Hero Section + Stat Badges + Tab Switcher
    │
    └── store/
        └── usePortfolioStore.ts      # Zustand Global State + LocalStorage Persistence
```

---

## 🔄 8. Data Flow & Component Relationships
```
                     ┌──────────────────┐
                     │    Home.tsx       │
                     │  (Hero + Tabs)   │
                     └────┬────────┬────┘
                          │        │
              Tab: Gallery│        │Tab: Security
                          ▼        ▼
            ┌──────────────┐  ┌─────────────────┐
            │ Timeline.tsx │  │ SecurityScanner  │
            │ (Grid + UI)  │  │ (Upload + Grid)  │
            └──────┬───────┘  └────────┬─────────┘
                   │                   │
                   ▼                   ▼
         ┌───────────────┐   ┌─────────────────────┐
         │ ActivityCard  │   │ FaceCanvasOverlay    │
         │ (Carousel)    │   │ (SVG + YOLOv8 API)  │
         └───────┬───────┘   └─────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ DetailModal   │
         │ (Edit/Delete) │
         └───────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │ usePortfolioStore     │  ◀── LocalStorage (dr_witcha_activities_v2)
         │ (Zustand Global)     │  ◀── Default Data (activities.ts)
         └───────────────────────┘
```

---

## ✅ 9. Verification Checklist (การตรวจสอบระบบ)

| Feature | Status | Notes |
|---------|--------|-------|
| Hero Section + Stat Badges | ✅ | จำนวนกิจกรรม, รูปภาพ, ช่วงปี, Accuracy 100% |
| Grid 2-Column Layout | ✅ | ซ้าย-ขวา กระชับ ไร้ whitespace |
| Image Carousel in Cards | ✅ | ปุ่มซ้าย/ขวา + Counter |
| Year Dropdown Filter | ✅ | Dynamic จากข้อมูลจริง |
| Real-time Search | ✅ | ค้นหา Title, Where, Date, Context |
| Detail Modal + Lightbox | ✅ | Keyboard navigation (← → Esc) |
| Photo Deletion | ✅ | ลบทีละรูป + Confirm Dialog |
| Text Editing (Inline) | ✅ | แก้ไขทุกฟิลด์ + บันทึก LocalStorage |
| Activity Deletion | ✅ | ลบทั้งกิจกรรม + Confirm Dialog |
| LocalStorage Persistence | ✅ | Key: dr_witcha_activities_v2 |
| Tab Switcher (Gallery/Security) | ✅ | สลับ 2 โหมด |
| Security Scanner UI | ✅ | Upload + Target Name + Stats |
| Face Overlay SVG | ✅ | วงกลมที่ระดับหัว/ใบหน้า |
| YOLOv8 Backend Integration | ✅ | Auto-detect + Graceful fallback |
| Python FastAPI Server | ✅ | `/detect-people` + `/detect-url` |
| Responsive Design | ✅ | Mobile 1-col, Desktop 2-3 col |
| Framer Motion Animations | ✅ | Card enter/exit + Modal transitions |
