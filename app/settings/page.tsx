"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  Lock,
  Trash2,
  LogOut,
  Bell,
  Shield,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [section, setSection] = useState("security");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    image: "",
    email: "",
    role: "user",
  });
  const [isOAuth, setIsOAuth] = useState(false);
  const [notifications, setNotifications] = useState({
    comments: true,
    newsletter: true,
    updates: false,
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setNotifications(data);
        });

      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfile(data);
            setIsOAuth(!!data.isOAuth);
          }
        });
    }
  }, [status]);

  const updateNotifications = async (newPrefs: typeof notifications) => {
    setNotifications(newPrefs);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      toast.success("Preferences updated");
    } catch (e) {
      toast.error("Failed to save preferences");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        toast.success("Profile updated");
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Error updating profile");
    }
    setSaving(false);
  };

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPass.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Password changed successfully!");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed to change password");
    }
  };

  const navItems = [
    { id: "profile", label: "Profile", icon: Eye },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-ink-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-ink-900 dark:text-white mb-8">
          Account Settings
        </h1>
        <div className="flex gap-6">
          {/* Nav */}
          <div className="w-44 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-500 transition-all text-left ${
                    section === id
                      ? "bg-brand-50 dark:bg-brand-950 text-brand-600"
                      : "text-ink-600 dark:text-ink-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  } ${id === "danger" ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {section === "profile" && (
              <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700">
                <h2 className="font-sans font-700 text-ink-900 dark:text-white text-lg mb-6">
                  Profile Information
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-stone-100 dark:bg-ink-800 border-2 border-stone-100 dark:border-ink-700">
                      {profile.image ? (
                        <NextImage
                          src={profile.image}
                          alt={profile.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-ink-300">
                          {profile.name?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="btn-secondary text-xs cursor-pointer">
                        Change Photo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            const t = toast.loading("Uploading...");
                            try {
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                body: fd,
                              });
                              const data = await res.json();
                              if (data.media?.secureUrl) {
                                setProfile((p) => ({
                                  ...p,
                                  image: data.media.secureUrl,
                                }));
                                toast.success("Photo uploaded", { id: t });
                              } else {
                                toast.error("Upload failed", { id: t });
                              }
                            } catch {
                              toast.error("Upload error", { id: t });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-stone-100 dark:bg-ink-950 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans text-ink-400 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-ink-400 mt-1">
                      Email cannot be changed manually. Contact support.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                      Biography
                    </label>
                    <textarea
                      value={profile.bio || ""}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, bio: e.target.value }))
                      }
                      rows={3}
                      className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {section === "security" && (
              <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700">
                <h2 className="font-sans font-700 text-ink-900 dark:text-white text-lg mb-6">
                  Security Settings
                </h2>

                {isOAuth ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <p className="text-sm font-sans text-blue-700 dark:text-blue-300">
                      You are signed in via a third-party provider (Google or
                      GitHub). Password management is handled by your provider.
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-sans font-600 text-ink-800 dark:text-ink-200 text-sm mb-4">
                      Change Password
                    </h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      {[
                        {
                          label: "Current Password",
                          value: oldPass,
                          setter: setOldPass,
                          show: showOld,
                          toggle: () => setShowOld(!showOld),
                        },
                        {
                          label: "New Password",
                          value: newPass,
                          setter: setNewPass,
                          show: showNew,
                          toggle: () => setShowNew(!showNew),
                        },
                        {
                          label: "Confirm New Password",
                          value: confirmPass,
                          setter: setConfirmPass,
                          show: showNew,
                          toggle: () => setShowNew(!showNew),
                        },
                      ].map(({ label, value, setter, show, toggle }) => (
                        <div key={label}>
                          <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                            {label}
                          </label>
                          <div className="relative">
                            <input
                              type={show ? "text" : "password"}
                              value={value}
                              onChange={(e) => setter(e.target.value)}
                              required
                              className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 pr-10 text-sm font-sans focus:outline-none focus:border-brand-400"
                            />
                            <button
                              type="button"
                              onClick={toggle}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                            >
                              {show ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors disabled:opacity-70"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saving ? "Changing..." : "Change Password"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {section === "notifications" && (
              <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700">
                <h2 className="font-sans font-700 text-ink-900 dark:text-white text-lg mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      key: "comments",
                      label: "Comment Replies",
                      desc: "Notify when someone replies to your comment",
                    },
                    {
                      key: "newsletter",
                      label: "Newsletter",
                      desc: "Receive weekly newsletter with top stories",
                    },
                    {
                      key: "updates",
                      label: "Product Updates",
                      desc: "Notify about new features and improvements",
                    },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-stone-50 dark:bg-ink-800 rounded-xl"
                    >
                      <div>
                        <p className="font-sans font-600 text-sm text-ink-800 dark:text-ink-200">
                          {label}
                        </p>
                        <p className="font-sans text-xs text-ink-400 mt-0.5">
                          {desc}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updateNotifications({
                            ...notifications,
                            [key]:
                              !notifications[key as keyof typeof notifications],
                          })
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-brand-500" : "bg-stone-300 dark:bg-stone-600"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "privacy" && (
              <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700">
                <h2 className="font-sans font-700 text-ink-900 dark:text-white text-lg mb-4">
                  Privacy & Data
                </h2>
                <div className="space-y-4 text-sm font-sans text-ink-600 dark:text-ink-400">
                  <p>
                    We take your privacy seriously. Here&apos;s what we collect
                    and why:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      Email address — for account management and notifications
                    </li>
                    <li>
                      Reading history — to personalise your feed (stored
                      locally)
                    </li>
                    <li>Comments and likes — to enable community features</li>
                  </ul>
                  <a
                    href="/privacy"
                    className="text-brand-500 hover:text-brand-600 font-600"
                  >
                    Read our full Privacy Policy →
                  </a>
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button
                      className="text-sm font-600 text-ink-600 hover:text-brand-500 transition-colors"
                      onClick={() => toast("Data export coming soon")}
                    >
                      Request Data Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {section === "danger" && (
              <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-red-200 dark:border-red-900">
                <h2 className="font-sans font-700 text-red-600 text-lg mb-6">
                  Danger Zone
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 dark:bg-ink-800 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-sans font-600 text-sm text-ink-800 dark:text-ink-200">
                        Sign Out
                      </p>
                      <p className="font-sans text-xs text-ink-400">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-200 dark:bg-stone-700 text-ink-700 dark:text-ink-300 rounded-lg text-sm font-600 hover:bg-stone-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-sans font-600 text-sm text-red-700 dark:text-red-400">
                        Delete Account
                      </p>
                      <p className="font-sans text-xs text-red-400">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        toast.error("Contact admin to delete your account")
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-600 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
