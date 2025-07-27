"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ROUTES from "@/constants/routes";
import { signUpSchema } from "@/lib/validations";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Logo } from "../logo";
import { Input } from "../ui/input";
import { LoadingSpinner } from "../ui/loading-spinner";
import { PasswordInput } from "../ui/password-input";
import SocialAuthForm from "./SocialAuthForm";

const SignUpForm = () => {
	const router = useRouter();

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			confirmPassword: ""
		}
	});
	const signUpMutation = api.user.signUp.useMutation({
		onSuccess: async (_data, variables) => {
			toast.success("Sign up successful!");
			try {
				const res = await signIn("credentials", {
					email: variables.email,
					password: variables.password,
					redirect: false
				});
				router.replace(ROUTES.HOME);
			} catch (error) {
				toast.error("Sign in failed.");
				router.push(ROUTES.SIGN_IN);
			}
		},
		onError: error => {
			if (error.data?.code === "CONFLICT") {
				form.setError("email", {
					type: "server",
					message: "Email already exists"
				});
				form.setFocus("email");
			}
			toast.error(`Sign up failed: ${error.message}`);
		}
	});

	const handleSubmit = (values: z.infer<typeof signUpSchema>) => {
		signUpMutation.mutate(values);
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
							<Logo size="lg" />
						</Link>
						<h1 className="mt-4 mb-1 font-semibold text-xl">Sign Up to Tz blog</h1>
						<p className="text-sm">Welcome!</p>
					</div>

					<SocialAuthForm />

					<hr className="my-4 border-dashed" />

					<div className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium">Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Email" {...field} />
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
										<Input placeholder="Username" {...field} />
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
										<PasswordInput placeholder="Password" {...field} />
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
										<PasswordInput placeholder="Confirm your password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button className="w-full cursor-pointer" disabled={signUpMutation.isPending}>
							{signUpMutation.isPending && <LoadingSpinner className="text-white" type="bars" />}
							Sign Up
						</Button>
					</div>
				</div>
				<div className="rounded-(--radius) border bg-muted p-3">
					<p className="text-center text-accent-foreground text-sm">
						Already have an account?
						<Button asChild variant="link" className="px-2">
							<Link href={ROUTES.SIGN_IN}>Sign In</Link>
						</Button>
					</p>
				</div>
			</form>
		</Form>
	);
};

export default SignUpForm;
