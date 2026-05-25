"use client";

import { useEffect, useState } from "react";

const GRAD_DATE = new Date("2021-07-01");

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function computeStatic() {
  const now = new Date();
  const year = now.getFullYear();
  return {
    year,
    yearsExp: year - 2021,
    date: `${year}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    days: Math.floor((now.getTime() - GRAD_DATE.getTime()) / 86_400_000),
  };
}

const AboutPage = () => {
  const { yearsExp, date, days } = computeStatic();
  const [time, setTime] = useState<string>("--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-5xl py-12 sm:py-20">
      {/* Header */}
      <section className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            online · {date} {time}
          </p>
        </div>

        <h1 className="text-5xl font-black leading-tight tracking-tight text-neutral-900 sm:text-7xl dark:text-neutral-50">
          你好。
        </h1>
      </section>

      {/* Bento Grid */}
      <section className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-6">
        {/* 现在 (主块) */}
        <div className="overflow-hidden rounded-2xl bg-blue-600 p-8 text-white transition-transform hover:-translate-y-0.5 sm:col-span-4">
          <div className="mb-6 flex items-center gap-2">
            <span className="rounded-md bg-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-widest">
              currently
            </span>
            <span className="font-mono text-xs text-blue-200">// 2024 → now</span>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">Agent 工程师</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs">LLM</span>
            <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs">Agent</span>
          </div>
        </div>

        {/* 经验年数 */}
        <div className="flex flex-col justify-between rounded-2xl bg-cyan-500 p-6 text-white transition-transform hover:-translate-y-0.5 sm:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-50">
            experience
          </p>
          <div>
            <p className="text-7xl font-black leading-none">
              {yearsExp}
              <span className="text-3xl">y</span>
            </p>
            <p className="mt-2 text-sm text-cyan-50">since 2021</p>
          </div>
        </div>

        {/* 当前时间(终端风) */}
        <div className="rounded-2xl bg-neutral-900 p-6 text-white transition-transform hover:-translate-y-0.5 sm:col-span-2">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              ~/now
            </span>
          </div>
          <div className="font-mono text-xs leading-relaxed">
            <p>
              <span className="text-cyan-400">$</span>{" "}
              <span className="text-neutral-400">date</span>
            </p>
            <p className="text-green-400">{date}</p>
            <p className="mt-2">
              <span className="text-cyan-400">$</span>{" "}
              <span className="text-neutral-400">uptime</span>
            </p>
            <p className="text-amber-400">
              {days.toLocaleString()} days online
              <span className="ml-0.5 inline-block animate-pulse text-green-400">▍</span>
            </p>
          </div>
        </div>

        {/* 角色历程 */}
        <div className="rounded-2xl bg-purple-600 p-6 text-white transition-transform hover:-translate-y-0.5 sm:col-span-2">
          <p className="mb-5 font-mono text-[10px] uppercase tracking-widest text-purple-200">
            path
          </p>
          <ul className="space-y-2.5 font-mono">
            <li className="flex items-baseline gap-3 text-purple-200/70">
              <span className="text-[10px] text-purple-300/60">01</span>
              <span className="text-sm">算法</span>
            </li>
            <li className="flex items-baseline gap-3 text-purple-200/80">
              <span className="text-[10px] text-purple-300/60">02</span>
              <span className="text-sm">PM</span>
            </li>
            <li className="flex items-baseline gap-3 text-purple-200/90">
              <span className="text-[10px] text-purple-300/60">03</span>
              <span className="text-sm">全栈</span>
            </li>
            <li className="flex items-center gap-3 pt-1 text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-xl font-bold">Agent</span>
            </li>
          </ul>
        </div>

        {/* 联系 */}
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 p-8 text-white transition-transform hover:-translate-y-0.5 sm:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/80">
            contact
          </p>
          <a
            href="mailto:tztw4723@gmail.com"
            className="mt-3 inline-block font-mono text-2xl font-bold underline decoration-white/40 decoration-2 underline-offset-4 transition hover:decoration-white sm:text-3xl"
          >
            tztw4723@gmail.com
          </a>
          <p className="mt-3 text-sm text-white/90">
            想聊 Agent / 找我合作 / 随便扯几句,都欢迎。
          </p>
        </div>
      </section>

      {/* 职业轨迹 — 竖向时间线 */}
      <section className="mb-16">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-50">
            职业轨迹
          </h2>
          <p className="font-mono text-xs text-neutral-500">2021 → now</p>
        </div>

        <ol className="relative ml-2 space-y-10 border-l border-dashed border-neutral-300 pl-8 dark:border-neutral-700">
          {/* 01 */}
          <li className="relative group">
            <span className="absolute -left-[34px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-purple-500 bg-white dark:bg-neutral-950" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              start
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-50">
              机器翻译算法
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              NMT · 序列模型 · 第一次和模型打交道
            </p>
          </li>

          {/* 02 */}
          <li className="relative group">
            <span className="absolute -left-[34px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-pink-500 bg-white dark:bg-neutral-950" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              detour
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-50">
              产品经理
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              需求 · 设计 · 落地 · 学会站在用户那边
            </p>
          </li>

          {/* 03 */}
          <li className="relative group">
            <span className="absolute -left-[34px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-emerald-500 bg-white dark:bg-neutral-950" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              hands-on
            </p>
            <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-neutral-50">
              前后端开发
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Python · React · Next.js · 自己写,自己上线
            </p>
          </li>

          {/* 04 — current */}
          <li className="relative">
            <span className="absolute -left-[38px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-blue-600 dark:text-blue-400">
                now
              </p>
              <span className="rounded-full bg-blue-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                2024 → present
              </span>
            </div>
            <h3 className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">
              Agent 工程师
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              LLM · 业务落地 · 把模型变成真正干活的东西
            </p>
          </li>
        </ol>
      </section>

    </div>
  );
};

export default AboutPage;
