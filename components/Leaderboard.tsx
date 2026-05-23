'use client';

import { useState, useEffect } from 'react';
import { lbData } from '@/lib/data';
import { useStore } from '@/lib/store';

const tabs = ['Mei 2025', 'Apr 2025', 'Mar 2025'];

export default function Leaderboard() {
  const { showToast } = useStore();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [animKey, setAnimKey] = useState(0);

  // Re-trigger animation on tab change
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [activeTab]);

  // Order: 2nd, 1st, 3rd (left, center, right)
  const podiumOrder = [
    { user: lbData[1], rank: 2, height: 'pod-h2', delay: 200 },
    { user: lbData[0], rank: 1, height: 'pod-h1', delay: 400 },
    { user: lbData[2], rank: 3, height: 'pod-h3', delay: 0 },
  ];
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className="lb-page">
      <div className="lb-hdr">
      </div>

      <div className="podium-3d" key={animKey}>
        {podiumOrder.map((p) => (
          <div
            key={p.rank}
            className={`pod-col pod-rank-${p.rank}`}
            style={{ animationDelay: `${p.delay}ms` }}
            onClick={() => showToast('Profil ' + p.user.name)}
          >
            <div className="pod-user">
              <div className="pod-av-wrap">
                {p.rank === 1 && (
                  <div className="pod-stars">
                    {[...Array(8)].map((_, i) => (
                      <span key={i} className={`pod-star pod-star-${i}`}>✦</span>
                    ))}
                  </div>
                )}
                <div className={`pod-av-big rank-${p.rank}`}>{p.user.init}</div>
                <div className="pod-medal">{medals[p.rank]}</div>
              </div>
              <div className="pod-name-big">{p.user.name}</div>
              <div className="pod-pts-big">{p.user.pts.toLocaleString()}</div>
              <div className="pod-pts-lbl">points</div>
              <div className="pod-acc-big">{p.user.acc}% akurasi</div>
            </div>
            <div className={`pod-base ${p.height}`}>
              <div className="pod-rank-num">{p.rank}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="lb-tabs">
        {tabs.map((t) => (
          <div
            key={t}
            className={`lb-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(t);
              showToast('Data ' + t + ' dimuat');
            }}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="lb-table">
        <div className="lb-thead">
          <div>#</div>
          <div>User</div>
          <div>Points</div>
          <div>Akurasi</div>
          <div>Streak</div>
        </div>
        <div>
          {lbData.slice(3).map((u) => (
            <div key={u.rank} className="lb-row" onClick={() => showToast('Profil ' + u.name)}>
              <div className="lb-rank">{u.rank}</div>
              <div className="lb-uc">
                <div className="lb-av">{u.init}</div>
                <div>
                  <div className="lb-un">{u.name}</div>
                  <div className="lb-bs">{u.badge}</div>
                </div>
              </div>
              <div className="lb-pts">{u.pts.toLocaleString()}</div>
              <div className="lb-acc">{u.acc}%</div>
              <div className="lb-st">🔥 {u.str}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
