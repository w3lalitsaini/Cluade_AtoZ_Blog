import type { Metadata } from "next";
import { config } from "@/lib/config";
import AdUnit from "@/components/ads/AdUnit";

export const metadata: Metadata = {
  title: "DMCA Policy",
  description: `DMCA Notice and Takedown Procedure for ${config.siteName}.`,
};

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <AdUnit position="header" className="mb-12" />
      <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white mb-8">
        DMCA Notice & Procedure
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-ink-700 dark:prose-p:text-ink-300">
        <p>
          <strong>{config.siteName}</strong> respects the intellectual property
          rights of others. In accordance with the Digital Millennium Copyright
          Act (DMCA), we will respond promptly to claims of copyright
          infringement that are reported to our Designated Copyright Agent.
        </p>

        <AdUnit position="in-article" className="my-12" />

        <h2>1. Reporting Infringement</h2>
        <p>
          If you are a copyright owner, or are authorized to act on behalf of
          one, and you believe that work has been copied in a way that
          constitutes copyright infringement, please submit a written notice to
          our DMCA Agent including the following:
        </p>
        <ul>
          <li>
            A physical or electronic signature of the copyright owner or
            authorized representative.
          </li>
          <li>
            Identification of the copyrighted work claimed to have been
            infringed.
          </li>
          <li>
            Identification of the material that is claimed to be infringing and
            where it is located on our site.
          </li>
          <li>
            Your contact information (Address, telephone number, and email).
          </li>
          <li>
            A statement that you have a good faith belief that use of the
            material is not authorized.
          </li>
          <li>
            A statement that the information in the notification is accurate,
            and under penalty of perjury, that you are the owner or authorized
            to act on behalf of the owner.
          </li>
        </ul>

        <AdUnit position="between-paragraphs" className="my-12" />

        <h2>2. Designated DMCA Agent</h2>
        <p>All DMCA notices should be sent to:</p>
        <div className="p-8 bg-stone-50 dark:bg-ink-900 rounded-2xl border border-stone-100 dark:border-stone-800">
          <p className="font-bold text-ink-950 dark:text-white mb-0">
            DMCA Compliance Team
          </p>
          <p className="mb-0">{config.siteName}</p>
          <p className="mb-0">{config.contact.address}</p>
          <p className="mb-0 mt-4 text-brand-600 dark:text-brand-400 font-bold">
            Email: dmca@atozblog.com
          </p>
        </div>

        <h2>3. Counter-Notification</h2>
        <p>
          If you believe that your content was removed by mistake or
          misidentification, you may submit a counter-notification to our DMCA
          Agent. Upon receipt of a valid counter-notification, we may restore
          the removed content unless we receive notice that a court action has
          been filed.
        </p>

        <h2 className="text-red-600 dark:text-red-400">Important Warning</h2>
        <p className="italic">
          Please note that under Section 512(f) of the DMCA, any person who
          knowingly materially misrepresents that material or activity is
          infringing may be subject to liability.
        </p>
      </div>
      <AdUnit position="footer" className="mt-20" />
    </div>
  );
}
