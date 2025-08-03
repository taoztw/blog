import BlogLayout from "@/components/layouts/blog-layout";
import React from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

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
      <BlogLayout>{children} </BlogLayout>
    </NextIntlClientProvider>
  );
};

export default Layout;
