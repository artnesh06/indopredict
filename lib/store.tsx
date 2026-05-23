'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import {
  initialMarkets, initialHist, initialClog,
  Market, HistItem, CreditLog,
} from './data';

type Page = 'home' | 'leaderboard' | 'profile' | 'settings' | 'markets' | 'market-detail';

type SocialKey = 'twitter' | 'instagram' | 'tiktok';

type UserProfile = {
  name: string;
  location: string;
  avatar: string | null;
  bio: string;
  socials: Record<SocialKey, { connected: boolean; handle: string }>;
  badges: Array<{ icon: string; label: string; desc: string }>;
};

type StoreCtx = {
  page: Page;
  setPage: (p: Page) => void;

  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateSocial: (key: SocialKey, patch: Partial<UserProfile['socials'][SocialKey]>) => void;
  cornerRadius: number;
  setCornerRadius: (v: number) => void;

  credits: number;
  markets: Market[];
  hist: HistItem[];
  clog: CreditLog[];

  filter: string;
  setFilter: (f: string) => void;

  search: string;
  setSearch: (s: string) => void;

  // Vote popup
  voteOpen: boolean;
  activeMarket: Market | null;
  selChoice: 'yes' | 'no' | null;
  vCr: number;
  openVote: (id: number) => void;
  closeVote: () => void;
  setSelChoice: (c: 'yes' | 'no') => void;
  adjC: (d: number) => void;
  confirmVote: () => void;

  // Buy modal
  buyOpen: boolean;
  selPkg: { amt: number; price: number } | null;
  setSelPkg: (p: { amt: number; price: number } | null) => void;
  openBuy: () => void;
  closeBuy: () => void;
  buyConfirm: () => void;

  // Toast
  toast: string;
  showToast: (msg: string) => void;

  // Saved
  savedMarkets: number[];
  toggleSave: (id: number) => void;

  // Market detail
  detailMarketId: number | null;
  openDetail: (id: number) => void;
  detailMarket: Market | null;

  // Confetti
  confettiActive: boolean;
};

const Ctx = createContext<StoreCtx | null>(null);

