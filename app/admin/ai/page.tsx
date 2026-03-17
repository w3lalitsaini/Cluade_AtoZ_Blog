"use client";
import { useState } from "react";
import { Sparkles, Copy, RefreshCw, Wand2, FileText, Tags, Search, Pen } from "lucide-react";
import toast from "react-hot-toast";

type Tool = "titles" | "outline" | "article" | "rewrite" | "seo" | "tags" | "excerpt";

const tools: { id: Tool; label: string; icon: any; description: string; placeholder: string }[] = [
  { id: "titles", label: "Generate Titles", icon: Wand2, description: "Generate catchy, SEO-optimized article titles", placeholder: "Describe what your article is about..." },
  { id: "outline", label: "Article Outline", icon: FileText, description: "Create a structured outline for your article", placeholder: "Enter your article title or topic..." },
  { id: "article", label: "Write Article", icon: Pen, description: "Generate a full article draft with sections", placeholder: "Enter your article title and any key points..." },
  { id: "rewrite", label: "Rewrite Content", icon: RefreshCw, description: "Improve and rewrite existing content", placeholder: "Paste the content you want to rewrite..." },
  { id: "seo", label: "SEO Optimization", icon: Search, description: "Generate meta titles, descriptions, and SEO suggestions", placeholder: "Enter your article title or paste your content..." },
  { id: "tags", label: "Generate Tags", icon: Tags, description: "Generate relevant tags for your article", placeholder: "Paste your article title and excerpt..." },
  { id: "excerpt", label: "Write Excerpt", icon: FileText, description: "Generate a compelling excerpt/summary", placeholder: "Enter your article title or paste the full content..." },
];

export default function AIAssistantPage() {
  const [activeTool, setActiveTool] = useState<Tool>("titles");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const tool = tools.find((t) => t.id === activeTool)!;

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTool, prompt: input }),
      });
      const data = await res.json();
      setOutput(data.result || data.error || "No result generated.");
    } catch {
      setOutput("Failed to generate. Please check your OpenAI API key.");
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-500" />
          AI Writing Assistant
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">Powered by OpenAI · Generate content, titles, SEO, and more</p>
      </div>

      <div className="flex gap-5">
        {/* Tool Selector */}
        <div className="w-56 shrink-0">
          <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider">AI Tools</p>
            </div>
            <nav className="p-2 space-y-1">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTool(t.id); setOutput(""); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                      activeTool === t.id
                        ? "bg-brand-500 text-white"
                        : "text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tool info */}
          <div className="bg-gradient-to-r from-brand-50 to-orange-50 dark:from-brand-950/30 dark:to-orange-950/20 rounded-xl p-4 border border-brand-100 dark:border-brand-900">
            <div className="flex items-center gap-2">
              <tool.icon className="w-5 h-5 text-brand-600" />
              <h2 className="font-semibold text-brand-800 dark:text-brand-300">{tool.label}</h2>
            </div>
            <p className="text-sm text-brand-700 dark:text-brand-400 mt-1">{tool.description}</p>
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-100 dark:border-ink-800 p-5">
            <label className="text-xs font-bold text-ink-500 uppercase tracking-wider block mb-2">Your Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tool.placeholder}
              rows={6}
              className="w-full bg-ink-50 dark:bg-ink-800 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none text-ink-800 dark:text-ink-200 placeholder-ink-400"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-ink-400">{input.length} characters</p>
              <div className="flex gap-2">
                <button onClick={() => setInput("")} className="px-3 py-1.5 text-xs text-ink-500 hover:text-ink-700 border border-ink-200 dark:border-ink-700 rounded-lg">
                  Clear
                </button>
                <button
                  onClick={generate}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 px-5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output */}
          {(output || loading) && (
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-100 dark:border-ink-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-ink-500 uppercase tracking-wider">AI Output</label>
                {output && (
                  <div className="flex gap-2">
                    <button onClick={copyOutput} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button onClick={generate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-500 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/20">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="flex items-center gap-3 py-8">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <span className="text-sm text-ink-400">AI is generating your content...</span>
                </div>
              ) : (
                <div className="bg-ink-50 dark:bg-ink-800 rounded-lg p-4">
                  <pre className="text-sm text-ink-800 dark:text-ink-200 whitespace-pre-wrap font-body leading-relaxed">{output}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
