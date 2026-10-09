import React, { useMemo } from 'react';
import { PersonSearch } from '../components/PersonSearch';
import DetailModal from '../components/DetailModal';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { 
  Cpu, 
  Database, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Fingerprint,
  Eye,
  Zap,
  Globe
} from 'lucide-react';

/* ── HUD Scan Line ── */
const ScanLineOverlay: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
    <div
      className="absolute left-0 right-0 h-[2px] opacity-20"
      style={{
        background: 'linear-gradient(90deg, transparent, #00d4ff, #00ff88, #00d4ff, transparent)',
        animation: 'scan-line 6s linear infinite',
        top: 0,
      }}
    />
  </div>
);

/* ── Animated Grid Background ── */
const GridBackground: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 grid-bg" />
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 60%)',
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,255,136,0.04) 0%, transparent 50%)',
      }}
    />
  </div>
);

/* ── Stat Card ── */
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: 'cyan' | 'green' }> = ({
  icon, label, value, accent = 'cyan',
}) => {
  const accentClass = accent === 'green' 
    ? 'border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.05)]' 
    : 'border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)]';
  const iconColor = accent === 'green' ? 'text-[#00ff88]' : 'text-[#00d4ff]';
  const valueColor = accent === 'green' ? 'text-[#00ff88]' : 'text-[#00d4ff]';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${accentClass} backdrop-blur-sm`}>
      <span className={`${iconColor} shrink-0`}>{icon}</span>
      <div>
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-bold ${valueColor} font-mono`}>{value}</p>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const Security: React.FC = () => {
  const { activitiesList } = usePortfolioStore();

  const stats = useMemo(() => {
    const totalActivities = activitiesList.length;
    const totalImages = activitiesList.reduce((acc, curr) => acc + (curr.images ? curr.images.length : 0), 0);
    const years = activitiesList.map(a => a.year).filter(Boolean);
    const minYear = years.length ? Math.min(...years) : 2556;
    const maxYear = years.length ? Math.max(...years) : 2569;
    return { totalActivities, totalImages, minYear, maxYear };
  }, [activitiesList]);

  return (
    <div className="min-h-screen bg-[#030712] font-['Inter',_'Prompt',_sans-serif] relative">
      <GridBackground />
      <ScanLineOverlay />

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-40 glass border-b border-[rgba(0,212,255,0.12)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#00ff88] opacity-20 animate-neon" />
                <Fingerprint size={18} className="text-[#00d4ff] relative z-10" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-mono font-bold text-[#00d4ff] tracking-[0.2em] uppercase">Suan Dusit University</p>
                <p className="text-xs font-bold text-white leading-none">Biometric Intelligence System</p>
              </div>
              <div className="sm:hidden">
                <p className="text-xs font-bold text-[#00d4ff]">BIS</p>
              </div>
            </div>

            {/* Center badge */}
            <div className="flex items-center gap-2">
              <span className="hidden md:flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#00ff88] tracking-widest">
                <span className="status-online" />
                SYSTEM ONLINE
              </span>
              <div className="h-4 w-px bg-[rgba(0,212,255,0.2)] hidden md:block" />
              <span className="font-mono text-[10px] font-bold text-slate-500 tracking-widest hidden md:block">
                SDU-FACE-AI / v2.0
              </span>
            </div>

            {/* Right: engine badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(0,255,136,0.25)] bg-[rgba(0,255,136,0.06)]">
                <Cpu size={12} className="text-[#00ff88]" />
                <span className="text-[10px] font-mono font-bold text-[#00ff88] tracking-wider hidden sm:block">
                  InsightFace · ArcFace
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative z-10 pt-14 pb-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Label */}
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.06)] font-mono text-[11px] font-bold text-[#00d4ff] tracking-[0.2em] uppercase">
                <Eye size={12} className="animate-scan" />
                Facial Recognition Intelligence Platform
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              ระบบตรวจสอบ
              <span className="block" style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ใบหน้า AI
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 font-medium mb-2 max-w-2xl mx-auto leading-relaxed">
              อัปโหลดรูปใบหน้าเป้าหมาย ระบบ AI จะค้นหาในฐานข้อมูลภาพกิจกรรมมหาวิทยาลัยสวนดุสิตทั้งหมด
            </p>
            <p className="text-sm text-slate-600 font-mono mb-10">
              ขับเคลื่อนด้วย InsightFace SCRFD + ArcFace 512-D Vector Matching
            </p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3"
            >
              <StatCard
                icon={<Activity size={16} />}
                label="กิจกรรมทั้งหมด"
                value={stats.totalActivities.toLocaleString()}
                accent="cyan"
              />
              <StatCard
                icon={<Layers size={16} />}
                label="รูปภาพในฐานข้อมูล"
                value={stats.totalImages.toLocaleString()}
                accent="green"
              />
              <StatCard
                icon={<Globe size={16} />}
                label="ช่วงปีข้อมูล"
                value={`พ.ศ. ${stats.minYear}–${stats.maxYear}`}
                accent="cyan"
              />
              <StatCard
                icon={<ShieldCheck size={16} />}
                label="AI Engine"
                value="ArcFace 512-D"
                accent="green"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="max-w-5xl mx-auto mt-10">
          <div className="cyber-divider" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <PersonSearch />
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[rgba(0,212,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint size={14} className="text-[#00d4ff]" />
            <p className="font-mono text-[11px] text-slate-500">
              SDU Biometric Intelligence System · มหาวิทยาลัยสวนดุสิต
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-slate-600">
              Powered by <span className="text-[#00ff88]">InsightFace</span> + <span className="text-[#00d4ff]">ArcFace</span>
            </span>
            <Zap size={12} className="text-[#00ff88] animate-scan" />
          </div>
        </div>
      </footer>

      {/* Modal */}
      <DetailModal />
    </div>
  );
};

export default Security;
