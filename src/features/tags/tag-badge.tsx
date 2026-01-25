"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagBadgeProps {
  name: string;
  color?: string | null;
  count?: number;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: "";
}

export function TagBadge({ name, color, count, onRemove, onClick, size = "md", className, ...props }: TagBadgeProps) {
  const isClickable = !!onClick;
  const hasRemove = !!onRemove;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge
      variant="default"
      className={cn(
        "gap-1.5 transition-all",
        sizeClasses[size],
        isClickable && "cursor-pointer hover:shadow-sm",
        className
      )}
      style={{
        backgroundColor: color ? `${color}15` : undefined,
        // borderColor: color ? `${color}40` : undefined,
        color: color ? color : undefined,
      }}
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
          className={cn("ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors")}
          aria-label="Remove tag"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
