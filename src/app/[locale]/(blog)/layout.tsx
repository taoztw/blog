import { Footer } from "@/components/layouts/footer";
import { FloatingNav } from "@/components/layouts/floating-nav";
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
        <FloatingNav />
        <div className="min-h-screen bg-background lg:pl-24">
          <main className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
        </div>
      </div>
      <div className="lg:pl-24">
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
};

export default Layout;
