@echo off
REM =====================================================
REM  Face Recognition System - รันระบบทั้งหมดในคลิกเดียว
REM  1. Backend  (python main.py)      -> http://localhost:8000
REM  2. Frontend (npm run dev)         -> http://localhost:5174
REM  อย่าปิดหน้าต่างดำที่เปิดขึ้นมา (ย่อไว้ได้)
REM =====================================================
cd /d "%~dp0backend"
start "1-Backend :8000 (ห้ามปิด)" python main.py
cd /d "%~dp0"
start "2-Frontend :5174 (ห้ามปิด)" cmd /c "npm run dev"
echo.
echo กำลังสตาร์ท... รอประมาณ 30 วินาทีแล้วเปิด http://localhost:5174
echo เช็ค backend ที่ http://localhost:8000/face-status
pause
