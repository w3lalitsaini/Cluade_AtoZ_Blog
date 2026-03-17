import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service and conditions for using ${config.siteName}.`,
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white mb-4">
        Terms of Service
      </h1>
      <p className="text-sm text-ink-500 font-sans mb-12">
        Last Updated: {lastUpdated}
      </p>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-ink-700 dark:prose-p:text-ink-300">
        <p>
          Welcome to <strong>{config.siteName}</strong>! These terms and
          conditions outline the rules and regulations for the use of{" "}
          {config.siteName}&apos;s Website, located at {config.siteUrl}.
        </p>

        <p>
          By accessing this website we assume you accept these terms and
          conditions. Do not continue to use {config.siteName} if you do not
          agree to take all of the terms and conditions stated on this page.
        </p>

        <h2>1. Intellectual Property Rights</h2>
        <p>
          Unless otherwise stated, {config.siteName} and/or its licensors own
          the intellectual property rights for all material on {config.siteName}
          . All intellectual property rights are reserved. You may access this
          from {config.siteName} for your own personal use subjected to
          restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul>
          <li>Republish material from {config.siteName}</li>
          <li>Sell, rent or sub-license material from {config.siteName}</li>
          <li>Reproduce, duplicate or copy material from {config.siteName}</li>
          <li>Redistribute content from {config.siteName}</li>
        </ul>

        <h2>2. User Comments</h2>
        <p>
          Parts of this website offer an opportunity for users to post and
          exchange opinions and information in certain areas of the website.{" "}
          {config.siteName} does not filter, edit, publish or review Comments
          prior to their presence on the website. Comments do not reflect the
          views and opinions of {config.siteName},its agents and/or affiliates.
        </p>
        <p>
          {config.siteName} reserves the right to monitor all Comments and to
          remove any Comments which can be considered inappropriate, offensive
          or causes breach of these Terms and Conditions.
        </p>

        <h2>3. Content Liability</h2>
        <p>
          We shall not be hold responsible for any content that appears on your
          Website. You agree to protect and defend us against all claims that is
          rising on your Website. No link(s) should appear on any Website that
          may be interpreted as libellous, obscene or criminal, or which
          infringes, otherwise violates, or advocates the infringement or other
          violation of, any third party rights.
        </p>

        <h2>4. Reservation of Rights</h2>
        <p>
          We reserve the right to request that you remove all links or any
          particular link to our Website. You approve to immediately remove all
          links to our Website upon request. We also reserve the right to amen
          these terms and conditions and it&apos;s linking policy at any time.
          By continuously linking to our Website, you agree to be bound to and
          follow these linking terms and conditions.
        </p>

        <h2>5. Disclaimer</h2>
        <p>
          To the maximum extent permitted by applicable law, we exclude all
          representations, warranties and conditions relating to our website and
          the use of this website. Nothing in this disclaimer will:
        </p>
        <ul>
          <li>
            limit or exclude our or your liability for death or personal injury;
          </li>
          <li>
            limit or exclude our or your liability for fraud or fraudulent
            misrepresentation;
          </li>
          <li>
            limit any of our or your liabilities in any way that is not
            permitted under applicable law.
          </li>
        </ul>

        <p className="mt-12 p-6 bg-stone-50 dark:bg-ink-900 rounded-xl border border-stone-100 dark:border-stone-800 italic">
          If you have any queries regarding any of our terms, please contact us
          at {config.contact.email}.
        </p>
      </div>
    </div>
  );
}
