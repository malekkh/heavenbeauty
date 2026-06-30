"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

/**
 * Auto-scrolling hero image slider. Crossfades between campaign photos,
 * pauses on hover/focus, exposes dot navigation, and honours
 * `prefers-reduced-motion` (no auto-advance, still navigable). Server-rendered
 * for the first frame; only the rotation is client-side.
 */
export function HeroSlider({
  slides,
  intervalMs = 4500,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || slides.length <= 1 || reducedMotion.current) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs
    );
    return () => window.clearInterval(id);
  }, [paused, slides.length, intervalMs]);

  if (slides.length === 0) return null;

  return (
    <div
      className="group relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-accent-soft"
      role="group"
      aria-roledescription="carousel"
      aria-label="Heaven Beauty campaign images"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Subtle gradient for legibility of any future overlaid captions */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/60 hover:bg-white/90"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
