import SignInForm from "@/components/forms/SignInForm";
import { auth } from "@/server/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to your account"
};

const SignIn = async () => {
	const session = await auth();
	if (session?.user) {
		redirect("/"); // Redirect to home if already signed in
	}
	return <SignInForm />;
};

export default SignIn;
