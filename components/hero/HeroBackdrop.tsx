'use client';

import { useEffect, useState } from 'react';
import { locations } from '@/data/locations';
import { useStore } from '@/lib/store';

export function HeroBackdrop({ children }: { children: React.ReactNode }) {
  const selectedSlug = useStore((s) => s.selectedLocationSlug);
  const [currentImage, setCurrentImage] = useState('');
  const [nextImage, setNextImage] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const loc = locations.find((l) => l.slug === selectedSlug);
    if (!loc) return;
    const newImage = loc.heroImage;

    if (!currentImage) {
      setCurrentImage(newImage);
      return;
    }

    if (newImage !== currentImage) {
      setNextImage(newImage);
      setTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentImage(newImage);
        setNextImage('');
        setTransitioning(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [selectedSlug, currentImage]);

  return (
    <section className="relative w-full h-[70vh] md:h-screen overflow-hidden" aria-label="Destination hero">
      {/* Current image */}
      {currentImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[240ms]"
          style={{
            backgroundImage: `url(${currentImage})`,
            opacity: transitioning ? 0 : 1,
          }}
        />
      )}

      {/* Next image (crossfade) */}
      {nextImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[240ms]"
          style={{
            backgroundImage: `url(${nextImage})`,
            opacity: transitioning ? 1 : 0,
          }}
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="max-w-content mx-auto w-full px-4 sm:px-6 pb-8 md:pb-16 space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
