"use client";
import { Bell, Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface Props {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;
  onMenuClick?: () => void;
}

export function AdminHeader({ user, onMenuClick }: Props) {
  return (
    <header className="h-16 bg-white dark:bg-ink-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-ink-600 dark:text-ink-400" />
        </button>
        <div className="relative flex-1 max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="search"
            placeholder="Search posts, users..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          <Bell className="w-5 h-5 text-ink-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200">
              {user?.name}
            </p>
            <p className="font-sans text-xs text-ink-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
