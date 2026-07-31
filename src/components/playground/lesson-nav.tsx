"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STAGES } from "@/app/(playground)/playground/lessons";

/** 左侧课程导航:按阶段分组,高亮当前课 */
export function LessonNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 text-sm">
      <Link
        href="/playground"
        className={cn(
          "block font-semibold text-ink-800 transition-colors hover:text-brand",
          pathname === "/playground" && "text-brand",
        )}
      >
        Slate / Plate 交互式学习
      </Link>

      {STAGES.map((stage) => (
        <div key={stage.id} className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {stage.title}
          </p>
          {stage.lessons.length === 0 ? (
            <p className="pl-3 text-xs text-ink-400">敬请期待</p>
          ) : (
            <ul className="space-y-1">
              {stage.lessons.map((lesson) => {
                const href = `/playground/${lesson.slug}`;
                const active = pathname === href;
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 leading-snug transition-colors",
                        active
                          ? "bg-brand/10 font-medium text-brand"
                          : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
                      )}
                    >
                      {lesson.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
