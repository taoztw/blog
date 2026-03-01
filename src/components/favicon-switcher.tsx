"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = resolvedTheme === "dark" ? "/Tz-white.svg" : "/Tz-black.svg";
    }
  }, [resolvedTheme]);

  return null;
}
