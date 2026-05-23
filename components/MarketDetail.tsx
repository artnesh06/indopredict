'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';

type DataPoint = { date: string; pct: number; voters: number };

function generateData(yes: number, voters: number): DataPoint[] {
  const days = 30;
  const data: DataPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`;
    const wave = Math.sin(i * 0.7) * 12 + Math.cos(i * 1.2) * 6;
    const trend = (i / days) * 8;
    const pct = Math.max(5, Math.min(95, Math.round(yes - 15 + wave + trend)));
    const dayVoters = Math.max(20, Math.floor(voters / days + Math.sin(i * 1.1) * 80));
    data.push({ date: dateStr, pct, voters: dayVoters });
  }
  return data;
}

function DetailChart({ data, color }: { data: DataPoint[]; color: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 600;
  const height = 200;
  const pad = 20;

  const maxPct = Math.max(...data.map(d => d.pct));
  const minPct = Math.min(...data.map(d => d.pct));
  const range = maxPct - minPct || 10;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (width - pad * 2),
    y: pad + (1 - (d.pct - minPct) / range) * (height - pad * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`;
  const lastPoint = points[points.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round(((x - pad) / (width - pad * 2)) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;
  const hoverData = hoverIdx !== null ? data[hoverIdx] : null;

  // Y-axis labels
  const yLabels = [minPct, Math.round((minPct + maxPct) / 2), maxPct];

  return (
    <div className="md-chart-container">
      <svg
        ref={svgRef}
        className="md-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="mdAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {yLabels.map((lbl, i) => {
          const y = pad + (1 - (lbl - minPct) / range) * (height - pad * 2);
          return <line key={i} x1={pad} y1={y} x2={width - pad} y2={y} stroke="var(--border)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />;
        })}
        <path d={areaPath} fill="url(#mdAreaGrad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill={color} vectorEffect="non-scaling-stroke" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="8" fill={color} opacity="0.2" vectorEffect="non-scaling-stroke">
          <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        {hoverPoint && (
          <>
            <line x1={hoverPoint.x} y1={0} x2={hoverPoint.x} y2={height} stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity="0.5" vectorEffect="non-scaling-stroke" />
            <circle cx={hoverPoint.x} cy={hoverPoint.y} r="5" fill={color} stroke="var(--white)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {/* Y labels */}
      <div className="md-chart-ylabels">
        {yLabels.reverse().map((lbl, i) => <span key={i}>{lbl}%</span>)}
      </div>
      {/* Tooltip */}
      {hoverData && hoverPoint && (
        <div className="md-chart-tooltip" style={{ left: `${(hoverPoint.x / width) * 100}%` }}>
          <div className="md-tt-date">{hoverData.date}</div>
          <div className="md-tt-pct" key={hoverData.pct}>{hoverData.pct}%</div>
          <div className="md-tt-voters" key={hoverData.voters}>{hoverData.voters} voters</div>
        </div>
      )}
    </div>
  );
}

export default function MarketDetail() {
  const {
    detailMarket, setPage, selChoice, setSelChoice,
    credits, vCr, adjC, confirmVote, savedMarkets, toggleSave,
  } = useStore();

  const [showSuccess, setShowSuccess] = useState(false);

  const m = detailMarket;
  if (!m) return null;

  const data = generateData(m.yes, m.voters);
  const isSaved = savedMarkets.includes(m.id);
  const canAfford = credits >= vCr;
  const potentialWin = selChoice
    ? Math.round(vCr * (100 / (selChoice === 'no' ? (100 - m.yes) : m.yes)))
    : 0;

  const handleVote = () => {
    confirmVote();
    setShowSuccess(true);
  };

  return (
    <div className="md-page">
      <button className="md-back" onClick={() => setPage('home')}>← Kembali</button>

      <div className="md-layout">
        {/* Left: Info + Chart */}
        <div className="md-left">
          <div className="md-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="md-img" src={m.img} alt="" />
            <div className="md-info">
              <div className="md-cat">{m.cl}</div>
              <h1 className="md-title">{m.q}</h1>
            </div>
            <div className="md-header-actions">
              <svg
                className={`mc-bookmark ${isSaved ? 'saved' : ''}`}
                onClick={() => toggleSave(m.id)}
                viewBox="0 0 24 24"
                fill={isSaved ? 'var(--accent)' : 'none'}
                stroke={isSaved ? 'var(--accent)' : 'currentColor'}
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>

          <div className="md-meta">
            <span className="md-tag">Tutup {m.dl}</span>
            <span className="md-tag">{m.voters.toLocaleString()} voters</span>
          </div>

          <div className="md-chance">
            <span className="md-chance-num">{m.yes}%</span>
            <span className="md-chance-label">chance</span>
          </div>

          <div className="md-chart-wrap">
            <DetailChart data={data} color="var(--green)" />
          </div>

          <div className="md-range">
            {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((r) => (
              <button key={r} className={`md-range-btn ${r === '1M' ? 'active' : ''}`}>{r}</button>
            ))}
          </div>
        </div>

        {/* Right: Vote panel — inline, no popup */}
        <div className="md-right">
          <div className="md-panel">
            <div className="md-panel-title">{m.q}</div>

            {/* Yes/No */}
            <div className="md-vote-btns">
              <button
                className={`md-vote-btn yes ${selChoice === 'yes' ? 'active' : ''}`}
                onClick={() => setSelChoice('yes')}
              >
                Yes {m.yes}¢
              </button>
              <button
                className={`md-vote-btn no ${selChoice === 'no' ? 'active' : ''}`}
                onClick={() => setSelChoice('no')}
              >
                No {100 - m.yes}¢
              </button>
            </div>

            {/* Amount + quick add — only show after choice */}
            {selChoice && !m.voted && (
              <>
                <div className="md-amount">
                  <span className="md-amount-label">Amount</span>
                  <span className="md-amount-value">{vCr} Credit</span>
                </div>

                <div className="md-quick-btns">
                  {[5, 10, 25, 50].map((amt) => (
                    <button key={amt} className="md-quick-btn" onClick={() => adjC(amt)}>+{amt}</button>
                  ))}
                </div>

                <div className="md-potential">
                  <span className="md-pot-label">Potensi menang</span>
                  <span className="md-pot-value">{potentialWin} Credit</span>
                </div>

                <button
                  className={`md-trade-btn ${selChoice}`}
                  onClick={handleVote}
                  disabled={!canAfford}
                >
                  Vote
                </button>

                <div className="md-panel-footer">
                  Saldo: {credits} credit · Min: {m.cost} credit
                </div>
              </>
            )}

            {m.voted && (
              <div className="md-voted-tag">✓ Lo sudah vote {m.voted.toUpperCase()}</div>
            )}

            {showSuccess && !m.voted && (
              <div className="md-success">
                <div className="md-success-icon">🎉</div>
                <div className="md-success-text">Vote berhasil!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
