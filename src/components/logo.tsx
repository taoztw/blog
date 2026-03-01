import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type * as React from "react";

const logoVariants = cva("inline-block shrink-0 select-none", {
  variants: {
    size: {
      sm: "h-5",
      md: "h-7",
      lg: "h-10",
      xl: "h-14",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof logoVariants> {
  /** href 存在时自动用 <Link> 包裹 */
  href?: "/";
  /** 无障碍文本 */
  alt?: string;
}

export function Logo({ size, href, className, alt = "Go Home", ...rest }: LogoProps) {
  const logoImage = (
    <>
      {/* 亮色模式：深色 logo */}
      <img
        src="/Tz-black.svg"
        alt={alt}
        className={cn(logoVariants({ size }), "w-auto dark:hidden", className)}
      />
      {/* 暗色模式：浅色 logo */}
      <img
        src="/Tz-white.svg"
        alt={alt}
        className={cn(logoVariants({ size }), "hidden w-auto dark:block", className)}
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={alt} {...rest}>
        {logoImage}
      </Link>
    );
  }

  return (
    <span aria-label={alt} {...rest}>
      {logoImage}
    </span>
  );
}
