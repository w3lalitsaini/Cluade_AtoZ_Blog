"use client";
import { useEffect } from "react";

interface AdBannerProps {
  position: "header" | "sidebar" | "in-article" | "footer" | "sticky-bottom";
  className?: string;
  adCode?: string;
}

export default function AdBanner({ position, className = "", adCode }: AdBannerProps) {
  const sizeMap = {
    header: { w: 728, h: 90, label: "728×90 Leaderboard" },
    sidebar: { w: 300, h: 250, label: "300×250 Rectangle" },
    "in-article": { w: 468, h: 60, label: "468×60 In-Article" },
    footer: { w: 728, h: 90, label: "728×90 Footer" },
    "sticky-bottom": { w: 320, h: 50, label: "320×50 Mobile Banner" },
  };

  const size = sizeMap[position];

  if (adCode) {
    return (
      <div
        className={`ad-container overflow-hidden ${className}`}
        style={{ minHeight: size.h }}
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
    );
  }

  return (
    <div
      className={`ad-container flex-col gap-1 ${className}`}
      style={{ height: size.h, minWidth: Math.min(size.w, 320) }}
    >
      <span className="text-[10px] font-bold tracking-widest text-ink-400">Advertisement</span>
      <span className="text-[10px] text-ink-300">{size.label}</span>
    </div>
  );
}

export function StickyBottomAd({ adCode }: { adCode?: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-white/95 dark:bg-ink-950/95 backdrop-blur border-t border-ink-200 dark:border-ink-800 py-2 px-4 md:hidden">
      <AdBanner position="sticky-bottom" adCode={adCode} />
    </div>
  );
}
