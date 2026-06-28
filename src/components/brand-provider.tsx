"use client";

import {
  BRAND_PRESETS,
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND,
  applyBrand,
  getStoredBrand,
  type BrandPreset,
} from "@/lib/accent";
import { useTheme } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface BrandContextValue {
  brandId: string;
  setBrandId: (id: string) => void;
  presets: BrandPreset[];
}

const BrandContext = createContext<BrandContextValue | null>(null);

/**
 * 品牌色 Provider：
 *  - 初始化时从 localStorage 读取（首屏颜色已由 <head> 脚本写好，此处只同步 React 状态）
 *  - 选色 / 明暗切换时重写 --brand 并持久化
 */
export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [brandId, setBrandIdState] = useState<string>(DEFAULT_BRAND);

  // 挂载后读取已保存选择
  useEffect(() => {
    setBrandIdState(getStoredBrand());
  }, []);

  // 选色或明暗切换 → 重写 --brand
  useEffect(() => {
    applyBrand(brandId, resolvedTheme === "dark");
  }, [brandId, resolvedTheme]);

  const setBrandId = useCallback((id: string) => {
    setBrandIdState(id);
    try {
      window.localStorage.setItem(BRAND_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <BrandContext.Provider value={{ brandId, setBrandId, presets: BRAND_PRESETS }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within <BrandProvider>");
  return ctx;
}
