'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Notifications from './Notifications';
import ThemeToggle from './ThemeToggle';
import GlareWrap from './GlareWrap';

type Notif = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const mobileNotifs: Notif[] = [
  { id: 1, icon: '✅', title: 'Prediksi Resolved!', desc: 'Timnas Indonesia menang — kamu dapat +120 points!', time: '2 jam lalu', read: false },
  { id: 2, icon: '🔥', title: 'Streak 5 hari!', desc: 'Login streak kamu udah 5 hari. Bonus +10 credit.', time: '5 jam lalu', read: false },
  { id: 3, icon: '📢', title: 'Market Baru', desc: 'Ada 3 prediksi baru di kategori Ekonomi. Cek sekarang!', time: '1 hari lalu', read: true },
  { id: 4, icon: '💰', title: 'Credit Ditambahkan', desc: 'Pembelian 300 credit berhasil.', time: '2 hari lalu', read: true },
  { id: 5, icon: '❌', title: 'Prediksi Salah', desc: 'Dollar tembus Rp16.500 — prediksi kamu salah. -50 credit.', time: '3 hari lalu', read: true },
];

export default function Header() {
  const { page, setPage, credits, openBuy, profile, showToast } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'menu' | 'notif'>('menu');
  const [notifs, setNotifs] = useState<Notif[]>(mobileNotifs);
  const initial = profile.name.replace('@', '').charAt(0).toUpperCase() || 'A';

  const unread = notifs.filter((n) => !n.read).length;

  const goTo = (nextPage: typeof page) => {
    setPage(nextPage);
    setMenuOpen(false);
    setMobileView('menu');
  };

  const openCredits = () => {
    openBuy();
    setMenuOpen(false);
    setMobileView('menu');
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Semua notifikasi ditandai dibaca');
  };

  return (
    <>
      <header>
        <div className="logo" onClick={() => goTo('home')}>
          Indo<span>predict.</span>
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${page === 'home' ? 'active' : ''}`} onClick={() => goTo('home')}>
            Home
          </button>
          <button className={`nav-btn ${page === 'leaderboard' ? 'active' : ''}`} onClick={() => goTo('leaderboard')}>
            Leaderboard
          </button>
          <button className={`nav-btn ${page === 'profile' ? 'active' : ''}`} onClick={() => goTo('profile')}>
            Profil
          </button>
        </div>
        <div className="header-right">
          <ThemeToggle />
          <Notifications />
          <GlareWrap className="credit-chip">
            <div className="credit-chip-inner" onClick={openBuy}>
              <div className="credit-dot" />
              <span>{credits} Credits</span>
            </div>
          </GlareWrap>
          <button className="av-btn" onClick={() => setPage('profile')}>
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="nav-av-img" src={profile.avatar} alt="" />
            ) : (
              initial
            )}
          </button>
        </div>
        {/* Mobile hamburger - inside header, sticks with it */}
        <button
          className={`mobile-menu-btn ${menuOpen ? 'open' : ''}`}
          onClick={() => { setMenuOpen((v) => !v); setMobileView('menu'); }}
          aria-label="Buka menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile bottom sheet */}
      {menuOpen && (
        <>
          <button className="mobile-menu-backdrop" onClick={() => { setMenuOpen(false); setMobileView('menu'); }} aria-label="Tutup menu" />
          <div className="mobile-menu-panel">
            <div className="mobile-menu-handle"></div>

            {mobileView === 'menu' && (
              <>
                <button className={`mobile-menu-link ${page === 'home' ? 'active' : ''}`} onClick={() => goTo('home')}>
                  Home
                </button>
                <button className={`mobile-menu-link ${page === 'leaderboard' ? 'active' : ''}`} onClick={() => goTo('leaderboard')}>
                  Leaderboard
                </button>
                <button className={`mobile-menu-link ${page === 'profile' ? 'active' : ''}`} onClick={() => goTo('profile')}>
                  Profil
                </button>
                <button className={`mobile-menu-link ${page === 'settings' ? 'active' : ''}`} onClick={() => goTo('settings')}>
                  Settings
                </button>
                <div className="mobile-menu-actions">
                  <ThemeToggle />
                  <button className="notif-btn" onClick={() => setMobileView('notif')} aria-label="Notifications">
                    <svg className="notif-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unread > 0 && <span className="notif-badge">{unread}</span>}
                  </button>
                  <GlareWrap className="credit-chip">
                    <div className="credit-chip-inner" onClick={openCredits}>
                      <div className="credit-dot" />
                      <span>{credits} Credits</span>
                    </div>
                  </GlareWrap>
                  <button className="av-btn" onClick={() => goTo('profile')}>
                    {profile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="nav-av-img" src={profile.avatar} alt="" />
                    ) : (
                      initial
                    )}
                  </button>
                </div>
              </>
            )}

            {mobileView === 'notif' && (
              <div className="mobile-notif-view">
                <div className="mobile-notif-header">
                  <button className="mobile-notif-back" onClick={() => setMobileView('menu')}>
                    ← Kembali
                  </button>
                  <span className="mobile-notif-title">Notifikasi</span>
                  {unread > 0 && (
                    <button className="notif-mark" onClick={markAllRead}>
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="mobile-notif-list">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                    >
                      <div className="notif-icon">{n.icon}</div>
                      <div className="notif-body">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-desc">{n.desc}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      {!n.read && <div className="notif-dot" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
