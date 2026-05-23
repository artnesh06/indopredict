const steps = [
  { n: '01', t: 'Daftar & Dapat Credit', d: 'Signup gratis, langsung dapat 100 credit. Login harian kasih bonus 10 credit.' },
  { n: '02', t: 'Pilih Event & Bet', d: 'Taruh credit di prediksi YES atau NO. Atur sendiri mau taruh berapa.' },
  { n: '03', t: 'Tunggu Hasil', d: 'Event resolve otomatis. Bener = point naik. Salah = credit hangus.' },
  { n: '04', t: 'Nangkring di Leaderboard', d: 'Top 10 bulanan dapat hadiah. Reset tiap tanggal 1. Buktiin siapa paling akurat.' },
];

export default function HowItWorks() {
  return (
    <section className="section">
      <div className="sec-hdr">
        <h2 className="sec-title">Cara Main</h2>
      </div>
      <div className="how-grid">
        {steps.map((s) => (
          <div className="how-item" key={s.n}>
            <div className="how-num">{s.n}</div>
            <div className="how-title">{s.t}</div>
            <div className="how-desc">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
