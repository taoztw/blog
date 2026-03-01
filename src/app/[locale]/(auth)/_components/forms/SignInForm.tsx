"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ROUTES from "@/constants/routes";
import { authClient } from "@/lib/auth/authClient";
import { signInSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import SocialAuthForm from "./SocialAuthForm";

const SignInForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: ROUTES.HOME,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            toast.success("Sign in successful!");
            router.replace(ROUTES.HOME);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Sign in failed. Please check your credentials.");
            form.setError("email", {
              type: "manual",
              message: "Invalid email or password",
            });
            form.setError("password", {
              type: "manual",
              message: "Invalid email or password",
            });
            form.setFocus("email");
          },
        }
      );
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          {/* Desktop: logo is in layout left panel, hide here */}
          <div className="hidden lg:block">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          {/* Mobile: show full branding */}
          <div className="lg:hidden">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Sign In to Tz Blog
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back! Sign in to continue
            </p>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="font-medium">Password</FormLabel>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" disabled={isLoading}>
            {isLoading && <LoadingSpinner className="text-white" type="bars" />}
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button asChild variant="link" className="h-auto p-0 text-foreground underline underline-offset-4">
            <Link href={ROUTES.SIGN_UP}>Create account</Link>
          </Button>
        </p>
      </form>
    </Form>
  );
};

export default SignInForm;
