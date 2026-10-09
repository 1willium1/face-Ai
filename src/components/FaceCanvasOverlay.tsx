import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Users, Target, MapPin, Calendar, UserX, Cpu, Sparkles, AlertTriangle } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { queuedFaceDetection } from '../utils/faceDetectionQueue';

interface FaceMatch {
  face_id: number;
  center_x_pct: number;
  center_y_pct: number;
  width_pct: number;
  height_pct: number;
  is_target: boolean;
  match_name: string | null;
  match_role: string | null;
  match_confidence: number;
}

interface FaceCanvasOverlayProps {
  imageUrl: string;
  activityTitle: string;
  date: string;
  where: string;
  year: number;
  isTargetMatch?: boolean;
  targetName?: string;
  onSelectImage?: () => void;
  scanMode?: 'target' | 'all';
  targetImageUrl?: string;
  minConfidence?: number; // 80-99 จากสไลเดอร์ SecurityScanner
}

let modelsLoaded = false;
let modelsLoadingPromise: Promise<void> | null = null;

const loadModels = () => {
  if (modelsLoaded) return Promise.resolve();
  if (modelsLoadingPromise) return modelsLoadingPromise;

  modelsLoadingPromise = (async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      modelsLoaded = true;
    } catch (err) {
      console.warn('Failed to load local face-api models:', err);
    }
  })();

  return modelsLoadingPromise;
};

/** โหลดรูปต่าง origin ผ่าน /img-proxy เพื่อเลี่ยง CORS ตอนอ่าน pixel */
const proxiedUrl = (url: string): string => {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
  try {
    if (new URL(url, window.location.href).origin === window.location.origin) return url;
  } catch {
    return url;
  }
  return `/img-proxy?url=${encodeURIComponent(url)}`;
};

/** ระยะห่าง descriptor ที่ถือว่าเป็นคนเดียวกัน (face-api มาตรฐานใช้ 0.6) */
const FACE_MATCH_THRESHOLD_DEFAULT = 0.55;

/** แปลงสไลเดอร์ 80-99% -> euclidean distance (เข้ม=ต่ำ): 80->0.65, 90->0.50, 99->0.35 */
const confidenceToDistance = (conf?: number): number => {
  if (!conf || conf < 80 || conf > 99) return FACE_MATCH_THRESHOLD_DEFAULT;
  return 0.65 - ((conf - 80) / 19) * 0.30;
};

/** descriptor ใบหน้าเป้าหมาย (cache ตาม URL รูปเป้าหมาย) */
let refCache: { url: string; descriptor: Float32Array | null } | null = null;

const loadImageEl = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img.complete && img.naturalWidth > 0 ? img : null);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

/** สกัด descriptor จากรูปเป้าหมาย (1 ใบหน้าที่ชัดที่สุด) */
const getReferenceDescriptor = async (targetUrl?: string): Promise<Float32Array | null> => {
  if (!targetUrl) return null;
  if (refCache && refCache.url === targetUrl) return refCache.descriptor;
  try {
    const img = await loadImageEl(proxiedUrl(targetUrl));
    if (!img) {
      refCache = { url: targetUrl, descriptor: null };
      return null;
    }
    const det = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    const descriptor = det?.descriptor ?? null;
    refCache = { url: targetUrl, descriptor };
    return descriptor;
  } catch (err) {
    console.warn('Reference face error:', err);
    return null;
  }
};

/** Deduplicate faces that overlap too much (IoU > threshold) */
const deduplicateFaces = (faces: FaceMatch[], iouThreshold = 0.4): FaceMatch[] => {
  const sorted = [...faces].sort((a, b) => b.match_confidence - a.match_confidence);
  const keep: FaceMatch[] = [];

  for (const face of sorted) {
    const isDuplicate = keep.some((existing) => {
      const x1 = Math.max(face.center_x_pct - face.width_pct / 2, existing.center_x_pct - existing.width_pct / 2);
      const y1 = Math.max(face.center_y_pct - face.height_pct / 2, existing.center_y_pct - existing.height_pct / 2);
      const x2 = Math.min(face.center_x_pct + face.width_pct / 2, existing.center_x_pct + existing.width_pct / 2);
      const y2 = Math.min(face.center_y_pct + face.height_pct / 2, existing.center_y_pct + existing.height_pct / 2);
      const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
      const areaA = face.width_pct * face.height_pct;
      const areaB = existing.width_pct * existing.height_pct;
      const union = areaA + areaB - intersection;
      return union > 0 ? intersection / union > iouThreshold : false;
    });
    if (!isDuplicate) keep.push(face);
  }

  // Re-assign sequential IDs
  return keep.map((f, i) => ({ ...f, face_id: i + 1 }));
};

