"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const SEASONS = [
  { src: "/春.png", label: "春", poem: "随风潜入夜，润物细无声。", author: "杜甫《春夜喜雨》" },
  { src: "/夏.png", label: "夏", poem: "接天莲叶无穷碧，映日荷花别样红。", author: "杨万里《晓出净慈寺送林子方》" },
  { src: "/秋.png", label: "秋", poem: "空山新雨后，天气晚来秋。", author: "王维《山居秋暝》" },
  { src: "/冬.png", label: "冬", poem: "晚来天欲雪，能饮一杯无。", author: "白居易《问刘十九》" },
] as const;

const INTERVAL = 6000;

export function SeasonCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SEASONS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <>
      {/* Images */}
      {SEASONS.map((season, i) => (
        <Image
          key={season.label}
          src={season.src}
          alt={season.label}
          fill
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
        />
      ))}

      {/* Poems — synced with images */}
      <div className="absolute bottom-20 left-10 z-30 max-w-md space-y-2 xl:left-14">
        {SEASONS.map((season, i) => (
          <div
            key={season.label}
            className={`absolute bottom-0 left-0 space-y-2 transition-all duration-700 ${
              i === current
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <blockquote className="font-serif text-2xl leading-relaxed tracking-wide text-ink-300 xl:text-3xl">
              &ldquo;{season.poem}&rdquo;
            </blockquote>
            <p className="text-sm tracking-widest text-ink-400">
              —— {season.author}
            </p>
          </div>
        ))}
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {SEASONS.map((season, i) => (
          <button
            key={season.label}
            onClick={() => setCurrent(i)}
            aria-label={season.label}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current
                ? "w-6 bg-ink-300/80"
                : "w-1.5 bg-ink-500/40 hover:bg-ink-400/60"
            }`}
          />
        ))}
      </div>
    </>
  );
}
