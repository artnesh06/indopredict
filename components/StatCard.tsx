'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

type Props = {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
};

export default function StatCard({ value, label, suffix = '', decimals = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  // Animated counter — count up from 0 to value
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  // 3D tilt effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - y) * 18;
    const rotY = (x - 0.5) * 18;
    ref.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  }, []);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('id-ID').replace(/,/g, '.');

  return (
    <div
      ref={ref}
      className="pfs pfs-3d"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pfs-glare" />
      <div className="pfs-num">{formatted}{suffix}</div>
      <div className="pfs-lbl">{label}</div>
    </div>
  );
}
