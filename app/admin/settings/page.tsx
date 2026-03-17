"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Globe,
  Palette,
  Mail,
  Code,
  Share2,
  Search,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

type Settings = Record<string, any>;

const tabs = [
  { id: "general", label: "General", icon: Globe },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "seo", label: "SEO", icon: Search },
  { id: "ads", label: "Ad Codes", icon: Code },
  { id: "email", label: "Email", icon: Mail },
  { id: "social", label: "Social", icon: Share2 },
];

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const set = useCallback(
    (key: string, val: any) => setSettings((prev) => ({ ...prev, [key]: val })),
    [],
  );
  const setNested = useCallback(
    (key: string, subKey: string, val: any) =>
      setSettings((prev) => ({
        ...prev,
        [key]: { ...prev[key], [subKey]: val },
      })),
    [],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("Settings saved successfully!");
      else toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );

  const inputCls =
    "w-full bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-lg px-4 py-2.5 text-sm font-sans text-ink-800 dark:text-ink-200 placeholder-ink-400 focus:outline-none focus:border-brand-400 transition-colors";
  const labelCls =
    "block text-xs font-sans font-700 uppercase tracking-wider text-ink-500 mb-1.5";

  function Field({
    label,
    field,
    type = "text",
    placeholder = "",
    hint = "",
  }: {
    label: string;
    field: string;
    type?: string;
    placeholder?: string;
    hint?: string;
  }) {
    return (
      <div className="mt-4">
        <label className={labelCls}>{label}</label>
        <input
          type={type}
          value={settings[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
        {hint && <p className="text-xs text-ink-400 font-sans mt-1">{hint}</p>}
      </div>
    );
  }

  function TextArea({
    label,
    field,
    placeholder = "",
    hint = "",
    rows = 3,
  }: {
    label: string;
    field: string;
    placeholder?: string;
    hint?: string;
    rows?: number;
  }) {
    return (
      <div className="mt-4">
        <label className={labelCls}>{label}</label>
        <textarea
          value={settings[field] || ""}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputCls} resize-none`}
        />
        {hint && <p className="text-xs text-ink-400 font-sans mt-1">{hint}</p>}
      </div>
    );
  }

  function Toggle({
    label,
    field,
    hint = "",
  }: {
    label: string;
    field: string;
    hint?: string;
  }) {
    const checked = !!settings[field];
    return (
      <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-lg mt-4">
        <div>
          <p className="text-sm font-sans font-600 text-ink-800 dark:text-ink-200">
            {label}
          </p>
          {hint && <p className="text-xs text-ink-400 font-sans">{hint}</p>}
        </div>
        <button
          onClick={() => set(field, !checked)}
          className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-600"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-ink-50">
            Site Settings
          </h1>
          <p className="text-sm text-ink-500 font-sans mt-1">
            Configure your website — changes save in real time
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white px-4 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-48 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-500 transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
                      : "text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl p-6">
          {activeTab === "general" && (
            <div className="space-y-2">
              <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100 text-lg border-b border-ink-100 dark:border-ink-800 pb-3">
                General Settings
              </h2>
              <Field label="Site Name" field="siteName" />
              <Field
                label="Site URL"
                field="siteUrl"
                hint="Ex: https://atozblog.com"
              />
              <TextArea
                label="Site Description"
                field="siteDescription"
                rows={3}
              />
              <Field
                label="Posts Per Page"
                field="postsPerPage"
                type="number"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Toggle label="Maintenance Mode" field="maintenanceMode" />
                <Toggle label="Allow Comments" field="allowComments" />
                <Toggle label="Moderate Comments" field="moderateComments" />
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-2">
              <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100 text-lg border-b border-ink-100 dark:border-ink-800 pb-3">
                {" "}
                Appearance Settings{" "}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Primary Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.themeColor || "#f97316"}
                      onChange={(e) => set("themeColor", e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border dark:border-ink-700"
                    />
                    <input
                      value={settings.themeColor || "#f97316"}
                      onChange={(e) => set("themeColor", e.target.value)}
                      className="flex-1 bg-ink-50 dark:bg-ink-800 border rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Dark Mode Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.darkThemeColor || "#ea580c"}
                      onChange={(e) => set("darkThemeColor", e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border dark:border-ink-700"
                    />
                    <input
                      value={settings.darkThemeColor || "#ea580c"}
                      onChange={(e) => set("darkThemeColor", e.target.value)}
                      className="flex-1 bg-ink-50 dark:bg-ink-800 border rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
              <Field
                label="Logo URL"
                field="logo"
                hint="Upload image to Media and paste URL here"
              />
              <Field label="Favicon URL" field="favicon" />
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-2">
              <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100 text-lg border-b border-ink-100 dark:border-ink-800 pb-3">
                {" "}
                Default SEO{" "}
              </h2>
              <Field label="Default Meta Title" field="defaultMetaTitle" />
              <TextArea
                label="Default Meta Description"
                field="defaultMetaDescription"
              />
              <Field
                label="Google Analytics ID"
                field="googleAnalyticsId"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          )}

          {activeTab === "ads" && (
            <div className="space-y-2">
              <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100 text-lg border-b border-ink-100 dark:border-ink-800 pb-3">
                {" "}
                Global Ad Scripts{" "}
              </h2>
              <Field
                label="AdSense Client ID"
                field="adsenseClientId"
                placeholder="ca-pub-XXXXXXXXXXXXX"
              />
              <TextArea
                label="Header Scripts"
                field="headerScripts"
                rows={5}
                hint="Wait, this will be placed in <head>"
              />
              <TextArea
                label="Footer Scripts"
                field="footerScripts"
                rows={5}
                hint="Placed before </body>"
              />
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-2">
              <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100 text-lg border-b border-ink-100 dark:border-ink-800 pb-3">
                {" "}
                SMTP Configuration{" "}
              </h2>
              <p className="text-xs text-ink-500 mb-4">
                {" "}
                Note: Some settings must be configured via Environment Variables
                for security.{" "}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mt-4">
                  <label className={labelCls}>SMTP Host</label>
                  <input
                    value={settings.emailSettings?.host || ""}
                    onChange={(e) =>
                      setNested("emailSettings", "host", e.target.value)
                    }
                    className={inputCls}
                  />
                </div>
                <div className="mt-4">
                  <label className={labelCls}>SMTP Port</label>
                  <input
                    type="number"
                    value={settings.emailSettings?.port || 587}
                    onChange={(e) =>
                      setNested(
                        "emailSettings",
                        "port",
                        parseInt(e.target.value),
                      )
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>SMTP From Email</label>
                <input
                  value={settings.emailSettings?.from || ""}
                  onChange={(e) =>
                    setNested("emailSettings", "from", e.target.value)
                  }
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-2">
              <h2 className="font-sans font-700 text-ink-900 dark:text-ink-100 text-lg border-b border-ink-100 dark:border-ink-800 pb-3">
                {" "}
                Social Profiles{" "}
              </h2>
              {["twitter", "facebook", "instagram", "youtube", "linkedin"].map(
                (key) => (
                  <div key={key} className="mt-4">
                    <label className={`${labelCls} capitalize`}>{key}</label>
                    <input
                      value={settings.socialLinks?.[key] || ""}
                      onChange={(e) =>
                        setNested("socialLinks", key, e.target.value)
                      }
                      className={inputCls}
                      placeholder={`https://www.${key}.com/yourpage`}
                    />
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
