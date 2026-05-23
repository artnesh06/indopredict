import { useState, useEffect, useRef } from 'react';

export function useAnimatedNumber(
  targetValue: number,
  duration: number = 400,
  easing: (t: number) => number = (t) => t * (2 - t) // easeOutQuad
) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(targetValue);

  useEffect(() => {
    if (targetValue === displayValue) return;

    setIsAnimating(true);
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      const currentValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, easing, displayValue]);

  return { displayValue, isAnimating };
}

export function useAnimatedPercentage(
  targetValue: number,
  duration: number = 400
) {
  return useAnimatedNumber(targetValue, duration);
}