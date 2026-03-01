"use client";

import { Separator } from "@/components/ui/separator";
import { ExternalLink, GithubIcon, Mail, Rss } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");

  const socialLinks = [
    {
      name: "GitHub",
      icon: GithubIcon,
      href: "https://github.com/taoztw",
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:tztw4723@gmail.com",
    },
    {
      name: "RSS",
      icon: Rss,
      href: "/rss.xml",
    },
  ];

  const friendLinks = [
    { name: "Cloudflare", href: "https://www.cloudflare.com/" },
    { name: "Next.js", href: "https://nextjs.org" },
    { name: "Tailwind CSS", href: "https://tailwindcss.com" },
    { name: "shadcn/ui", href: "https://ui.shadcn.com" },
  ];

  return (
    <footer className="border-t border-border bg-ink-50 dark:bg-ink-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block text-xl font-semibold tracking-tight text-foreground"
            >
              Tz Blog
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-ink-200 hover:text-foreground dark:hover:bg-ink-700"
                  aria-label={link.name}
                >
                  <link.icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("navigation")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: t("nav.blog"), href: "/blog" },
                { label: t("nav.archives"), href: "/archives" },
                { label: t("nav.about"), href: "/about" },
                { label: t("nav.projects"), href: "/projects" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-600 transition-colors hover:text-foreground dark:text-ink-400 dark:hover:text-ink-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("legal")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-ink-600 transition-colors hover:text-foreground dark:text-ink-400 dark:hover:text-ink-300"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-ink-600 transition-colors hover:text-foreground dark:text-ink-400 dark:hover:text-ink-300"
                >
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Friends column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("friends")}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {friendLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-foreground dark:text-ink-400 dark:hover:text-ink-300"
                  >
                    {link.name}
                    <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tz Blog. {t("rights")}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              {t("privacy")}
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              {t("terms")}
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <Link
              href="/rss.xml"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Rss className="size-3" />
              RSS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
