import SignUpForm from "../_components/forms/SignUpForm";

export const metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

const SignUp = async () => {
  // const session = await auth();
  // if (session?.user) {
  //   redirect("/"); // Redirect to home if already signed in
  // }
  return <SignUpForm />;
};

export default SignUp;
