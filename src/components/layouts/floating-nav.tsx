"use client";

import { BrandPicker } from "@/components/brand-picker";
import { useBrand } from "@/components/brand-provider";
import { GlobalSearch } from "@/components/global-search";
import { Logo } from "@/components/logo";
import UserAvatarHeader from "@/components/user-avatar-header";
import ROUTES from "@/constants/routes";
import { authClient } from "@/lib/auth/authClient";
import { cn } from "@/lib/utils";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import {
  FolderGit2,
  Languages,
  LogIn,
  Menu,
  Moon,
  Newspaper,
  NotebookPen,
  Palette,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { key: "blog", href: "/blog", Icon: Newspaper },
  { key: "journals", href: "/journals", Icon: NotebookPen },
  { key: "projects", href: "/projects", Icon: FolderGit2 },
  { key: "about", href: "/about", Icon: User },
] as const;

const stripLocale = (p: string) => p.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

/** 共用：圆形图标 + 可展开文字标签 的一行 */
function PillRow({
  Icon,
  label,
  open,
  active = false,
  className,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  open: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <>
      {/* 固定 32px 宽的图标区：折叠态(48px - 左右各8px padding = 32px)正好居中 */}
      <span className="grid w-8 shrink-0 place-items-center">
        <span
          data-active={active}
          className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors group-hover:text-foreground data-[active=true]:bg-[var(--brand)] data-[active=true]:text-white"
        >
          <Icon className="size-3.5" />
        </span>
      </span>
      <span
        style={{ opacity: open ? 1 : 0, width: open ? undefined : 0 }}
        className={cn(
          "min-w-0 truncate pr-3 text-sm font-semibold text-foreground transition-opacity duration-200",
          className
        )}
      >
        {label}
      </span>
    </>
  );
}

