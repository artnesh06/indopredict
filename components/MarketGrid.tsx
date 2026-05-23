'use client';

import { useStore } from '@/lib/store';
import { categories } from '@/lib/data';
import MarketCard from './MarketCard';

export default function MarketGrid() {
  const { markets, filter, setFilter, search, setPage, setSearch } = useStore();

  const filtered = filter === 'all' ? markets : markets.filter((m) => m.cat === filter);
  const list = search
    ? filtered.filter((m) => m.q.toLowerCase().includes(search.toLowerCase()))
    : filtered;

  return (
    <section className="section" id="markets">
      <div className="sec-hdr">
        <h2 className="sec-title">Market Aktif</h2>
        <button
          className="sec-link"
          onClick={() => {
            setSearch('');
            setFilter('all');
            setPage('markets');
          }}
        >
          Lihat semua →
        </button>
      </div>

      <div className="cats">
        {categories.map((c) => (
          <div
            key={c.key}
            className={`cpill ${filter === c.key ? 'active' : ''}`}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <div className="empty-text">Tidak ada prediksi ditemukan</div>
        </div>
      ) : (
        <div className="mgrid">
          {list.map((m) => (
            <MarketCard market={m} key={m.id} />
          ))}
        </div>
      )}
    </section>
  );
}
