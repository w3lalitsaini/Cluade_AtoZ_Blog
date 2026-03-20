import { logInfo, logWarn, logError } from "./logger";

/**
 * UPDATED AI PROVIDERS (WORKING MODELS ONLY)
 */
const AI_PROVIDERS = [
  {
    id: "groq-llama-3.1-8b",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: process.env.GROQ_API_KEY,
    type: "openai-chat",
    active: true,
  },
  {
    id: "groq-llama-3.1-70b",
    provider: "groq",
    model: "llama-3.1-70b-versatile",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: process.env.GROQ_API_KEY,
    type: "openai-chat",
    active: true,
  },
  {
    id: "hf-mistral",
    provider: "huggingface",
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    endpoint:
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    apiKey: process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY,
    type: "hf-inference",
    active: true,
  },
  {
    id: "hf-gemma",
    provider: "huggingface",
    model: "google/gemma-7b-it",
    endpoint: "https://api-inference.huggingface.co/models/google/gemma-7b-it",
    apiKey: process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY,
    type: "hf-inference",
    active: true,
  },
];

const TIMEOUT_MS = 60000;

export async function generateText(prompt, retries = 2) {
  if (!prompt) return "";

  const activeProviders = AI_PROVIDERS.filter((p) => p.active && p.apiKey);

  if (activeProviders.length === 0) {
    await logError("AIService", "No active AI providers configured");
    throw new Error("AI System misconfigured");
  }

  for (const provider of activeProviders) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        if (attempt > 0) {
          await logWarn(
            "AIService",
            `Retrying ${provider.id} (${attempt}/${retries})`,
          );
        } else {
          await logInfo("AIService", `[AI] Started: ${provider.model}`);
        }

        const response = await callProvider(
          provider,
          prompt,
          controller.signal,
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();

          // 🚀 SMART MODEL DISABLE
          if (
            response.status === 404 ||
            response.status === 410 ||
            errorText.includes("decommissioned")
          ) {
            await logError("AIService", `Model dead: ${provider.model}`);
            provider.active = false;
            break;
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = parseResponse(provider, data);

        if (!text) throw new Error("Empty response");

        await logInfo("AIService", `[AI] Success: ${provider.model}`);
        return text.trim();
      } catch (err) {
        clearTimeout(timeoutId);

        if (attempt === retries) {
          await logWarn(
            "AIService",
            `${provider.model} failed: ${err.message}`,
          );
        } else {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
  }

  throw new Error("All AI providers exhausted or unavailable.");
}

async function callProvider(p, prompt, signal) {
  const body =
    p.type === "openai-chat"
      ? {
          model: p.model,
          messages: [
            {
              role: "system",
              content: "You are a professional SEO blog writer",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }
      : {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1200,
            temperature: 0.7,
            return_full_text: false,
          },
        };

  return fetch(p.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.apiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify(body),
  });
}

function parseResponse(p, data) {
  if (p.type === "openai-chat") {
    return data?.choices?.[0]?.message?.content || "";
  }

  if (Array.isArray(data)) {
    return data[0]?.generated_text || "";
  }

  return data.generated_text || "";
}
