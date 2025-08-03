import type React from "react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
	return (
		<main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-transparent">{children}</main>
	);
};

export default AuthLayout;
