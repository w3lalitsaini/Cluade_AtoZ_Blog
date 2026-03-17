/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Cookie Policy for ${config.siteName}. Learn how we use cookies to improve your experience.`,
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="font-heading text-4xl md:text-5xl font-black text-ink-950 dark:text-white mb-8">
        Cookie Policy
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:font-body prose-p:text-ink-700 dark:prose-p:text-ink-300">
        <p>
          This is the Cookie Policy for <strong>{config.siteName}</strong>,
          accessible from {config.siteUrl}.
        </p>

        <h2>What Are Cookies</h2>
        <p>
          As is common practice with almost all professional websites this site
          uses cookies, which are tiny files that are downloaded to your
          computer, to improve your experience. This page describes what
          information they gather, how we use it and why we sometimes need to
          store these cookies.
        </p>

        <h2>How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately
          in most cases there are no industry standard options for disabling
          cookies without completely disabling the functionality and features
          they add to this site.
        </p>

        <h2>The Cookies We Set</h2>
        <ul>
          <li>
            <strong>Account related cookies:</strong> If you create an account
            with us then we will use cookies for the management of the signup
            process and general administration.
          </li>
          <li>
            <strong>Login related cookies:</strong> We use cookies when you are
            logged in so that we can remember this fact. This prevents you from
            having to log in every single time you visit a new page.
          </li>
          <li>
            <strong>Newsletters related cookies:</strong> This site offers
            newsletter or email subscription services and cookies may be used to
            remember if you are already registered.
          </li>
        </ul>

        <h2>Third Party Cookies</h2>
        <p>
          In some special cases we also use cookies provided by trusted third
          parties. The following section details which third party cookies you
          might encounter through this site.
        </p>
        <ul>
          <li>
            This site uses Google Analytics which is one of the most widespread
            and trusted analytics solution on the web for helping us to
            understand how you use the site.
          </li>
          <li>
            We also use social media buttons and/or plugins on this site that
            allow you to connect with your social network in various ways.
          </li>
        </ul>

        <h2>More Information</h2>
        <p>
          Hopefully that has clarified things for you. However if you are still
          looking for more information then you can contact us through one of
          our preferred contact methods:
        </p>
        <ul>
          <li>Email: {config.contact.email}</li>
        </ul>
      </div>
    </div>
  );
}
