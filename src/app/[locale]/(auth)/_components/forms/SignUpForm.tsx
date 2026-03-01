"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PasswordInput } from "@/components/ui/password-input";
import ROUTES from "@/constants/routes";
import { authClient } from "@/lib/auth/authClient";
import { signUpSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import SocialAuthForm from "./SocialAuthForm";

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof signUpSchema>) => {
    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: ROUTES.HOME,
      },
      {
        onRequest: () => {
          // Loading state is handled by form.formState.isSubmitting
        },
        onSuccess: () => {
          toast.success("Sign up successful!");
          router.replace(ROUTES.HOME);
        },
        onError: (ctx) => {
          toast.error(`Sign up failed: ${ctx.error.message}`);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="hidden lg:block">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join Tz Blog and start your journey
            </p>
          </div>
          <div className="lg:hidden">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Sign Up to Tz Blog
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome!</p>
          </div>
        </div>

        {/* Social Auth */}
        <SocialAuthForm />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-dashed" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
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
                <FormLabel className="font-medium">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
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
                <FormLabel className="font-medium">Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
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
                <FormLabel className="font-medium">Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full cursor-pointer" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <LoadingSpinner className="text-white" type="bars" />}
            Create Account
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button asChild variant="link" className="h-auto p-0 text-foreground underline underline-offset-4">
            <Link href={ROUTES.SIGN_IN}>Sign In</Link>
          </Button>
        </p>
      </form>
    </Form>
  );
};

export default SignUpForm;
