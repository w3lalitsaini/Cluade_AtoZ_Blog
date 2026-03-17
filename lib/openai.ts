import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateBlogTitles(
  topic: string,
  count = 5
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert blog title generator. Return only a JSON array of title strings.",
      },
      {
        role: "user",
        content: `Generate ${count} compelling, SEO-optimized blog titles for the topic: "${topic}". Return as JSON array.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content || '{"titles":[]}';
  const parsed = JSON.parse(content);
  return parsed.titles || [];
}

export async function generateOutline(title: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional content strategist. Create detailed blog outlines.",
      },
      {
        role: "user",
        content: `Create a detailed outline for a blog post titled: "${title}". Include H2 and H3 headings with brief descriptions.`,
      },
    ],
  });
  return response.choices[0].message.content || "";
}

export async function generateArticle(
  title: string,
  outline: string,
  tone = "professional"
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert blog writer. Write in HTML format suitable for a rich text editor. Use <h2>, <h3>, <p>, <ul>, <li>, <blockquote> tags. Tone: ${tone}.`,
      },
      {
        role: "user",
        content: `Write a comprehensive, SEO-optimized blog article for:
Title: "${title}"
Outline: ${outline}
Make it engaging, informative, and at least 1500 words.`,
      },
    ],
  });
  return response.choices[0].message.content || "";
}

export async function generateMetaDescription(
  title: string,
  content: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Write a compelling SEO meta description (150-160 characters) for:
Title: "${title}"
Content excerpt: "${content.substring(0, 500)}"
Return only the meta description, no quotes.`,
      },
    ],
  });
  return response.choices[0].message.content?.trim() || "";
}

export async function generateTags(
  title: string,
  content: string
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Return only a JSON object with a tags array.",
      },
      {
        role: "user",
        content: `Generate 8-10 relevant SEO tags for:
Title: "${title}"
Content: "${content.substring(0, 500)}"
Return as JSON: {"tags": ["tag1", "tag2"]}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const parsed = JSON.parse(
    response.choices[0].message.content || '{"tags":[]}'
  );
  return parsed.tags || [];
}

export async function rewriteContent(
  content: string,
  instruction: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional editor. Rewrite content as instructed. Return HTML-formatted content.",
      },
      {
        role: "user",
        content: `Rewrite the following content with this instruction: "${instruction}"\n\nContent:\n${content}`,
      },
    ],
  });
  return response.choices[0].message.content || content;
}

export async function analyzeSEO(
  title: string,
  content: string,
  keyword: string
): Promise<{
  score: number;
  suggestions: string[];
  keywordDensity: number;
  readabilityScore: number;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an SEO expert. Return analysis as JSON.",
      },
      {
        role: "user",
        content: `Analyze SEO for:
Title: "${title}"
Focus keyword: "${keyword}"
Content length: ${content.length} chars
Content preview: "${content.substring(0, 1000)}"

Return JSON: {
  "score": 0-100,
  "suggestions": ["suggestion1", "suggestion2"],
  "keywordDensity": 0.00,
  "readabilityScore": 0-100
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(
    response.choices[0].message.content ||
      '{"score":0,"suggestions":[],"keywordDensity":0,"readabilityScore":0}'
  );
}

export default openai;
