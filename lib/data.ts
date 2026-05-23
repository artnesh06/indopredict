export type Market = {
  id: number;
  cat: string;
  cl: string;
  q: string;
  yes: number;
  voters: number;
  dl: string;
  cost: number;
  voted: 'yes' | 'no' | null;
  img: string;
};

export type LbUser = {
  rank: number;
  name: string;
  init: string;
  badge: string;
  pts: number;
  acc: number;
  str: number;
};

export type HistItem = {
  q: string;
  v: 'yes' | 'no';
  r: 'win' | 'lose' | 'pending';
  p: string;
  img: string;
};

export type CreditLog = {
  desc: string;
  date: string;
  amt: string;
  t: 'plus' | 'minus';
};

export const initialMarkets: Market[] = [
  { id: 1, cat: 'ekonomi', cl: '💰 Ekonomi', q: 'Dollar tembus Rp17.000 sebelum akhir Juni?', yes: 44, voters: 3241, dl: '30 Jun', cost: 10, voted: null, img: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 2, cat: 'bola', cl: '⚽ Bola', q: 'Timnas Indonesia menang di laga berikutnya?', yes: 71, voters: 8820, dl: '18 Jun', cost: 10, voted: 'yes', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 3, cat: 'cuaca', cl: '🌧️ Cuaca', q: 'Jakarta akan banjir minimal sekali minggu ini?', yes: 33, voters: 1540, dl: '16 Jun', cost: 5, voted: null, img: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 4, cat: 'ekonomi', cl: '💰 Ekonomi', q: 'BBM naik sebelum Juli 2025?', yes: 62, voters: 5502, dl: '30 Jun', cost: 15, voted: null, img: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 5, cat: 'kripto', cl: '₿ Kripto', q: 'Bitcoin tembus $70.000 bulan ini?', yes: 55, voters: 4210, dl: '30 Jun', cost: 10, voted: null, img: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 6, cat: 'politik', cl: '🏛️ Politik', q: 'Kabinet reshuffle terjadi sebelum Agustus?', yes: 28, voters: 2891, dl: '31 Jul', cost: 20, voted: null, img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 7, cat: 'hiburan', cl: '🎭 Hiburan', q: 'Film Indonesia masuk top 5 box office Asia bulan ini?', yes: 41, voters: 1200, dl: '30 Jun', cost: 5, voted: null, img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=120&h=120&q=80' },
  { id: 8, cat: 'ekonomi', cl: '💰 Ekonomi', q: 'IHSG tembus level 7.500 sebelum akhir bulan?', yes: 51, voters: 3388, dl: '30 Jun', cost: 10, voted: null, img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=120&h=120&q=80' },
];

export const lbData: LbUser[] = [
  { rank: 1, name: '@sotoymaster', init: 'S', badge: 'Ekonomi Expert', pts: 14820, acc: 74, str: 12 },
  { rank: 2, name: '@bola_prophet', init: 'B', badge: 'Bola Oracle', pts: 12340, acc: 71, str: 8 },
  { rank: 3, name: '@analisis_jawa', init: 'A', badge: 'Analis Ulung', pts: 10980, acc: 68, str: 15 },
  { rank: 4, name: '@netizen_legit', init: 'N', badge: 'All Rounder', pts: 9210, acc: 65, str: 6 },
  { rank: 5, name: '@kripto_benar', init: 'K', badge: 'Kripto Watcher', pts: 8760, acc: 63, str: 4 },
  { rank: 6, name: '@jkt_observer', init: 'J', badge: 'Cuaca Expert', pts: 7540, acc: 61, str: 3 },
  { rank: 7, name: '@bola_stats', init: 'B', badge: 'Bola Analyst', pts: 6820, acc: 60, str: 9 },
  { rank: 8, name: '@makro_indo', init: 'M', badge: 'Makro Watcher', pts: 6200, acc: 58, str: 2 },
  { rank: 9, name: '@trendspotter', init: 'T', badge: 'Hiburan Guru', pts: 5880, acc: 57, str: 7 },
  { rank: 10, name: '@artnesh', init: 'A', badge: 'Web3 Analyst', pts: 4820, acc: 63, str: 5 },
];

export const initialHist: HistItem[] = [
  { q: 'Timnas Indonesia menang di laga berikutnya?', v: 'yes', r: 'win', p: '+120', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'IHSG tembus 7.000 bulan lalu?', v: 'yes', r: 'win', p: '+80', img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'Dollar tembus Rp16.500 bulan lalu?', v: 'no', r: 'lose', p: '-50', img: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'Bitcoin tembus $65.000 April lalu?', v: 'yes', r: 'win', p: '+200', img: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'Kabinet reshuffle sebelum Juni?', v: 'no', r: 'win', p: '+60', img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'BBM naik April 2025?', v: 'yes', r: 'lose', p: '-30', img: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'Jakarta banjir minggu lalu?', v: 'yes', r: 'pending', p: '—', img: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=80&h=80&q=80' },
  { q: 'Dollar tembus Rp17.000 sebelum akhir Juni?', v: 'no', r: 'pending', p: '—', img: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=80&h=80&q=80' },
];

export const initialClog: CreditLog[] = [
  { desc: 'Beli paket Value', date: '18 Mei 2025', amt: '+300', t: 'plus' },
  { desc: 'Vote: Timnas menang', date: '17 Mei 2025', amt: '-10', t: 'minus' },
  { desc: 'Bonus login harian', date: '17 Mei 2025', amt: '+10', t: 'plus' },
  { desc: 'Vote: Bitcoin $65k', date: '16 Mei 2025', amt: '-20', t: 'minus' },
  { desc: 'Bonus login harian', date: '16 Mei 2025', amt: '+10', t: 'plus' },
  { desc: 'Bonus daftar akun', date: '15 Mei 2025', amt: '+100', t: 'plus' },
];

export const tickerItems = [
  { q: 'BBM Naik Sebelum Juli?', y: 62, n: 38 },
  { q: 'Dollar Tembus Rp17k?', y: 44, n: 56 },
  { q: 'Timnas Menang vs Thailand?', y: 71, n: 29 },
  { q: 'Jakarta Banjir Minggu Ini?', y: 33, n: 67 },
  { q: 'IHSG Tembus 7500?', y: 51, n: 49 },
  { q: 'Bitcoin $70k Bulan Ini?', y: 55, n: 45 },
];

export const categories = [
  { key: 'all', label: 'Semua' },
  { key: 'ekonomi', label: '💰 Ekonomi' },
  { key: 'bola', label: '⚽ Bola' },
  { key: 'politik', label: '🏛️ Politik' },
  { key: 'cuaca', label: '🌧️ Cuaca' },
  { key: 'hiburan', label: '🎭 Hiburan' },
  { key: 'kripto', label: '₿ Kripto' },
];
