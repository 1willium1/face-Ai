import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, MapPin, Calendar, Database, RefreshCw, ScanSearch,
  X, ExternalLink, Users, ChevronDown, Cpu, Target,
  AlertTriangle, CheckCircle, Loader, ImageIcon, Plus,
  TrendingUp, Eye, Crosshair
} from 'lucide-react';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { FacePhoto } from './FacePhoto';

interface SearchMatch {
  image_url: string;
  activity_id: string;
  title: string;
  date: string;
  where: string;
  year: number;
  center_x_pct: number;
  center_y_pct: number;
  width_pct: number;
  height_pct: number;
  similarity: number;
  match_confidence: number;
}

const proxied = (url: string) => `/img-proxy?url=${encodeURIComponent(url)}`;

interface FullFace {
  face_id: number;
  center_x_pct: number;
  center_y_pct: number;
  width_pct: number;
  height_pct: number;
  is_target: boolean;
  match_confidence: number;
  match_name: string | null;
}

const evidenceNo = (url: string, i: number) => {
  let h = 0;
  for (let k = 0; k < url.length; k++) h = (h * 31 + url.charCodeAt(k)) >>> 0;
  return `#${(h % 90000 + 10000).toString(16).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
};

const getConfidenceColor = (conf: number) => {
  if (conf >= 80) return { text: 'text-[#00ff88]', border: 'border-[rgba(0,255,136,0.4)]', bg: 'bg-[rgba(0,255,136,0.08)]' };
  if (conf >= 60) return { text: 'text-[#00d4ff]', border: 'border-[rgba(0,212,255,0.4)]', bg: 'bg-[rgba(0,212,255,0.08)]' };
  return { text: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/08' };
};

/* ══ Processing Indicator ══ */
const ProcessingBar: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="h-0.5 w-full overflow-hidden rounded-full bg-[rgba(0,212,255,0.1)]">
    <div
      className="h-full rounded-full transition-all duration-300"
      style={{
        width: active ? '100%' : '0%',
        background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
        transition: active
          ? 'width 2s ease-in-out'
          : 'width 0.3s ease-out',
        boxShadow: active ? '0 0 10px rgba(0,255,136,0.5)' : 'none',
      }}
    />
  </div>
);

/* ══ Target Upload Panel ══ */
const TargetUploadPanel: React.FC<{
  targetImages: string[];
  targetName: string;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
  onNameChange: (n: string) => void;
}> = ({ targetImages, targetName, onFile, onRemove, onNameChange }) => (
  <div className="glass rounded-2xl border border-[rgba(0,212,255,0.15)] p-5 space-y-4">
    {/* Header */}
    <div className="flex items-center gap-2">
      <Target size={14} className="text-[#00d4ff]" />
      <span className="font-mono text-[11px] font-bold text-[#00d4ff] tracking-[0.15em] uppercase">
        Target Subject
      </span>
      <span className="ml-auto font-mono text-[10px] text-slate-500">
        {targetImages.length}/12 FRAMES
      </span>
    </div>

    {/* Primary photo */}
    <div className="relative hud-corner p-1">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0a0f1e] border border-[rgba(0,212,255,0.1)]">
        {targetImages.length > 0 ? (
          <>
            <img src={targetImages[0]} alt="target" className="w-full h-full object-cover" />
            {/* Scan overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(180deg, transparent 60%, rgba(0,212,255,0.2) 100%)',
            }} />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(0,0,0,0.7)] backdrop-blur-sm border border-[rgba(0,255,136,0.2)]">
                <CheckCircle size={10} className="text-[#00ff88] shrink-0" />
                <span className="font-mono text-[10px] font-bold text-[#00ff88] truncate">{targetName || 'TARGET LOADED'}</span>
              </div>
            </div>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer group">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-[rgba(0,212,255,0.3)] group-hover:border-[rgba(0,212,255,0.6)] flex items-center justify-center transition-colors">
              <Upload size={20} className="text-[#00d4ff] opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-center">
              <p className="font-mono text-[11px] font-bold text-[#00d4ff] tracking-wider">UPLOAD PHOTO</p>
              <p className="text-[10px] text-slate-500 mt-0.5">หรือลากรูปมาวาง</p>
            </div>
            <input type="file" accept="image/*" multiple onChange={onFile} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
        )}
        {targetImages.length === 0 && (
          <input type="file" accept="image/*" multiple onChange={onFile} className="absolute inset-0 opacity-0 cursor-pointer" />
        )}
      </div>
    </div>

    {/* Name input */}
    {targetImages.length > 0 && (
      <div>
        <label className="block font-mono text-[10px] font-bold text-slate-500 tracking-widest mb-1.5 uppercase">
          Subject Label
        </label>
        <input
          type="text"
          value={targetName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="ชื่อผู้ต้องสงสัย..."
          className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(0,212,255,0.2)] rounded-lg px-3 py-2 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,212,255,0.5)] focus:shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all"
        />
      </div>
    )}

    {/* Multi-angle thumbnails */}
    {targetImages.length > 0 && (
      <div>
        <p className="font-mono text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">
          Multi-Angle Frames
        </p>
        <div className="flex flex-wrap gap-2">
          {targetImages.map((t, i) => (
            <div key={i} className={`relative w-10 h-10 rounded-lg overflow-hidden border ${i === 0 ? 'border-[rgba(0,255,136,0.5)]' : 'border-[rgba(0,212,255,0.2)]'}`}>
              <img src={t} alt={`frame-${i}`} className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(i)}
                className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)] opacity-0 hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-red-400" />
              </button>
            </div>
          ))}
          {targetImages.length < 12 && (
            <label className="relative w-10 h-10 rounded-lg border border-dashed border-[rgba(0,212,255,0.2)] hover:border-[rgba(0,212,255,0.5)] flex items-center justify-center cursor-pointer transition-colors">
              <Plus size={14} className="text-[#00d4ff] opacity-60" />
              <input type="file" accept="image/*" multiple onChange={onFile} className="hidden" />
            </label>
          )}
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5">ยิ่งหลายมุมยิ่งแม่นยำ</p>
      </div>
    )}
  </div>
);

/* ══ Search Controls Panel ══ */
const SearchControlPanel: React.FC<{
  threshold: number;
  topK: number;
  onThresholdChange: (v: number) => void;
  onTopKChange: (v: number) => void;
  onSearch: () => void;
  isSearching: boolean;
  hasTarget: boolean;
  searchInfo: string;
  idxStatus: { images: number; faces: number } | null;
  onRefreshIndex: () => void;
}> = ({
  threshold, topK, onThresholdChange, onTopKChange,
  onSearch, isSearching, hasTarget, searchInfo,
  idxStatus, onRefreshIndex,
}) => (
  <div className="glass rounded-2xl border border-[rgba(0,212,255,0.15)] p-5 space-y-5">
    {/* DB Status */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database size={13} className="text-[#00d4ff]" />
        <span className="font-mono text-[10px] font-bold text-[#00d4ff] tracking-[0.15em] uppercase">
          Gallery Index
        </span>
      </div>
      <button
        onClick={onRefreshIndex}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.05)] hover:border-[rgba(0,212,255,0.3)] text-[10px] font-mono font-bold text-slate-400 hover:text-[#00d4ff] transition-all"
      >
        <RefreshCw size={10} />
        REFRESH
      </button>
    </div>

    {/* DB info */}
    <div className="grid grid-cols-2 gap-2">
      <div className="px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(0,212,255,0.08)]">
        <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Images</p>
        <p className="font-mono text-sm font-bold text-[#00d4ff]">{idxStatus ? idxStatus.images.toLocaleString() : '—'}</p>
      </div>
      <div className="px-3 py-2 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(0,212,255,0.08)]">
        <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Faces</p>
        <p className="font-mono text-sm font-bold text-[#00ff88]">{idxStatus ? idxStatus.faces.toLocaleString() : '—'}</p>
      </div>
    </div>

    <div className="cyber-divider" />

    {/* Threshold */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-mono text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          Similarity Threshold
        </label>
        <span className="font-mono text-sm font-bold"
          style={{ color: threshold >= 80 ? '#00ff88' : threshold >= 65 ? '#00d4ff' : '#f59e0b' }}>
          {threshold}%
        </span>
      </div>
      <input
        type="range" min={50} max={99} value={threshold}
        onChange={e => onThresholdChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
      <div className="flex justify-between font-mono text-[9px] text-slate-600">
        <span>LOW (50%)</span>
        <span>BALANCED (70%)</span>
        <span>STRICT (99%)</span>
      </div>
    </div>

    {/* Top K */}
    <div className="space-y-2">
      <label className="font-mono text-[10px] font-bold text-slate-400 tracking-widest uppercase block">
        Max Results
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {[30, 50, 100, 200, 500, 2000].map(k => (
          <button
            key={k} onClick={() => onTopKChange(k)}
            className={`py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              topK === k
                ? 'bg-[rgba(0,255,136,0.15)] border border-[rgba(0,255,136,0.4)] text-[#00ff88]'
                : 'border border-[rgba(0,212,255,0.1)] text-slate-500 hover:border-[rgba(0,212,255,0.3)] hover:text-slate-300'
            }`}
          >
            {k >= 1000 ? `${k/1000}K` : k}
          </button>
        ))}
      </div>
    </div>

    {/* Search Button */}
    <button
      onClick={onSearch}
      disabled={!hasTarget || isSearching}
      className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
    >
      {isSearching ? (
        <>
          <Loader size={16} className="animate-spin" />
          กำลังค้นหา...
        </>
      ) : (
        <>
          <ScanSearch size={16} />
          เริ่มค้นหาใบหน้า
        </>
      )}
    </button>

    {/* Processing bar */}
    <ProcessingBar active={isSearching} />

    {/* Search info */}
    {searchInfo && (
      <p className="font-mono text-[10px] text-slate-500 leading-relaxed break-words">{searchInfo}</p>
    )}
  </div>
);

/* ══ Result Card ══ */
const ResultCard: React.FC<{
  m: SearchMatch;
  i: number;
  scanned?: FullFace[];
  scanningCards: boolean;
  imgRetry: Record<string, number>;
  targetImages: string[];
  onSelect: () => void;
  onRetryImg: (url: string) => void;
}> = ({ m, i, scanned, scanningCards, imgRetry, targetImages, onSelect, onRetryImg }) => {
  const conf = m.match_confidence;
  const colors = getConfidenceColor(conf);
  const gCount = scanned ? scanned.filter(f => f.is_target).length : 0;
  const rCount = scanned ? scanned.length - gCount : 0;
  const isLow = conf < 40;

  return (
    <figure
      onClick={onSelect}
      className={`card-hover relative rounded-2xl overflow-hidden border cursor-pointer group ${
        isLow
          ? 'border-amber-400/20 opacity-60'
          : 'border-[rgba(0,212,255,0.12)]'
      } bg-[#0d1526]`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#030712] overflow-hidden">
        {(imgRetry[m.image_url] ?? 0) > 2 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <ImageIcon size={24} className="text-slate-600" />
            <p className="font-mono text-[10px] text-slate-500">Image unavailable</p>
            <a href={m.image_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
              className="font-mono text-[10px] text-[#00d4ff] underline hover:text-[#00ff88] transition-colors">
              Open original →
            </a>
          </div>
        ) : (
          <FacePhoto
            src={proxied(m.image_url) + ((imgRetry[m.image_url] ?? 0) > 0 ? `&r=${imgRetry[m.image_url]}` : '')}
            alt={m.title}
            fit="cover"
            boxes={scanned || [{ ...m, is_target: false }]}
            onError={() => onRetryImg(m.image_url)}
            className="absolute inset-0 w-full h-full"
          />
        )}

        {/* HUD overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />

        {/* Top-left: scan status */}
        {scanned ? (
          <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold bg-[rgba(0,255,136,0.85)] text-[#030712]">
              ✓{gCount}
            </span>
            {rCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold bg-[rgba(220,38,38,0.85)] text-white">
                ✗{rCount}
              </span>
            )}
          </div>
        ) : scanningCards ? (
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(0,0,0,0.7)] border border-[rgba(0,212,255,0.3)] font-mono text-[9px] text-[#00d4ff] animate-pulse">
              <Cpu size={8} /> SCANNING
            </span>
          </div>
        ) : null}

        {/* Top-right: confidence badge */}
        <div className="absolute top-2 right-2 pointer-events-none">
          <div className={`px-2 py-1 rounded-lg border ${colors.border} ${colors.bg} backdrop-blur-sm`}>
            <p className={`font-mono text-[11px] font-bold ${colors.text}`}>{conf.toFixed(1)}%</p>
          </div>
        </div>

        {/* Bottom: evidence ID */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="font-mono text-[9px] font-bold text-[#00d4ff] tracking-widest">{evidenceNo(m.image_url, i)}</p>
        </div>
      </div>

      {/* Info */}
      <figcaption className="p-3 space-y-2">
        {isLow && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <AlertTriangle size={10} className="text-amber-400 shrink-0" />
            <span className="font-mono text-[9px] font-bold text-amber-400">LOW CONFIDENCE</span>
          </div>
        )}

        <p className="text-xs font-semibold text-slate-200 line-clamp-1 leading-snug">
          {m.title || 'กิจกรรม มหาวิทยาลัยสวนดุสิต'}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={9} className="text-[#00d4ff] shrink-0" />
            {m.where || 'ม.สวนดุสิต'}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar size={9} className="text-[#00ff88]" />
            {m.date || `พ.ศ. ${m.year}`}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="h-0.5 rounded-full bg-[rgba(0,212,255,0.08)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, conf)}%`,
              background: conf >= 80 ? '#00ff88' : conf >= 60 ? '#00d4ff' : '#f59e0b',
              boxShadow: `0 0 6px ${conf >= 80 ? 'rgba(0,255,136,0.5)' : conf >= 60 ? 'rgba(0,212,255,0.5)' : 'rgba(245,158,11,0.5)'}`,
            }}
          />
        </div>
      </figcaption>
    </figure>
  );
};

