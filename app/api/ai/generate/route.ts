import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateText } from "@/lib/services/aiService";

type AIType = "titles" | "outline" | "article" | "rewrite" | "seo" | "tags" | "excerpt" | string;

const buildPrompt = (type: AIType, prompt: string): string => {
  switch (type) {
    case "titles":
      return `Generate 10 compelling, SEO-optimized blog post titles about: "${prompt}". Include question-based, how-to, list, and statement titles. Format as a numbered list.`;
    case "outline":
      return `Create a detailed article outline for: "${prompt}". Include introduction hook, 4-6 main sections with subheadings, key points for each section, and conclusion. Format with ## for sections.`;
    case "article":
      return `Write a comprehensive, engaging 1000-1200 word blog article about: "${prompt}". Include compelling introduction, well-structured body with subheadings, statistics and examples, and clear conclusion. Format in clean HTML.`;
    case "rewrite":
      return `Rewrite and improve the following content. Make it more engaging, clear, and SEO-friendly:\n\n${prompt}`;
    case "seo":
      return `Provide SEO optimization for a blog post about: "${prompt}". Include primary keyword recommendations, secondary keywords, title tag suggestion, meta description (150-160 chars), internal linking opportunities, and readability tips.`;
    case "tags":
      return `Generate 8-10 relevant SEO tags for an article about: "${prompt}". Include broad topic, specific niche, and long-tail keyword tags. Format as comma-separated list.`;
    case "excerpt":
      return `Write 3 compelling 2-3 sentence excerpts/summaries for a blog post about: "${prompt}". Each should be different and optimized for SEO. Format as numbered list.`;
    default:
      return `Help me with the following blogging task: ${prompt}`;
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const type = body.type || body.action || "titles";
    const prompt = body.prompt || body.content || "";

    if (!prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const userPrompt = buildPrompt(type, prompt);
    const result = await generateText(userPrompt);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
