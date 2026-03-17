"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  position:
    | "header"
    | "sidebar"
    | "in-article"
    | "footer"
    | "sticky-bottom"
    | "between-paragraphs";
  variant?: "horizontal" | "vertical" | "article";
  adCode?: string;
  adsenseSlot?: string;
  className?: string;
  label?: string;
}

// Google AdSense component
function AdSenseUnit({
  slot,
  variant,
}: {
  slot?: string;
  variant?: "horizontal" | "vertical" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
      adsbygoogle.push({});
    } catch {
      // Adsense not loaded
    }
  }, []);

  const getFormat = () => {
    if (variant === "article") return "fluid";
    if (variant === "vertical") return "vertical";
    if (variant === "horizontal") return "horizontal";
    return "auto";
  };

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
      data-ad-slot={slot || process.env.NEXT_PUBLIC_AD_SLOT_DISPLAY}
      data-ad-format={getFormat()}
      data-ad-layout={variant === "article" ? "in-article" : undefined}
      data-full-width-responsive="true"
    />
  );
}

// Custom HTML ad
function CustomAd({ code }: { code: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: code }}
      className="overflow-hidden"
    />
  );
}

export default function AdUnit({
  position,
  variant,
  adCode,
  adsenseSlot,
  className = "",
  label = "Advertisement",
}: AdUnitProps) {
  const sizeMap: Record<string, string> = {
    header: "min-h-[90px]",
    sidebar: "min-h-[250px]",
    "in-article": "min-h-[280px]",
    footer: "min-h-[90px]",
    "sticky-bottom": "min-h-[60px]",
    "between-paragraphs": "min-h-[250px]",
  };

  // Resolve slot ID from env if not explicitly passed
  const resolvedSlot = adsenseSlot || (
    position === "in-article" || position === "between-paragraphs" 
      ? process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE
      : position === "header" || position === "footer"
        ? process.env.NEXT_PUBLIC_AD_SLOT_DISPLAY
        : process.env.NEXT_PUBLIC_AD_SLOT_AUTORELAXED
  );

  return (
    <div className={`ad-container relative ${sizeMap[position]} ${className}`}>
      <span className="ad-label text-[10px] text-ink-400 font-sans">
        {label}
      </span>
      <div className="pt-4">
        {resolvedSlot && <AdSenseUnit slot={resolvedSlot} variant={variant} />}
        {adCode && !resolvedSlot && <CustomAd code={adCode} />}
        {!resolvedSlot && !adCode && (
           <div className="text-ink-300 dark:text-ink-700 text-xs font-sans italic text-center py-2">
             [Ad Space - {position}]
           </div>
        )}
      </div>
    </div>
  );
}

// Sticky bottom ad
export function StickyBottomAd({
  adCode,
  adsenseSlot,
}: {
  adCode?: string;
  adsenseSlot?: string;
}) {
  return (
    <div className="sticky-ad no-print">
      <div className="relative w-full max-w-screen-lg px-4">
        <span className="absolute -top-4 right-4 text-[10px] text-ink-400 bg-white dark:bg-ink-900 px-1 font-sans">
          Advertisement
        </span>
        {adsenseSlot && <AdSenseUnit slot={adsenseSlot} />}
        {adCode && !adsenseSlot && <CustomAd code={adCode} />}
        {!adCode && !adsenseSlot && (
          <div className="h-14 flex items-center justify-center text-ink-300 text-sm font-sans">
            [Sticky Ad Space]
          </div>
        )}
      </div>
    </div>
  );
}
