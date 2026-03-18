"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import NextImage from "next/image";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  BookmarkIcon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { CATEGORIES } from "@/lib/utils";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-ink-950 dark:bg-black text-white text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4 text-ink-400">
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <span className="text-ink-300">
                Welcome,{" "}
                <span className="text-brand-400">
                  {user.name?.split(" ")[0]}
                </span>
              </span>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-ink-300 hover:text-brand-400 transition-colors"
                >
                  Sign In
                </Link>
                <span className="text-ink-600">|</span>
                <Link
                  href="/auth/register"
                  className="text-ink-300 hover:text-brand-400 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-ink-950/95 backdrop-blur-md shadow-md"
            : "bg-white dark:bg-ink-950"
        } border-b border-ink-200 dark:border-ink-800`}
      >
        {/* Logo + Search + Actions */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <span className="font-display text-2xl font-black text-ink-950 dark:text-white leading-none">
                AtoZ
              </span>
              <span className="font-display text-2xl font-black text-brand-500 leading-none ml-1">
                Blogs
              </span>
              <span className="absolute -top-1 -right-2 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
            </div>
          </Link>

          {/* Search bar */}
          <div
            className={`hidden md:flex items-center transition-all duration-300 ${searchOpen ? "flex-1 max-w-xl" : "max-w-xs flex-1"}`}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search articles, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4 text-ink-600 dark:text-ink-300" />
              ) : (
                <Moon className="w-4 h-4 text-ink-600 dark:text-ink-300" />
              )}
            </button>

            {user ? (
              <>
                <Link
                  href="/bookmarks"
                  className="hidden md:flex p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                >
                  <BookmarkIcon className="w-4 h-4 text-ink-600 dark:text-ink-300" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
                  >
                    <div className="relative w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {user?.image ? (
                        <NextImage
                          src={user.image}
                          alt={user.name || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3 text-ink-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-ink-900 rounded-xl shadow-xl border border-ink-200 dark:border-ink-700 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800">
                        <p className="font-semibold text-sm text-ink-900 dark:text-ink-100">
                          {user?.name}
                        </p>
                        <p className="text-xs text-ink-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
                        >
                          <User className="w-4 h-4" /> My Dashboard
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
                          >
                            <Settings className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        {["admin", "editor", "author"].includes(
                          user?.role || "",
                        ) && (
                          <Link
                            href="/admin/posts/new"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
                          >
                            <Pencil className="w-4 h-4" /> Write Article
                          </Link>
                        )}
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Category navigation */}
        <div className="border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-950">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.slug}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    isActive(cat.slug)
                      ? "border-brand-500 text-brand-600 dark:text-brand-400"
                      : "border-transparent text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:border-ink-300"
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-ink-950 md:hidden overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-ink-200 dark:border-ink-800">
            <span className="font-display text-xl font-black">
              AtoZ<span className="text-brand-500">Blogs</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg bg-ink-100 dark:bg-ink-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-3 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <nav className="space-y-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.slug}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(cat.slug)
                      ? "bg-brand-50 dark:bg-brand-950 text-brand-600"
                      : "text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </nav>
            {!user && (
              <div className="mt-6 flex gap-3">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-3 text-center font-semibold border border-ink-300 dark:border-ink-700 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-3 text-center font-semibold bg-brand-500 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
