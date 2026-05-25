"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Check,
  Copy,
  Heart,
  Mail,
  Search,
  Send,
  Trash2,
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
  Star,
  Download,
  Settings,
} from "lucide-react";

/* ─────────────────────────────────────────────
 *  墨色设计系统 — Ink Design System
 *  展示页：颜色 · 字体 · 按钮 · 徽章 · 表单 · 卡片
 * ───────────────────────────────────────────── */

const inkScale = [
  { step: "50", hex: "#FEFDFB", name: "纯净宣纸", usage: "Card / Popover", textDark: false },
  { step: "100", hex: "#FAF9F6", name: "宣纸白", usage: "Page Background", textDark: false },
  { step: "200", hex: "#F4F2ED", name: "陈年宣纸", usage: "Secondary / Muted", textDark: false },
  { step: "300", hex: "#E2DDD4", name: "清", usage: "Border / Divider", textDark: false },
  { step: "400", hex: "#C4BDB0", name: "淡", usage: "Disabled / Placeholder", textDark: false },
  { step: "500", hex: "#887B6C", name: "重", usage: "Auxiliary Text ≥14px", textDark: true },
  { step: "600", hex: "#6B5F52", name: "浓", usage: "Muted Foreground", textDark: true },
  { step: "700", hex: "#453B32", name: "焦", usage: "Body Text", textDark: true },
  { step: "800", hex: "#2C2520", name: "松烟墨", usage: "Headings / Foreground", textDark: true },
  { step: "900", hex: "#1D1C19", name: "浓墨", usage: "Dark Mode Background", textDark: true },
];

const accentColors = [
  { name: "朱红 Seal", hex: "#C23B22", token: "--seal / --destructive", desc: "强调 · 错误 · 品牌" },
  { name: "苔绿 Success", hex: "#5B7A5E", token: "--success", desc: "成功 · 正面" },
  { name: "赭黄 Warning", hex: "#B8863E", token: "--warning", desc: "警告 · 提示" },
  { name: "青墨 Info", hex: "#5C7A8A", token: "--info", desc: "信息 · 辅助" },
];

