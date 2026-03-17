"use client";

import Script from "next/script";

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

export default function GoogleAdSense() {
  if (!PUBLISHER_ID || PUBLISHER_ID === "your-publisher-id") return null;

  return (
    <Script
      async
      id="google-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
