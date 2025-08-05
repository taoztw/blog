import React from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Header2 from "@/components/mvpblocks/header";
import { Footer } from "@/components/layouts/footer";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const Layout = async ({ children, params }: LayoutProps) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <NextIntlClientProvider>
      <div className="w-full">
        <Header2 />
        <div className="min-h-screen bg-background">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">{children}</main>
        </div>
      </div>
      <Footer />
    </NextIntlClientProvider>
  );
};

export default Layout;
