"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { LogoIcon } from "../logo";
import { Input } from "../ui/input";
import SocialAuthForm from "./SocialAuthForm";

const SignUpForm = () => {
	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: { email: "", name: "", password: "", confirmPassword: "" }
	});

	const handleSubmit = (values: z.infer<typeof signUpSchema>) => {
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
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter you Name" {...field} />
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
									</div>

									<FormControl>
										<Input type="password" placeholder="Enter you Password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between">
										<FormLabel>Confirm Password</FormLabel>
									</div>

									<FormControl>
										<Input type="password" placeholder="Confirm your Password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button className="w-full">Sign In</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default SignUpForm;
