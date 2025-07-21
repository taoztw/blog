"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signInSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { LogoIcon } from "../logo";
import { Input } from "../ui/input";
import SocialAuthForm from "./SocialAuthForm";

const SignInForm = () => {
	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" }
	});

	const handleSubmit = (values: z.infer<typeof signInSchema>) => {
		console.log("Form submitted with values:", values);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="m-auto h-fit w-full max-w-[400px] rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
			>
				<div className="p-8 pb-6">
					<div>
						<Link href="/" aria-label="go home">
							<LogoIcon />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">Sign In to Tailark</h1>
						<p className="text-sm">Welcome back! Sign in to continue</p>
					</div>

					<SocialAuthForm />

					<hr className="my-4 border-dashed" />

					<div className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Enter you email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Password</FormLabel>
										<Button asChild variant="link" size="sm" className="font-light text-muted-foreground text-sm">
											<Link href="#">Forgot your Password ?</Link>
										</Button>
									</div>

									<FormControl>
										<Input type="password" placeholder="Enter you Password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button className="w-full">Sign In</Button>
					</div>
				</div>

				<div className="rounded-(--radius) border bg-muted p-3">
					<p className="text-center text-accent-foreground text-sm">
						Don't have an account ?
						<Button asChild variant="link" className="px-2">
							<Link href="#">Create account</Link>
						</Button>
					</p>
				</div>
			</form>
		</Form>
	);
};

export default SignInForm;
