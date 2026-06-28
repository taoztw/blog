/**
 * 品牌强调色 — User-selectable Brand Accent
 * ─────────────────────────────────────────
 * 单一品牌色（默认深蓝），用户可在预设里自选并持久化（localStorage）。
 * 品牌色统一写入 --brand，由 globals.css 联动 seal/ring/chart-1/sidebar-primary。
 *
 * 同一份预设被两处共用：
 *   1. <head> 内联脚本（ACCENT_INJECT）—— 首屏读 localStorage，无闪烁
 *   2. BrandProvider 客户端组件 —— 选色 / 明暗切换时重写 --brand
 */

export interface BrandPreset {
  id: string;
  /** 展示名 */
  name: string;
  /** 亮色模式值 */
  light: string;
  /** 暗色模式值 */
  dark: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  { id: "blue", name: "深蓝", light: "#2563eb", dark: "#5aaef0" },
  { id: "indigo", name: "靛紫", light: "#5b53d6", dark: "#8b85f0" },
  { id: "teal", name: "青墨", light: "#0d9488", dark: "#34c5b5" },
  { id: "green", name: "翠绿", light: "#1f9e6e", dark: "#46c08b" },
  { id: "violet", name: "紫罗兰", light: "#7c3aed", dark: "#a98bf5" },
  { id: "rose", name: "玫红", light: "#e11d48", dark: "#fb7185" },
  { id: "amber", name: "琥珀", light: "#d97706", dark: "#f0a93a" },
  { id: "seal", name: "朱红", light: "#c23b22", dark: "#e5604a" },
];

export const DEFAULT_BRAND = "blue";
export const BRAND_STORAGE_KEY = "brand-accent";

export function getPreset(id: string | null | undefined): BrandPreset {
  return BRAND_PRESETS.find((p) => p.id === id) ?? BRAND_PRESETS[0];
}

/** 读取已保存的品牌色 id（仅客户端） */
export function getStoredBrand(): string {
  if (typeof window === "undefined") return DEFAULT_BRAND;
  return window.localStorage.getItem(BRAND_STORAGE_KEY) ?? DEFAULT_BRAND;
}

/** 把指定品牌色写入 --brand（按当前明暗取变体） */
export function applyBrand(id: string, isDark: boolean): void {
  const p = getPreset(id);
  document.documentElement.style.setProperty("--brand", isDark ? p.dark : p.light);
}

/**
 * 注入 <body> 顶部的内联脚本字符串。
 * 首帧渲染前同步执行：读 localStorage（无则用默认深蓝），按 dark class 取变体。
 */
export const ACCENT_INJECT = `(function(){
  var M=${JSON.stringify(
    Object.fromEntries(BRAND_PRESETS.map((p) => [p.id, [p.light, p.dark]])),
  )};
  var def=${JSON.stringify(DEFAULT_BRAND)};
  var id;
  try{id=localStorage.getItem(${JSON.stringify(BRAND_STORAGE_KEY)});}catch(e){}
  var v=M[id]||M[def];
  var dark=document.documentElement.classList.contains('dark');
  document.documentElement.style.setProperty('--brand',dark?v[1]:v[0]);
})();`;
