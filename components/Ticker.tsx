'use client';

import { tickerItems } from '@/lib/data';
import { useStore } from '@/lib/store';

export default function Ticker() {
  const { markets, openVote } = useStore();
  const items = [...tickerItems, ...tickerItems];

  const handleClick = (q: string) => {
    // Match ticker item to market by partial question match
    const market = markets.find((m) => q.toLowerCase().includes(m.q.toLowerCase().slice(0, 15)));
    if (market) {
      openVote(market.id);
    }
  };

  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {items.map((t, i) => (
          <span className="ti" key={i} onClick={() => handleClick(t.q)}>
            {t.q} <span className="ty">YES {t.y}%</span> <span className="ts">·</span>{' '}
            <span className="tn">NO {t.n}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
