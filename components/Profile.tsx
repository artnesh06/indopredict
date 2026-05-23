'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { HistItem } from '@/lib/data';
import NumberFlow from './NumberFlow';

export default function Profile() {
  const { credits, hist, clog, savedMarkets, markets, profile, updateProfile, setPage, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'positions' | 'activity' | 'settings'>('positions');
  const [posFilter, setPosFilter] = useState<'active' | 'closed'>('active');
  const [searchPos, setSearchPos] = useState('');
  const [selectedHist, setSelectedHist] = useState<HistItem | null>(null);
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  const [shareOpen, setShareOpen] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverDate, setHoverDate] = useState('');
  const [chartHoverX, setChartHoverX] = useState<number | null>(null);
  const [chartHoverY, setChartHoverY] = useState<number | null>(50);
  const fileRef = useRef<HTMLInputElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const initial = profile.name.replace('@', '').charAt(0).toUpperCase() || 'A';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateProfile({ avatar: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate stats
  const totalWins = hist.filter(h => h.r === 'win').length;
  const totalPredictions = hist.length;
  const accuracy = totalPredictions > 0 ? Math.round((totalWins / totalPredictions) * 100) : 0;
  const biggestWin = useMemo(() => {
    const wins = hist.filter(h => h.r === 'win').map(h => parseInt(h.p.replace('+', '')) || 0);
    return wins.length > 0 ? Math.max(...wins) : 0;
  }, [hist]);

  // Generate chart data based on range
  const chartData = useMemo(() => {
    const points = chartRange === '1D' ? 24 : chartRange === '1W' ? 7 : chartRange === '1M' ? 30 : chartRange === '1Y' ? 12 : 52;
    const data: number[] = [];
    let val = 150;
    for (let i = 0; i < points; i++) {
      val += Math.random() * 40 - 18;
      val = Math.max(50, val);
      data.push(Math.round(val));
    }
    return data;
  }, [chartRange]);

  // Calculate profit/loss
  const profitLoss = useMemo(() => {
    let total = 0;
    clog.forEach(c => {
      const amt = parseInt(c.amt.replace('+', '').replace('-', ''));
      if (c.t === 'plus') total += amt;
      else total -= amt;
    });
    return total;
  }, [clog]);

  // Animated profit/loss value
  const currentDisplayValue = hoverValue ?? profitLoss;

  // SVG chart path with proper padding - DEBUGGED
  const { chartPath, chartPoints } = useMemo(() => {
    if (chartData.length === 0) return { chartPath: '', chartPoints: [] };
    
    const width = 400;
    const height = 80;
    const padding = 16;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const max = Math.max(...chartData);
    const min = Math.min(...chartData);
    const range = max - min || 1;
    const stepX = chartWidth / (chartData.length - 1);

    // EXACT points calculation
    const points = chartData.map((val, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((val - min) / range) * chartHeight;
      return { x, y };
    });

    // Generate smooth curve path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + stepX * 0.4;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - stepX * 0.4;
      const cp2y = points[i].y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
    }
    
    return { chartPath: path, chartPoints: points };
  }, [chartData]);

  // Chart hover handler - BEZIER CURVE INTERPOLATION
  const handleChartHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * 400; // SVG coordinate
    
    // Find segment on curve
    let segmentIdx = 0;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      if (relativeX >= chartPoints[i].x && relativeX <= chartPoints[i + 1].x) {
        segmentIdx = i;
        break;
      }
    }
    
    const p0 = chartPoints[segmentIdx];
    const p1 = chartPoints[segmentIdx + 1];
    
    if (!p0 || !p1) return;
    
    // Calculate bezier control points (same as path generation)
    const stepX = (400 - 32) / (chartData.length - 1);
    const cp1x = p0.x + stepX * 0.4;
    const cp1y = p0.y;
    const cp2x = p1.x - stepX * 0.4;
    const cp2y = p1.y;
    
    // Bezier curve parameter t (0 to 1)
    const t = (relativeX - p0.x) / (p1.x - p0.x);
    
    // Cubic Bezier formula: B(t) = (1-t)³P0 + 3(1-t)²t*CP1 + 3(1-t)t²*CP2 + t³*P1
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;
    
    const bezierY = mt3 * p0.y + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * p1.y;
    
    // Use closest data point for value
    const idx = Math.round((relativeX - 16) / ((400 - 32) / (chartData.length - 1)));
    const clampedIdx = Math.max(0, Math.min(chartData.length - 1, idx));
    const val = chartData[clampedIdx];

    // Generate date label
    const d = new Date();
    d.setDate(d.getDate() - (chartData.length - 1 - clampedIdx));
    const dateStr = `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]} ${d.getFullYear()}`;

    // Calculate credit value
    const baseCredit = profitLoss;
    const variation = Math.round((val - chartData[chartData.length - 1]) * 1.5);
    const creditAtPoint = baseCredit + variation;

    setHoverValue(creditAtPoint);
    setHoverDate(dateStr);
    setChartHoverX(relativeX);
    setChartHoverY(bezierY); // Use BEZIER Y!
  }, [chartData, profitLoss, chartPoints]);

  // Filter positions
  const filteredHist = useMemo(() => {
    let items = posFilter === 'active'
      ? hist.filter(h => h.r === 'pending')
      : hist.filter(h => h.r !== 'pending');
    if (searchPos) {
      items = items.filter(h => h.q.toLowerCase().includes(searchPos.toLowerCase()));
    }
    return items;
  }, [hist, posFilter, searchPos]);

  // Top wins for share card
  const topWins = useMemo(() => {
    return hist
      .filter(h => h.r === 'win')
      .sort((a, b) => (parseInt(b.p.replace('+', '')) || 0) - (parseInt(a.p.replace('+', '')) || 0))
      .slice(0, 5);
  }, [hist]);

  // Share profile link
  const profileUrl = `https://indopredict.id/${profile.name}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    showToast('Link profil disalin!');
  }, [profileUrl, showToast]);

  const handleCopyImage = useCallback(async () => {
    if (!shareCardRef.current) return;
    try {
      // Use native canvas approach to capture the share card
      const el = shareCardRef.current;
      const rect = el.getBoundingClientRect();
      const canvas = document.createElement('canvas');
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');

      // Draw a simplified version of the card
      ctx.scale(2, 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.roundRect(0, 0, rect.width / 2, rect.height, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(rect.width / 2, 0, rect.width / 2, rect.height, 12);
      ctx.fill();

      // Brand text
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 12px DM Sans';
      ctx.fillText('IndoPredict', 24, 30);

      // Name
      ctx.font = '700 15px DM Sans';
      ctx.fillText(profile.name, 24, 120);

      // PnL
      ctx.fillStyle = profitLoss >= 0 ? '#69f0ae' : '#ff5252';
      ctx.font = '700 18px DM Mono';
      ctx.fillText(`${profitLoss >= 0 ? '+' : ''}${profitLoss} credits`, 24, 145);

      // Right side title
      ctx.fillStyle = '#666666';
      ctx.font = '700 11px DM Sans';
      ctx.fillText('BIGGEST WINS', rect.width / 2 + 16, 28);

      // Win items
      ctx.fillStyle = '#111111';
      ctx.font = '500 11px DM Sans';
      topWins.forEach((w, i) => {
        const y = 50 + i * 28;
        ctx.fillText(w.q.substring(0, 30) + (w.q.length > 30 ? '...' : ''), rect.width / 2 + 16, y);
        ctx.fillStyle = '#2e7d32';
        ctx.font = '700 11px DM Mono';
        ctx.fillText(w.p, rect.width - 40, y);
        ctx.fillStyle = '#111111';
        ctx.font = '500 11px DM Sans';
      });

      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Gambar profil disalin!');
        }
      });
    } catch {
      // Fallback: copy link
      navigator.clipboard.writeText(profileUrl);
      showToast('Link profil disalin!');
    }
  }, [profileUrl, showToast, profile.name, profitLoss, topWins]);

  const handleShareX = useCallback(() => {
    const text = `Cek profil prediksi gue di IndoPredict!\n\n📊 ${credits} Credits\n🏆 Biggest Win: +${biggestWin}\n🎯 ${totalPredictions} Prediksi\n\n`;
    const url = encodeURIComponent(profileUrl);
    const tweetText = encodeURIComponent(text);
    window.open(`https://x.com/intent/tweet?text=${tweetText}&url=${url}`, '_blank');
    setShareOpen(false);
  }, [credits, biggestWin, totalPredictions, profileUrl]);

  return (
    <div className="pf-page">
      {/* Top section: Profile info + Chart */}
      <div className="pf-top-grid">
        {/* Left: Profile info */}
        <div className="pf-info-card">
          <div className="pf-info-header">
            <div className="pf-av-wrap" onClick={() => fileRef.current?.click()}>
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="pf-av-img" src={profile.avatar} alt="avatar" />
              ) : (
                <div className="pf-av">{initial}</div>
              )}
              <div className="pf-av-edit">📷</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
            <div className="pf-info-text">
              <div className="pf-name-row">
                <h1 className="pf-name">{profile.name}</h1>
              </div>
              <div className="pf-meta">Bergabung Mei 2025 · {hist.length.toLocaleString()} prediksi</div>
            </div>
          </div>

          {/* Bio/Description */}
          <div className="pf-bio-section">
            <p className="pf-bio-text">{profile.bio}</p>
            <div className="pf-badges-row">
              {profile.badges.slice(0, 3).map((b) => (
                <span className="pf-badge-pill" key={b.label}>{b.icon} {b.label}</span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="pf-stats-row">
            <div className="pf-stat">
              <div className="pf-stat-value">{credits.toLocaleString()}</div>
              <div className="pf-stat-label">Credits</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-value">{biggestWin}</div>
              <div className="pf-stat-label">Biggest Win</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-value">{totalPredictions}</div>
              <div className="pf-stat-label">Prediksi</div>
            </div>
          </div>
        </div>

        {/* Right: Profit/Loss Chart */}
        <div className="pf-chart-card">
          <div className="pf-chart-header">
            <div className="pf-chart-label">
              <span className={`pf-chart-dot ${profitLoss >= 0 ? 'green' : 'red'}`}></span>
              Profit/Loss
            </div>
            <div className="pf-chart-ranges">
              {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map(r => (
                <button
                  key={r}
                  className={`pf-chart-range ${chartRange === r ? 'active' : ''}`}
                  onClick={() => setChartRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="pf-chart-value">
            <span className={`pf-chart-num ${profitLoss >= 0 ? 'green' : 'red'}`}>
              {currentDisplayValue >= 0 ? '+' : '-'}<NumberFlow value={Math.abs(currentDisplayValue)} />
            </span>
            <span className="pf-chart-unit"> credits</span>
          </div>
          <div className="pf-chart-period">
            {hoverDate || (chartRange === '1D' ? 'Hari ini' : chartRange === '1W' ? '7 hari terakhir' : chartRange === '1M' ? '30 hari terakhir' : chartRange === '1Y' ? 'Tahun ini' : 'Semua waktu')}
          </div>
          <div className="pf-chart-svg-wrap" onMouseMove={handleChartHover} onMouseLeave={() => { setHoverValue(null); setHoverDate(''); setChartHoverX(null); setChartHoverY(null); }}>
            <svg viewBox="0 0 400 80" className="pf-chart-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={profitLoss >= 0 ? 'var(--green)' : 'var(--red)'} stopOpacity="0.15"/>
                  <stop offset="100%" stopColor={profitLoss >= 0 ? 'var(--green)' : 'var(--red)'} stopOpacity="0"/>
                </linearGradient>
              </defs>
              {chartPath && (
                <>
                  <path d={chartPath + ` L 384 80 L 16 80 Z`} fill="url(#chartGrad)" />
                  <path d={chartPath} fill="none" stroke={profitLoss >= 0 ? 'var(--green)' : 'var(--red)'} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </>
              )}
              {chartHoverX !== null && chartHoverY !== null && (
                <>
                  <line x1={chartHoverX} y1="0" x2={chartHoverX} y2="80" stroke="var(--ink)" strokeWidth="0.5" opacity="0.3" vectorEffect="non-scaling-stroke" />
                  {/* DEBUG: Show exact path point */}
                  <circle 
                    cx={chartHoverX} 
                    cy={chartHoverY} 
                    r="2" 
                    fill={profitLoss >= 0 ? 'var(--green)' : 'var(--red)'} 
                    stroke="var(--white)" 
                    strokeWidth="1" 
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs: Positions / Activity */}
      <div className="pf-main-tabs">
        <button
          className={`pf-main-tab ${activeTab === 'positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('positions')}
        >
          Positions
        </button>
        <button
          className={`pf-main-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button
          className={`pf-main-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="pf-settings-inline">
          <button className="pf-settings-link" onClick={() => setPage('settings')}>
            ⚙️ Buka Settings Lengkap →
          </button>
          <button className="pf-settings-link" onClick={() => setShareOpen(true)}>
            📤 Share Profil
          </button>
        </div>
      )}

      {activeTab === 'positions' && (
        <>
          {/* Filter row */}
          <div className="pf-filter-row">
            <div className="pf-pos-filters">
              <button
                className={`pf-pos-filter ${posFilter === 'active' ? 'active' : ''}`}
                onClick={() => setPosFilter('active')}
              >
                Active
              </button>
              <button
                className={`pf-pos-filter ${posFilter === 'closed' ? 'active' : ''}`}
                onClick={() => setPosFilter('closed')}
              >
                Closed
              </button>
            </div>
            <div className="pf-pos-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Cari prediksi"
                value={searchPos}
                onChange={(e) => setSearchPos(e.target.value)}
              />
            </div>
          </div>

          {/* Positions table */}
          <div className="pf-positions-table">
            <div className="pf-pos-thead">
              <span className="pf-pos-th market">MARKET</span>
              <span className="pf-pos-th">VOTE</span>
              <span className="pf-pos-th">STATUS</span>
              <span className="pf-pos-th right">POIN</span>
            </div>
            {filteredHist.length === 0 ? (
              <div className="pf-pos-empty">
                <div className="empty-icon">📊</div>
                <div className="empty-text">
                  {posFilter === 'active' ? 'Belum ada prediksi aktif' : 'Belum ada prediksi selesai'}
                </div>
              </div>
            ) : (
              filteredHist.map((h, i) => (
                <div className="pf-pos-row" key={i} onClick={() => setSelectedHist(h)}>
                  <div className="pf-pos-cell market">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="pf-pos-img" src={h.img} alt="" />
                    <span className="pf-pos-q">{h.q}</span>
                  </div>
                  <div className="pf-pos-cell">
                    <span className={`pf-pos-vote ${h.v}`}>{h.v.toUpperCase()}</span>
                  </div>
                  <div className="pf-pos-cell">
                    <span className={`pf-pos-status ${h.r}`}>
                      {h.r === 'win' ? '✓ Menang' : h.r === 'lose' ? '✗ Kalah' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="pf-pos-cell right">
                    <span className={`pf-pos-pts ${h.r}`}>{h.p}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'activity' && (
        <div className="pf-activity">
          {clog.map((c, i) => (
            <div className="pf-activity-item" key={i}>
              <div className="pf-activity-icon">
                {c.t === 'plus' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )}
              </div>
              <div className="pf-activity-info">
                <div className="pf-activity-desc">{c.desc}</div>
                <div className="pf-activity-date">{c.date}</div>
              </div>
              <div className={`pf-activity-amt ${c.t}`}>{c.amt}</div>
            </div>
          ))}
        </div>
      )}

      {/* Popup detail prediksi */}
      {selectedHist && (
        <div className="ov open" onClick={() => setSelectedHist(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="pop-close" onClick={() => setSelectedHist(null)}>×</button>
            <div className="hist-popup-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hist-popup-img" src={selectedHist.img} alt="" />
              <div>
                <div className="hist-popup-name">{profile.name}</div>
                <div className="hist-popup-handle">Prediksi</div>
              </div>
            </div>
            <div className="hist-popup-q">{selectedHist.q}</div>
            <div className="hist-popup-details">
              <div className="hist-popup-row">
                <span className="hist-popup-label">Vote</span>
                <span className={`hvote ${selectedHist.v}`}>{selectedHist.v.toUpperCase()}</span>
              </div>
              <div className="hist-popup-row">
                <span className="hist-popup-label">Hasil</span>
                <span className={`hresult ${selectedHist.r}`}>
                  {selectedHist.r === 'win' ? '✓ Menang' : selectedHist.r === 'lose' ? '✗ Kalah' : '⏳ Pending'}
                </span>
              </div>
              <div className="hist-popup-row">
                <span className="hist-popup-label">Poin</span>
                <span className={`hist-popup-pts ${selectedHist.r}`}>{selectedHist.p}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Share Profile Modal */}
      {shareOpen && (
        <div className="ov open" onClick={() => setShareOpen(false)}>
          <div className="popup share-popup" onClick={(e) => e.stopPropagation()}>
            <button className="pop-close" onClick={() => setShareOpen(false)}>×</button>
            <h2 className="share-title">Share Profile</h2>

            {/* Preview card (embed) */}
            <div className="share-card" ref={shareCardRef}>
              <div className="share-card-inner">
                {/* Left side */}
                <div className="share-card-left">
                  <div className="share-card-brand">
                    <span className="share-card-brand-dot"></span>
                    IndoPredict
                  </div>
                  <div className="share-card-avatar">
                    {profile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar} alt="" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div className="share-card-name">{profile.name}</div>
                  <div className={`share-card-pnl ${profitLoss >= 0 ? 'green' : 'red'}`}>
                    {profitLoss >= 0 ? '+' : ''}{profitLoss} credits
                  </div>
                </div>
                {/* Right side - Biggest Wins */}
                <div className="share-card-right">
                  <div className="share-card-right-title">Biggest Wins</div>
                  <div className="share-card-wins">
                    {topWins.length === 0 ? (
                      <div className="share-card-no-wins">Belum ada win</div>
                    ) : (
                      topWins.map((w, i) => (
                        <div className="share-card-win-item" key={i}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={w.img} alt="" className="share-card-win-img" />
                          <div className="share-card-win-q">{w.q}</div>
                          <div className="share-card-win-pts">{w.p}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="share-card-footer">
                {profile.name} on IndoPredict
              </div>
            </div>

            {/* Action buttons */}
            <div className="share-actions">
              <button className="share-action-btn" onClick={handleCopyLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Copy Link
              </button>
              <button className="share-action-btn" onClick={handleCopyImage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Copy Image
              </button>
              <button className="share-action-btn share-x-btn" onClick={handleShareX}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
