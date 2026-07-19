"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * Lazy autoplay video player.
 *
 * Behavior:
 * - Shows a poster thumbnail with a play button until the player enters the viewport.
 * - An IntersectionObserver (threshold 0.5) starts muted autoplay once the
 *   thumbnail is scrolled into view (autoplay=1&mute=1&loop=1&playsinline=1).
 * - Clicking the thumbnail is a manual fallback to start playback.
 * - After playback starts the iframe stays mounted so the trailer keeps looping.
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const autoplaySrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  useEffect(() => {
    if (active) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {active ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={autoplaySrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={`Play ${title}`}
            className="absolute inset-0 h-full w-full cursor-pointer group"
            style={{
              backgroundImage: `url(${poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/30">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] text-white shadow-lg transition-transform group-hover:scale-110 md:h-20 md:w-20">
                <Play className="ml-1 h-7 w-7 md:h-9 md:w-9" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
