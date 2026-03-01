"use client";

import ROUTES from "@/constants/routes";
import { authClient } from "@/lib/auth/authClient";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GlobalSearch } from "../global-search";
import { LanguageSwitcher } from "../language-switcher";
import { Logo } from "../logo";
import { ThemeSwitcher } from "../theme-switcher";
import UserAvatarHeader from "../user-avatar-header";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "blog", href: "/blog" },
  { name: "journals", href: "/journals" },
  { name: "projects", href: "/projects" },
  { name: "archives", href: "/archives" },
  { name: "about", href: "/about" },
];

export default function Header2() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const t = useTranslations("HomePage.Header");

  // Determine active navigation item based on current pathname
  const getActiveItem = (href: string) => {
    // Remove locale prefix from pathname for comparison
    const currentPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
    // Don't highlight any nav item when on the homepage
    if (currentPath === "/") {
      return false;
    }
    if (href === "/blog" && currentPath.startsWith("/blog")) {
      return true;
    }
    return currentPath.startsWith(href);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
        staggerChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          isScrolled ? "border-border/50 bg-background/80 border-b shadow-sm backdrop-blur-md" : "bg-transparent"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/"
                className="flex items-center space-x-3"
              >
                <Logo size="md" />
                {/* <div className="flex flex-col">
                  <span className="text-foreground text-md font-bold">Gi</span>
                  <span className="text-muted-foreground -mt-1 text-xs">Build faster</span>
                </div> */}
              </Link>
            </motion.div>
            <nav className="hidden items-center space-x-1 lg:flex">
              {navItems.map((item) => {
                const isActive = getActiveItem(item.href);
                return (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive ? "text-foreground/80  bg-muted " : "text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      {!isActive && hoveredItem === item.name && (
                        <motion.div
                          className="bg-muted absolute inset-0 rounded-lg"
                          layoutId="navbar-hover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg
                          "
                          layoutId="navbar-active"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10">{t(`navItems.${item.name}`)}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <motion.div
              className="hidden items-center space-x-3 lg:flex"
              variants={itemVariants}
            >
              <motion.button
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {mounted && (
                <ThemeSwitcher
                  value={theme as "light" | "dark" | "system"}
                  onChange={(newTheme) => setTheme(newTheme)}
                />
              )}

              <LanguageSwitcher />

              {session?.user?.id ? (
                <UserAvatarHeader
                  id={session.user.id}
                  name={session.user.name!}
                  imageUrl={session.user?.image}
                />
              ) : (
                <Link
                  href={ROUTES.SIGN_IN}
                  className="text-foreground/80 hover:text-foreground px-4 py-2 text-sm font-medium transition-colors duration-200 bg-secondary rounded-lg"
                >
                  {t("signIn")}
                </Link>
              )}

              {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center space-x-2 rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div> */}
            </motion.div>

            <motion.button
              className="text-foreground hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="border-border bg-background fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-6 p-6">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = getActiveItem(item.href);
                    return (
                      <motion.div
                        key={item.name}
                        variants={mobileItemVariants}
                      >
                        <Link
                          href={item.href}
                          className={`block rounded-lg px-4 py-3 font-medium transition-colors duration-200 ${
                            isActive
                              ? "text-foreground bg-primary/10 border border-primary/20"
                              : "text-foreground hover:bg-muted"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t(`navItems.${item.name}`)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  className="border-border space-y-3 border-t pt-6"
                  variants={mobileItemVariants}
                >
                  <Link
                    href="/login"
                    className="text-foreground hover:bg-muted block w-full rounded-lg py-3 text-center font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <div className="flex items-center justify-center px-4 max-w-[120px] mx-auto">
                    {mounted && (
                      <ThemeSwitcher
                        value={theme as "light" | "dark" | "system"}
                        onChange={(newTheme) => setTheme(newTheme)}
                      />
                    )}
                  </div>
                  {/* <Link
                    href="/signup"
                    className="bg-foreground text-background hover:bg-foreground/90 block w-full rounded-lg py-3 text-center font-medium transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link> */}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Dialog */}
      <GlobalSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </>
  );
}
