"use client";
import { useState, useEffect } from "react";
import {
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MessageSquare,
  MoreVertical,
  ChevronRight,
  User,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/admin/messages"
          : `/api/admin/messages?type=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Marked as ${status}`);
        fetchMessages();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Message deleted");
        fetchMessages();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-ink-900 dark:text-white">
            Messages & Inquiries
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Manage contact form and advertising requests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-ink-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-ink-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="contact">Contact</option>
            <option value="advertising">Advertising</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-ink-900 rounded-2xl animate-pulse"
            />
          ))
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-ink-900 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 font-sans">
            <Mail className="w-12 h-12 text-ink-200 dark:text-ink-700 mx-auto mb-4" />
            <p className="text-ink-500 dark:text-ink-400">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className={`p-6 bg-white dark:bg-ink-900 rounded-2xl border transition-all ${
                msg.status === "unread"
                  ? "border-brand-200 dark:border-brand-900 shadow-sm"
                  : "border-stone-100 dark:border-stone-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      msg.type === "advertising"
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                    }`}
                  >
                    {msg.type === "advertising" ? (
                      <Tag className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-sans font-bold text-ink-900 dark:text-white">
                        {msg.name}
                      </h3>
                      <span className="text-xs text-ink-400 font-sans">
                        &bull;
                      </span>
                      <span className="text-xs text-ink-400 font-sans">
                        {msg.email}
                      </span>
                      {msg.status === "unread" && (
                        <span className="px-2 py-0.5 bg-brand-500 text-white text-[10px] uppercase font-bold rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-sans font-700 text-ink-700 dark:text-ink-200">
                        {msg.subject}
                      </p>
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-ink-800 text-ink-500 text-[10px] uppercase font-bold rounded-full">
                        {msg.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateStatus(
                        msg._id,
                        msg.status === "unread" ? "read" : "unread",
                      )
                    }
                    className="p-2 hover:bg-stone-50 dark:hover:bg-ink-800 rounded-lg transition-colors text-ink-400"
                    title={
                      msg.status === "unread"
                        ? "Mark as read"
                        : "Mark as unread"
                    }
                  >
                    {msg.status === "unread" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-400"
                    title="Delete message"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer font-sans bg-stone-50 dark:bg-ink-800/50 p-4 rounded-xl leading-relaxed">
                {msg.message}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-ink-400 font-sans uppercase tracking-wider font-bold">
                  Received {new Date(msg.createdAt).toLocaleDateString()} at{" "}
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                  className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1"
                >
                  Reply via Email <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
