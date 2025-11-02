"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const InstagramEmbed = dynamic(
  () => import('react-social-media-embed').then((mod) => mod.InstagramEmbed),
  { ssr: false }
);

interface InstagramCarouselProps {
  posts: string[];
  autoRotate?: boolean;
  intervalSeconds?: number;
}

export default function InstagramCarousel({ 
  posts, 
  autoRotate = true, 
  intervalSeconds = 10 
}: InstagramCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotación
  useEffect(() => {
    if (!autoRotate || posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [autoRotate, intervalSeconds, posts.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* Post actual */}
      <div className="relative">
        <InstagramEmbed 
          url={posts[currentIndex]} 
          width="100%"
        />
        
        {/* Overlay de controles */}
        {posts.length > 1 && (
          <>
            {/* Botones anterior/siguiente */}
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-gold rounded-full flex items-center justify-center transition-all z-10"
              aria-label="Anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-gold rounded-full flex items-center justify-center transition-all z-10"
              aria-label="Siguiente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {posts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-gold w-8' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Ir al post ${index + 1}`}
                />
              ))}
            </div>

            {/* Contador */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
              {currentIndex + 1} / {posts.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
