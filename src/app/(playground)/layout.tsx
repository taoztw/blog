import { LessonNav } from "@/components/playground/lesson-nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import type React from "react";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-ink-300 bg-ink-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/playground" className="font-semibold text-ink-800">
            Playground
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-ink-600 transition-colors hover:text-brand"
            >
              返回博客
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20">
            <LessonNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
