import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import localFont from "next/font/local";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

const geistSans = localFont({
  src: [
    {
      path: "./fonts/Geist-VariableFont_wght.ttf",
      weight: "100 900", // 变量字体权重范围
      style: "normal",
    },
  ],
  variable: "--font-geist-sans", // 用 CSS 变量方便在全局/ Tailwind 中使用
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL(SITE_URL),
  creator: "Tao z(Tz)",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable}`} suppressHydrationWarning>
      {/* <html lang="en" suppressHydrationWarning> */}
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <Toaster position="top-right" />
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
