'use client';

import { useRef, useState, type JSX } from 'react';
import { useStore } from '@/lib/store';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'appearance';

const socials = [
  { key: 'twitter', label: 'X (Twitter)', icon: '𝕏', prefix: '@' },
  { key: 'instagram', label: 'Instagram', icon: '📷', prefix: '@' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', prefix: '@' },
] as const;

export default function Settings() {
  const {
    profile,
    updateProfile,
    updateSocial,
    cornerRadius,
    setCornerRadius,
    setPage,
    showToast,
  } = useStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const initial = profile.name.replace('@', '').charAt(0).toUpperCase() || 'A';
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [bioLength, setBioLength] = useState(profile.bio.length);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      updateProfile({ avatar: ev.target?.result as string });
      showToast('PFP berhasil diganti');
    };
    reader.readAsDataURL(file);
  };

  const normalizeName = (value: string) => {
    const clean = value.trimStart().replace(/\s+/g, '_');
    if (!clean) return '@';
    return clean.startsWith('@') ? clean : '@' + clean;
  };

  const tabs: { key: SettingsTab; label: string; icon: JSX.Element }[] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      key: 'account',
      label: 'Account',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    },
    {
      key: 'appearance',
      label: 'Appearance',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 0 0 20 4 4 0 0 1 0-8 4 4 0 0 0 0-8"/></svg>,
    },
  ];

  return (
    <main className="settings-page-v2">
      <div className="settings-layout">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <button className="settings-back" onClick={() => setPage('profile')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Kembali
          </button>
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`settings-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Profile</h2>

              {/* Profile picture */}
              <div className="settings-row">
                <div className="settings-row-label">Profile picture</div>
                <div className="settings-row-value">
                  <button className="settings-pfp" onClick={() => fileRef.current?.click()}>
                    {profile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar} alt="" />
                    ) : (
                      <span className="settings-pfp-initial">{initial}</span>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>
              </div>

              {/* Username */}
              <div className="settings-row">
                <div className="settings-row-label">Username</div>
                <div className="settings-row-value">
                  <input
                    className="settings-input"
                    value={profile.name}
                    onChange={(e) => updateProfile({ name: normalizeName(e.target.value) })}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="settings-row">
                <div className="settings-row-label">Lokasi</div>
                <div className="settings-row-value">
                  <input
                    className="settings-input"
                    value={profile.location}
                    onChange={(e) => updateProfile({ location: e.target.value })}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="settings-row bio-row">
                <div className="settings-row-label">Bio</div>
                <div className="settings-row-value">
                  <textarea
                    className="settings-textarea"
                    value={profile.bio}
                    maxLength={200}
                    onChange={(e) => {
                      updateProfile({ bio: e.target.value });
                      setBioLength(e.target.value.length);
                    }}
                    placeholder="Tell others about yourself"
                  />
                  <div className="settings-bio-count">{bioLength}/200</div>
                </div>
              </div>

              {/* Social connections */}
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Social connections</h3>
                <div className="settings-socials">
                  {socials.map((social) => {
                    const state = profile.socials[social.key];
                    return (
                      <div className="settings-social-row" key={social.key}>
                        <div className="settings-social-info">
                          <span className="settings-social-icon">{social.icon}</span>
                          <div>
                            <div className="settings-social-name">{social.label}</div>
                            <div className="settings-social-desc">
                              {state.connected
                                ? state.handle || social.prefix + profile.name.replace('@', '')
                                : 'Link akun untuk ditampilkan di profil'}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`settings-social-btn ${state.connected ? 'connected' : ''}`}
                          onClick={() => {
                            updateSocial(social.key, {
                              connected: !state.connected,
                              handle: state.connected ? '' : state.handle || social.prefix + profile.name.replace('@', ''),
                            });
                            showToast(`${social.label} ${state.connected ? 'diputus' : 'terhubung'}`);
                          }}
                        >
                          {state.connected ? 'Disconnect' : `Connect ${social.label}`}
                          {!state.connected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Account</h2>

              <div className="settings-row">
                <div className="settings-row-label">Email</div>
                <div className="settings-row-value">
                  <div className="settings-static-value">Belum ditambahkan</div>
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-row-label">Badges</div>
                <div className="settings-row-value">
                  <div className="settings-badges-grid">
                    {profile.badges.map((badge) => (
                      <div className="settings-badge-item" key={badge.label}>
                        <span className="settings-badge-icon">{badge.icon}</span>
                        <div>
                          <div className="settings-badge-label">{badge.label}</div>
                          <div className="settings-badge-desc">{badge.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="settings-subsection danger-zone">
                <h3 className="settings-subsection-title">Danger Zone</h3>
                <p className="settings-danger-desc">Hapus akun secara permanen. Tindakan ini tidak bisa dibatalkan.</p>
                <button className="settings-danger-btn">Hapus Akun</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Notifications</h2>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-toggle-label">Prediksi selesai</div>
                  <div className="settings-toggle-desc">Notifikasi saat prediksi kamu sudah ada hasilnya</div>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-switch-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-toggle-label">Market baru</div>
                  <div className="settings-toggle-desc">Notifikasi saat ada market baru yang trending</div>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-switch-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-toggle-label">Bonus credit</div>
                  <div className="settings-toggle-desc">Notifikasi saat kamu mendapat bonus credit</div>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-switch-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-row">
                <div>
                  <div className="settings-toggle-label">Leaderboard update</div>
                  <div className="settings-toggle-desc">Notifikasi saat ranking kamu berubah</div>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" />
                  <span className="settings-switch-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Appearance</h2>

              <div className="settings-row">
                <div className="settings-row-label">Corner Radius</div>
                <div className="settings-row-value">
                  <div className="settings-corner-control">
                    <div className="settings-corner-header">
                      <span>Curve</span>
                      <strong>{cornerRadius}px</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={cornerRadius}
                      onChange={(e) => setCornerRadius(Number(e.target.value))}
                      className="settings-range"
                    />
                    <div className="settings-corner-previews">
                      <div className="settings-corner-preview" style={{ borderRadius: `${Math.max(4, cornerRadius * 0.5)}px` }}>Sm</div>
                      <div className="settings-corner-preview" style={{ borderRadius: `${cornerRadius}px` }}>Md</div>
                      <div className="settings-corner-preview" style={{ borderRadius: `${Math.min(40, cornerRadius * 1.5)}px` }}>Lg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
