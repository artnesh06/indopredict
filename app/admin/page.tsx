'use client';

import { useState, useEffect } from 'react';
import { initialMarkets, lbData, initialClog, categories, Market, LbUser, CreditLog } from '@/lib/data';

type AdminTab = 'dashboard' | 'markets' | 'users' | 'credits' | 'settings';

type AdminMarket = Market & { status: 'active' | 'paused' | 'resolved'; result?: 'yes' | 'no' };

type AdminUser = LbUser & { credits: number; status: 'active' | 'banned'; joinDate: string };

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [markets, setMarkets] = useState<AdminMarket[]>(
    initialMarkets.map((m) => ({ ...m, status: 'active' as const }))
  );
  const [users, setUsers] = useState<AdminUser[]>(
    lbData.map((u) => ({
      ...u,
      credits: Math.floor(Math.random() * 500) + 50,
      status: 'active' as const,
      joinDate: '2025-0' + (Math.floor(Math.random() * 5) + 1) + '-' + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
    }))
  );
  const [creditLogs] = useState<CreditLog[]>(initialClog);
  const [settings, setSettings] = useState({
    appName: 'IndoPredict',
    defaultCredit: 100,
    dailyBonus: 10,
    maintenance: false,
  });

  // Market form
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [editMarket, setEditMarket] = useState<AdminMarket | null>(null);
  const [marketForm, setMarketForm] = useState({ q: '', cat: 'ekonomi', dl: '', cost: 10, img: '' });

  // Resolve modal
  const [resolveMarket, setResolveMarket] = useState<AdminMarket | null>(null);

  // User credit modal
  const [creditModal, setCreditModal] = useState<AdminUser | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);

  const stats = {
    totalUsers: users.length,
    activeMarkets: markets.filter((m) => m.status === 'active').length,
    resolvedMarkets: markets.filter((m) => m.status === 'resolved').length,
    totalVotes: markets.reduce((a, m) => a + m.voters, 0),
    totalCredits: users.reduce((a, u) => a + u.credits, 0),
  };

  const handleAddMarket = () => {
    if (!marketForm.q || !marketForm.dl) return;
    const catObj = categories.find((c) => c.key === marketForm.cat);
    const newMarket: AdminMarket = {
      id: Date.now(),
      cat: marketForm.cat,
      cl: catObj?.label || marketForm.cat,
      q: marketForm.q,
      yes: 50,
      voters: 0,
      dl: marketForm.dl,
      cost: marketForm.cost,
      voted: null,
      img: marketForm.img || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=120&h=120&q=80',
      status: 'active',
    };
    setMarkets((prev) => [newMarket, ...prev]);
    setMarketForm({ q: '', cat: 'ekonomi', dl: '', cost: 10, img: '' });
    setShowMarketForm(false);
  };

  const handleEditMarket = () => {
    if (!editMarket || !marketForm.q || !marketForm.dl) return;
    const catObj = categories.find((c) => c.key === marketForm.cat);
    setMarkets((prev) =>
      prev.map((m) =>
        m.id === editMarket.id
          ? { ...m, q: marketForm.q, cat: marketForm.cat, cl: catObj?.label || marketForm.cat, dl: marketForm.dl, cost: marketForm.cost, img: marketForm.img || m.img }
          : m
      )
    );
    setEditMarket(null);
    setShowMarketForm(false);
    setMarketForm({ q: '', cat: 'ekonomi', dl: '', cost: 10, img: '' });
  };

  const handleResolve = (result: 'yes' | 'no') => {
    if (!resolveMarket) return;
    setMarkets((prev) =>
      prev.map((m) => (m.id === resolveMarket.id ? { ...m, status: 'resolved' as const, result } : m))
    );
    setResolveMarket(null);
  };

  const handleTogglePause = (id: number) => {
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return { ...m, status: m.status === 'paused' ? 'active' : 'paused' } as AdminMarket;
      })
    );
  };

  const handleDeleteMarket = (id: number) => {
    setMarkets((prev) => prev.filter((m) => m.id !== id));
  };

  const handleBanUser = (name: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.name === name ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } as AdminUser : u))
    );
  };

  const handleGiveCredit = () => {
    if (!creditModal || creditAmount <= 0) return;
    setUsers((prev) =>
      prev.map((u) => (u.name === creditModal.name ? { ...u, credits: u.credits + creditAmount } : u))
    );
    setCreditModal(null);
    setCreditAmount(0);
  };

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">Indo<span>predict.</span></div>
        <div className="admin-label">ADMIN PANEL</div>
        <nav className="admin-nav">
          {([
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'markets', icon: '🎯', label: 'Markets' },
            { key: 'users', icon: '👥', label: 'Users' },
            { key: 'credits', icon: '💰', label: 'Credits' },
            { key: 'settings', icon: '⚙️', label: 'Settings' },
          ] as { key: AdminTab; icon: string; label: string }[]).map((item) => (
            <button
              key={item.key}
              className={`admin-nav-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" className="admin-back-btn">← Kembali ke App</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {tab === 'dashboard' && (
          <div className="admin-section">
            <h1 className="admin-title">Dashboard</h1>
            <p className="admin-sub">Overview statistik IndoPredict</p>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">👥</div>
                <div className="admin-stat-num">{stats.totalUsers}</div>
                <div className="admin-stat-label">Total Users</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🎯</div>
                <div className="admin-stat-num">{stats.activeMarkets}</div>
                <div className="admin-stat-label">Market Aktif</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">✅</div>
                <div className="admin-stat-num">{stats.resolvedMarkets}</div>
                <div className="admin-stat-label">Market Resolved</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🗳️</div>
                <div className="admin-stat-num">{stats.totalVotes.toLocaleString()}</div>
                <div className="admin-stat-label">Total Votes</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">💎</div>
                <div className="admin-stat-num">{stats.totalCredits.toLocaleString()}</div>
                <div className="admin-stat-label">Credit Beredar</div>
              </div>
            </div>

            <h2 className="admin-subtitle">Market Terbaru</h2>
            <div className="admin-table">
              <div className="admin-thead">
                <span>Market</span>
                <span>Voters</span>
                <span>Status</span>
              </div>
              {markets.slice(0, 5).map((m) => (
                <div className="admin-trow" key={m.id}>
                  <span className="admin-trow-q">{m.q}</span>
                  <span>{m.voters.toLocaleString()}</span>
                  <span className={`admin-badge admin-badge-${m.status}`}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'markets' && (
          <div className="admin-section">
            <div className="admin-header-row">
              <div>
                <h1 className="admin-title">Market Management</h1>
                <p className="admin-sub">Kelola semua prediksi market</p>
              </div>
              <button className="admin-btn-primary" onClick={() => { setShowMarketForm(true); setEditMarket(null); setMarketForm({ q: '', cat: 'ekonomi', dl: '', cost: 10, img: '' }); }}>
                + Tambah Market
              </button>
            </div>

            <div className="admin-table">
              <div className="admin-thead admin-thead-market">
                <span>Market</span>
                <span>Kategori</span>
                <span>Voters</span>
                <span>Deadline</span>
                <span>Status</span>
                <span>Aksi</span>
              </div>
              {markets.map((m) => (
                <div className="admin-trow admin-trow-market" key={m.id}>
                  <span className="admin-trow-q">{m.q}</span>
                  <span className="admin-trow-cat">{m.cl}</span>
                  <span>{m.voters.toLocaleString()}</span>
                  <span>{m.dl}</span>
                  <span className={`admin-badge admin-badge-${m.status}`}>
                    {m.status}{m.result ? ` (${m.result.toUpperCase()})` : ''}
                  </span>
                  <span className="admin-actions">
                    {m.status !== 'resolved' && (
                      <>
                        <button className="admin-act-btn" title="Edit" onClick={() => { setEditMarket(m); setMarketForm({ q: m.q, cat: m.cat, dl: m.dl, cost: m.cost, img: m.img }); setShowMarketForm(true); }}>✏️</button>
                        <button className="admin-act-btn" title={m.status === 'paused' ? 'Resume' : 'Pause'} onClick={() => handleTogglePause(m.id)}>
                          {m.status === 'paused' ? '▶️' : '⏸️'}
                        </button>
                        <button className="admin-act-btn" title="Resolve" onClick={() => setResolveMarket(m)}>🏁</button>
                      </>
                    )}
                    <button className="admin-act-btn admin-act-del" title="Hapus" onClick={() => handleDeleteMarket(m.id)}>🗑️</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-section">
            <h1 className="admin-title">User Management</h1>
            <p className="admin-sub">Kelola semua pengguna</p>
            <div className="admin-table">
              <div className="admin-thead admin-thead-user">
                <span>#</span>
                <span>User</span>
                <span>Credits</span>
                <span>Akurasi</span>
                <span>Points</span>
                <span>Status</span>
                <span>Aksi</span>
              </div>
              {users.map((u, i) => (
                <div className="admin-trow admin-trow-user" key={u.name}>
                  <span>{i + 1}</span>
                  <span className="admin-user-cell">
                    <div className="admin-user-av">{u.init}</div>
                    <div>
                      <div className="admin-user-name">{u.name}</div>
                      <div className="admin-user-badge">{u.badge}</div>
                    </div>
                  </span>
                  <span>{u.credits}</span>
                  <span>{u.acc}%</span>
                  <span>{u.pts.toLocaleString()}</span>
                  <span className={`admin-badge admin-badge-${u.status}`}>{u.status}</span>
                  <span className="admin-actions">
                    <button className="admin-act-btn" title="Kasih Credit" onClick={() => { setCreditModal(u); setCreditAmount(100); }}>💰</button>
                    <button className="admin-act-btn" title={u.status === 'banned' ? 'Unban' : 'Ban'} onClick={() => handleBanUser(u.name)}>
                      {u.status === 'banned' ? '✅' : '🚫'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'credits' && (
          <div className="admin-section">
            <h1 className="admin-title">Credit Transactions</h1>
            <p className="admin-sub">Semua log transaksi credit</p>
            <div className="admin-table">
              <div className="admin-thead admin-thead-credit">
                <span>Deskripsi</span>
                <span>Tanggal</span>
                <span>Jumlah</span>
              </div>
              {creditLogs.map((c, i) => (
                <div className="admin-trow admin-trow-credit" key={i}>
                  <span>{c.desc}</span>
                  <span>{c.date}</span>
                  <span className={`admin-credit-${c.t}`}>{c.amt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="admin-section">
            <h1 className="admin-title">Settings</h1>
            <p className="admin-sub">Konfigurasi aplikasi</p>
            <div className="admin-settings-grid">
              <div className="admin-setting-item">
                <label>Nama Aplikasi</label>
                <input type="text" value={settings.appName} onChange={(e) => setSettings({ ...settings, appName: e.target.value })} />
              </div>
              <div className="admin-setting-item">
                <label>Default Credit (User Baru)</label>
                <input type="number" value={settings.defaultCredit} onChange={(e) => setSettings({ ...settings, defaultCredit: +e.target.value })} />
              </div>
              <div className="admin-setting-item">
                <label>Daily Login Bonus</label>
                <input type="number" value={settings.dailyBonus} onChange={(e) => setSettings({ ...settings, dailyBonus: +e.target.value })} />
              </div>
              <div className="admin-setting-item admin-setting-toggle">
                <label>Maintenance Mode</label>
                <button className={`admin-toggle ${settings.maintenance ? 'on' : ''}`} onClick={() => setSettings({ ...settings, maintenance: !settings.maintenance })}>
                  <span className="admin-toggle-dot" />
                </button>
              </div>
            </div>
            <button className="admin-btn-primary admin-save-btn">💾 Simpan Settings</button>
          </div>
        )}
      </main>

      {/* Market Form Modal */}
      {showMarketForm && (
        <div className="admin-overlay" onClick={() => setShowMarketForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editMarket ? 'Edit Market' : 'Tambah Market Baru'}</h2>
            <div className="admin-form">
              <div className="admin-field">
                <label>Pertanyaan</label>
                <input type="text" placeholder="Contoh: Bitcoin tembus $100k?" value={marketForm.q} onChange={(e) => setMarketForm({ ...marketForm, q: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Kategori</label>
                <select value={marketForm.cat} onChange={(e) => setMarketForm({ ...marketForm, cat: e.target.value })}>
                  {categories.filter((c) => c.key !== 'all').map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Deadline</label>
                  <input type="text" placeholder="30 Jun" value={marketForm.dl} onChange={(e) => setMarketForm({ ...marketForm, dl: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Cost (Credit)</label>
                  <input type="number" value={marketForm.cost} onChange={(e) => setMarketForm({ ...marketForm, cost: +e.target.value })} />
                </div>
              </div>
              <div className="admin-field">
                <label>Image URL</label>
                <input type="text" placeholder="https://..." value={marketForm.img} onChange={(e) => setMarketForm({ ...marketForm, img: e.target.value })} />
              </div>
              <div className="admin-form-actions">
                <button className="admin-btn-secondary" onClick={() => setShowMarketForm(false)}>Batal</button>
                <button className="admin-btn-primary" onClick={editMarket ? handleEditMarket : handleAddMarket}>
                  {editMarket ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveMarket && (
        <div className="admin-overlay" onClick={() => setResolveMarket(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Resolve Market</h2>
            <p className="admin-resolve-q">{resolveMarket.q}</p>
            <p className="admin-resolve-info">YES: {resolveMarket.yes}% · NO: {100 - resolveMarket.yes}% · {resolveMarket.voters.toLocaleString()} voters</p>
            <div className="admin-resolve-btns">
              <button className="admin-resolve-yes" onClick={() => handleResolve('yes')}>✅ Resolve YES</button>
              <button className="admin-resolve-no" onClick={() => handleResolve('no')}>❌ Resolve NO</button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {creditModal && (
        <div className="admin-overlay" onClick={() => setCreditModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Kasih Credit</h2>
            <p>User: <strong>{creditModal.name}</strong></p>
            <p>Credit saat ini: {creditModal.credits}</p>
            <div className="admin-field">
              <label>Jumlah Credit</label>
              <input type="number" value={creditAmount} onChange={(e) => setCreditAmount(+e.target.value)} />
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={() => setCreditModal(null)}>Batal</button>
              <button className="admin-btn-primary" onClick={handleGiveCredit}>Kirim Credit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
