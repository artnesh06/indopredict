'use client';

import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import Ticker from '@/components/Ticker';
import Hero from '@/components/Hero';
import MarketGrid from '@/components/MarketGrid';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import Leaderboard from '@/components/Leaderboard';
import Profile from '@/components/Profile';
import Settings from '@/components/Settings';
import AllMarkets from '@/components/AllMarkets';
import MarketDetail from '@/components/MarketDetail';
import VoteModal from '@/components/VoteModal';
import BuyModal from '@/components/BuyModal';
import Toast from '@/components/Toast';
import Confetti from '@/components/Confetti';

export default function Page() {
  const { page, confettiActive } = useStore();

  return (
    <>
      <Confetti active={confettiActive} />
      <Ticker />
      <Header />

      {page === 'home' && (
        <>
          <Hero />
          <hr className="divider" />
          <MarketGrid />
          <hr className="divider" />
          <HowItWorks />
          <hr className="divider" />
          <Footer />
        </>
      )}

      {page === 'leaderboard' && <Leaderboard />}
      {page === 'profile' && <Profile />}
      {page === 'settings' && <Settings />}
      {page === 'markets' && <AllMarkets />}
      {page === 'market-detail' && <MarketDetail />}

      <VoteModal />
      <BuyModal />
      <Toast />
    </>
  );
}
