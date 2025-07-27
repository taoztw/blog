import SignInForm from "@/components/forms/SignInForm";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import React from "react";

const SignIn = async () => {
	const session = await auth();
	if (session?.user) {
		redirect("/"); // Redirect to home if already signed in
	}
	return <SignInForm />;
};

export default SignIn;
