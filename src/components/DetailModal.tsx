import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Info, 
  Target, 
  UserCheck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  AlertTriangle,
  Layers,
  Crosshair
} from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { Activity } from '../data/activities';

const DetailModal: React.FC = () => {
  const { 
    selectedActivity, 
    isModalOpen, 
    setModalOpen, 
    setSelectedActivity, 
    deleteImage, 
    updateActivity, 
    deleteActivity 
  } = usePortfolioStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsEditing(false);
    if (selectedActivity) {
      setEditForm({ ...selectedActivity });
    }
  }, [selectedActivity]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen || !selectedActivity) return;
      if (isEditing) return;
      if (e.key === 'ArrowRight' && selectedActivity.images.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % selectedActivity.images.length);
      } else if (e.key === 'ArrowLeft' && selectedActivity.images.length > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + selectedActivity.images.length) % selectedActivity.images.length);
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedActivity, isEditing]);

  const handleClose = () => {
    setModalOpen(false);
    setIsEditing(false);
    setTimeout(() => {
      setSelectedActivity(null);
      setCurrentImageIndex(0);
    }, 300);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedActivity || selectedActivity.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedActivity.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedActivity || selectedActivity.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedActivity.images.length) % selectedActivity.images.length);
  };

  const handleDeleteCurrentPhoto = () => {
    if (!selectedActivity || selectedActivity.images.length === 0) return;
    if (window.confirm(`ลบรูปภาพลำดับที่ ${currentImageIndex + 1} นี้?`)) {
      deleteImage(selectedActivity.id, currentImageIndex);
      if (currentImageIndex >= selectedActivity.images.length - 1) {
        setCurrentImageIndex(Math.max(0, selectedActivity.images.length - 2));
      }
    }
  };

  const handleSaveEdit = () => {
    if (!selectedActivity) return;
    const updated: Activity = {
      ...selectedActivity,
      title: editForm.title || selectedActivity.title,
      year: Number(editForm.year) || selectedActivity.year,
      date: editForm.date || selectedActivity.date,
      where: editForm.where || selectedActivity.where,
      context: editForm.context || selectedActivity.context,
      what: editForm.what || selectedActivity.what,
      how: editForm.how || selectedActivity.how,
    };
    updateActivity(updated);
    setIsEditing(false);
  };

  const handleDeleteEntireActivity = () => {
    if (!selectedActivity) return;
    if (window.confirm(`ลบกิจกรรม "${selectedActivity.title}" ออกจากระบบทั้งหมด?`)) {
      deleteActivity(selectedActivity.id);
    }
  };

  if (!selectedActivity) return null;

  const images = selectedActivity.images || [];
  const currentImage = images[currentImageIndex] || images[0] || 'https://www.dusit.ac.th/home/wp-content/uploads/2020/08/1.jpg';

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="pointer-events-auto w-full max-w-5xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col border border-[rgba(0,212,255,0.2)] shadow-[0_0_80px_rgba(0,212,255,0.1)]"
              style={{ background: '#0d1526' }}
            >
              {/* Top accent line */}
              <div className="h-0.5 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff)' }} />

              {/* Top bar */}
              <div className="px-5 pt-4 pb-3 border-b border-[rgba(0,212,255,0.1)] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Crosshair size={14} className="text-[#00d4ff] shrink-0" />
                  <span className="font-mono text-[10px] font-bold text-[#00d4ff] tracking-widest uppercase truncate">
                    Activity Detail · {selectedActivity.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-neon flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      <Edit3 size={12} />
                      <span className="hidden sm:inline">แก้ไข</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        <Save size={12} />
                        บันทึก
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[rgba(0,212,255,0.15)] text-slate-400 hover:text-white transition-colors"
                      >
                        <RotateCcw size={12} />
                        ยกเลิก
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-xl border border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.4)] text-slate-400 hover:text-white transition-all"
                    title="ปิด (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Image viewport */}
                <div className="relative aspect-video w-full bg-[#030712] flex items-center justify-center overflow-hidden group/slider">
                  {images.length > 0 ? (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={currentImage}
                        alt={`${selectedActivity.title} - รูปที่ ${currentImageIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.dusit.ac.th/home/wp-content/uploads/2020/08/1.jpg';
                        }}
                      />
                    </AnimatePresence>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-3">
                      <ImageIcon size={40} />
                      <span className="font-mono text-sm">No images available</span>
                    </div>
                  )}

                  {/* Prev/Next buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 glass border border-[rgba(0,212,255,0.2)] text-[#00d4ff] rounded-xl transition-all opacity-80 sm:opacity-0 group-hover/slider:opacity-100 hover:border-[rgba(0,212,255,0.5)] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] z-20"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 glass border border-[rgba(0,212,255,0.2)] text-[#00d4ff] rounded-xl transition-all opacity-80 sm:opacity-0 group-hover/slider:opacity-100 hover:border-[rgba(0,212,255,0.5)] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] z-20"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Top overlay controls */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                    {images.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-[rgba(0,212,255,0.2)] font-mono text-[10px] font-bold text-[#00d4ff]">
                        <Layers size={10} />
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                    {images.length > 0 && (
                      <button
                        onClick={handleDeleteCurrentPhoto}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-900/70 hover:bg-red-700/80 border border-red-700/40 text-red-300 hover:text-white font-mono text-[10px] font-bold transition-all"
                      >
                        <Trash2 size={10} />
                        ลบรูปนี้
                      </button>
                    )}
                  </div>

                  {/* Bottom gradient + title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 px-5 py-5 z-20">
                    {!isEditing ? (
                      <>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#00ff88] mb-2">
                          <Calendar size={10} />
                          {selectedActivity.date} (พ.ศ. {selectedActivity.year})
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug drop-shadow-lg">
                          {selectedActivity.title}
                        </h2>
                      </>
                    ) : (
                      <div className="space-y-2 p-4 rounded-xl border border-[rgba(0,212,255,0.2)] bg-[rgba(13,21,38,0.95)] backdrop-blur-sm">
                        <label className="font-mono text-[10px] text-[#00d4ff] font-bold tracking-widest uppercase block">Edit Title</label>
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-[rgba(0,0,0,0.5)] border border-[rgba(0,212,255,0.2)] rounded-lg text-white text-sm font-bold focus:outline-none focus:border-[rgba(0,212,255,0.5)] font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-mono text-[9px] text-slate-500 uppercase">Date</label>
                            <input
                              type="text"
                              value={editForm.date || ''}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-[rgba(0,0,0,0.5)] border border-[rgba(0,212,255,0.15)] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                            />
                          </div>
                          <div>
                            <label className="font-mono text-[9px] text-slate-500 uppercase">Year (B.E.)</label>
                            <input
                              type="number"
                              value={editForm.year || 2566}
                              onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 bg-[rgba(0,0,0,0.5)] border border-[rgba(0,212,255,0.15)] rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[rgba(0,212,255,0.4)]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[rgba(0,255,136,0.4)] pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[rgba(0,255,136,0.4)] pointer-events-none" />
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="px-4 py-3 border-b border-[rgba(0,212,255,0.08)] flex gap-2 overflow-x-auto custom-scrollbar bg-[rgba(0,0,0,0.3)]">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                            : 'border-[rgba(0,212,255,0.1)] opacity-50 hover:opacity-80 hover:border-[rgba(0,212,255,0.3)]'
                        }`}
                      >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Article content */}
                <div className="p-5 sm:p-7 space-y-4">
                  {/* Context */}
                  <div className="rounded-xl border border-[rgba(0,212,255,0.1)] bg-[rgba(0,0,0,0.2)] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.04)]">
                      <Info size={13} className="text-[#00d4ff]" />
                      <span className="font-mono text-[10px] font-bold text-[#00d4ff] tracking-widest uppercase">Overview</span>
                    </div>
                    <div className="px-4 py-3">
                      {!isEditing ? (
                        <p className="text-slate-300 leading-relaxed text-sm">{selectedActivity.context}</p>
                      ) : (
                        <textarea
                          rows={3}
                          value={editForm.context || ''}
                          onChange={(e) => setEditForm({ ...editForm, context: e.target.value })}
                          className="w-full p-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.15)] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-[rgba(0,212,255,0.4)] font-mono resize-none"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* What */}
                    <div className="rounded-xl border border-[rgba(0,212,255,0.1)] bg-[rgba(0,0,0,0.2)] overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.08)] bg-[rgba(0,255,136,0.04)]">
                        <Target size={13} className="text-[#00ff88]" />
                        <span className="font-mono text-[10px] font-bold text-[#00ff88] tracking-widest uppercase">Objective</span>
                      </div>
                      <div className="px-4 py-3">
                        {!isEditing ? (
                          <p className="text-slate-300 text-sm leading-relaxed">{selectedActivity.what}</p>
                        ) : (
                          <textarea
                            rows={2}
                            value={editForm.what || ''}
                            onChange={(e) => setEditForm({ ...editForm, what: e.target.value })}
                            className="w-full p-2.5 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.15)] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-[rgba(0,212,255,0.4)] font-mono resize-none"
                          />
                        )}
                      </div>
                    </div>

                    {/* Where */}
                    <div className="rounded-xl border border-[rgba(0,212,255,0.1)] bg-[rgba(0,0,0,0.2)] overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.04)]">
                        <MapPin size={13} className="text-[#00d4ff]" />
                        <span className="font-mono text-[10px] font-bold text-[#00d4ff] tracking-widest uppercase">Location</span>
                      </div>
                      <div className="px-4 py-3">
                        {!isEditing ? (
                          <p className="text-slate-300 text-sm leading-relaxed">{selectedActivity.where}</p>
                        ) : (
                          <input
                            type="text"
                            value={editForm.where || ''}
                            onChange={(e) => setEditForm({ ...editForm, where: e.target.value })}
                            className="w-full p-2.5 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.15)] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-[rgba(0,212,255,0.4)] font-mono"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* How */}
                  <div className="rounded-xl border border-[rgba(0,212,255,0.1)] bg-[rgba(0,0,0,0.2)] overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(0,212,255,0.08)] bg-[rgba(0,212,255,0.04)]">
                      <UserCheck size={13} className="text-[#00d4ff]" />
                      <span className="font-mono text-[10px] font-bold text-[#00d4ff] tracking-widest uppercase">Role & Contribution</span>
                    </div>
                    <div className="px-4 py-3">
                      {!isEditing ? (
                        <p className="text-slate-300 text-sm leading-relaxed">{selectedActivity.how}</p>
                      ) : (
                        <textarea
                          rows={2}
                          value={editForm.how || ''}
                          onChange={(e) => setEditForm({ ...editForm, how: e.target.value })}
                          className="w-full p-2.5 bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.15)] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-[rgba(0,212,255,0.4)] font-mono resize-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[rgba(0,212,255,0.1)] flex flex-wrap items-center justify-between gap-3 bg-[rgba(0,0,0,0.3)] shrink-0">
                <button
                  onClick={handleDeleteEntireActivity}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-700/40 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 font-mono text-[11px] font-bold transition-all"
                >
                  <Trash2 size={12} />
                  ลบกิจกรรมทั้งหมด
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  {isEditing && (
                    <button
                      onClick={handleSaveEdit}
                      className="btn-primary flex items-center gap-1.5 px-5 py-2 rounded-xl font-mono text-xs font-bold"
                    >
                      <Save size={13} />
                      บันทึก
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-[rgba(0,212,255,0.15)] text-slate-400 hover:text-white hover:border-[rgba(0,212,255,0.3)] font-mono text-xs font-bold transition-all"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailModal;
