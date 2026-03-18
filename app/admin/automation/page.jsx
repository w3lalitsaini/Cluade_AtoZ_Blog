"use client";
import React, { useState, useEffect, useCallback } from "react";
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RefreshCcw, 
  Clock, 
  Search,
  ChevronRight,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function AutomationMonitor() {
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, warn: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/automation/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLogs(data.logs);
      }
    } catch (error) {
      toast.error("Failed to load automation data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRunNow = async () => {
    if (!confirm("Are you sure you want to trigger the full automation cycle now?")) return;
    
    setRunning(true);
    const toastId = toast.loading("Starting automation engine...");
    
    try {
      const res = await fetch("/api/admin/automation/run", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Success! Processed ${data.summary.total} keywords.`, { id: toastId });
        fetchStats();
      } else {
        toast.error(`Automation failed: ${data.error}`, { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during automation trigger", { id: toastId });
    } finally {
      setRunning(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.source.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-ink-900 dark:text-white">
            Automation Monitor
          </h1>
          <p className="font-sans text-ink-500 mt-1">
            Track and manage your autonomous blog generation system.
          </p>
        </div>
        <button
          onClick={handleRunNow}
          disabled={running}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
        >
          {running ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {running ? "Running Cycle..." : "Run Automation Now"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Today", value: stats.total, icon: Zap, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Successful", value: stats.success, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Failed", value: stats.failed, icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "Warnings", value: stats.warn, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-ink-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{s.label}</p>
                <p className="text-2xl font-black text-ink-900 dark:text-white leading-tight">
                  {s.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" />
            <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/50 text-ink-400 font-bold uppercase text-[10px] tracking-widest">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      log.level === 'error' ? 'bg-red-100 text-red-700' :
                      log.level === 'warn' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-ink-600 dark:text-ink-400 whitespace-nowrap">
                    {log.source}
                  </td>
                  <td className="px-6 py-4 text-ink-900 dark:text-ink-200">
                    {log.message}
                    {log.metadata?.keyword && (
                      <span className="block text-xs text-ink-400 mt-0.5">Keyword: {log.metadata.keyword}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ink-400 whitespace-nowrap">
                    {format(new Date(log.timestamp), "MMM d, HH:mm:ss")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors text-ink-400">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink-400 italic">
                    No activity logs found for your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 text-center">
          <button 
            onClick={fetchStats}
            className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center justify-center gap-1 mx-auto"
          >
            <RefreshCcw className="w-3 h-3" /> Refresh Logs
          </button>
        </div>
      </div>
    </div>
  );
}
