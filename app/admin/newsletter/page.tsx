"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Users,
  Send,
  Download,
  Trash2,
  Eye,
  Plus,
  CheckCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface ISubscriber {
  _id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: string;
  source?: string;
}

// Mock campaigns for now as they require a dedicated table later
const campaigns = [
  {
    id: "c1",
    subject: "Weekly Digest: Top AI Stories This Week",
    sentAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    recipients: 12400,
    openRate: 38.2,
    clickRate: 6.4,
    status: "sent",
  },
];

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState<
    "subscribers" | "campaigns" | "compose"
  >("subscribers");
  const [subscribers, setSubscribers] = useState<ISubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscribers?search=${search}`);
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data);
      }
    } catch (error) {
      toast.error("Error fetching subscribers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscribers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSubscribers]);

  const del = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Subscriber removed");
        fetchSubscribers();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSend = async () => {
    if (!subject || !body) return toast.error("Subject and body are required");
    setIsSending(true);
    // In a real app, this would call an API like /api/newsletter/send
    await new Promise((r) => setTimeout(r, 2000));
    toast.success(`Newsletter will be sent to subscribers!`);
    setIsSending(false);
    setSubject("");
    setBody("");
    setActiveTab("campaigns");
  };

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink-900 dark:text-ink-50">
            Newsletter
          </h1>
          <p className="text-sm text-ink-500 font-sans mt-0.5">
            Manage subscribers and email campaigns
          </p>
        </div>
        <button
          onClick={() => setActiveTab("compose")}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Subscribers",
            value: subscribers.length,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Active",
            value: activeCount,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Open Rate",
            value: "38.2%",
            icon: Eye,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-950",
          },
          {
            label: "Click Rate",
            value: "6.4%",
            icon: Send,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-950",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-4"
          >
            <div
              className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center mb-3`}
            >
              <Icon size={16} />
            </div>
            <p className="text-xl font-headline font-700 text-ink-900 dark:text-ink-50">
              {value}
            </p>
            <p className="text-xs font-sans text-ink-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-lg w-fit">
        {(["subscribers", "campaigns", "compose"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-sans font-500 capitalize transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm"
                : "text-ink-500 hover:text-ink-700 dark:hover:text-ink-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "subscribers" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscribers..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-lg text-sm font-sans"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950">
                  {["Email", "Name", "Status", "Source", "Subscribed", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-sans font-600 text-ink-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center text-ink-400 animate-pulse"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr
                      key={sub._id}
                      className="hover:bg-ink-50 dark:hover:bg-ink-800/30"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-sans text-ink-800 dark:text-ink-200">
                          {sub.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-sans text-ink-600 dark:text-ink-400">
                          {sub.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-sans ${sub.isActive ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-500"}`}
                        >
                          {sub.isActive ? "Active" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-sans text-ink-500">
                          {sub.source || "web"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-sans text-ink-500">
                          {formatDate(sub.subscribedAt, "short")}
                        </span>
                      </td>
                      <td className="px-4 py-3 italic">
                        <button
                          onClick={() => del(sub._id)}
                          className="text-ink-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="px-2 py-0.5 text-xs font-sans font-600 rounded bg-green-100 text-green-700 uppercase">
                    {campaign.status}
                  </span>
                  <h3 className="font-sans font-600 text-ink-900 dark:text-ink-100 mt-2">
                    {campaign.subject}
                  </h3>
                  <p className="text-xs font-sans text-ink-500 mt-1">
                    Sent {formatDate(campaign.sentAt)} ·{" "}
                    {campaign.recipients.toLocaleString()} recipients
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "compose" && (
        <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-6 space-y-5 max-w-3xl">
          <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100">
            Compose Newsletter
          </h2>
          <div>
            <label className="block text-xs font-sans font-600 text-ink-500 uppercase mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-ink-50 dark:bg-ink-800 border rounded-lg px-4 py-3 text-sm focus:border-brand-400 outline-none"
              placeholder="Subject..."
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-600 text-ink-500 uppercase mb-2">
              Body (HTML allowed)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full bg-ink-50 dark:bg-ink-800 border rounded-lg px-4 py-3 text-sm focus:border-brand-400 outline-none resize-none"
              placeholder="Newsletter content..."
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="btn-brand w-full flex items-center justify-center gap-2 py-3"
          >
            {isSending ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            {isSending ? "Sending..." : "Send Newsletter"}
          </button>
        </div>
      )}
    </div>
  );
}
