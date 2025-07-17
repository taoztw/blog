import type React from "react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <main className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">{children}</main>;
};

export default AuthLayout;
