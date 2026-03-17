import type { Metadata } from "next";
import { Download, FileText, Image as ImageIcon, Mail } from "lucide-react";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Press & Media Kit",
  description: `Resources, brand assets, and contact information for journalists and media outlets from ${config.siteName}.`,
};

export default function PressPage() {
  const assets = [
    { name: "Brand Guidelines (PDF)", size: "4.2 MB", icon: FileText },
    { name: "Logo Pack (SVG, PNG, EPS)", size: "12.8 MB", icon: ImageIcon },
    { name: "Executive Headshots", size: "24.5 MB", icon: ImageIcon },
    { name: "Platform Screenshots", size: "15.1 MB", icon: ImageIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Content */}
        <div className="flex-1">
          <h1 className="font-heading text-4xl md:text-6xl font-black text-ink-950 dark:text-white mb-8">
            Press & <span className="text-brand-500">Media</span> Kit.
          </h1>
          <p className="text-xl text-ink-600 dark:text-ink-400 font-body mb-10 leading-relaxed">
            Welcome to the {config.siteName} media center. Here you&apos;ll find
            our latest announcements, brand assets, and contact details for our
            media relations team.
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-heading prose-headings:font-bold">
            <h2>About {config.siteName}</h2>
            <p>
              {config.siteName} is a leading digital media platform dedicated to
              providing in-depth analysis and breaking updates on technology,
              business, and global trends. Since its founding, it has become a
              trusted voice for millions of readers worldwide who seek context
              beyond the headlines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {assets.map((asset, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-stone-50 dark:bg-ink-900 border border-stone-100 dark:border-stone-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-ink-800 flex items-center justify-center text-brand-500 border border-stone-100 dark:border-stone-700">
                    <asset.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-ink-900 dark:text-white text-sm">
                      {asset.name}
                    </h3>
                    <p className="text-xs text-ink-400 font-sans mt-0.5">
                      {asset.size}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-ink-800 transition-colors text-ink-400 hover:text-brand-500">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Sidebar */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-32 space-y-8">
            <div className="p-8 rounded-3xl bg-ink-900 text-white shadow-xl">
              <h3 className="font-heading text-2xl font-bold mb-6">
                Media Inquiries
              </h3>
              <p className="text-ink-400 mb-8 font-body leading-relaxed">
                For interview requests, expert commentary, or further
                information, please contact our media relations team.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-ink-800 pb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm">
                      Media Relations
                    </h4>
                    <p className="text-sm text-ink-400">press@atozblog.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm">
                      Partnerships
                    </h4>
                    <p className="text-sm text-ink-400">
                      partners@atozblog.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-heading text-xl font-bold text-ink-900 dark:text-white mb-4">
                Fast Facts
              </h3>
              <ul className="space-y-4 font-sans text-sm">
                <li className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <span className="text-ink-400">Founded</span>
                  <span className="text-ink-900 dark:text-white font-bold">
                    2023
                  </span>
                </li>
                <li className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <span className="text-ink-400">Monthly Readers</span>
                  <span className="text-ink-900 dark:text-white font-bold">
                    2.5M+
                  </span>
                </li>
                <li className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <span className="text-ink-400">Headquarters</span>
                  <span className="text-ink-900 dark:text-white font-bold">
                    Remote-First
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-ink-400">Platform</span>
                  <span className="text-ink-900 dark:text-white font-bold">
                    Dynamic Digital media
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
