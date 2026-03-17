"use client";
import { useState } from "react";
import {
  Sparkles,
  FileText,
  Tag,
  Search,
  Loader2,
  Copy,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const PROMPTS = [
  {
    icon: FileText,
    label: "Blog Post Idea",
    placeholder: "Topic or keyword...",
    action: "idea",
  },
  {
    icon: Tag,
    label: "SEO Meta Description",
    placeholder: "Article title or topic...",
    action: "seo",
  },
  {
    icon: Search,
    label: "Headline Variants",
    placeholder: "Draft headline...",
    action: "headlines",
  },
  {
    icon: Sparkles,
    label: "Article Outline",
    placeholder: "Topic for outline...",
    action: "outline",
  },
];

function buildPrompt(action: string, input: string): string {
  switch (action) {
    case "idea":
      return `Generate 5 unique, engaging blog post ideas for the topic: "${input}". Format as a numbered list with a headline and one-line description for each.`;
    case "seo":
      return `Write 3 compelling SEO meta descriptions (max 160 characters each) for an article about: "${input}". Make them click-worthy and include a call to action.`;
    case "headlines":
      return `Generate 5 headline variants for: "${input}". Include power words, make them curiosity-driven and SEO-friendly.`;
    case "outline":
      return `Create a detailed article outline for: "${input}". Include H2 and H3 headings, with a brief note about what each section should cover.`;
    default:
      return input;
  }
}

export default function AIAssistantPage() {
  const [mode, setMode] = useState("idea");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    { prompt: string; result: string; mode: string }[]
  >([]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter some input first");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const prompt = buildPrompt(mode, input);
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      const generated = data.result || data.text || "No result generated";
      setResult(generated);
      setHistory((h) => [
        { prompt: input, result: generated, mode },
        ...h.slice(0, 4),
      ]);
    } catch {
      // Fallback: show a placeholder when AI API is not configured
      const fallback = `AI generation requires configuring an AI API key (Gemini, OpenAI, etc.) in your .env file.\n\nExample output for "${input}":\n\n1. The Complete Guide to ${input}: Everything You Need to Know\n2. Why ${input} Matters More Than You Think\n3. Top 10 ${input} Trends Shaping the Future\n4. ${input}: A Beginner's Deep Dive\n5. The Untold Story of ${input}`;
      setResult(fallback);
      toast(
        "Using placeholder — configure AI API key in .env for real generation",
        { icon: "⚠️" },
      );
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  const currentPrompt = PROMPTS.find((p) => p.action === mode)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-500" /> AI Writing Assistant
        </h1>
        <p className="font-sans text-ink-500 text-sm mt-1">
          Generate content ideas, headlines, SEO descriptions, and article
          outlines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm">
            <h2 className="font-sans font-700 text-ink-800 dark:text-ink-200 text-sm mb-3">
              Select Task
            </h2>
            <nav className="space-y-1">
              {PROMPTS.map(({ icon: Icon, label, action }) => (
                <button
                  key={action}
                  onClick={() => {
                    setMode(action);
                    setResult("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans font-500 transition-all text-left ${
                    mode === action
                      ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
                      : "text-ink-600 dark:text-ink-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-ink-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800 shadow-sm">
              <h2 className="font-sans font-700 text-ink-800 dark:text-ink-200 text-sm mb-3">
                Recent
              </h2>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(h.prompt);
                      setResult(h.result);
                      setMode(h.mode);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <p className="text-xs font-sans text-ink-500 truncate">
                      {h.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
            <label className="block text-xs font-700 uppercase tracking-wider text-ink-500 mb-2">
              {currentPrompt.label}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder={currentPrompt.placeholder}
              className="w-full bg-stone-50 dark:bg-ink-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-400 resize-none transition-colors"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-3 flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-sans font-600 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {(result || loading) && (
            <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans font-700 text-ink-800 dark:text-ink-200 text-sm">
                  Generated Output
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-ink-400 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copy}
                    className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-ink-400 transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center gap-3 text-ink-400 font-sans text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating content...
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
                  {result}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
