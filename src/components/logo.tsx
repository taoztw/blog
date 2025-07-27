import { cn } from "@/lib/utils"; // shadcn 项目默认提供
import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type * as React from "react";

const logoVariants = cva("inline-block shrink-0", {
	variants: {
		size: {
			sm: "h-6 w-6",
			md: "h-8 w-8",
			lg: "h-12 w-12",
			xl: "h-16 w-16"
		}
	},
	defaultVariants: {
		size: "md"
	}
});

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof logoVariants> {
	/** href 存在时自动用 <Link> 包裹 */
	href?: "/";
	/** 无障碍文本 */
	alt?: string;
}

export function Logo({ size, href, className, alt = "Tz Blog", ...rest }: LogoProps) {
	const img = <img src="/logo.svg" alt={alt} className={cn(logoVariants({ size }), className)} width={0} height={0} />;

	if (href) {
		return (
			<Link href={href} aria-label={alt} {...rest}>
				{img}
			</Link>
		);
	}

	return (
		<span aria-label={alt} {...rest}>
			{img}
		</span>
	);
}
