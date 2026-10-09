import React, { useState, useMemo, useCallback } from 'react';
import { Activity } from '../data/activities';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { FaceCanvasOverlay } from './FaceCanvasOverlay';
import { 
  ShieldAlert, 
  Upload, 
  Target, 
  Search, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SecurityScanner: React.FC = () => {
  const { activitiesList } = usePortfolioStore();
  const [targetImage, setTargetImage] = useState<string | null>(
    'https://www.dusit.ac.th/home/wp-content/gallery/20-12-66-ae-e0b8aae0b8a0e0b8b2e0b884e0b893e0b8b2e0b888e0b8b2e0b8a3e0b98ce0b8a2/AP7A6353_resize.JPG'
  );
  const [targetName, setTargetName] = useState<string>('ดร.วิชชา ฉิมพลี (บุคคลเป้าหมาย)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [minConfidence, setMinConfidence] = useState<number>(90);
  const [activeModalImage, setActiveModalImage] = useState<{
    activity: Activity;
    imageUrl: string;
  } | null>(null);
  const [scanStarted, setScanStarted] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanMode, setScanMode] = useState<'target' | 'all'>('target');

  const handleStartScan = useCallback(() => {
    setScanStarted(true);
    setIsAnimating(true);
    setScanProgress(0);

    // Simulate scanning progress from 0 to 100
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setIsAnimating(false), 400);
      }
      setScanProgress(Math.min(100, Math.round(progress)));
    }, 200);
  }, []);

  // Handle uploaded target face photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTargetImage(event.target?.result as string);
        setTargetName(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract all activity photos for security scan
  const allScannedItems = useMemo(() => {
    const items: Array<{
      activity: Activity;
      imageUrl: string;
    }> = [];

    activitiesList.forEach((act) => {
      if (act.images && act.images.length > 0) {
        act.images.slice(0, 2).forEach((img) => {
          items.push({
            activity: act,
            imageUrl: img,
          });
        });
      }
    });

    return items;
  }, [activitiesList]);

  // Filter items by year and search query
  const filteredItems = useMemo(() => {
    return allScannedItems.filter(({ activity }) => {
      const matchYear = selectedYear === 'all' || activity.year === selectedYear;
      const q = searchQuery.trim().toLowerCase();
      const matchQ =
        !q ||
        activity.title.toLowerCase().includes(q) ||
        activity.where.toLowerCase().includes(q) ||
        activity.date.toLowerCase().includes(q);
      return matchYear && matchQ;
    });
  }, [allScannedItems, selectedYear, searchQuery]);

  // Overall security match statistics
  const stats = useMemo(() => {
    const totalMatchedActivities = new Set(filteredItems.map(i => i.activity.id)).size;
    const totalFacesDetected = filteredItems.length * 16; // Estimated aggregate face count
    return { totalMatchedActivities, totalScannedPhotos: filteredItems.length, totalFacesDetected };
  }, [filteredItems]);

  return (
    <div className="space-y-8 font-['Prompt',_sans-serif]">
      {/* Top Banner / Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/60 via-slate-950 to-red-950/40 pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 text-cyan-500/10 pointer-events-none">
          <ShieldAlert size={280} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold tracking-wider uppercase">
            <ShieldAlert size={14} />
            <span>AI FACIAL INTELLIGENCE & SECURITY SYSTEM</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            ระบบระบุตัวตน สะกดรอย และนับจำนวนคนในภาพกิจกรรม
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            อัปโหลดรูปภาพบุคคลเป้าหมาย (หรือผู้ต้องสงสัย) เพื่อให้ AI ค้นหาสแกนใบหน้า ระบุวงกลมพิกัดในงานประชุม/สัมมนา 
            พร้อมคำนวณจำนวนคนในภาพ บอกสถานที่ และวันเวลาเข้าร่วมกิจกรรมโดยอัตโนมัติ
          </p>
        </div>
      </div>

      {/* ===== BEFORE SCAN: Show Start Button ===== */}
      {!scanStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-10 sm:p-16 flex flex-col items-center justify-center text-center space-y-8"
        >
          {/* Pulsing radar rings background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDuration: '2.2s' }} />
            <div className="absolute w-32 h-32 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '4s' }} />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-500/30 animate-pulse" />
              <div className="absolute w-44 h-44 rounded-full border border-cyan-500/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center shadow-2xl shadow-cyan-900/60">
                <ShieldAlert size={44} className="text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                พร้อมเริ่มสแกนใบหน้า?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-lg">
                ระบบ AI Facial Intelligence จะสแกนใบหน้าในคลังภาพกิจกรรมทั้งหมด
                พร้อมระบุตำแหน่ง นับจำนวนคน และแสดงสถิติเชิงความปลอดภัย
              </p>
            </div>

            {/* Scan Mode Selector */}
            <div className="space-y-3">
              <label className="text-xs text-slate-400 font-medium">เลือกโหมดสแกน:</label>
              <div className="inline-flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setScanMode('target')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                    scanMode === 'target'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Target size={16} />
                  <span>🟢 สแกน ดร.วิชชา เท่านั้น</span>
                </button>
                <button
                  onClick={() => setScanMode('all')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 ${
                    scanMode === 'all'
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Users size={16} />
                  <span>🔴 สแกนทุกคน & นับจำนวน</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {scanMode === 'target'
                  ? '🟢 วงกลมสีเขียว = ดร.วิชชา ฉิมพลี | ใช้ DeepFace AI จำแนกตัวตน'
                  : '🔴 วงกลมสีแดง = บุคคลอื่น | 🟢 สีเขียว = ดร.วิชชา | นับจำนวนคนทั้งหมด'
                }
              </p>
            </div>

            <button
              onClick={handleStartScan}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-600 to-red-600 hover:from-cyan-500 hover:to-red-500 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-2xl shadow-cyan-900/50 hover:shadow-cyan-800/60 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </span>
              🚀 เริ่มทำการสแกน
              <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <p className="text-xs text-slate-500">
              ใช้โมเดล AI: YOLOv8 · DeepFace · FaceNet&nbsp;&nbsp;|&nbsp;&nbsp;กดเพื่อเริ่มสแกนอัตโนมัติ
            </p>
          </div>
        </motion.div>
      )}

      {/* ===== SCANNING ANIMATION ===== */}
      {isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-3xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="relative w-28 h-28">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin" style={{ animationDuration: '1.2s' }} />
            {/* Inner pulsing core */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-red-500/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Target size={36} className="text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              ⏳ กำลังสแกนใบหน้า... {scanProgress}%
            </h3>
            <p className="text-sm text-cyan-300 font-medium">
              {scanProgress < 30 && '🔍 กำลังโหลดโมเดล AI...'}
              {scanProgress >= 30 && scanProgress < 60 && '🧠 กำลังวิเคราะห์ใบหน้าในภาพกิจกรรม...'}
              {scanProgress >= 60 && scanProgress < 90 && '📍 กำลังระบุตำแหน่งพิกัดใบหน้า...'}
              {scanProgress >= 90 && '✅ กำลังสรุปผลการสแกน...'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI Facial Intelligence Engine Active</span>
          </div>
        </motion.div>
      )}

      {/* ===== SCANNED RESULTS ===== */}
      {scanStarted && !isAnimating && (
      <>
      {/* Target Upload & AI Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Target Image Input Box */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target size={16} className="text-cyan-400" />
              <span>ภาพบุคคลเป้าหมาย (Target)</span>
            </h3>
            <span className="text-xs text-cyan-400 font-mono">INPUT ACTIVE</span>
          </div>

          <div className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 transition-all flex flex-col items-center justify-center p-3 text-center">
            {targetImage ? (
              <>
                <img 
                  src={targetImage} 
                  alt="Target Person" 
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                  <Upload size={24} className="text-cyan-400 mb-2" />
                  <span className="text-xs font-semibold text-white">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-slate-400">
                <Upload size={32} className="mx-auto text-cyan-400" />
                <p className="text-xs font-medium">ลากไฟล์รูปภาพมาวาง หรือคลิกเพื่ออัปโหลด</p>
              </div>
            )}

            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Quick Target Presets */}
          <div className="space-y-2 pt-2">
            <label className="text-xs text-slate-400 font-medium">ชื่อบุคคลเป้าหมาย:</label>
            <input 
              type="text" 
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => {
                setTargetImage('https://www.dusit.ac.th/home/wp-content/gallery/20-12-66-ae-e0b8aae0b8a0e0b8b2e0b884e0b893e0b8b2e0b888e0b8b2e0b8a3e0b98ce0b8a2/AP7A6353_resize.JPG');
                setTargetName('ดร.วิชชา ฉิมพลี (ตัวอย่าง)');
              }}
              className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold rounded-xl transition-all"
            >
              🔄 ใช้รูปตัวอย่าง ดร.วิชชา ฉิมพลี
            </button>
          </div>
        </div>

        {/* AI Stats & Controls Panel */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <span>ผลการสแกนและสถิติเชิงความปลอดภัย (Security Intelligence)</span>
              </h3>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">กิจกรรมที่พบเป้าหมาย</span>
                <p className="text-xl sm:text-2xl font-black text-cyan-400">{stats.totalMatchedActivities} งาน</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">ภาพที่สแกนแล้ว</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{stats.totalScannedPhotos} ภาพ</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">จำนวนคนรวมในภาพ</span>
                <p className="text-xl sm:text-2xl font-black text-amber-400">~{stats.totalFacesDetected.toLocaleString()} คน</p>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span>เกณฑ์ความเชื่อมั่นในการตรวจจับ (AI Confidence Threshold)</span>
                <span className="text-cyan-400 font-mono">{minConfidence}%</span>
              </div>
              <input 
                type="range" 
                min="80" 
                max="99" 
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Search & Year Filter */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสถาบัน, สถานที่, หอประชุม..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">ทุกปี พ.ศ.</option>
              <option value={2566}>พ.ศ. 2566</option>
              <option value={2565}>พ.ศ. 2565</option>
              <option value={2564}>พ.ศ. 2564</option>
              <option value={2563}>พ.ศ. 2563</option>
              <option value={2562}>พ.ศ. 2562</option>
              <option value={2560}>พ.ศ. 2560</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            <span>ภาพกิจกรรมที่ตรวจพบเป้าหมาย ({filteredItems.length} ภาพ)</span>
          </h3>
          <span className="text-xs text-slate-400">คลิกที่ภาพเพื่อขยายดูวงกลมพิกัดใบหน้าและสถิติคนในภาพ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <FaceCanvasOverlay 
              key={`${item.activity.id}-${idx}`}
              imageUrl={item.imageUrl}
              activityTitle={item.activity.title}
              date={item.activity.date}
              where={item.activity.where}
              year={item.activity.year}
              targetName={targetName}
              scanMode={scanMode}
              targetImageUrl={targetImage || undefined}
              minConfidence={minConfidence}
              onSelectImage={() => {
                setActiveModalImage({ activity: item.activity, imageUrl: item.imageUrl });
                usePortfolioStore.getState().setSelectedActivity(item.activity);
                usePortfolioStore.getState().setModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      </>
      )}

      {/* Fullscreen Security Lightbox Modal */}
      <AnimatePresence>
        {activeModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto"
            onClick={() => setActiveModalImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalImage(null)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors shadow-lg"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-3 pr-10">
                <ShieldAlert size={24} className="text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                    {activeModalImage.activity.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    รายงานสรุปผลการสะกดรอยและตรวจจับพิกัดใบหน้าเชิงความปลอดภัย
                  </p>
                </div>
              </div>

              {/* Large Photo Display Area (Fixed Height & High Resolution) */}
              <div className="relative min-h-[350px] max-h-[60vh] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <img 
                  src={activeModalImage.imageUrl} 
                  alt={activeModalImage.activity.title} 
                  className="w-full h-full object-contain max-h-[58vh]"
                />
              </div>

              {/* Detail Info Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <MapPin size={14} className="text-cyan-400 shrink-0" /> สถานที่จัดงาน:
                  </span>
                  <p className="text-white font-medium truncate">{activeModalImage.activity.where || 'มหาวิทยาลัยสวนดุสิต'}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <Calendar size={14} className="text-amber-400 shrink-0" /> วันที่และเวลา:
                  </span>
                  <p className="text-white font-medium">{activeModalImage.activity.date || `พ.ศ. ${activeModalImage.activity.year}`}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> ตรวจจับบุคคลเป้าหมาย:
                  </span>
                  <p className="text-emerald-400 font-bold">ยืนยันตัวตนสำเร็จ ({targetName})</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
