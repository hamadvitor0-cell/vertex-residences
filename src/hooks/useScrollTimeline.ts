import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib/timeline.mjs';
import { activeTourStep, visibleTowerFloors } from '../lib/apartmentTour.mjs';

export function useScrollTimeline(reduced: boolean, fallback: boolean) {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [step, setStep] = useState(0);
  const [floors, setFloors] = useState(1);

  useEffect(() => {
    const element = section.current!;
    const sticky = viewport.current!;
    let origin = 0;
    let distance = 1;
    let frame = 0;
    let previousStep = -1;
    let previousFloors = -1;
    const update = () => {
      frame = 0;
      const value = reduced ? 0 : clamp((window.scrollY - origin) / distance);
      if (meter.current && value !== progressRef.current) {
        meter.current.style.transform = `scaleX(${value})`;
      }
      progressRef.current = value;

      const nextStep = activeTourStep(value);
      if (previousStep !== nextStep) {
        previousStep = nextStep;
        setStep(nextStep);
      }
      if (fallback) {
        const nextFloors = reduced ? 22 : visibleTowerFloors(value);
        if (nextFloors !== previousFloors) {
          previousFloors = nextFloors;
          setFloors(nextFloors);
        }
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      origin = window.scrollY + element.getBoundingClientRect().top;
      distance = Math.max(1, element.clientHeight - sticky.clientHeight);
      request();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(sticky);
    measure();
    window.addEventListener('scroll', request, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', request);
    };
  }, [reduced, fallback]);

  const goTo = (value: number) => {
    const element = section.current;
    const sticky = viewport.current;
    if (!element || !sticky) return;
    const origin = window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({
      top: origin + value * (element.clientHeight - sticky.clientHeight),
      behavior: reduced ? 'instant' : 'smooth',
    });
  };
  return { section, viewport, meter, progressRef, step, floors, goTo };
}
