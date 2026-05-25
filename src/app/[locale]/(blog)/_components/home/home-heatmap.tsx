"use client";

import { api } from "@/trpc/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

const TOTAL_WEEKS = 53;
const LEVEL_BG: Record<number, string> = {
  0: "bg-ink-200",
  1: "bg-seal/15",
  2: "bg-seal/35",
  3: "bg-seal/60",
  4: "bg-seal/90",
};

function bucket(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function HomeHeatmap() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const { data } = api.post.getActivity.useQuery({ days: TOTAL_WEEKS * 7 });

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data ?? []) map.set(row.date, Number(row.count));
    return map;
  }, [data]);

  const { cells, monthMarkers, streak, totalPosts } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDow = today.getDay();

    type Cell = { key: string; date: Date | null; count: number; level: 0 | 1 | 2 | 3 | 4 };
    const all: Cell[] = [];
    let total = 0;
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const isFuture = w === TOTAL_WEEKS - 1 && d > todayDow;
        if (isFuture) {
          all.push({ key: `${w}-${d}`, date: null, count: 0, level: 0 });
          continue;
        }
        const offset = (TOTAL_WEEKS - 1 - w) * 7 + (todayDow - d);
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        const c = countByDate.get(isoDate(date)) ?? 0;
        total += c;
        all.push({ key: `${w}-${d}`, date, count: c, level: bucket(c) });
      }
    }

    let s = 0;
    for (let i = all.length - 1; i >= 0; i--) {
      const cell = all[i];
      if (!cell || !cell.date) continue;
      if (cell.count > 0) s++;
      else break;
    }

    const markers: { week: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const cell = all[w * 7];
      if (!cell?.date) continue;
      const m = cell.date.getMonth();
      if (m !== lastMonth) {
        if (lastMonth !== -1) {
          const label =
            locale === "zh"
              ? `${m + 1}${t("monthSuffix")}`
              : cell.date.toLocaleString("en-US", { month: "short" });
          markers.push({ week: w, label });
        }
        lastMonth = m;
      }
    }

    return { cells: all, monthMarkers: markers, streak: s, totalPosts: total };
  }, [countByDate, locale, t]);

  const dayLabels = locale === "zh" ? ["", "一", "", "三", "", "五", ""] : ["", "M", "", "W", "", "F", ""];

  return (
    <div className="rounded-lg border border-ink-300 bg-ink-50 p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-500">{t("activityLabel")}</span>
        <span className="text-sm text-ink-700">
          <span className="font-cormorant text-[1.4rem] font-medium text-seal tabular-nums">{totalPosts}</span>
          <span className="ml-1">{locale === "zh" ? `${t("posts")} / ${t("pastYear")}` : `${t("posts")} ${t("pastYear")}`}</span>
        </span>
      </div>

      <div className="flex items-start gap-1.5">
        <div className="grid grid-rows-7 gap-[2px] pt-[14px] text-[9px] text-ink-400 self-stretch">
          {dayLabels.map((d, i) => (
            <span key={i} className="text-right leading-[11px]">
              {d}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative mb-1 h-2.5 text-[9px] leading-none text-ink-400">
            {monthMarkers.map((m) => (
              <span
                key={m.week}
                className="absolute top-0"
                style={{ left: `${(m.week / TOTAL_WEEKS) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div
            className="grid w-full grid-flow-col grid-rows-7 gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)`, aspectRatio: `${TOTAL_WEEKS} / 7` }}
          >
            {cells.map((cell) => (
              <div
                key={cell.key}
                className={`rounded-[2px] transition-transform hover:scale-[1.4] hover:relative hover:z-10 ${
                  cell.date ? LEVEL_BG[cell.level] : "invisible"
                }`}
                title={
                  cell.date
                    ? `${isoDate(cell.date)} · ${cell.count > 0 ? `${cell.count} ${t("posts")}` : t("noActivity")}`
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-ink-500">
        <span>
          {t("streak")} <span className="font-cormorant text-base text-ink-800 tabular-nums">{streak}</span>{" "}
          {t("streakDays")}
        </span>
        <div className="flex items-center gap-1.5">
          <span>{t("legendLess")}</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`size-2.5 rounded-[2px] ${LEVEL_BG[l]}`} />
          ))}
          <span>{t("legendMore")}</span>
        </div>
      </div>
    </div>
  );
}
