import { Logo } from "@/components/logo";
import type React from "react";
import { SeasonCarousel } from "./_components/SeasonCarousel";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="flex min-h-screen w-full">
      {/* ═══ Left Panel — Decorative Image ═══ */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Image carousel + overlays */}
        <div className="absolute inset-0 bg-ink-800 dark:bg-ink-900">
          <SeasonCarousel />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 z-10 bg-ink-900/40" />

          <div
            className="absolute inset-0 z-10"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 50%, rgba(194, 59, 34, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(92, 122, 138, 0.1) 0%, transparent 40%),
                radial-gradient(ellipse at 50% 80%, rgba(184, 134, 62, 0.06) 0%, transparent 45%)
              `,
            }}
          />
          {/* Ink wash texture overlay */}
          <svg
            className="absolute inset-0 z-10 h-full w-full opacity-[0.04]"
            aria-hidden="true"
          >
            <filter id="ink-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="4"
                stitchTiles="stitch"
              />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter="url(#ink-noise)"
            />
          </svg>
        </div>

        {/* Branding content over image */}
        <div className="relative z-20 flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo
            size="lg"
            href="/"
            className="brightness-0 invert"
          />

          {/* Quote is rendered by SeasonCarousel, synced with images */}
          <div className="flex-1" />

          {/* Decorative seal stamp */}
          <div className="flex items-end justify-between">
            <p className="text-xs text-ink-600">&copy; {new Date().getFullYear()} Tz Blog</p>
            <div className="flex size-14 items-center justify-center rounded-sm border border-seal/50 border-2 text-seal/60 xl:size-16">
              <span className="font-serif text-2xl xl:text-3xl">陶</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right Panel — Auth Form ═══ */}
      <div className="flex w-full flex-col bg-background lg:w-1/2">
        {/* Mobile-only logo */}
        <div className="p-6 lg:hidden">
          <Logo
            size="lg"
            href="/"
          />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
