import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib/timeline.mjs';

export function useScrollTimeline(reduced: boolean) {
  const section = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section.current) return;
      const rect = section.current.getBoundingClientRect();
      const value = reduced ? 0 : clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      progressRef.current = value;
      setProgress(value);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [reduced]);
  const goTo = (value: number) => {
    if (!section.current) return;
    const rect = section.current.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + value * (rect.height - window.innerHeight),
      behavior: reduced ? 'instant' : 'smooth',
    });
  };
  return { section, progressRef, progress, goTo };
}