/* ══ Detail Modal ══ */
const MatchDetailModal: React.FC<{
  m: SearchMatch;
  allFaces: FullFace[] | null;
  loadingAll: boolean;
  matches: SearchMatch[];
  targetImages: string[];
  onClose: () => void;
  onScanAll: () => void;
  sourceUrl: string | null;
}> = ({ m, allFaces, loadingAll, matches, targetImages, onClose, onScanAll, sourceUrl }) => {
  const targetCount = (allFaces || []).filter(f => f.is_target).length;
  const otherCount = (allFaces || []).length - targetCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(3,7,18,0.92)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-auto rounded-2xl overflow-hidden border border-[rgba(0,212,255,0.2)] bg-[#0d1526] shadow-[0_0_80px_rgba(0,212,255,0.1)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff)' }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[rgba(0,212,255,0.1)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] font-bold text-[#00d4ff] tracking-widest">
                  {evidenceNo(m.image_url, matches.indexOf(m))}
                </span>
                <span className="tag-cyber">ACT-{m.activity_id}</span>
                <span className={`tag-match`}>{m.match_confidence.toFixed(1)}% MATCH</span>
              </div>
              <h2 className="text-base font-bold text-white line-clamp-2">
                {m.title || 'กิจกรรม มหาวิทยาลัยสวนดุสิต'}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {targetImages.length > 0 && (
                <button
                  onClick={onScanAll} disabled={loadingAll}
                  className="btn-neon flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {loadingAll ? <Loader size={12} className="animate-spin" /> : <Users size={12} />}
                  {loadingAll ? 'Scanning...' : allFaces ? 'Re-scan' : 'Scan All Faces'}
                </button>
              )}
              <button onClick={onClose}
                className="p-2 rounded-xl border border-[rgba(0,212,255,0.15)] hover:border-[rgba(0,212,255,0.4)] text-slate-400 hover:text-white transition-all">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Face count summary */}
          {allFaces && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)]">
                <Eye size={11} className="text-[#00d4ff]" />
                <span className="font-mono text-[10px] font-bold text-[#00d4ff]">{allFaces.length} FACES DETECTED</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.2)]">
                <CheckCircle size={11} className="text-[#00ff88]" />
                <span className="font-mono text-[10px] font-bold text-[#00ff88]">{targetCount} TARGET MATCH</span>
              </div>
              {otherCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/25">
                  <span className="font-mono text-[10px] font-bold text-red-400">{otherCount} OTHER</span>
                </div>
              )}
            </div>
          )}

          {!allFaces && !loadingAll && targetImages.length > 0 && (
            <p className="mt-2 font-mono text-[10px] text-slate-500">
              💡 คลิก "Scan All Faces" เพื่อให้ AI ระบุตำแหน่งใบหน้าทุกคนในภาพ
            </p>
          )}
          {loadingAll && !allFaces && (
            <div className="mt-2 flex items-center gap-2">
              <Loader size={11} className="text-[#00d4ff] animate-spin" />
              <p className="font-mono text-[10px] text-[#00d4ff] animate-pulse">กำลังสแกนใบหน้าทั้งหมด...</p>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative bg-[#030712] overflow-hidden mx-6 mt-5 rounded-xl border border-[rgba(0,212,255,0.1)]"
          style={{ height: '50vh' }}>
          <FacePhoto
            src={proxied(m.image_url)}
            alt={m.title}
            fit="contain"
            eager
            boxes={allFaces || [{ ...m, is_target: false }]}
            className="absolute inset-0 w-full h-full"
          />
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[rgba(0,255,136,0.5)] pointer-events-none" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[rgba(0,255,136,0.5)] pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[rgba(0,255,136,0.5)] pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[rgba(0,255,136,0.5)] pointer-events-none" />
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6">
          <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(0,212,255,0.08)] space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 uppercase">
              <MapPin size={10} className="text-[#00d4ff]" /> Location
            </div>
            <p className="text-sm font-semibold text-slate-200">{m.where || 'มหาวิทยาลัยสวนดุสิต'}</p>
          </div>
          <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(0,212,255,0.08)] space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 uppercase">
              <Calendar size={10} className="text-[#00ff88]" /> Date
            </div>
            <p className="text-sm font-semibold text-slate-200">{m.date || `พ.ศ. ${m.year}`}</p>
          </div>
          <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(0,212,255,0.08)] space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 uppercase">
              <TrendingUp size={10} className="text-[#00ff88]" /> Similarity
            </div>
            <p className="text-sm font-bold" style={{ color: getConfidenceColor(m.match_confidence).text.replace('text-[', '').replace(']', '') }}>
              {m.match_confidence.toFixed(2)}%
            </p>
            <p className="font-mono text-[9px] text-slate-600">score: {m.similarity.toFixed(4)}</p>
          </div>
          <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(0,212,255,0.08)] space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Links</div>
            <a href={m.image_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#00d4ff] hover:text-[#00ff88] transition-colors">
              View Image <ExternalLink size={10} />
            </a>
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#00d4ff] hover:text-[#00ff88] transition-colors">
                Source Post <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══ Main PersonSearch Component ══ */
export const PersonSearch: React.FC = () => {
  const [targetImages, setTargetImages] = useState<string[]>([]);
  const [targetName, setTargetName] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(70);
  const [topK, setTopK] = useState<number>(50);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [searchInfo, setSearchInfo] = useState<string>('');
  const [idxStatus, setIdxStatus] = useState<{ images: number; faces: number } | null>(null);
  const [selected, setSelected] = useState<SearchMatch | null>(null);
  const [allFaces, setAllFaces] = useState<FullFace[] | null>(null);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [scanMap, setScanMap] = useState<Record<string, FullFace[]>>({});
  const [scanningCards, setScanningCards] = useState<boolean>(false);
  const [imgRetry, setImgRetry] = useState<Record<string, number>>({});
  const { activitiesList } = usePortfolioStore();

  const sourcePostUrl = (m: SearchMatch): string | null => {
    const act = activitiesList.find(a => a.id === m.activity_id);
    const urls = act?.sourceUrls;
    return urls && urls.length > 0 ? urls[0] : null;
  };

  const showAllFaces = async (m: SearchMatch) => {
    if (targetImages.length === 0 || loadingAll) return;
    setLoadingAll(true);
    setAllFaces(null);
    try {
      const res = await fetch('http://localhost:8000/recognize-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: m.image_url,
          target_images_base64: targetImages,
          target_name: targetName,
          threshold: threshold / 100,
        }),
      });
      const data = await res.json();
      if (data.success) setAllFaces(data.face_matches || []);
    } catch { /* backend offline */ }
    setLoadingAll(false);
  };

  useEffect(() => { setAllFaces(null); }, [selected]);

  const autoScanCards = async (list: SearchMatch[], tImages: string[], tName: string, thr: number, maxAutoScan = 20) => {
    const urls = list.slice(0, maxAutoScan).map(m => m.image_url);
    if (urls.length === 0 || tImages.length === 0) return;
    setScanningCards(true);
    try {
      const res = await fetch('http://localhost:8000/recognize-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_urls: urls,
          target_images_base64: tImages,
          target_name: tName,
          threshold: thr / 100,
          max_images: maxAutoScan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const map: Record<string, FullFace[]> = {};
        for (const r of data.results || []) {
          if (r.success && r.face_matches) map[r.image_url] = r.face_matches;
        }
        setScanMap(map);
      }
    } catch { /* silent */ }
    setScanningCards(false);
  };

  const showAllRef = useRef(showAllFaces);
  showAllRef.current = showAllFaces;

  useEffect(() => {
    if (!selected) return;
    const cached = scanMap[selected.image_url];
    if (cached) { setAllFaces(cached); return; }
    if (targetImages.length > 0) showAllRef.current(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, scanMap]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const fetchIndexStatus = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/gallery-index-status');
      if (res.ok) {
        const d = await res.json();
        setIdxStatus({ images: d.images_indexed || 0, faces: d.faces_total || 0 });
      }
    } catch { /* backend offline */ }
  }, []);

  useEffect(() => { fetchIndexStatus(); }, [fetchIndexStatus]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 12);
    if (files.length === 0) return;
    e.target.value = '';
    files.forEach((file, fi) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setTargetImages(prev => (prev.length >= 12 ? prev : [...prev, url]));
        if (fi === 0) setTargetName(prev => prev || file.name.replace(/\.[^/.]+$/, ''));
        setSearched(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeTarget = (idx: number) => {
    setTargetImages(prev => prev.filter((_, i) => i !== idx));
    setSearched(false);
  };

  const handleSearch = async () => {
    if (targetImages.length === 0 || isSearching) return;
    setIsSearching(true);
    setSearched(false);
    try {
      const res = await fetch('http://localhost:8000/search-person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_images_base64: targetImages,
          target_name: targetName,
          threshold: threshold / 100,
          top_k: topK,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const list: SearchMatch[] = data.matches || [];
        setMatches(list);
        setImgRetry({});
        setScanMap({});
        setSearchInfo(
          `Scanned ${(data.faces_compared || 0).toLocaleString()} faces in ${(data.images_searched || 0).toLocaleString()} images · ${data.processing_ms}ms · ${data.target_views || targetImages.length} target frames`
        );
        autoScanCards(list, targetImages, targetName, threshold, Math.min(topK, 30));
      } else {
        setMatches([]);
        setSearchInfo(data.error || 'Search failed');
      }
    } catch {
      setMatches([]);
      setSearchInfo('Cannot connect to backend (is python main.py running?)');
    }
    setSearched(true);
    setIsSearching(false);
    fetchIndexStatus();
  };

  return (
    <div className="space-y-6">
      {/* ── Control Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Left: Upload */}
        <TargetUploadPanel
          targetImages={targetImages}
          targetName={targetName}
          onFile={handleFile}
          onRemove={removeTarget}
          onNameChange={setTargetName}
        />

        {/* Right: Controls */}
        <SearchControlPanel
          threshold={threshold}
          topK={topK}
          onThresholdChange={setThreshold}
          onTopKChange={setTopK}
          onSearch={handleSearch}
          isSearching={isSearching}
          hasTarget={targetImages.length > 0}
          searchInfo={searchInfo}
          idxStatus={idxStatus}
          onRefreshIndex={fetchIndexStatus}
        />
      </div>

      {/* ── Results Section ── */}
      {searched && (
        <div className="space-y-5">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Crosshair size={16} className={matches.length > 0 ? 'text-[#00ff88]' : 'text-slate-500'} />
                <span className="font-mono text-sm font-bold text-white">
                  {matches.length > 0 ? `${matches.length} Results Found` : 'No Matches Found'}
                </span>
              </div>
              {matches.length > 0 && (
                <span className="tag-match">SORTED BY CONFIDENCE</span>
              )}
            </div>
            {scanningCards && (
              <div className="flex items-center gap-2">
                <Loader size={12} className="text-[#00d4ff] animate-spin" />
                <span className="font-mono text-[10px] text-[#00d4ff] animate-pulse">Auto-scanning frames...</span>
              </div>
            )}
          </div>

          {matches.length === 0 && (
            <div className="glass rounded-2xl border border-[rgba(0,212,255,0.1)] p-12 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[rgba(0,212,255,0.2)] flex items-center justify-center mx-auto mb-4">
                <ScanSearch size={24} className="text-slate-600" />
              </div>
              <p className="font-bold text-slate-400 mb-1">ไม่พบใบหน้าที่ตรงกัน</p>
              <p className="font-mono text-[11px] text-slate-600">ลองลดค่า Similarity Threshold ลงหรืออัปโหลดรูปที่ชัดขึ้น</p>
            </div>
          )}

          {/* Cards grid */}
          {matches.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {matches.map((m, i) => (
                <ResultCard
                  key={`${m.image_url}-${i}`}
                  m={m} i={i}
                  scanned={scanMap[m.image_url]}
                  scanningCards={scanningCards}
                  imgRetry={imgRetry}
                  targetImages={targetImages}
                  onSelect={() => setSelected(m)}
                  onRetryImg={(url) => setImgRetry(prev => ({ ...prev, [url]: (prev[url] ?? 0) + 1 }))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <MatchDetailModal
          m={selected}
          allFaces={allFaces}
          loadingAll={loadingAll}
          matches={matches}
          targetImages={targetImages}
          onClose={() => setSelected(null)}
          onScanAll={() => showAllFaces(selected)}
          sourceUrl={sourcePostUrl(selected)}
        />
      )}
    </div>
  );
};
