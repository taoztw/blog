"use client";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

interface TagBadgeProps extends ComponentPropsWithoutRef<"span"> {
  name: string;
  color?: string | null;
  icon?: string | null;
  size?: "sm" | "md" | "lg";
}

export function TagBadge({ name, color, icon, size = "md", className, ...props }: TagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-2.5 py-1 gap-1.5",
  };

  const iconSizeClasses = {
    sm: "size-3",
    md: "size-3.5",
    lg: "size-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium transition-colors",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: color ? `${color}12` : undefined,
        borderColor: color ? `${color}40` : undefined,
        color: color || undefined,
      }}
      {...props}
    >
      {icon ? (
        <span
          className={cn("shrink-0", iconSizeClasses[size])}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      ) : null}
      {name}
    </span>
  );
}
