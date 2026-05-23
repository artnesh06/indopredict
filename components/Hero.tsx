'use client';

import { useRef, useState, useMemo } from 'react';
import SearchModal from './SearchModal';
import NumberFlow from './NumberFlow';

// Seeded random to avoid hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateHeroData() {
  const days = 60;
  const data = [];
  let base = 1200;
  for (let i = 0; i < days; i++) {
    const d = new Date(2025, 0, 1);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`;
    base = Math.max(400, Math.min(4000, base + (seededRandom(i * 7 + 42) - 0.45) * 300));
    data.push({ date: dateStr, voters: Math.round(base) });
  }
  return data;
}

function HeroChart() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Stable data - same on server and client
  const heroData = useMemo(() => generateHeroData(), []);

  const width = 1200;
  const height = 200;
  const padY = 20;

  const maxV = Math.max(...heroData.map(d => d.voters));
  const minV = Math.min(...heroData.map(d => d.voters));
  const range = maxV - minV || 1;

  const points = heroData.map((d, i) => ({
    x: (i / (heroData.length - 1)) * width,
    y: padY + (1 - (d.voters - minV) / range) * (height - padY * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current || !svgRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: px, y: py });

    const fracX = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(fracX * (heroData.length - 1));
    setHoverIdx(Math.max(0, Math.min(heroData.length - 1, idx)));

    // Interpolate exact position on line
    const floatIdx = fracX * (heroData.length - 1);
    const i0 = Math.max(0, Math.floor(floatIdx));
    const i1 = Math.min(i0 + 1, points.length - 1);
    const t = floatIdx - i0;
    const interpX = points[i0].x * (1 - t) + points[i1].x * t;
    const interpY = points[i0].y * (1 - t) + points[i1].y * t;

    setDotPos({ x: interpX, y: interpY });
  };

  const hoverData = hoverIdx !== null ? heroData[hoverIdx] : null;

  return (
    <>
    <div
      ref={wrapRef}
      className={`hero-chart-wrap ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoverIdx(null); setDotPos(null); }}
      onMouseMove={handleMouseMove}
      style={{
        '--hero-mx': `${mousePos.x}%`,
        '--hero-my': `${mousePos.y}%`,
      } as React.CSSProperties}
    >
      <svg
        ref={svgRef}
        className="hero-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#heroGrad)" />
        <path d={linePath} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {dotPos && (
          <>
            <line x1={dotPos.x} y1={0} x2={dotPos.x} y2={height} stroke="#a78bfa" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {/* Dot as div - always perfect circle */}
      {dotPos && (
        <div
          className="hero-chart-dot"
          style={{
            left: `${(dotPos.x / width) * 100}%`,
            top: `${(dotPos.y / height) * 100}%`,
          }}
        />
      )}
      {/* Tooltip inside wrap so it follows mask opacity */}
      {hoverData && dotPos && (
        <div
          className="hero-chart-tooltip"
          style={{
            left: `clamp(70px, ${(dotPos.x / width) * 100}%, calc(100% - 70px))`,
          }}
        >
          <span className="hct-date">{hoverData.date}</span>
          <span className="hct-sep"> · </span>
          <span className="hct-voters"><NumberFlow value={hoverData.voters} /> voters</span>
        </div>
      )}
    </div>

    </>
  );
}

export default function Hero() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <section className="hero-banner">
      <HeroChart />
      <div className="banner-content">
        <div className="banner-label glare-wrap">🇮🇩 Prediction Game Indonesia <span className="flag-flip">🇮🇩</span></div>
        <h1 className="banner-title">
          Netizen paling <em>sotoy!</em>
        </h1>
        <p className="banner-sub">Buktikan lo lebih akurat dari semua netizen lainnya.</p>
        <div className="banner-search">
          <span className="search-icon">🔍</span>
          <button className="search-input search-trigger" onClick={() => setSearchOpen(true)}>
            Cari market, akun, kategori...
          </button>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  );
}
