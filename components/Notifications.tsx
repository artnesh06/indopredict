'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

type Notif = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const initialNotifs: Notif[] = [
  { id: 1, icon: '✅', title: 'Prediksi Resolved!', desc: 'Timnas Indonesia menang — kamu dapat +120 points!', time: '2 jam lalu', read: false },
  { id: 2, icon: '🔥', title: 'Streak 5 hari!', desc: 'Login streak kamu udah 5 hari. Bonus +10 credit.', time: '5 jam lalu', read: false },
  { id: 3, icon: '📢', title: 'Market Baru', desc: 'Ada 3 prediksi baru di kategori Ekonomi. Cek sekarang!', time: '1 hari lalu', read: true },
  { id: 4, icon: '💰', title: 'Credit Ditambahkan', desc: 'Pembelian 300 credit berhasil.', time: '2 hari lalu', read: true },
  { id: 5, icon: '❌', title: 'Prediksi Salah', desc: 'Dollar tembus Rp16.500 — prediksi kamu salah. -50 credit.', time: '3 hari lalu', read: true },
];

export default function Notifications() {
  const { showToast } = useStore();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Semua notifikasi ditandai dibaca');
  };

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (e: PointerEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  return (
    <div className="notif-wrap">
      <button ref={buttonRef} className="notif-btn" onClick={() => setOpen(!open)} aria-label="Notifications" aria-expanded={open}>
        <svg
          className="notif-bell"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div ref={panelRef} className="notif-panel">
            <div className="notif-header">
              <span className="notif-title">Notifikasi</span>
              {unread > 0 && (
                <button className="notif-mark" onClick={markAllRead}>
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="notif-list">
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => {
                    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                  }}
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
        </>
      )}
    </div>
  );
}
