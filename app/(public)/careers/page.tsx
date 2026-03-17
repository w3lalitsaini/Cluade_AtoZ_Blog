import type { Metadata } from "next";
import { Briefcase, Zap, Globe, Heart } from "lucide-react";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join the team at ${config.siteName} and help us build the future of news and insights.`,
};

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Tech Journalist",
      department: "Editorial",
      location: "Remote / NY",
    },
    {
      title: "Frontend Engineer (Next.js)",
      department: "Engineering",
      location: "Remote",
    },
    {
      title: "Social Media Manager",
      department: "Marketing",
      location: "London / Remote",
    },
    { title: "Data Analyst", department: "Strategy", location: "Remote" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="font-heading text-4xl md:text-6xl font-black text-ink-950 dark:text-white mb-6">
          Build the <span className="text-brand-500">Future</span> of News.
        </h1>
        <p className="text-xl text-ink-600 dark:text-ink-400 font-body leading-relaxed">
          At {config.siteName}, we&apos;re looking for curious minds,
          storytellers, and builders who are passionate about bringing clarity
          to a complex world.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          {
            icon: Zap,
            title: "Stay Fast",
            text: "We move at the speed of news, iterating and innovating constantly.",
          },
          {
            icon: Globe,
            title: "Global Impact",
            text: "Our stories reach millions of readers across every continent.",
          },
          {
            icon: Heart,
            title: "People First",
            text: "Work with a diverse, inclusive team that values your growth.",
          },
          {
            icon: Briefcase,
            title: "Flexible Work",
            text: "We embrace a remote-first culture with global hub access.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl bg-stone-50 dark:bg-ink-900 border border-stone-100 dark:border-stone-800 text-center"
          >
            <item.icon className="w-10 h-10 text-brand-500 mx-auto mb-6" />
            <h3 className="font-heading text-lg font-bold text-ink-950 dark:text-white mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-ink-500 dark:text-ink-400 font-body leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-3xl font-bold text-ink-900 dark:text-white mb-10 text-center">
          Open Positions
        </h2>
        <div className="space-y-4">
          {openings.map((job, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white dark:bg-ink-900 border border-stone-100 dark:border-stone-800 hover:border-brand-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-sans font-bold text-xl text-ink-950 dark:text-white group-hover:text-brand-500 transition-colors">
                  {job.title}
                </h3>
                <div className="flex gap-4 mt-1 text-sm text-ink-400 font-sans">
                  <span>{job.department}</span>
                  <span>·</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <button className="bg-ink-900 dark:bg-ink-800 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 rounded-3xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30 text-center">
          <h3 className="font-heading text-2xl font-bold text-ink-900 dark:text-white mb-4">
            Don&apos;t see a fit?
          </h3>
          <p className="text-ink-600 dark:text-ink-400 font-body mb-8 max-w-xl mx-auto">
            We&apos;re always looking for exceptional talent. If you&apos;re
            passionate about what we do, send us your resume anyway!
          </p>
          <a
            href={`mailto:careers@atozblog.com`}
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            jobs@atozblog.com
          </a>
        </div>
      </div>
    </div>
  );
}
