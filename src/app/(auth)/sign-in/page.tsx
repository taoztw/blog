"use client";
import { AuthForm } from "@/components/forms/AuthForm";
import React from "react";
import { z } from "zod";

const SignIn = () => {
  const signInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters"),
  });

  return (
    <div>
      <AuthForm schema={signInSchema} formType="login" defaultValues={{ email: "", password: "" }} />
    </div>
  );
};

export default SignIn;
