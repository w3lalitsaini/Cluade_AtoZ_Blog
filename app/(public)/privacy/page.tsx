import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${config.siteName}. Learn how we collect, use, and protect your personal information.`,
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-ink-500 font-sans mb-12">
        Last Updated: {lastUpdated}
      </p>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-ink-700 dark:prose-p:text-ink-300">
        <p>
          At <strong>{config.siteName}</strong>, accessible from{" "}
          {config.siteUrl}, one of our main priorities is the privacy of our
          visitors. This Privacy Policy document contains types of information
          that is collected and recorded by {config.siteName} and how we use it.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          The personal information that you are asked to provide, and the
          reasons why you are asked to provide it, will be made clear to you at
          the point we ask you to provide your personal information.
        </p>
        <ul>
          <li>
            <strong>Registration Data:</strong> When you register for an
            Account, we may ask for your contact information, including items
            such as name, company name, address, email address, and telephone
            number.
          </li>
          <li>
            <strong>Comment Data:</strong> If you comment on our articles, we
            collect the data shown in the comments form, and also the
            visitor&apos;s IP address and browser user agent string to help spam
            detection.
          </li>
          <li>
            <strong>Log Files:</strong> {config.siteName} follows a standard
            procedure of using log files. These files log visitors when they
            visit websites.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect in various ways, including to:</p>
        <ul>
          <li>Provide, operate, and maintain our website.</li>
          <li>Improve, personalize, and expand our website.</li>
          <li>Understand and analyze how you use our website.</li>
          <li>Develop new products, services, features, and functionality.</li>
          <li>
            Communicate with you, either directly or through one of our
            partners.
          </li>
          <li>Send you emails and newsletters.</li>
          <li>Find and prevent fraud.</li>
        </ul>

        <h2>3. Cookies and Web Beacons</h2>
        <p>
          Like any other website, {config.siteName} uses &apos;cookies&apos;.
          These cookies are used to store information including visitors&apos;
          preferences, and the pages on the website that the visitor accessed or
          visited. The information is used to optimize the users&apos;
          experience by customizing our web page content based on visitors&apos;
          browser type and/or other information.
        </p>

        <h2>4. Third Party Privacy Policies</h2>
        <p>
          {config.siteName}&apos;s Privacy Policy does not apply to other
          advertisers or websites. Thus, we are advising you to consult the
          respective Privacy Policies of these third-party ad servers for more
          detailed information.
        </p>

        <h2>5. GDPR Data Protection Rights</h2>
        <p>
          We would like to make sure you are fully aware of all of your data
          protection rights. Every user is entitled to the following:
        </p>
        <ul>
          <li>
            The right to access – You have the right to request copies of your
            personal data.
          </li>
          <li>
            The right to rectification – You have the right to request that we
            correct any information you believe is inaccurate.
          </li>
          <li>
            The right to erasure – You have the right to request that we erase
            your personal data, under certain conditions.
          </li>
        </ul>

        <h2>6. Contact Us</h2>
        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us at{" "}
          <strong>{config.contact.email}</strong>.
        </p>
      </div>
    </div>
  );
}
