const originalFetch = globalThis.fetch;

type Input = Parameters<typeof originalFetch>[0];
type Init = Parameters<typeof originalFetch>[1];

const customFetch = async (input: Input, init: Init) => {
  const fallback = () => originalFetch.call(globalThis, input, init);

  if (!isGeminiEndpoint(input)) {
    return fallback();
  }

  if (!init?.body || typeof init.body !== "string") {
    return fallback();
  }

  const body = JSON.parse(init.body) as unknown;

  if (!isRecord(body)) {
    return fallback();
  }

  body.tools ??= [];

  if (!Array.isArray(body.tools)) {
    return fallback();
  }

  const googleTools = [];

  if (isEnabled(process.env.OPENCODE_GEMINI_TOOLS_ENABLE_GOOGLE_SEARCH)) {
    googleTools.push({ googleSearch: {} });
  }

  if (isEnabled(process.env.OPENCODE_GEMINI_TOOLS_ENABLE_GOOGLE_MAPS)) {
    googleTools.push({ googleMaps: {} });
  }

  if (isEnabled(process.env.OPENCODE_GEMINI_TOOLS_ENABLE_URL_CONTEXT)) {
    googleTools.push({ urlContext: {} });
  }

  if (isEnabled(process.env.OPENCODE_GEMINI_TOOLS_ENABLE_CODE_EXECUTION)) {
    googleTools.push({ codeExecution: {} });
  }

  body.tools = [...googleTools, ...body.tools];

  init.body = JSON.stringify(body);

  return originalFetch(input, init);
};

export function GeminiToolsPlugin() {
  globalThis.fetch = Object.assign(customFetch, originalFetch);

  return {};
}

function isGeminiEndpoint(value: unknown): boolean {
  try {
    if (typeof value !== "string") {
      return false;
    }

    const url = new URL(value);

    const isGoogleHost =
      url.hostname === "generativelanguage.googleapis.com" ||
      url.hostname.endsWith("aiplatform.googleapis.com");

    const isGenerateContent = url.pathname.includes("streamGenerateContent");

    return isGoogleHost && isGenerateContent;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isEnabled(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.toLowerCase().trim();
  return normalized !== "0" && normalized !== "false";
}
