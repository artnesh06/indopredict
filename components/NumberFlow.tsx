'use client';

import { useEffect, useRef, useState } from 'react';

type NumberFlowProps = {
  value: number;
  className?: string;
};

/**
 * NumberFlow — continuous rolling digits like @number-flow/react.
 * Pure transform, no opacity. Digits roll in/out via overflow:hidden.
 */
export default function NumberFlow({ value, className = '' }: NumberFlowProps) {
  const [displayDigits, setDisplayDigits] = useState<string[]>(String(Math.round(value)).split(''));
  const prevValueRef = useRef(value);
  const [transitions, setTransitions] = useState<Map<number, { from: string; to: string; dir: number }>>(new Map());

  useEffect(() => {
    const prev = Math.round(prevValueRef.current);
    const curr = Math.round(value);
    if (prev === curr) return;

    const prevStr = String(prev);
    const currStr = String(curr);
    const maxLen = Math.max(prevStr.length, currStr.length);
    const pDigits = prevStr.padStart(maxLen, ' ').split('');
    const cDigits = currStr.padStart(maxLen, ' ').split('');

    const newTransitions = new Map<number, { from: string; to: string; dir: number }>();
    for (let i = 0; i < maxLen; i++) {
      if (pDigits[i] !== cDigits[i]) {
        const dir = curr > prev ? 1 : -1;
        newTransitions.set(i, { from: pDigits[i], to: cDigits[i], dir });
      }
    }

    setTransitions(newTransitions);
    setDisplayDigits(cDigits);
    prevValueRef.current = value;

    const timer = setTimeout(() => {
      setTransitions(new Map());
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span className={`nf-root ${className}`}>
      {displayDigits.map((digit, i) => {
        const t = transitions.get(i);
        if (t) {
          return (
            <span key={i} className="nf-slot">
              <span className={`nf-roll ${t.dir > 0 ? 'nf-up' : 'nf-down'}`}>
                <span className="nf-char">{t.from === ' ' ? '' : t.from}</span>
                <span className="nf-char">{t.to === ' ' ? '' : t.to}</span>
              </span>
            </span>
          );
        }
        return (
          <span key={i} className="nf-slot">
            <span className="nf-char">{digit === ' ' ? '' : digit}</span>
          </span>
        );
      })}
    </span>
  );
}
