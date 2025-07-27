// components/form/PasswordInput.tsx
"use client";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";

type PasswordInputProps = React.ComponentProps<typeof Input>;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ ...props }, ref) => {
	const [visible, setVisible] = React.useState(false);

	return (
		<div className="relative">
			<Input ref={ref} type={visible ? "text" : "password"} {...props} />
			<button
				type="button"
				onClick={() => setVisible(v => !v)}
				className="absolute inset-y-0 end-0 flex w-9 items-center justify-center text-muted-foreground/80 hover:text-foreground"
				aria-label={visible ? "Hide password" : "Show password"}
			>
				{visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
			</button>
		</div>
	);
});
PasswordInput.displayName = "PasswordInput";
