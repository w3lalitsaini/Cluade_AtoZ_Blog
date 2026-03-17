"use client";

import { useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import {
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Edit,
  Trash2,
  Mail,
  Eye,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "editor" | "author" | "user";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  postsCount?: number;
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  editor:
    "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  author: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  user: "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=${roleFilter}&search=${search}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const updateStatus = async (id: string, updates: Partial<IUser>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success("User updated");
        fetchUsers();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const roleCounts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    editor: users.filter((u) => u.role === "editor").length,
    author: users.filter((u) => u.role === "author").length,
    user: users.filter((u) => u.role === "user").length,
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink-900 dark:text-ink-50">
            Users
          </h1>
          <p className="text-sm text-ink-500 font-sans mt-0.5">
            {users.length} registered users
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors">
          <Plus size={16} /> Invite User
        </button>
      </div>

      <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-lg w-fit flex-wrap">
        {["all", "admin", "editor", "author", "user"].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-1.5 rounded-md text-sm font-sans font-500 capitalize transition-all ${
              roleFilter === role
                ? "bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm"
                : "text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg text-sm font-sans text-ink-800 dark:text-ink-200"
          />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-sans text-ink-500">
              {selected.length} selected
            </span>
            <button className="px-3 py-1.5 text-xs font-sans font-600 text-red-600 bg-red-50 dark:bg-red-950 rounded-lg">
              Batch Action
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === users.length && users.length > 0
                    }
                    onChange={() =>
                      setSelected(
                        selected.length === users.length
                          ? []
                          : users.map((u) => u._id),
                      )
                    }
                    className="rounded border-ink-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-sans font-600 text-ink-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-sans font-600 text-ink-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-sans font-600 text-ink-500 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-sans font-600 text-ink-500 uppercase tracking-wider hidden xl:table-cell">
                  Joined
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-ink-400 animate-pulse"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors ${selected.includes(user._id) ? "bg-brand-50 dark:bg-brand-950/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(user._id)}
                        onChange={() => toggleSelect(user._id)}
                        className="rounded border-ink-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {user.image ? (
                            <NextImage
                              src={user.image}
                              alt={user.name}
                              width={36}
                              height={36}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center font-bold text-ink-600">
                              {user.name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-sans font-600 text-ink-900 dark:text-ink-100">
                              {user.name}
                            </span>
                            {user.isVerified && (
                              <UserCheck size={12} className="text-blue-500" />
                            )}
                          </div>
                          <span className="text-xs font-sans text-ink-500">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-500 capitalize ${roleColors[user.role]}`}
                      >
                        {user.role === "admin" && <Shield size={10} />}
                        {user.role === "editor" && <Star size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-sans ${user.isActive ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-ink-400"}`}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-sm font-sans text-ink-500">
                        {formatDate(user.createdAt, "short")}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === user._id ? null : user._id)
                        }
                        className="p-1.5 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 rounded transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenu === user._id && (
                        <div className="absolute right-4 top-full mt-1 w-44 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg shadow-lg z-10 overflow-hidden">
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
                            onClick={() => setOpenMenu(null)}
                          >
                            <Eye size={14} /> View Profile
                          </button>
                          <button
                            onClick={() => {
                              updateStatus(user._id, {
                                isActive: !user.isActive,
                              });
                              setOpenMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
                          >
                            {user.isActive ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}{" "}
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => {
                              del(user._id);
                              setOpenMenu(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-sans text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