const defaultProfile: UserProfile = {
  name: '@artnesh',
  location: 'Jakarta',
  avatar: null,
  bio: 'NFT artist & Web3 builder. Prediksi ekonomi & kripto adalah keahlian gue.',
  socials: {
    twitter: { connected: false, handle: '' },
    instagram: { connected: false, handle: '' },
    tiktok: { connected: false, handle: '' },
  },
  badges: [
    { icon: '⚡', label: 'Rank #47', desc: 'Masuk top 50 netizen paling aktif.' },
    { icon: '🔥', label: 'Streak 5 hari', desc: 'Login dan vote konsisten lima hari.' },
    { icon: '💰', label: 'Ekonomi Watcher', desc: 'Sering ikut market ekonomi.' },
    { icon: '✓', label: 'Early Voter', desc: 'Cepat ambil posisi saat market baru.' },
  ],
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [cornerRadius, setCornerRadiusState] = useState(16);
  const [credits, setCredits] = useState(250);
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [hist, setHist] = useState<HistItem[]>(initialHist);
  const [clog, setClog] = useState<CreditLog[]>(initialClog);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [voteOpen, setVoteOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selChoice, setSelChoiceState] = useState<'yes' | 'no' | null>(null);
  const [vCr, setVCr] = useState(10);

  const [buyOpen, setBuyOpen] = useState(false);
  const [selPkg, setSelPkg] = useState<{ amt: number; price: number } | null>(null);

  const [toast, setToast] = useState('');
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const [savedMarkets, setSavedMarkets] = useState<number[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [detailMarketId, setDetailMarketId] = useState<number | null>(null);

  const activeMarket = useMemo(
    () => markets.find((m) => m.id === activeId) ?? null,
    [markets, activeId]
  );

  const detailMarket = useMemo(
    () => markets.find((m) => m.id === detailMarketId) ?? null,
    [markets, detailMarketId]
  );

  const openDetail = useCallback((id: number) => {
    setDetailMarketId(id);
    setPage('market-detail');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--corner', `${cornerRadius}px`);
    document.documentElement.style.setProperty('--corner-sm', `${Math.max(4, Math.round(cornerRadius * 0.62))}px`);
    document.documentElement.style.setProperty('--corner-lg', `${Math.max(8, Math.round(cornerRadius * 1.35))}px`);
  }, [cornerRadius]);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSocial = useCallback((key: SocialKey, patch: Partial<UserProfile['socials'][SocialKey]>) => {
    setProfile((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [key]: { ...prev.socials[key], ...patch },
      },
    }));
  }, []);

  const setCornerRadius = useCallback((v: number) => {
    setCornerRadiusState(Math.max(0, Math.min(40, Math.round(v))));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  }, []);

  const toggleSave = useCallback((id: number) => {
    setSavedMarkets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const openVote = useCallback((id: number) => {
    const m = initialMarkets.find((x) => x.id === id);
    setActiveId(id);
    setSelChoiceState(null);
    setVCr(m?.cost ?? 10);
    setVoteOpen(true);
  }, []);

  const closeVote = useCallback(() => setVoteOpen(false), []);

  const setSelChoice = useCallback((c: 'yes' | 'no') => setSelChoiceState(c), []);

  const adjC = useCallback(
    (d: number) => {
      if (!activeMarket) return;
      setVCr((v) => Math.max(activeMarket.cost, Math.min(credits, v + d)));
    },
    [activeMarket, credits]
  );

  const openBuy = useCallback(() => setBuyOpen(true), []);
  const closeBuy = useCallback(() => {
    setBuyOpen(false);
    setSelPkg(null);
  }, []);

  const confirmVote = useCallback(() => {
    if (!activeMarket) return;
    if (activeMarket.voted) {
      showToast('Lo sudah vote di prediksi ini!');
      return;
    }
    if (!selChoice) {
      showToast('Pilih YES atau NO dulu!');
      return;
    }
    if (credits < vCr) {
      openBuy();
      return;
    }

    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== activeMarket.id) return m;
        const newVoters = m.voters + 1;
        const newYes =
          selChoice === 'yes'
            ? Math.min(99, Math.round((m.yes * m.voters + 100) / newVoters))
            : Math.max(1, Math.round((m.yes * m.voters) / newVoters));
        return { ...m, voted: selChoice, yes: newYes, voters: newVoters };
      })
    );
    setCredits((c) => c - vCr);
    setHist((prev) => [{ q: activeMarket.q, v: selChoice, r: 'pending', p: '—', img: activeMarket.img }, ...prev]);
    setClog((prev) => [
      { desc: 'Vote: ' + activeMarket.q.substring(0, 38) + '…', date: 'Baru saja', amt: '-' + vCr, t: 'minus' },
      ...prev,
    ]);

    setVoteOpen(false);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3500);
    showToast(`✓ Vote ${selChoice.toUpperCase()} tercatat! ${vCr} credit dipakai.`);
  }, [activeMarket, selChoice, credits, vCr, openBuy, showToast]);

  const buyConfirm = useCallback(() => {
    if (!selPkg) {
      showToast('Pilih paket dulu!');
      return;
    }
    setCredits((c) => c + selPkg.amt);
    setClog((prev) => [
      { desc: 'Beli ' + selPkg.amt + ' credit', date: 'Baru saja', amt: '+' + selPkg.amt, t: 'plus' },
      ...prev,
    ]);
    showToast(`+${selPkg.amt} credit berhasil! 🎉`);
    closeBuy();
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3500);
  }, [selPkg, closeBuy, showToast]);

  const value: StoreCtx = {
    page, setPage,
    profile, updateProfile, updateSocial, cornerRadius, setCornerRadius,
    credits, markets, hist, clog,
    filter, setFilter,
    search, setSearch,
    voteOpen, activeMarket, selChoice, vCr,
    openVote, closeVote, setSelChoice, adjC, confirmVote,
    buyOpen, selPkg, setSelPkg, openBuy, closeBuy, buyConfirm,
    toast, showToast,
    savedMarkets, toggleSave,
    detailMarketId, openDetail, detailMarket,
    confettiActive,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
