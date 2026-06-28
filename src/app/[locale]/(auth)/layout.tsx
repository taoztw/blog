import { Logo } from "@/components/logo";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import type React from "react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="flex min-h-screen w-full flex-col bg-background">
      {/* ═══ Logo — centered at top ═══ */}
      <div className="flex justify-center pt-14 pb-4 sm:pt-20">
        <Logo size="lg" href="/" />
      </div>

      {/* ═══ Centered single-column form ═══ */}
      <div className="flex flex-1 justify-center px-6">
        <div className="w-full max-w-[480px]">{children}</div>
      </div>

      {/* ═══ Footer ═══ */}
      <footer className="flex items-center justify-center gap-5 py-8 text-xs text-muted-foreground">
        <Link href={ROUTES.HOME} className="transition-colors hover:text-foreground">
          隐私和条款
        </Link>
        <Link href={ROUTES.HOME} className="transition-colors hover:text-foreground">
          联系我们
        </Link>
        <span>&copy; {new Date().getFullYear()} Tz Blog</span>
      </footer>
    </main>
  );
};

export default AuthLayout;
