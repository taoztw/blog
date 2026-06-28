"use client";

import { useBrand } from "@/components/brand-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";

/**
 * 品牌主题色选择器。
 * 传入自定义触发器作为 children（asChild），弹出预设色板供选择。
 */
export function BrandPicker({
  children,
  align = "start",
  side = "right",
}: {
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}) {
  const { brandId, setBrandId, presets } = useBrand();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        className="w-auto p-3"
      >
        <p className="mb-2.5 px-0.5 text-xs font-medium tracking-wider text-muted-foreground">主题色</p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((p) => {
            const active = p.id === brandId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setBrandId(p.id)}
                aria-label={p.name}
                aria-pressed={active}
                title={p.name}
                className={cn(
                  "grid size-9 place-items-center rounded-full ring-offset-2 ring-offset-popover transition-transform hover:scale-110",
                  active && "ring-2 ring-foreground/40",
                )}
                style={{ backgroundColor: isDark ? p.dark : p.light }}
              >
                {active && <Check className="size-4 text-white" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