const semanticTokens = [
  { token: "background", light: "#FAF9F6", dark: "#1D1C19", desc: "页面背景" },
  { token: "foreground", light: "#2C2520", dark: "#E2DDD4", desc: "主要文字" },
  { token: "card", light: "#FEFDFB", dark: "#252320", desc: "卡片背景" },
  { token: "muted", light: "#F4F2ED", dark: "#2A2725", desc: "次要背景" },
  { token: "muted-foreground", light: "#6B5F52", dark: "#96897A", desc: "次要文字" },
  { token: "border", light: "#E2DDD4", dark: "rgba(232,224,212,0.08)", desc: "边框" },
  { token: "primary", light: "#2C2520", dark: "#E2DDD4", desc: "主按钮" },
  { token: "destructive", light: "#C23B22", dark: "#D4493A", desc: "危险操作" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div
      className="mb-8 scroll-mt-24"
      id={id}
    >
      <div className="flex items-baseline gap-3 mb-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
      <Separator className="mt-4" />
    </div>
  );
}

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navSections = [
    { id: "logo", label: "Logo", zh: "标志" },
    { id: "colors", label: "Colors", zh: "颜色" },
    { id: "typography", label: "Typography", zh: "字体" },
    { id: "buttons", label: "Buttons", zh: "按钮" },
    { id: "badges", label: "Badges", zh: "徽章" },
    { id: "forms", label: "Forms", zh: "表单" },
    { id: "cards", label: "Cards", zh: "卡片" },
    { id: "reference", label: "Reference", zh: "速查" },
  ];

  // Scroll-spy: track which section is currently in view
  const [activeSection, setActiveSection] = useState("logo");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    const ids = navSections.map((s) => s.id);
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="py-12 pb-32 flex gap-10">
      {/* ── Sidebar TOC (desktop only) ── */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 mb-5">
            <Logo size="sm" />
            {mounted && (
              <ThemeSwitcher
                value={theme as "light" | "dark" | "system"}
                onChange={(t) => setTheme(t)}
                className="ml-auto"
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[3px] mb-3 font-medium">目录</p>
          <nav className="flex flex-col gap-0.5">
            {navSections.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`group flex items-center gap-2 text-left text-sm px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full shrink-0 transition-all duration-200 ${
                      isActive ? "bg-seal scale-150" : "bg-border group-hover:bg-muted-foreground"
                    }`}
                  />
                  <span>{s.label}</span>
                  <span
                    className={`ml-auto text-[10px] transition-opacity ${isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"}`}
                  >
                    {s.zh}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Mini color strip */}
          <div className="mt-6 flex rounded-md overflow-hidden border border-border">
            {inkScale.map((c) => (
              <div
                key={c.step}
                className="flex-1 h-2"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1.5 text-center tracking-wider">ink-50 → ink-900</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0">
        {/* ── Hero ── */}
        <div className="mb-16 max-w-2xl">
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <Logo size="xl" />
            {mounted && (
              <ThemeSwitcher
                value={theme as "light" | "dark" | "system"}
                onChange={(t) => setTheme(t)}
              />
            )}
          </div>
          <div className="hidden lg:block mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-normal tracking-wide mb-3 font-serif">Ink Design System</h1>
          <p className="text-muted-foreground leading-relaxed">
            墨色设计系统 — 源自宣纸与松烟墨的暖褐色阶，搭配印章朱红强调色。 所有色相锁定在
            H≈40°-80°，避免了纯灰的「塑料感」。 本页展示博客使用的全部设计标记（Design Tokens）与组件样式。
          </p>

          {/* Quick nav — mobile only */}
          <div className="flex flex-wrap gap-2 mt-6 lg:hidden">
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* ═══════════ LOGO ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="logo"
            title="Logo"
            subtitle="书法风格 Tz wordmark，亮暗模式自动切换"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light */}
            <div className="rounded-xl border border-border bg-[#FAF9F6] p-10 flex flex-col items-center gap-4 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  background: "radial-gradient(ellipse at 30% 40%, rgba(139,119,101,0.5) 0%, transparent 60%)",
                }}
              />
              <img
                src="/Tz-black.svg"
                alt="Tz Logo Light"
                className="h-14 w-auto relative z-10"
              />
              <span className="text-xs tracking-widest text-ink-500 uppercase relative z-10">Light · 宣纸</span>
            </div>
            {/* Dark */}
            <div className="rounded-xl border border-white/[0.04] bg-[#1D1C19] p-10 flex flex-col items-center gap-4 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  background: "radial-gradient(ellipse at 30% 40%, rgba(200,180,150,0.5) 0%, transparent 60%)",
                }}
              />
              <img
                src="/Tz-white.svg"
                alt="Tz Logo Dark"
                className="h-14 w-auto relative z-10"
              />
              <span className="text-xs tracking-widest text-[#887B6C] uppercase relative z-10">Dark · 墨夜</span>
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">尺寸变体</p>
            <div className="flex items-end gap-8 flex-wrap">
              {(["sm", "md", "lg", "xl"] as const).map((size) => (
                <div
                  key={size}
                  className="flex flex-col items-center gap-2"
                >
                  <Logo size={size} />
                  <span className="text-xs text-muted-foreground font-mono">{size}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ COLORS ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="colors"
            title="Colors"
            subtitle="墨色色阶 ink-50 → ink-900 · 功能色 · 语义映射"
          />

          {/* Ink Scale */}
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
              墨色色阶 — Ink Scale
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 rounded-xl overflow-hidden border border-border">
              {inkScale.map((c) => (
                <div
                  key={c.step}
                  className="aspect-square flex flex-col items-center justify-end p-2 relative group cursor-pointer transition-transform hover:scale-105 hover:z-10 hover:shadow-lg"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] font-semibold ${c.textDark ? "text-white/80" : "text-ink-700/70"}`}>
                    {c.step}
                  </span>
                  <span className={`text-[8px] font-mono ${c.textDark ? "text-white/60" : "text-ink-600/50"}`}>
                    {c.hex}
                  </span>
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                    <div className="font-medium">{c.name}</div>
                    <div className="opacity-70">{c.usage}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground tracking-wider px-1">
              <span>宣纸白 ←</span>
              <span>→ 松烟墨</span>
            </div>
          </div>

          {/* Accent / State Colors */}
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
              功能色 — State Colors
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {accentColors.map((c) => (
                <div
                  key={c.name}
                  className="rounded-xl border border-border overflow-hidden group"
                >
                  <div
                    className="h-16 flex items-center justify-center"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-white/90 text-xs tracking-wider font-medium">{c.name}</span>
                  </div>
                  <div className="p-3 bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-[10px] text-muted-foreground font-mono">{c.hex}</code>
                      <CopyButton text={c.hex} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Tokens Table */}
          <div>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
              语义映射 — Semantic Tokens
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Token</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Light</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Dark</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">用途</th>
                  </tr>
                </thead>
                <tbody>
                  {semanticTokens.map((t) => (
                    <tr
                      key={t.token}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <code className="text-xs font-mono text-foreground">--{t.token}</code>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-4 rounded border border-black/10 shrink-0"
                            style={{ backgroundColor: t.light }}
                          />
                          <code className="text-[10px] font-mono text-muted-foreground">{t.light}</code>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-4 rounded border border-white/10 shrink-0"
                            style={{ backgroundColor: t.dark }}
                          />
                          <code className="text-[10px] font-mono text-muted-foreground">{t.dark}</code>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══════════ TYPOGRAPHY ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="typography"
            title="Typography"
            subtitle="Geist Sans 正文 · Serif 装饰标题"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type Scale */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">文字层级</p>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono">text-4xl · font-light · font-serif</span>
                <p className="text-4xl font-light tracking-wide mt-1 font-serif">Ink Design System</p>
              </div>
              <Separator />
              <div>
                <span className="text-[10px] text-muted-foreground font-mono">text-2xl · font-semibold</span>
                <h2 className="text-2xl font-semibold tracking-tight mt-1">墨色设计系统</h2>
              </div>
              <Separator />
              <div>
                <span className="text-[10px] text-muted-foreground font-mono">text-lg · font-medium</span>
                <h3 className="text-lg font-medium mt-1">Section Heading</h3>
              </div>
              <Separator />
              <div>
                <span className="text-[10px] text-muted-foreground font-mono">text-base · foreground</span>
                <p className="text-base mt-1">
                  正文文字排版示例 — Body text in the ink color system feels warm and readable.
                </p>
              </div>
              <Separator />
              <div>
                <span className="text-[10px] text-muted-foreground font-mono">text-sm · muted-foreground</span>
                <p className="text-sm text-muted-foreground mt-1">
                  辅助说明文字，次要信息。Secondary text with muted foreground.
                </p>
              </div>
              <Separator />
              <div>
                <span className="text-[10px] text-muted-foreground font-mono">text-xs · muted-foreground</span>
                <p className="text-xs text-muted-foreground mt-1">标注 · 时间戳 · Caption text · 2024-03-01</p>
              </div>
            </div>

            {/* Font families + color hierarchy */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">字体家族</p>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4">
                    <span
                      className="text-2xl"
                      style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                    >
                      Geist Sans
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">--font-geist-sans</span>
                  </div>
                  <p
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                  </p>
                  <Separator />
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl font-serif">Serif</span>
                    <span className="text-xs text-muted-foreground font-mono">font-serif</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic font-serif">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">色彩层级</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">text-foreground</span>
                    <span className="text-xs text-muted-foreground ml-auto">标题 / 重要文字</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-secondary-foreground shrink-0" />
                    <span className="text-sm text-secondary-foreground">text-secondary-foreground</span>
                    <span className="text-xs text-muted-foreground ml-auto">正文</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">text-muted-foreground</span>
                    <span className="text-xs text-muted-foreground ml-auto">辅助说明</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-ink-400 shrink-0" />
                    <span className="text-sm text-ink-400">text-ink-400</span>
                    <span className="text-xs text-muted-foreground ml-auto">禁用 / Placeholder</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-destructive shrink-0" />
                    <span className="text-sm text-destructive">text-destructive</span>
                    <span className="text-xs text-muted-foreground ml-auto">错误 / 强调</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ BUTTONS ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="buttons"
            title="Buttons"
            subtitle="7 种变体 × 3 种尺寸，基于 shadcn/ui Button 组件"
          />

          <div className="space-y-6">
            {/* All variants */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-5">变体 Variants</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="default">
                  <Send className="size-4" />
                  Primary
                </Button>
                <Button variant="secondary">
                  <Settings className="size-4" />
                  Secondary
                </Button>
                <Button variant="outline">
                  <Download className="size-4" />
                  Outline
                </Button>
                <Button variant="ghost">
                  <Star className="size-4" />
                  Ghost
                </Button>
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                  Destructive
                </Button>
                <Button variant="link">Link</Button>
                <Button variant="tertiary">Tertiary</Button>
              </div>

              {/* Code hint */}
              <div className="mt-5 p-3 rounded-lg bg-muted/50 border border-border">
                <code className="text-xs text-muted-foreground">
                  {`<Button variant="default | secondary | outline | ghost | destructive | link | tertiary">`}
                </code>
              </div>
            </div>

            {/* Sizes */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-5">尺寸 Sizes</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Plus />
                </Button>
              </div>
              <div className="mt-5 p-3 rounded-lg bg-muted/50 border border-border">
                <code className="text-xs text-muted-foreground">{`<Button size="sm | default | lg | icon">`}</code>
              </div>
            </div>

            {/* States */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-5">状态 States</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button className="opacity-80">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading...
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ BADGES ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="badges"
            title="Badges"
            subtitle="4 种变体，用于标签、状态标记和分类"
          />

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">变体 Variants</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              <Separator />

              {/* Use cases */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">使用场景</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="default">已发布</Badge>
                  <Badge variant="secondary">草稿</Badge>
                  <Badge variant="destructive">已删除</Badge>
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">Next.js</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">成功</Badge>
                  <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">审核中</Badge>
                  <Badge className="bg-info/10 text-info border-info/20 hover:bg-info/20">信息</Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <code className="text-xs text-muted-foreground">
                  {`<Badge variant="default | secondary | destructive | outline">`}
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ FORMS ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="forms"
            title="Forms"
            subtitle="Input · Textarea · Label · Select — 表单组件"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input variants */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Input 输入框</p>

              <div className="space-y-2">
                <Label htmlFor="ds-default">默认输入</Label>
                <Input
                  id="ds-default"
                  placeholder="请输入内容..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-search">搜索输入</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="ds-search"
                    type="search"
                    placeholder="搜索文章..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="ds-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-password">密码</Label>
                <div className="relative">
                  <Input
                    id="ds-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-disabled">禁用态</Label>
                <Input
                  id="ds-disabled"
                  placeholder="不可编辑"
                  disabled
                />
              </div>
            </div>

            {/* Textarea + Form combo */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Textarea 文本域</p>

                <div className="space-y-2">
                  <Label htmlFor="ds-textarea">评论内容</Label>
                  <Textarea
                    id="ds-textarea"
                    placeholder="写下你的想法..."
                    className="min-h-24"
                  />
                </div>
              </div>

              {/* Example form composition */}
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">组合示例</p>
                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="ds-first">名</Label>
                      <Input
                        id="ds-first"
                        placeholder="陶"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ds-last">姓</Label>
                      <Input
                        id="ds-last"
                        placeholder="张"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ds-form-email">邮箱</Label>
                    <Input
                      id="ds-form-email"
                      type="email"
                      placeholder="tz@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ds-form-msg">留言</Label>
                    <Textarea
                      id="ds-form-msg"
                      placeholder="想说的话..."
                      className="min-h-20"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button
                      type="submit"
                      className="flex-1"
                    >
                      <Send className="size-4" />
                      提交
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ CARDS ═══════════ */}
        <section className="mb-20">
          <SectionHeader
            id="cards"
            title="Cards"
            subtitle="Card · CardHeader · CardContent · CardFooter"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic card */}
            <Card>
              <CardHeader>
                <CardTitle>基础卡片</CardTitle>
                <CardDescription>Card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  使用 <code className="text-xs bg-muted px-1 py-0.5 rounded">bg-card</code> 作为背景色，
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">border-border</code> 作为边框。
                </p>
              </CardContent>
            </Card>

            {/* Card with actions */}
            <Card>
              <CardHeader>
                <CardTitle>带操作卡片</CardTitle>
                <CardDescription>Card with footer actions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">卡片底部放置操作按钮，常用于表单提交、确认等场景。</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">保存</Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  取消
                </Button>
              </CardFooter>
            </Card>

            {/* Blog post card example */}
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-ink-200 to-ink-300 flex items-center justify-center">
                <Logo
                  size="lg"
                  className="opacity-30"
                />
              </div>
              <CardHeader>
                <div className="flex gap-1.5 mb-1">
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    React
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    设计系统
                  </Badge>
                </div>
                <CardTitle className="text-base">博客文章卡片</CardTitle>
                <CardDescription>2024-03-01 · 5 min read</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  墨色设计系统的完整文档，包含颜色、字体、组件使用指南...
                </p>
              </CardContent>
              <CardFooter className="justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="size-3.5" />
                  <span>1,234</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="size-3.5" />
                  <span>56</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ═══════════ QUICK REFERENCE ═══════════ */}
        <section>
          <SectionHeader
            id="reference"
            title="Quick Reference"
            subtitle="Tailwind 类速查"
          />

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-6 font-mono text-xs leading-loose text-muted-foreground overflow-x-auto">
              <pre>{`/* 背景 */
bg-background        /* 页面底色 ink-100 / ink-900 */
bg-card              /* 卡片 ink-50 / #252320 */
bg-muted             /* 次要区域 ink-200 / #2A2725 */
bg-secondary         /* 同 muted */

/* 文字 */
text-foreground           /* 标题 ink-800 / ink-300 */
text-secondary-foreground /* 正文 ink-700 / ink-300 */
text-muted-foreground     /* 辅助 ink-600 / ink-500 */
text-destructive          /* 朱红错误 */

/* 边框 */
border-border        /* 默认边框 ink-300 / 暖白8% */
border-input         /* 输入框边框 */

/* 墨色色阶直接使用 */
bg-ink-50 ~ bg-ink-900
text-ink-50 ~ text-ink-900

/* 功能色 */
text-seal / bg-seal       /* 印章朱红 */
text-success / bg-success /* 苔绿 */
text-warning / bg-warning /* 赭黄 */
text-info / bg-info       /* 青墨 */

/* 透明度 */
bg-primary/5              /* 5% 松烟墨 */
bg-seal/10                /* 10% 朱红，适合标签背景 */
border-foreground/20      /* 20% 前景色边框 */`}</pre>
            </div>
          </div>
        </section>
      </div>
      {/* end flex-1 main content */}
    </div>
  );
}
