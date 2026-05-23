'use client';

import { useState, useRef, useMemo } from 'react';
import { useStore } from '@/lib/store';
import NumberFlow from './NumberFlow';

type DataPoint = { date: string; pct: number; voters: number };

function generateData(yes: number, voters: number): DataPoint[] {
  const days = 14;
  const data: DataPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`;
    // More dramatic movement
    const wave = Math.sin(i * 0.9) * 15 + Math.cos(i * 1.4) * 8;
    const trend = (i / days) * 10;
    const pct = Math.max(8, Math.min(92, Math.round(yes - 20 + wave + trend)));
    const dayVoters = Math.max(30, Math.floor(voters / days + Math.sin(i * 1.2) * 120));
    data.push({ date: dateStr, pct, voters: dayVoters });
  }
  return data;
}

function InteractiveChart({ data, color }: { data: DataPoint[]; color: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 400;
  const height = 120;
  const pad = 10;

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

  return (
    <div className="vp-chart-container">
      <svg
        ref={svgRef}
        className="vote-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {/* Live dot at end */}
        <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={color} vectorEffect="non-scaling-stroke" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="6" fill={color} opacity="0.3" vectorEffect="non-scaling-stroke">
          <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        {hoverPoint && (
          <>
            <line x1={hoverPoint.x} y1={0} x2={hoverPoint.x} y2={height} stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" vectorEffect="non-scaling-stroke" />
            <circle cx={hoverPoint.x} cy={hoverPoint.y} r="4" fill={color} stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {hoverData && hoverPoint && (
        <div
          className="vp-tooltip"
          style={{ left: `${(hoverPoint.x / width) * 100}%` }}
        >
          <div className="vp-tooltip-date">{hoverData.date}</div>
          <div className="vp-tooltip-pct">{hoverData.pct}%</div>
          <div className="vp-tooltip-voters">{hoverData.voters.toLocaleString()} voters</div>
        </div>
      )}
    </div>
  );
}

export default function VoteModal() {
  const {
    voteOpen, closeVote, activeMarket, selChoice, setSelChoice,
    credits, confirmVote, savedMarkets, toggleSave, vCr, adjC,
  } = useStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successChoice, setSuccessChoice] = useState<'yes' | 'no' | null>(null);
  const [successCredits, setSuccessCredits] = useState(0);

  const yesData = useMemo(() => activeMarket ? generateData(activeMarket.yes, activeMarket.voters) : [], [activeMarket]);
  const noData = useMemo(() => yesData.map(d => ({ ...d, pct: 100 - d.pct, voters: Math.floor(d.voters * 0.7) })), [yesData]);

  const handleConfirmVote = () => {
    if (!activeMarket || !selChoice) return;
    setSuccessChoice(selChoice);
    setSuccessCredits(vCr);
    confirmVote();
    setShowSuccess(true);
  };

  if (!activeMarket) return <div className={`ov ${voteOpen ? 'open' : ''}`} onClick={closeVote} />;

  const m = activeMarket;
  const isSaved = savedMarkets.includes(m.id);
  const chartData = selChoice === 'no' ? noData : yesData;
  const chartColor = selChoice === 'no' ? '#c62828' : '#2e7d32';
  const minCredit = m.cost;
  const canAfford = credits >= vCr;

  // Success popup overlay
  if (showSuccess) {
    return (
      <div className="ov open">
        <div className="popup vote-success-popup" onClick={(e) => e.stopPropagation()}>
          <div className="vs-icon">🎉</div>
          <div className="vs-title">Vote Berhasil!</div>
          <div className="vs-desc">
            Lo berhasil vote <span className={`vs-choice ${successChoice}`}>{successChoice?.toUpperCase()}</span> dengan <strong>{successCredits} credit</strong>
          </div>
          <div className="vs-market">{m.q}</div>
          <div className="vs-anim">
            <div className="vs-ring"></div>
            <div className="vs-check">✓</div>
          </div>
          <button className="vs-close-btn" onClick={() => setShowSuccess(false)}>
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ov ${voteOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && closeVote()}>
      <div className="popup vote-popup">

        {/* Header */}
        <div className="vp-header">
          <div className="vp-header-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="vp-img" src={m.img} alt="" />
            <div className="vp-meta">
              <div className="vp-cat">{m.cl} · Tutup {m.dl}</div>
              <div className="vp-q">{m.q}</div>
            </div>
          </div>
          <div className="vp-actions">
            <svg
              className={`vp-save ${isSaved ? 'saved' : ''}`}
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

        {/* Chance */}
        <div className="vp-chance-row">
          <div className="vp-chance">
            <span className={`vp-chance-num ${selChoice === 'no' ? 'red' : ''}`}>
              {selChoice === 'no' ? 100 - m.yes : m.yes}% chance
            </span>
          </div>
          <div className="vp-voters">{m.voters.toLocaleString()} voters</div>
        </div>

        {/* Chart */}
        <div className="vp-chart-wrap">
          <InteractiveChart data={chartData} color={chartColor} />
        </div>

        {/* Vote buttons */}
        <div className="vp-vote-btns">
          <button
            className={`mc-btn-yes ${selChoice === 'yes' ? 'selected' : ''}`}
            onClick={() => setSelChoice('yes')}
          >
            <span className="mc-btn-label">Yes</span>
            <span className="mc-btn-pct">{m.yes}%</span>
          </button>
          <button
            className={`mc-btn-no ${selChoice === 'no' ? 'selected' : ''}`}
            onClick={() => setSelChoice('no')}
          >
            <span className="mc-btn-label">No</span>
            <span className="mc-btn-pct">{100 - m.yes}%</span>
          </button>
        </div>

        {/* Credit adjuster */}
        {selChoice && !m.voted && (
          <div className={`vp-credit-adjuster ${selChoice}`}>
            <div className="vp-ca-header">
              <span className="vp-ca-label">Jumlah Credit</span>
              <span className="vp-ca-balance">Saldo: {credits} credit</span>
            </div>
            
            {/* Radix-style Slider with NumberFlow above thumb */}
            <div className="vp-radix-slider-wrap">
              <div className="vp-radix-slider">
                <div className="vp-radix-track">
                  <div 
                    className={`vp-radix-range ${selChoice}`}
                    style={{ width: `${credits > minCredit ? ((vCr - minCredit) / (credits - minCredit)) * 100 : 0}%` }}
                  />
                </div>
                <div 
                  className="vp-radix-thumb"
                  style={{ left: `${credits > minCredit ? ((vCr - minCredit) / (credits - minCredit)) * 100 : 0}%` }}
                >
                  <NumberFlow value={vCr} className="vp-radix-number" />
                </div>
                <input
                  type="range"
                  className="vp-radix-input"
                  min={minCredit}
                  max={credits}
                  step={1}
                  value={vCr}
                  onChange={(e) => adjC(Number(e.target.value) - vCr)}
                />
              </div>
            </div>
            
            <div className="vp-ca-minmax">
              <span>Min. {minCredit}</span>
              <span>Max. {credits}</span>
            </div>
            {!canAfford && (
              <div className="vp-ca-warning">⚠️ Credit tidak cukup!</div>
            )}
          </div>
        )}

        {/* Confirm */}
        {selChoice && !m.voted && (
          <button
            className={`vp-confirm ${selChoice}`}
            onClick={handleConfirmVote}
            disabled={!canAfford}
          >
            Konfirmasi Vote {selChoice.toUpperCase()} · <NumberFlow value={vCr} /> Credit
          </button>
        )}
        {m.voted && (
          <div className="vp-voted">✓ Lo sudah vote {m.voted.toUpperCase()} di prediksi ini</div>
        )}

        {/* Footer info */}
        <div className="vp-footer">
          <span>Saldo: {credits} credit</span>
          <span>Event tutup: {m.dl}</span>
        </div>
      </div>
    </div>
  );
}
