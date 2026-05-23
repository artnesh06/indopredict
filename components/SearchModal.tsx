'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, lbData, Market, LbUser } from '@/lib/data';
import { useStore } from '@/lib/store';

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

type SearchResult =
  | { id: string; type: 'market'; icon: string; title: string; meta: string; market: Market }
  | { id: string; type: 'category'; icon: string; title: string; meta: string; category: (typeof categories)[number] }
  | { id: string; type: 'user'; icon: string; title: string; meta: string; user: LbUser }
  | { id: string; type: 'action'; icon: string; title: string; meta: string; action: 'filter' | 'home' | 'leaderboard' | 'profile' | 'credits' };

type ActionResult = Extract<SearchResult, { type: 'action' }>;

const cleanCategory = (label: string) => label.replace(/[^\p{L}\p{N}\s]/gu, '').trim();

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const {
    markets,
    setPage,
    setFilter,
    setSearch,
    openVote,
    openBuy,
    showToast,
  } = useStore();

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const normalized = query.trim().toLowerCase();

  const results = useMemo<SearchResult[]>(() => {
    const contains = (parts: Array<string | number | null | undefined>) =>
      parts.join(' ').toLowerCase().includes(normalized);

    const pageActions: ActionResult[] = [
      { id: 'action-home', type: 'action', icon: '⌂', title: 'Home', meta: 'Kembali ke market aktif', action: 'home' },
      { id: 'action-leaderboard', type: 'action', icon: '#', title: 'Leaderboard', meta: 'Cari akun dan ranking netizen', action: 'leaderboard' },
      { id: 'action-profile', type: 'action', icon: '@', title: 'Profil', meta: 'Riwayat vote, saved, dan credit', action: 'profile' },
      { id: 'action-credits', type: 'action', icon: '•', title: 'Beli Credit', meta: 'Top up credit untuk ikut vote', action: 'credits' },
    ];

    if (!normalized) {
      return [
        ...markets.slice(0, 3).map((market) => ({
          id: `market-${market.id}`,
          type: 'market' as const,
          icon: '✓',
          title: market.q,
          meta: `${market.cl} · ${market.voters.toLocaleString()} vote · Minimum ${market.cost} Credit`,
          market,
        })),
        ...categories.slice(1, 4).map((category) => ({
          id: `category-${category.key}`,
          type: 'category' as const,
          icon: '◎',
          title: category.label,
          meta: 'Filter kategori market',
          category,
        })),
        ...pageActions,
      ];
    }

    const marketResults = markets
      .filter((market) =>
        contains([
          market.q,
          market.cl,
          cleanCategory(market.cl),
          market.cat,
          market.dl,
          market.cost,
          `${market.yes} yes`,
          `${100 - market.yes} no`,
          market.voted ? `sudah vote voted ${market.voted}` : 'belum vote minimum credit',
        ])
      )
      .slice(0, 5)
      .map((market) => ({
        id: `market-${market.id}`,
        type: 'market' as const,
        icon: '✓',
        title: market.q,
        meta: `${market.cl} · ${market.yes}% YES · Tutup ${market.dl}`,
        market,
      }));

    const categoryResults = categories
      .filter((category) => contains([category.key, category.label, cleanCategory(category.label), 'kategori category filter']))
      .slice(0, 4)
      .map((category) => ({
        id: `category-${category.key}`,
        type: 'category' as const,
        icon: '◎',
        title: category.label,
        meta: 'Filter kategori market',
        category,
      }));

    const userResults = lbData
      .filter((user) => contains([user.name, user.badge, user.rank, user.pts, user.acc, 'akun user leaderboard ranking']))
      .slice(0, 5)
      .map((user) => ({
        id: `user-${user.rank}`,
        type: 'user' as const,
        icon: user.init,
        title: user.name,
        meta: `#${user.rank} · ${user.badge} · ${user.acc}% akurasi`,
        user,
      }));

    const actionResults = pageActions.filter((action) => contains([action.title, action.meta, action.action]));

    return [
      { id: 'action-filter', type: 'action' as const, icon: '⌕', title: `Filter market: "${query.trim()}"`, meta: 'Tampilkan card yang cocok di Market Aktif', action: 'filter' as const },
      ...marketResults,
      ...categoryResults,
      ...userResults,
      ...actionResults,
    ].slice(0, 12);
  }, [markets, normalized, query]);

  const scrollToMarkets = () => {
    setTimeout(() => document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const selectResult = (result: SearchResult) => {
    if (result.type === 'market') {
      setPage('home');
      setFilter('all');
      setSearch(result.market.q);
      onClose();
      scrollToMarkets();
      setTimeout(() => openVote(result.market.id), 120);
      return;
    }

    if (result.type === 'category') {
      setPage('home');
      setFilter(result.category.key);
      setSearch('');
      onClose();
      scrollToMarkets();
      return;
    }

    if (result.type === 'user') {
      setPage('leaderboard');
      onClose();
      showToast(`Akun ${result.user.name}`);
      return;
    }

    if (result.action === 'filter') {
      setPage('home');
      setFilter('all');
      setSearch(query.trim());
      onClose();
      scrollToMarkets();
      return;
    }

    if (result.action === 'credits') {
      openBuy();
      onClose();
      return;
    }

    setSearch('');
    setFilter('all');
    setPage(result.action);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="search-pop" onClick={onClose}>
      <div className="search-pop-box" onClick={(e) => e.stopPropagation()}>
        <div className="search-pop-input-wrap">
          <span className="search-pop-icon">⌕</span>
          <input
            ref={inputRef}
            className="search-pop-input"
            type="text"
            placeholder="Cari market, akun, kategori..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-pop-close" onClick={onClose}>×</button>
        </div>

        <div className="search-pop-results">
          {results.length === 0 ? (
            <div className="search-pop-empty">Tidak ada hasil</div>
          ) : (
            results.map((result) => (
              <button className={`search-result search-result-${result.type}`} key={result.id} onClick={() => selectResult(result)}>
                <span className="search-result-icon">{result.icon}</span>
                <span className="search-result-copy">
                  <span className="search-result-title">{result.title}</span>
                  <span className="search-result-meta">{result.meta}</span>
                </span>
                <span className="search-result-go">↵</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
