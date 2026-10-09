import React, { useRef, useState, useEffect } from 'react';

export interface FaceBox {
  center_x_pct: number;
  center_y_pct: number;
  width_pct: number;
  height_pct: number;
  is_target?: boolean;
  match_confidence?: number;
  face_id?: number;
}

interface FacePhotoProps {
  src: string;
  alt?: string;
  boxes?: FaceBox[];
  /** cover = ครอปเต็มกรอบ (การ์ด), contain = เห็นรูปทั้งใบ (modal) */
  fit?: 'cover' | 'contain';
  /** ขยายกรอบสูง 1.15x ให้คลุมหน้าผาก (ดีฟอลต์ตามดีไซน์เดิม) */
  tallBox?: boolean;
  className?: string;
  onError?: () => void;
  eager?: boolean;
}

/**
 * รูป + กรอบใบหน้าที่ map พิกัด % (อ้างอิงรูปเต็ม) ให้ตรงกับส่วนที่แสดงจริงบนจอ
 * แก้บั๊กกรอบหลุดไปอยู่นอกรูปตอนใช้ object-contain (letterbox) / object-cover (crop)
 */
export const FacePhoto: React.FC<FacePhotoProps> = ({
  src,
  alt = '',
  boxes = [],
  fit = 'cover',
  tallBox = true,
  className = '',
  onError,
  eager = false,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);

  const measure = () => {
    const el = wrapRef.current;
    if (el) {
      setCw(el.clientWidth);
      setCh(el.clientHeight);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // แปลงพิกัด % ของรูปเต็ม -> px บนจอ (คิด letterbox/crop ตาม fit)
  let pxBoxes: Array<FaceBox & { x: number; y: number; w: number; h: number }> = [];
  if (nat.w > 0 && nat.h > 0 && cw > 0 && ch > 0) {
    const scale = fit === 'cover'
      ? Math.max(cw / nat.w, ch / nat.h)
      : Math.min(cw / nat.w, ch / nat.h);
    const dw = nat.w * scale;
    const dh = nat.h * scale;
    const ox = (cw - dw) / 2;
    const oy = (ch - dh) / 2;
    pxBoxes = boxes.map((b) => {
      const bw = (b.width_pct / 100) * nat.w * scale;
      const bh = (b.height_pct / 100) * nat.h * scale * (tallBox ? 1.15 : 1);
      return {
        ...b,
        w: bw,
        h: bh,
        x: (b.center_x_pct / 100) * nat.w * scale - bw / 2 + ox,
        y: (b.center_y_pct / 100) * nat.h * scale - bh / 2 + oy,
      };
    });
  }
  const fontPx = Math.max(10, cw * 0.024);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        crossOrigin="anonymous"
        onError={onError}
        onLoad={(e) => {
          const im = e.currentTarget;
          setNat({ w: im.naturalWidth || 0, h: im.naturalHeight || 0 });
          measure();
        }}
        className={`absolute inset-0 w-full h-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />
      {pxBoxes.length > 0 && cw > 0 && ch > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${cw} ${ch}`}>
          {pxBoxes.map((b, i) => {
            const col = b.is_target ? '#22c55e' : '#dc2626';
            const label = b.is_target
              ? `✓${b.match_confidence ?? ''}${b.match_confidence !== undefined ? '%' : ''}`
              : (b.face_id !== undefined ? `#${b.face_id}` : '');
            return (
              <g key={b.face_id ?? i}>
                <rect
                  x={b.x} y={b.y} width={b.w} height={b.h}
                  fill={b.is_target ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.08)'}
                  stroke={col} strokeWidth={Math.max(1.5, cw * 0.004)}
                  strokeDasharray={b.is_target ? 'none' : '6 4'}
                />
                {label && (
                  <text x={b.x + 3} y={Math.max(fontPx, b.y - 4)} fill={col}
                    fontSize={fontPx} fontFamily="monospace" fontWeight="bold">
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
