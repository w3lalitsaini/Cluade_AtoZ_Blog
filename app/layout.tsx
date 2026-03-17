import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Source_Serif_4,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "AtoZ Blogs – News, Insights & More",
    template: "%s | AtoZ Blogs",
  },
  description:
    "AtoZ Blogs is your trusted source for breaking news, in-depth analysis, technology, business, and more.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://blog.atozmovies.in",
  ),
  openGraph: {
    siteName: "AtoZ Blogs",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@atozblog",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/favicon.svg",
    apple: "/images/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${sourceSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased text-ink-900 dark:text-ink-50 bg-white dark:bg-black`}
      >
        <SessionProvider session={session}>
          <GoogleAnalytics />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#1c1917",
                  color: "#fef3c7",
                  borderRadius: "8px",
                  border: "1px solid #f97316",
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
