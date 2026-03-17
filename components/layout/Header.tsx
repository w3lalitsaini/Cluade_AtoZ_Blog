"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Bell,
  BookmarkIcon,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const staticCategories = [
  { name: "Home", href: "/" },
  { name: "News", href: "/category/news" },
  { name: "Technology", href: "/category/technology" },
  { name: "Business", href: "/category/business" },
  { name: "AI", href: "/category/ai" },
  { name: "World", href: "/category/world" },
  { name: "Politics", href: "/category/politics" },
  { name: "Health", href: "/category/health" },
  { name: "Science", href: "/category/science" },
  { name: "Sports", href: "/category/sports" },
  { name: "Entertainment", href: "/category/entertainment" },
];

export default function Header() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState(staticCategories);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?active=true");
        const data = await res.json();
        if (data.length > 0) {
          setCategories([
            { name: "Home", href: "/" },
            ...data.map((c: any) => ({
              name: c.name,
              href: `/category/${c.slug}`,
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userRole = (session?.user as { role?: string })?.role;
  const isAdminOrEditor =
    userRole === "admin" || userRole === "editor" || userRole === "author";

  return (
    <>
      {/* Top Bar */}
      <div className="bg-ink-950 text-white text-xs font-sans py-1.5 px-4 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-ink-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-4 text-ink-300">
          <Link
            href="/latest"
            className="hover:text-brand-400 transition-colors"
          >
            Latest
          </Link>
          <Link
            href="/subscribe"
            className="hover:text-brand-400 transition-colors"
          >
            Subscribe
          </Link>
          <Link
            href="/advertise"
            className="hover:text-brand-400 transition-colors"
          >
            Advertise
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-ink-950/95 backdrop-blur-md shadow-md"
            : "bg-white dark:bg-ink-950"
        } border-b border-stone-200 dark:border-stone-800`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Logo + Actions Row */}
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <span
                  className="font-heading text-2xl md:text-3xl font-black tracking-tight text-ink-950 dark:text-white"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  A<span className="text-brand-500">to</span>Z
                </span>
                <span className="font-sans text-lg md:text-xl font-light text-ink-500 dark:text-ink-400 ml-1">
                  Blogs
                </span>
              </div>
              <div className="hidden sm:block w-px h-7 bg-stone-300 dark:bg-stone-700 mx-1" />
              <span className="hidden sm:block text-xs font-sans text-ink-400 dark:text-ink-500 uppercase tracking-widest max-w-[80px] leading-tight">
                News & Insights
              </span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Search className="w-5 h-5 text-ink-600 dark:text-ink-400" />
              </button>

              <ThemeToggle />

              {/* Auth */}
              {session ? (
                <div className="flex items-center gap-3">
                  {isAdminOrEditor && (
                    <Link
                      href="/admin/dashboard"
                      className="hidden md:flex items-center gap-1.5 text-xs font-sans font-700 bg-brand-500 text-white px-3 py-1.5 rounded-full hover:bg-brand-600 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span className="capitalize">{userRole}</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="hidden md:flex items-center gap-2 text-sm font-sans font-600 text-ink-600 dark:text-ink-400 hover:text-brand-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[80px] truncate">
                      {session.user?.name?.split(" ")[0] || "Profile"}
                    </span>
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <ChevronDown className="w-4 h-4 text-ink-500 hidden md:block" />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-ink-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                            <p className="font-sans text-sm font-semibold text-ink-900 dark:text-white">
                              {session.user?.name}
                            </p>
                            <p className="font-sans text-xs text-ink-500 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <User className="w-4 h-4 text-ink-500" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              href="/saved"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <BookmarkIcon className="w-4 h-4 text-ink-500" />
                              <span>Saved Posts</span>
                            </Link>
                            {isAdminOrEditor && (
                              <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <LayoutDashboard className="w-4 h-4 text-ink-500" />
                                <span>Dashboard</span>
                              </Link>
                            )}
                            <Link
                              href="/settings"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="w-4 h-4 text-ink-500" />
                              <span>Settings</span>
                            </Link>
                          </div>
                          <div className="border-t border-stone-100 dark:border-stone-800 py-1">
                            <button
                              onClick={() => signOut()}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="btn-secondary text-sm py-2 px-4 hidden sm:flex"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Category Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 h-11 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="nav-link px-3 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-stone-200 dark:border-stone-800"
            >
              <div className="max-w-2xl mx-auto px-4 py-4">
                <form action="/search" method="GET">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                    <input
                      type="search"
                      name="q"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search articles, topics, authors..."
                      className="input-field pl-12 pr-4 py-3 text-base"
                      autoFocus
                    />
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-stone-200 dark:border-stone-800"
            >
              <nav className="px-4 py-4 grid grid-cols-2 gap-1 border-b border-stone-100 dark:border-stone-800">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="nav-link px-3 py-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4 grid grid-cols-2 gap-4">
                <Link
                  href="/about"
                  className="text-sm font-sans text-ink-500 hover:text-brand-500"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-sans text-ink-500 hover:text-brand-500"
                >
                  Contact
                </Link>
                <Link
                  href="/advertise"
                  className="text-sm font-sans text-ink-500 hover:text-brand-500"
                >
                  Advertise
                </Link>
                <Link
                  href="/careers"
                  className="text-sm font-sans text-ink-500 hover:text-brand-500"
                >
                  Careers
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
