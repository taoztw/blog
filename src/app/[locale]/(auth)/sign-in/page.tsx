import type { Metadata } from "next";
import SignInForm from "../_components/forms/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

const SignIn = async () => {
  // const session = await auth();
  // if (session?.user) {
  //   redirect("/"); // Redirect to home if already signed in
  // }
  return <SignInForm />;
};

export default SignIn;
