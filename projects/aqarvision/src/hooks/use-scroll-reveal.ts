'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook qui observe les éléments .luxury-scroll-reveal dans un container
 * et ajoute la classe .is-visible quand ils entrent dans le viewport.
 * Animation one-shot : l'élément est désinscrit après apparition.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const elements = container.querySelectorAll('.luxury-scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
