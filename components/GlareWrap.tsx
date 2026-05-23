'use client';

import { ReactNode } from 'react';

export default function GlareWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glare-wrap ${className}`}>
      {children}
    </div>
  );
}
