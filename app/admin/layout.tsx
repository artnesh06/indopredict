import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin — IndoPredict',
  description: 'Admin panel IndoPredict',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
