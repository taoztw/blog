"use client";

import { cn } from "@/lib/utils";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const themes = [
  {
    key: "system",
    icon: Monitor,
    label: "System theme",
  },
  {
    key: "light",
    icon: Sun,
    label: "Light theme",
  },
  {
    key: "dark",
    icon: Moon,
    label: "Dark theme",
  },
] as const;

export type ThemeSwitcherProps = {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  defaultValue?: "light" | "dark" | "system";
  className?: string;
};

export const ThemeSwitcher = ({ value, onChange, defaultValue = "system", className }: ThemeSwitcherProps) => {
  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });
  const [mounted, setMounted] = useState(false);

  const handleThemeClick = useCallback(() => {
    const currentIndex = themes.findIndex((t) => t.key === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]?.key || themes[0].key);
  }, [theme, setTheme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = themes.find((t) => t.key === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <motion.button
      className={cn(
        "relative text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors duration-200",
        className
      )}
      onClick={handleThemeClick}
      type="button"
      aria-label={`Switch theme (current: ${currentTheme.label})`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};
