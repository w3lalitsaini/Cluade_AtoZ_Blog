import type { Metadata } from "next";
import Image from "next/image";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn more about ${config.siteName}, your trusted source for news and insights.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white mb-6">
          Our Story
        </h1>
        <p className="text-xl text-ink-600 dark:text-ink-400 font-body leading-relaxed max-w-2xl mx-auto">
          Delivering clarity in a complex world through in-depth reporting and
          expert analysis.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-ink-700 dark:prose-p:text-ink-300">
        <p>
          Founded with a vision to bridge the gap between breaking news and
          meaningful understanding, <strong>{config.siteName}</strong> has grown
          into a premier destination for thoughtful readers. We believe that in
          an era of rapid-fire headlines, the value of context, nuance, and
          integrity has never been higher.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is simple: to empower our readers with the information
          they need to navigate the modern landscape. Whether it&apos;s
          technology shifts, business trends, or global political movements, we
          strive to explain not just what happened, but why it matters.
        </p>

        <div className="my-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center not-prose">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1491336477066-31156b5e4f35?auto=format&fit=crop&q=80&w=800"
              alt="Our office environment"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-heading text-2xl font-bold text-ink-950 dark:text-white mb-4">
              Integrity Driven
            </h3>
            <p className="text-ink-600 dark:text-ink-400 font-body leading-relaxed">
              Every piece of content on our platform undergoes a rigorous
              verification process. We partner with industry experts and veteran
              journalists to ensure that what you read is accurate, fair, and
              authoritative.
            </p>
          </div>
        </div>

        <h2>What We Cover</h2>
        <ul>
          <li>
            <strong>Technology:</strong> From AI breakthroughs to consumer
            electronics.
          </li>
          <li>
            <strong>Business & Finance:</strong> Market insights and
            entrepreneurial stories.
          </li>
          <li>
            <strong>Science:</strong> Discoveries that shape our future.
          </li>
          <li>
            <strong>Society & Culture:</strong> The trends and ideas moving
            humanity.
          </li>
        </ul>

        <h2 className="text-center mt-20">Join Our Community</h2>
        <p className="text-center max-w-xl mx-auto">
          We invite you to be part of the conversation. Follow our journey as we
          continue to explore the frontiers of news and insights.
        </p>
      </div>
    </div>
  );
}
