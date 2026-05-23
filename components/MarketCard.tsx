'use client';

import { Market } from '@/lib/data';
import { useStore } from '@/lib/store';
import NumberFlow from './NumberFlow';

type MarketCardProps = {
  market: Market;
};

export default function MarketCard({ market: m }: MarketCardProps) {
  const { openVote, openDetail, savedMarkets, toggleSave } = useStore();
  const isSaved = savedMarkets.includes(m.id);

  return (
    <div className={`mcard ${m.voted ? 'voted' : ''}`}>
      <div className="mcard-inner" onClick={() => openDetail(m.id)} style={{ cursor: 'pointer' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mc-img" src={m.img} alt="" />
        <div className="mc-content">
          <div className="mc-top">
            <span className="mc-cat">{m.cl}</span>
            <span className="mc-dl">Tutup {m.dl}</span>
          </div>
          <div className="mc-q">{m.q}</div>
        </div>
      </div>
      <div className="mc-btns">
        <button className={`mc-btn-yes ${m.voted === 'yes' ? 'selected' : ''}`} onClick={() => openVote(m.id)}>
          <span className="mc-btn-label">Yes</span>
          <span className="mc-btn-pct"><NumberFlow value={m.yes} />%</span>
        </button>
        <button className={`mc-btn-no ${m.voted === 'no' ? 'selected' : ''}`} onClick={() => openVote(m.id)}>
          <span className="mc-btn-label">No</span>
          <span className="mc-btn-pct"><NumberFlow value={100 - m.yes} />%</span>
        </button>
      </div>
      <div className="mc-ft">
        <span className="mc-vt">{m.voters.toLocaleString()} vote</span>
        <div className="mc-ft-icons">
          {m.voted ? (
            <span className="mc-vtag">✓ {m.voted.toUpperCase()}</span>
          ) : (
            <span className="mc-cost">Minimum: {m.cost} Credit</span>
          )}
          <svg
            className={`mc-bookmark ${isSaved ? 'saved' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleSave(m.id); }}
            viewBox="0 0 24 24"
            fill={isSaved ? 'var(--accent)' : 'none'}
            stroke={isSaved ? 'var(--accent)' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}