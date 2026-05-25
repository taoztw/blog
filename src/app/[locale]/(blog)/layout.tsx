import { Footer } from "@/components/layouts/footer";
import Header2 from "@/components/layouts/header";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return {
    alternates: {
      types: {
        "application/rss+xml": [{ url: `/${locale}/rss.xml`, title: "Tz Blog RSS" }],
      },
    },
  };
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
