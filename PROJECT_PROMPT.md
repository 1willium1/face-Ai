# PROJECT_PROMPT — Master Specification

> SDU Face AI Intelligence — Portfolio & Activity Biometric Gallery
> ผู้พัฒนาโครงงาน: นายปวีณวัชร์ เหลืองอุทัย (รหัสนักศึกษา: 6811011662009)

## วัตถุประสงค์
สร้างเว็บแอปพลิเคชันระบบสรุปผลงาน กิจกรรมวิชาการ และงานวิจัยของ รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ มหาวิทยาลัยสวนดุสิต พร้อมระบบ AI Biometric สแกนและตรวจพิสูจน์ใบหน้าอัจฉริยะ (Smart Campus Face Intelligence)

## ขอบเขตงาน
1. **Activity Gallery** — Grid แสดงการ์ดกิจกรรมพร้อม Image Carousel, Search แบบ real-time, Filter ช่วงปี พ.ศ. 2560–2569, Modal แก้ไข/ลบ (persist LocalStorage `sdu_face_ai_activities_v4`)
2. **Stat Badges** — สรุปจำนวนกิจกรรมทั้งหมด, รูปภาพรวมในฐานข้อมูล, ช่วงปี พ.ศ., ความแม่นยำ AI Vector Matching
3. **AI Security Scanner & Detective Board** — อัปโหลดใบหน้าเป้าหมาย → ค้นหาและสแกนในคลังภาพกิจกรรม → วาดวงกลม/กรอบเรืองแสง (🎯 Target Match / ⭕ Crowd/Other Faces) + ค่า Confidence % + People Counter + Fallback เมื่อไม่มี Backend
4. **UI Design** — Dark Glassmorphism HUD Theme (Slate-950 + Glow Cyan-500/Emerald-400), Typography: Prompt / Inter, Framer Motion Micro-animations
5. **Backend & AI Architecture** — FastAPI + InsightFace SCRFD + ArcFace 512-D + ONNX Runtime, พร้อม Browser Face-API Fallback Engine
6. **Data Structure** — `Activity` interface (id, images[], date, year, title, context, what, where, how, sourceUrls) ครอบคลุม พ.ศ. 2560–2569

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Framer Motion + Lucide React
- Backend: FastAPI + Uvicorn + InsightFace + ArcFace + OpenCV + NumPy + ONNX Runtime

## เกณฑ์สำเร็จ
- `npm run dev` → http://localhost:5173 หรือ http://localhost:5174
- `npm run build` → tsc + vite build ผ่านสมบูรณ์
- ระบบสแกนและเปรียบเทียบใบหน้าทำงานได้ทั้งโหมด Online และ Browser-Fallback Mode
- ลบ/แก้ไขข้อมูลบันทึกลง LocalStorage อัตโนมัติ
