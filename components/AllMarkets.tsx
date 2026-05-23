'use client';

import { categories } from '@/lib/data';
import { useStore } from '@/lib/store';
import MarketCard from './MarketCard';

export default function AllMarkets() {
  const { markets, filter, setFilter, search, setSearch, setPage } = useStore();

  const filtered = markets.filter((m) => {
    const matchFilter = filter === 'all' || m.cat === filter;
    const matchSearch = !search || [m.q, m.cl, m.cat, m.dl].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <main className="all-page">
      <div className="all-top">
        <button className="all-back" onClick={() => setPage('home')}>← Home</button>
        <div>
          <h1 className="all-title">Semua Market</h1>
          <p className="all-sub">{markets.length} market aktif, termasuk kategori ekonomi, bola, politik, cuaca, hiburan, dan kripto.</p>
        </div>
      </div>

      <div className="all-toolbar">
        <div className="all-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari market..."
          />
        </div>
        <div className="cats all-cats">
          {categories.map((c) => (
            <button
              key={c.key}
              className={`cpill ${filter === c.key ? 'active' : ''}`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <div className="empty-text">Tidak ada market yang cocok</div>
        </div>
      ) : (
        <div className="mgrid">
          {filtered.map((market) => (
            <MarketCard market={market} key={market.id} />
          ))}
        </div>
      )}
    </main>
  );
}
