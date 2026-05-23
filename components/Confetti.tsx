'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ active }: { active: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    if (active && !fired.current) {
      fired.current = true;

      const colors = ['#e01b24', '#ffd700', '#2e7d32', '#0f0f0f', '#4ecdc4'];

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.7 },
        colors,
        zIndex: 9999,
      });
    }

    if (!active) {
      fired.current = false;
    }
  }, [active]);

  return null;
}
