"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { type DefaultValues, type FieldValues, type Resolver, type SubmitHandler, useForm } from "react-hook-form";
import type { ZodType, z } from "zod";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  //   onSubmit: (data: T) => void | Promise<void>;
  formType: "login" | "register";
}

export function AuthForm<T extends FieldValues>({ schema, defaultValues, formType }: AuthFormProps<T>) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {};
  const buttonText = formType === "login" ? "Sign In" : "Sign Up";

  return <div>Auth</div>;
}
