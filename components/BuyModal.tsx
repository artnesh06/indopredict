'use client';

import { useStore } from '@/lib/store';
import GlareWrap from './GlareWrap';

const packages = [
  { amt: 100, price: 9000, label: 'Starter', popular: false },
  { amt: 300, price: 19000, label: 'Value', popular: true },
  { amt: 750, price: 39000, label: 'Pro', popular: false },
];

export default function BuyModal() {
  const { buyOpen, closeBuy, selPkg, setSelPkg, buyConfirm } = useStore();

  return (
    <div
      className={`ov ${buyOpen ? 'open' : ''}`}
      onClick={(e) => e.target === e.currentTarget && closeBuy()}
    >
      <div className="popup" style={{ maxWidth: 400 }}>
        <div className="modal-title">Beli Credit ⚡</div>
        <div className="modal-sub">
          Credit dipakai buat ikut prediksi. Tidak bisa dicairkan ke uang.
        </div>

        <div className="pkg-grid">
          {packages.map((p) => {
            const isSel = selPkg?.amt === p.amt;
            return (
              <div key={p.amt} className="pkg-wrap">
                {p.popular && <div className="pkg-pop-tag">POPULER</div>}
                <GlareWrap
                  className={`pkg ${p.popular ? 'pop' : ''} ${isSel ? 'sel' : ''}`}
                >
                  <div onClick={() => setSelPkg({ amt: p.amt, price: p.price })} style={{ cursor: 'pointer' }}>
                    <div className="pkg-lbl">{p.label}</div>
                    <div className="pkg-cr">{p.amt}</div>
                    <div className="pkg-lbl">credits</div>
                    <div className="pkg-price">Rp {p.price.toLocaleString('id-ID')}</div>
                  </div>
                </GlareWrap>
              </div>
            );
          })}
        </div>

        <button className="modal-btn" onClick={buyConfirm}>
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
