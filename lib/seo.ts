import { Metadata } from "next";

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  author,
  publishedAt,
  tags,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article";
  author?: string;
  publishedAt?: string;
  tags?: string[];
}): Metadata {
  const metaTitle = `${title} | AtoZ Blogs`;

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: metaTitle,
      description,
      url,
      siteName: "AtoZ Blogs",
      images: image ? [{ url: image }] : [],
      type,
      ...(type === "article" && {
        publishedTime: publishedAt,
        authors: author ? [author] : [],
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: image ? [image] : [],
    },
  };
}

export function generateArticleSchema(post: any) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author?.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/author/${post.author?._id}`,
    },
    publisher: {
      "@type": "Organization",
      name: "AtoZ Blogs",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/article/${post.slug}`,
    },
  };
}

export function generateBreadcrumbSchema(
  breadcrumbs: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": crumb.url.startsWith("http")
          ? crumb.url
          : `${process.env.NEXT_PUBLIC_SITE_URL}${crumb.url}`,
        name: crumb.name,
      },
    })),
  };
}

export function generateStructuredData(post: {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.image
      ? {
          "@type": "ImageObject",
          url: post.image,
        }
      : undefined,
    url: post.url,
    publisher: {
      "@type": "Organization",
      name: "AtoZ Blogs",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  };
}
