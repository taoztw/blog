import SignUpForm from "@/components/forms/SignUpForm";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import React from "react";

const SignUp = async () => {
	const session = await auth();
	if (session?.user) {
		redirect("/"); // Redirect to home if already signed in
	}
	return <SignUpForm />;
};

export default SignUp;
