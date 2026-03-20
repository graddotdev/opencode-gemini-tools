const originalFetch = globalThis.fetch;

type Input = Parameters<typeof originalFetch>[0];
type Init = Parameters<typeof originalFetch>[1];

const customFetch = async (input: Input, init: Init) => {
	const fallback = () => originalFetch.call(globalThis, input, init);

	if (!isGeminiEndpoint(input)) {
		return fallback();
	}

	if (!init || !init.body || typeof init.body !== "string") {
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

	body.tools = [
		{ googleSearch: {} },
		{ googleMaps: {} },
		{ urlContext: {} },
		{ codeExecution: {} },
		...body.tools,
	];

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
