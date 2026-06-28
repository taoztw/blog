"use client";

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            首先，请登录
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            输入你的邮箱和密码以继续。
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@email.com"
                    className="h-12 text-base"
                    {...field}
                  />
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
                <FormControl>
                  <Input
                    type="password"
                    placeholder="密码"
                    className="h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="h-12 w-full text-base font-semibold" disabled={isLoading}>
            {isLoading && <LoadingSpinner className="text-white" type="bars" />}
            继续
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-muted-foreground">或</span>
          </div>
        </div>

        {/* Social Auth */}
        <SocialAuthForm />

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          还没有账户？{" "}
          <Button asChild variant="link" className="h-auto p-0 text-base text-seal underline-offset-4 hover:underline">
            <Link href={ROUTES.SIGN_UP}>立即创建</Link>
          </Button>
        </p>
      </form>
    </Form>
  );
};

export default SignInForm;
