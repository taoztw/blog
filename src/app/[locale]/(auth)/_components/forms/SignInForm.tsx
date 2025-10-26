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
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="m-auto h-fit w-full max-w-[400px] rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <div>
              <Logo size={"lg"} href="/" />
            </div>
            <h1 className="mt-4 mb-1 font-semibold text-xl">Sign In to Tz blog</h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
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
                    <Input type="email" placeholder="Enter you email" {...field} />
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
                    <Input type="password" placeholder="Enter you Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full " disabled={isLoading}>
              {isLoading && <LoadingSpinner className="text-white" type="bars" />}Sign In
            </Button>
          </div>
        </div>

        <div className="rounded-(--radius) border bg-muted p-3">
          <p className="text-center text-accent-foreground text-sm">
            Don't have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href={ROUTES.SIGN_UP}>Create account</Link>
            </Button>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
