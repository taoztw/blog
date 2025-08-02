import SignUpForm from "@/components/forms/SignUpForm";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
	title: "Sign Up",
	description: "Create a new account"
};

const SignUp = async () => {
	const session = await auth();
	if (session?.user) {
		redirect("/"); // Redirect to home if already signed in
	}
	return <SignUpForm />;
};

export default SignUp;
