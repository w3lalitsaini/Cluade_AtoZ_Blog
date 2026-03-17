"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart2,
  Settings,
  Image,
  DollarSign,
  Mail,
  Tag,
  MessageSquare,
  Cpu,
  FolderOpen,
  PlusCircle,
  Globe,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "editor", "author"],
  },
  {
    label: "All Posts",
    href: "/admin/posts",
    icon: FileText,
    roles: ["admin", "editor", "author"],
  },
  {
    label: "New Post",
    href: "/admin/posts/new",
    icon: PlusCircle,
    roles: ["admin", "editor", "author"],
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
    roles: ["admin", "editor"],
  },
  { label: "Tags", href: "/admin/tags", icon: Tag, roles: ["admin", "editor"] },
  {
    label: "Comments",
    href: "/admin/comments",
    icon: MessageSquare,
    roles: ["admin", "editor"],
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: Image,
    roles: ["admin", "editor", "author"],
  },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["admin"] },
  { label: "Ads", href: "/admin/ads", icon: DollarSign, roles: ["admin"] },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    roles: ["admin", "editor"],
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    roles: ["admin"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart2,
    roles: ["admin"],
  },
  {
    label: "AI Assistant",
    href: "/admin/ai-assistant",
    icon: Cpu,
    roles: ["admin", "editor", "author"],
  },
  { label: "SEO", href: "/admin/seo", icon: Globe, roles: ["admin", "editor"] },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

interface Props {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ role, isOpen, onClose }: Props) {
  const pathname = usePathname();

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`fixed lg:relative inset-y-0 left-0 w-64 bg-ink-950 text-white flex flex-col z-50 transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } overflow-y-auto scrollbar-thin`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="lg:hidden absolute right-4 top-4 p-2 rounded-lg bg-ink-900 border border-ink-800 text-ink-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-ink-800 flex-shrink-0">
        <Link href="/" className="font-heading text-xl font-black">
          A<span className="text-brand-500">to</span>Z
          <span className="font-sans font-light text-ink-400 ml-1 text-base">
            Blogs
          </span>
        </Link>
        <span className="ml-auto bg-brand-500 text-white text-xs font-sans font-bold px-2 py-0.5 rounded-full uppercase">
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {filtered.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-500/20 text-brand-400 border-l-2 border-brand-500 pl-[calc(0.75rem-2px)]"
                  : "text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-brand-400" : "text-ink-500"}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-ink-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink-400 hover:text-white text-sm font-sans transition-colors"
        >
          <Globe className="w-4 h-4" />
          View Site
        </Link>
      </div>
    </aside>
  );
}
