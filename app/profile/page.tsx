"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Edit3,
  Save,
  Twitter,
  Linkedin,
  Globe,
  Loader2,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    image: "",
    socialLinks: { twitter: "", linkedin: "", website: "" },
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setForm({
            name: data.name || "",
            bio: data.bio || "",
            image: data.image || "",
            socialLinks: data.socialLinks || {
              twitter: "",
              linkedin: "",
              website: "",
            },
          });
        });
    }
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setProfile({ ...profile, ...updated });
      setEditing(false);
      toast.success("Profile updated!");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "atozblogs/profiles");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, image: data.media.secureUrl });
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-ink-950 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-700 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="relative group">
              {editing ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-brand-100 group">
                  <Image
                    src={form.image || "/placeholder-avatar.png"}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                  />
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] text-white font-700 uppercase">
                          Change
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              ) : profile.image ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-brand-100">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-brand-100">
                  {profile.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-ink-500 font-sans text-sm mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
              <span className="mt-2 inline-block text-xs font-sans font-700 uppercase tracking-wider px-3 py-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-full">
                {profile.role}
              </span>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 flex items-center gap-2 text-sm font-sans font-600 text-brand-500 hover:text-brand-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {editing && (
            <div className="mt-6 space-y-4 border-t border-stone-100 dark:border-stone-800 pt-6">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                  Profile Photo
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
                  />
                  <label className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 px-4 py-2.5 rounded-lg text-sm font-sans font-600 transition-colors cursor-pointer disabled:opacity-70">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Local"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    key: "twitter",
                    label: "Twitter/X",
                    icon: Twitter,
                    placeholder: "https://twitter.com/...",
                  },
                  {
                    key: "linkedin",
                    label: "LinkedIn",
                    icon: Linkedin,
                    placeholder: "https://linkedin.com/...",
                  },
                  {
                    key: "website",
                    label: "Website",
                    icon: Globe,
                    placeholder: "https://yoursite.com",
                  },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-1">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                      <input
                        value={(form.socialLinks as any)[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            socialLinks: {
                              ...form.socialLinks,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={placeholder}
                        className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-9 pr-3 py-2.5 text-sm font-sans focus:outline-none focus:border-brand-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
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
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-sans font-600 text-ink-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bio display when not editing */}
        {!editing && profile.bio && (
          <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-sm">
            <h2 className="font-sans font-700 text-ink-700 dark:text-ink-300 text-sm uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-ink-600 dark:text-ink-400 font-sans text-sm leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Social Links */}
        {!editing &&
          (profile.socialLinks?.twitter ||
            profile.socialLinks?.linkedin ||
            profile.socialLinks?.website) && (
            <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-sm">
              <h2 className="font-sans font-700 text-ink-700 dark:text-ink-300 text-sm uppercase tracking-wider mb-3">
                Social Links
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks?.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-brand-50 dark:hover:bg-brand-900 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-brand-50 dark:hover:bg-brand-900 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks?.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-brand-50 dark:hover:bg-brand-900 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

        {/* Quick Links */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-sm">
          <h2 className="font-sans font-700 text-ink-700 dark:text-ink-300 text-sm uppercase tracking-wider mb-3">
            Quick Links
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/saved"
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-brand-50 transition-colors"
            >
              📖 Saved Posts
            </a>
            <a
              href="/settings"
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-sans text-ink-700 dark:text-ink-300 hover:bg-brand-50 transition-colors"
            >
              ⚙️ Account Settings
            </a>
            {(session?.user as any)?.role === "admin" && (
              <a
                href="/admin/dashboard"
                className="px-4 py-2 bg-brand-50 dark:bg-brand-900 rounded-lg text-sm font-sans text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition-colors"
              >
                🛠 Admin Dashboard
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
