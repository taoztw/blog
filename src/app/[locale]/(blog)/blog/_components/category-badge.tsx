"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type ComponentProps } from "react";

interface CategoryBadgeProps extends Omit<ComponentProps<typeof Badge>, "onClick"> {
  name: string;
  count?: number;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function CategoryBadge({
  name,
  count,
  onRemove,
  onClick,
  size = "md",
  className,
  ...props
}: CategoryBadgeProps) {
  const isClickable = !!onClick;
  const hasRemove = !!onRemove;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 transition-all bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300",
        sizeClasses[size],
        isClickable && "cursor-pointer hover:shadow-sm hover:bg-green-100 dark:hover:bg-green-900",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span className="font-medium">{name}</span>
      {count !== undefined && <span className="text-[10px] opacity-60">({count})</span>}
      {hasRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn("ml-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800 p-0.5 transition-colors")}
          aria-label="Remove category"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
