import { z } from "zod";

export const signInSchema = z.object({
	email: z.email().min(1, "Email is required"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(100, "Password must be at most 100 characters")
});

export const signUpSchema = z
	.object({
		email: z.email().min(1, "Email is required"),
		name: z.string().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(100, "Password must be at most 100 characters"),
		confirmPassword: z
			.string()
			.min(6, "Confirm Password must be at least 6 characters")
			.max(100, "Confirm Password must be at most 100 characters")
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"]
	});