/** cache ผลสแกนรายรูป (กันสแกนซ้ำตอนกรอง/เปลี่ยนหน้าแล้วกลับมา) */
type CachedResult = { matches: FaceMatch[]; personCount: number; aiEngine: string };
const resultCache = new Map<string, CachedResult>();
const cacheKey = (img: string, target?: string, conf?: number) => `${img}::${target ?? ''}::${conf ?? ''}`;

export const FaceCanvasOverlay: React.FC<FaceCanvasOverlayProps> = ({
  imageUrl,
  activityTitle,
  date,
  where,
  year,
  isTargetMatch = true,
  targetName = 'ดร.วิชชา ฉิมพลี',
  onSelectImage,
  scanMode = 'target',
  targetImageUrl,
  minConfidence = 90,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [faceMatches, setFaceMatches] = useState<FaceMatch[]>([]);
  const [personCount, setPersonCount] = useState<number>(0);
  const [aiEngine, setAiEngine] = useState<string>('LOADING');
  const [targetFace, setTargetFace] = useState<FaceMatch | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let isMounted = true;
    setIsScanning(true);
    // เคลียร์ผลรอบก่อน กัน footer โชว์ชื่อ/ตัวเลขค้างระหว่างสแกนรอบใหม่
    setFaceMatches([]);
    setPersonCount(0);
    setTargetFace(null);

    const imageToBase64 = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 640;
          const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
          canvas.width = img.naturalWidth * scale;
          canvas.height = img.naturalHeight * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('No canvas ctx')); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = proxiedUrl(url);
      });
    };

    const processDetection = async () => {
      // เจอผลเก่าใน cache → ใช้เลย ไม่ต้องเข้าคิวสแกนใหม่
      const key = cacheKey(imageUrl, targetImageUrl, minConfidence);
      const hit = resultCache.get(key);
      if (hit && isMounted) {
        setFaceMatches(hit.matches);
        setPersonCount(hit.personCount);
        setAiEngine(hit.aiEngine);
        setTargetFace(hit.matches.find((m) => m.is_target) || null);
        setIsScanning(false);
        return;
      }

      let imageBase64: string | null = null;
      try {
        imageBase64 = await imageToBase64(imageUrl);
      } catch {
        // Can't convert
      }

      // Use global queue to limit concurrent backend requests
      await queuedFaceDetection(async () => {

      // 1. InsightFace Backend (ตรงกับ backend/main.py ตอนนี้)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const body: Record<string, unknown> = { threshold: (minConfidence ?? 90) / 100 };
        if (imageBase64) body.image_base64 = imageBase64;
        else body.url = imageUrl;
        if (targetImageUrl) {
          if (targetImageUrl.startsWith('data:')) body.target_image_base64 = targetImageUrl;
          else body.target_url = targetImageUrl;
        }
        if (targetName) body.target_name = targetName;

        const res = await fetch('http://localhost:8000/recognize-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            let matches: FaceMatch[] = (data.face_matches || []).map((f: any, i: number) => ({
              face_id: f.face_id ?? i + 1,
              center_x_pct: f.center_x_pct,
              center_y_pct: f.center_y_pct,
              width_pct: f.width_pct,
              height_pct: f.height_pct,
              is_target: f.is_target,
              match_name: f.match_name,
              match_role: f.match_role,
              match_confidence: f.match_confidence,
            }));

            // Deduplicate overlapping faces
            matches = deduplicateFaces(matches);

            setFaceMatches(matches);
            setPersonCount(data.person_count || matches.length);
            setAiEngine('INSIGHTFACE');

            const target = matches.find((m) => m.is_target);
            setTargetFace(target || null);
            resultCache.set(key, { matches, personCount: data.person_count || matches.length, aiEngine: 'INSIGHTFACE' });

            setIsScanning(false);
            return;
          }
        }
      } catch {
        // InsightFace server not running -> fallback ข้างล่าง
      }

      // 2. YOLOv8 Backend (person detection only)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const detectBody: Record<string, unknown> = {};
        if (imageBase64) detectBody.image_base64 = imageBase64;
        else detectBody.url = imageUrl;

        const res = await fetch('http://localhost:8000/detect-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detectBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.boxes && data.boxes.length > 0) {
            let matches: FaceMatch[] = data.boxes.map((b: any, i: number) => ({
              face_id: i + 1,
              center_x_pct: b.center_x_pct,
              center_y_pct: b.center_y_pct,
              width_pct: b.width_pct,
              height_pct: b.height_pct,
              is_target: false,
              match_name: null,
              match_role: null,
              match_confidence: 0,
            }));
            matches = deduplicateFaces(matches);
            setFaceMatches(matches);
            setPersonCount(data.person_count || matches.length);
            setAiEngine('YOLOv8');
            setIsScanning(false);
            return;
          }
        }
      } catch {
        // Python server not running
      }

      // 3. Client-Side Browser AI (face-api.js + 1:N face matching)
      try {
        await loadModels();
        if (!isMounted) return;

        // descriptor ของรูปเป้าหมาย (อัปโหลด / รูปตัวอย่าง ดร.วิชชา)
        const refDescriptor = await getReferenceDescriptor(targetImageUrl);
        if (!isMounted) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = proxiedUrl(imageUrl);

        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        if (isMounted && img.complete && img.naturalWidth > 0) {
          const detectorOpts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 });

          type ScoredBox = {
            box: { x: number; y: number; width: number; height: number };
            score: number;
            distance: number | null; // null = จำตัวตนไม่ได้ (นับใบหน้าอย่างเดียว)
          };
          let boxes: ScoredBox[] = [];

          // 3a. มีรูปเป้าหมาย → เทียบ descriptor ทุกใบหน้า
          if (refDescriptor) {
            try {
              const full = await faceapi
                .detectAllFaces(img, detectorOpts)
                .withFaceLandmarks()
                .withFaceDescriptors();
              boxes = full.map((d) => ({
                box: d.detection.box,
                score: d.detection.score,
                distance: faceapi.euclideanDistance(d.descriptor, refDescriptor),
              }));
            } catch {
              boxes = [];
            }
          }

          // 3b. ตกกลับ: ไม่มีรูปเป้าหมาย / โมเดลจำใบหน้าโหลดไม่ครบ → นับใบหน้าอย่างเดียว
          if (boxes.length === 0) {
            const plain = await faceapi.detectAllFaces(img, detectorOpts);
            boxes = plain.map((d) => ({ box: d.box, score: d.score, distance: null }));
          }

          if (isMounted && boxes.length > 0) {
            const matchThreshold = confidenceToDistance(minConfidence);
            let matches: FaceMatch[] = boxes.map((b, i) => {
              const isTarget = b.distance !== null && b.distance <= matchThreshold;
              return {
                face_id: i + 1,
                center_x_pct: ((b.box.x + b.box.width / 2) / img.naturalWidth) * 100,
                center_y_pct: ((b.box.y + b.box.height / 2) / img.naturalHeight) * 100,
                width_pct: (b.box.width / img.naturalWidth) * 100,
                height_pct: (b.box.height / img.naturalHeight) * 100,
                is_target: isTarget,
                match_name: isTarget ? targetName : null,
                match_role: null,
                match_confidence: isTarget && b.distance !== null
                  ? Math.max(1, Math.round((1 - b.distance) * 100))
                  : Math.round(b.score * 100),
              };
            });
            matches = deduplicateFaces(matches);
            const found = matches.find((m) => m.is_target) || null;
            setFaceMatches(matches);
            setPersonCount(matches.length);
            setAiEngine('FACE-API');
            setTargetFace(found);
            resultCache.set(key, { matches, personCount: matches.length, aiEngine: 'FACE-API' });
            setIsScanning(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Browser AI detection error:', err);
      }

      // 4. No backend available
      if (isMounted) {
        setFaceMatches([]);
        setPersonCount(0);
        setAiEngine('OFFLINE');
        setIsScanning(false);
      }

      }); // end queuedFaceDetection
    };

    processDetection();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, targetName, targetImageUrl, minConfidence]);

  const targetCount = faceMatches.filter((m) => m.is_target).length;
  const otherCount = faceMatches.length - targetCount;

  return (
    <div
      onClick={onSelectImage}
      className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl cursor-pointer hover:border-cyan-500/50 transition-all duration-300 flex flex-col w-full h-full font-['Prompt',_sans-serif]"
    >
      {/* Top Security Status Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-1">
            {isScanning ? (
              'AI SCANNING...'
            ) : aiEngine === 'INSIGHTFACE' ? (
              <>
                <ShieldAlert size={13} className="text-emerald-400" />
                <span>INSIGHTFACE AI</span>
              </>
            ) : aiEngine === 'YOLOv8' ? (
              <>
                <Cpu size={13} className="text-emerald-400" />
                <span>YOLOv8 AI</span>
              </>
            ) : aiEngine === 'FACE-API' ? (
              <>
                <Sparkles size={13} className="text-cyan-400" />
                <span>BROWSER AI</span>
              </>
            ) : (
              'AI FACE SCAN'
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 rounded-full border border-slate-700 text-xs font-semibold">
          <Users size={13} className={targetCount > 0 ? 'text-emerald-400' : 'text-slate-400'} />
          <span className={targetCount > 0 ? 'text-emerald-300' : 'text-slate-300'}>
            {isScanning ? 'กำลังสแกน...' : `นับได้ ${personCount} คน`}
          </span>
        </div>
      </div>

      {/* Main Photo View */}
      <div className="relative aspect-[4/3] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <img
            ref={imgRef}
            src={imageUrl}
            alt={activityTitle}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 text-xs p-4">
            <UserX size={24} />
            <span>ไม่สามารถโหลดภาพได้</span>
          </div>
        )}

        {/* Scanning Loader Overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-15">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 border border-cyan-500/50 rounded-full text-cyan-300 text-xs font-mono shadow-xl">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>AI DETECTING FACES...</span>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* RECTANGULAR BOUNDING BOXES - OPENCV STYLE   */}
        {/* ============================================ */}
        {!isScanning && faceMatches.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Glow filter for target */}
              <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {faceMatches.map((face) => {
              const isTarget = face.is_target;

              // Calculate rectangle position (top-left corner based)
              const rectW = face.width_pct;
              const rectH = face.height_pct * 1.15; // Taller to cover full face + forehead
              const rectX = face.center_x_pct - rectW / 2;
              const rectY = face.center_y_pct - rectH / 2;

              // Colors
              const strokeColor = isTarget ? '#22c55e' : '#ef4444';
              const bgColor = isTarget ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.06)';
              const labelBg = isTarget ? '#166534' : '#991b1b';
              const labelText = '#ffffff';
              const cornerLen = Math.min(rectW, rectH) * 0.25;
              const sw = isTarget ? 0.45 : 0.35; // stroke width in viewBox units
              const cornerSW = isTarget ? 0.7 : 0.55; // corner stroke (thicker)
              const filterName = isTarget ? 'url(#glow-green)' : 'url(#glow-red)';

              // Label text
              const label = isTarget
                ? `#${face.face_id} ${(face.match_name || targetName).split(' ').pop()} ${face.match_confidence}%`
                : `#${face.face_id} ${face.match_confidence > 0 ? face.match_confidence + '%' : 'Unknown'}`;

              return (
                <g key={face.face_id} filter={filterName}>
                  {/* Filled background rectangle */}
                  <rect
                    x={rectX}
                    y={rectY}
                    width={rectW}
                    height={rectH}
                    fill={bgColor}
                    stroke="none"
                  />

                  {/* Main rectangle border (dashed for non-target, solid for target) */}
                  <rect
                    x={rectX}
                    y={rectY}
                    width={rectW}
                    height={rectH}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={sw}
                    strokeDasharray={isTarget ? 'none' : '1.5 1'}
                    opacity={isTarget ? 0.9 : 0.7}
                  />

                  {/* ====== CORNER BRACKETS (L-shapes) ====== */}
                  {/* Top-Left corner */}
                  <polyline
                    points={`${rectX},${rectY + cornerLen} ${rectX},${rectY} ${rectX + cornerLen},${rectY}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={cornerSW}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Top-Right corner */}
                  <polyline
                    points={`${rectX + rectW - cornerLen},${rectY} ${rectX + rectW},${rectY} ${rectX + rectW},${rectY + cornerLen}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={cornerSW}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Bottom-Left corner */}
                  <polyline
                    points={`${rectX},${rectY + rectH - cornerLen} ${rectX},${rectY + rectH} ${rectX + cornerLen},${rectY + rectH}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={cornerSW}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Bottom-Right corner */}
                  <polyline
                    points={`${rectX + rectW - cornerLen},${rectY + rectH} ${rectX + rectW},${rectY + rectH} ${rectX + rectW},${rectY + rectH - cornerLen}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={cornerSW}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Center crosshair dot for target */}
                  {isTarget && (
                    <circle
                      cx={face.center_x_pct}
                      cy={face.center_y_pct}
                      r={0.8}
                      fill={strokeColor}
                      opacity={0.8}
                    />
                  )}

                  {/* ====== LABEL BOX (above rectangle) ====== */}
                  {(() => {
                    const labelFontSize = 2.2;
                    const labelPadX = 0.8;
                    const labelPadY = 0.4;
                    const labelH = labelFontSize + labelPadY * 2;
                    const labelW = label.length * labelFontSize * 0.55 + labelPadX * 2;
                    const labelX = rectX;
                    const labelY = rectY - labelH - 0.3;

                    return (
                      <g>
                        {/* Label background */}
                        <rect
                          x={labelX}
                          y={labelY}
                          width={labelW}
                          height={labelH}
                          fill={labelBg}
                          rx={0.5}
                          opacity={0.95}
                        />
                        {/* Label text */}
                        <text
                          x={labelX + labelPadX}
                          y={labelY + labelH * 0.72}
                          fill={labelText}
                          fontSize={labelFontSize}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>
        )}

        {/* Target Name Badge - Floating above target face */}
        {!isScanning && targetFace && scanMode === 'target' && (
          <div
            className="absolute z-15 pointer-events-none flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/95 border-2 border-emerald-400 rounded-lg text-emerald-200 text-[11px] font-bold shadow-lg shadow-emerald-950/80"
            style={{
              left: `${targetFace.center_x_pct}%`,
              top: `${Math.max(4, targetFace.center_y_pct - targetFace.height_pct / 2 - 12)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🎯 {targetFace.match_name || targetName}</span>
            <span className="text-emerald-400 font-mono">{targetFace.match_confidence}%</span>
          </div>
        )}

        {/* OFFLINE message */}
        {!isScanning && aiEngine === 'OFFLINE' && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/95 border border-amber-500/50 rounded-xl text-amber-300 text-xs font-bold shadow-lg">
              <AlertTriangle size={16} className="text-amber-400" />
              <span>⚠️ Backend AI ไม่ได้ทำงาน - กรุณารัน python main.py</span>
            </div>
          </div>
        )}

        {/* Legend */}
        {!isScanning && faceMatches.length > 0 && (
          <div className="absolute bottom-14 left-3 z-20 pointer-events-none flex flex-col gap-1">
            {targetCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-900/90 border border-emerald-500/50 rounded-lg text-emerald-300 text-[10px] font-bold shadow-lg">
                <div className="w-3 h-3 border-2 border-emerald-400 bg-emerald-400/20" />
                <span>{targetFace?.match_name || targetName} ({targetCount} คน)</span>
              </div>
            )}
            {otherCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-900/90 border border-red-500/50 rounded-lg text-red-300 text-[10px] font-bold shadow-lg">
                <div className="w-3 h-3 border-2 border-red-400 bg-red-400/20" />
                <span>บุคคลอื่น ({otherCount} คน)</span>
              </div>
            )}
            {aiEngine === 'FACE-API' && targetCount === 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-900/90 border border-amber-500/50 rounded-lg text-amber-300 text-[10px] font-bold shadow-lg">
                <div className="w-3 h-3 border-2 border-amber-400 bg-amber-400/20" />
                <span>ตรวจพบใบหน้า (ไม่สามารถจำแนกตัวตนได้)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Info Details Card */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800/80 space-y-2 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {activityTitle}
          </h4>
          <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono border ${
            targetCount > 0
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isScanning
              ? `⏳ กำลังสแกน...`
              : targetCount > 0
                ? `✅ พบ ${targetFace?.match_name || targetName} ${targetFace?.match_confidence ?? 0}%`
                : `👤 ${personCount} คน`
            }
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-cyan-400 shrink-0" />
            <span className="truncate">{where || 'มหาวิทยาลัยสวนดุสิต'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-amber-400 shrink-0" />
            <span>{date || `พ.ศ. ${year}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