export function FloatingNav() {
  const [open, setOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("HomePage.Header");
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const { brandId, setBrandId, presets } = useBrand();

  const currentPath = stripLocale(pathname);
  const isActive = (href: string) => {
    if (currentPath === "/") return false;
    if (href === "/blog") return currentPath.startsWith("/blog");
    return currentPath.startsWith(href);
  };

  const isDark = resolvedTheme === "dark";
  const searchLabel = locale === "zh" ? "搜索" : "Search";
  const themeLabel = isDark ? (locale === "zh" ? "亮色" : "Light") : locale === "zh" ? "暗色" : "Dark";
  const langLabel = locale === "en" ? "中文" : "English";

  const switchLocale = () => {
    const next = locale === "en" ? "zh" : "en";
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  };

  useEffect(() => setMounted(true), []);

  // ⌘K / Ctrl+K → 打开搜索
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%", transition: { duration: 0.3, ease: easeInOut } },
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeInOut, staggerChildren: 0.08 } },
  };
  const mobileItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      {/* ─────────── 桌面：左缘悬浮胶囊 ─────────── */}
      <motion.nav
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        animate={{ width: open ? 164 : 48 }}
        transition={{ type: "spring", stiffness: 400, damping: 34 }}
        className="fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 flex-col gap-1 overflow-hidden rounded-[18px] bg-card/90 p-1 shadow-xl ring-1 ring-border backdrop-blur-md lg:flex"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Go Home"
          className="group mb-1 flex items-center rounded-xl py-1.5"
        >
          <span className="grid w-8 shrink-0 place-items-center">
            <Logo
              size="sm"
              className="h-4"
            />
          </span>
        </Link>

        {/* 主导航 */}
        {NAV_ITEMS.map(({ key, href, Icon }) => (
          <Link
            key={key}
            href={href}
            className="group flex items-center rounded-xl py-1.5 transition-colors hover:bg-muted"
          >
            <PillRow
              Icon={Icon}
              label={t(`navItems.${key}`)}
              open={open}
              active={isActive(href)}
            />
          </Link>
        ))}

        <div className="my-1.5 h-px bg-border" />

        {/* 搜索 */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label={searchLabel}
          className="group flex items-center rounded-xl py-1.5 text-left transition-colors hover:bg-muted"
        >
          <PillRow
            Icon={Search}
            label={searchLabel}
            open={open}
          />
        </button>

        {/* 主题切换 */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={themeLabel}
          className="group flex items-center rounded-xl py-1.5 text-left transition-colors hover:bg-muted"
        >
          <PillRow
            Icon={mounted && isDark ? Sun : Moon}
            label={themeLabel}
            open={open}
          />
        </button>

        {/* 语言切换 */}
        <button
          type="button"
          onClick={switchLocale}
          aria-label={langLabel}
          className="group flex items-center rounded-xl py-1.5 text-left transition-colors hover:bg-muted"
        >
          <PillRow
            Icon={Languages}
            label={langLabel}
            open={open}
          />
        </button>

        {/* 主题色选择 */}
        <BrandPicker
          side="right"
          align="end"
        >
          <button
            type="button"
            aria-label="主题色"
            className="group flex items-center rounded-xl py-1.5 text-left transition-colors hover:bg-muted"
          >
            <PillRow
              Icon={Palette}
              label="主题色"
              open={open}
            />
          </button>
        </BrandPicker>

        {/* 用户 / 登录 */}
        {session?.user?.id ? (
          <div className="flex items-center py-1.5">
            <span className="grid w-8 shrink-0 place-items-center">
              <UserAvatarHeader
                id={session.user.id}
                name={session.user.name!}
                imageUrl={session.user?.image}
              />
            </span>
            <span
              style={{ opacity: open ? 1 : 0, width: open ? undefined : 0 }}
              className="min-w-0 truncate pr-3 text-sm font-semibold text-foreground transition-opacity duration-200"
            >
              {session.user.name}
            </span>
          </div>
        ) : (
          <Link
            href={ROUTES.SIGN_IN}
            className="group flex items-center rounded-xl py-1.5 transition-colors hover:bg-muted"
          >
            <PillRow
              Icon={LogIn}
              label={t("signIn")}
              open={open}
            />
          </Link>
        )}
      </motion.nav>

      {/* ─────────── 移动端：顶栏 + 抽屉 ─────────── */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            aria-label="Go Home"
          >
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={searchLabel}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileOpen((o) => !o)}
              aria-label="Menu"
              className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted"
            >
              {isMobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              className="fixed top-16 right-4 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-5 p-5">
                <div className="space-y-1">
                  {NAV_ITEMS.map(({ key, href, Icon }) => {
                    const active = isActive(href);
                    return (
                      <motion.div
                        key={key}
                        variants={mobileItemVariants}
                      >
                        <Link
                          href={href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors",
                            active ? "text-foreground" : "text-foreground hover:bg-muted"
                          )}
                        >
                          <span
                            data-active={active}
                            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground data-[active=true]:bg-[var(--brand)] data-[active=true]:text-white"
                          >
                            <Icon className="size-[18px]" />
                          </span>
                          {t(`navItems.${key}`)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  className="flex items-center justify-between border-t border-border pt-4"
                  variants={mobileItemVariants}
                >
                  <button
                    type="button"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {mounted && isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    {themeLabel}
                  </button>
                  <button
                    type="button"
                    onClick={switchLocale}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Languages className="size-4" />
                    {langLabel}
                  </button>
                </motion.div>

                {/* 主题色 */}
                <motion.div
                  className="border-t border-border pt-4"
                  variants={mobileItemVariants}
                >
                  <p className="mb-2.5 flex items-center gap-2 px-1 text-xs font-medium tracking-wider text-muted-foreground">
                    <Palette className="size-3.5" />
                    主题色
                  </p>
                  <div className="flex flex-wrap gap-2 px-1">
                    {presets.map((p) => {
                      const active = p.id === brandId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setBrandId(p.id)}
                          aria-label={p.name}
                          aria-pressed={active}
                          title={p.name}
                          className={cn(
                            "grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-background transition-transform active:scale-95",
                            active && "ring-2 ring-foreground/40"
                          )}
                          style={{ backgroundColor: isDark ? p.dark : p.light }}
                        >
                          {active && <span className="block size-2 rounded-full bg-white" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                {!session?.user?.id && (
                  <motion.div variants={mobileItemVariants}>
                    <Link
                      href={ROUTES.SIGN_IN}
                      onClick={() => setIsMobileOpen(false)}
                      className="block w-full rounded-lg bg-secondary py-2.5 text-center font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {t("signIn")}
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GlobalSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </>
  );
}

export default FloatingNav;
