
const LANGUAGE_MAP = {
  telugu: "te",
  te: "te",
  hindi: "hi",
  hi: "hi",
  tamil: "ta",
  ta: "ta",
  kannada: "kn",
  kn: "kn",
  malayalam: "ml",
  ml: "ml",
  bengali: "bn",
  bn: "bn",
  marathi: "mr",
  mr: "mr",
  gujarati: "gu",
  gu: "gu",
  punjabi: "pa",
  pa: "pa",
  english: "en",
  en: "en",
  spanish: "es",
  es: "es",
  french: "fr",
  fr: "fr",
  german: "de",
  de: "de",
  italian: "it",
  it: "it",
  portuguese: "pt",
  pt: "pt",
  russian: "ru",
  ru: "ru",
  chinese: "zh",
  zh: "zh",
  japanese: "ja",
  ja: "ja",
  korean: "ko",
  ko: "ko",
};

// In-memory cache for recent translations to prevent rate limits & duplicate calls
const translationCache = new Map();
const MAX_CACHE_SIZE = 500;

function getCachedTranslation(key) {
  return translationCache.get(key) || null;
}

function setCachedTranslation(key, val) {
  if (translationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }
  translationCache.set(key, val);
}

// Provider 1: Google Translate client=dict-chrome-ex
async function translateViaChromeEx(text, targetIso) {
  const url = `https://clients5.google.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=${targetIso}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "*/*",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`Google Chrome-Ex returned status ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0].map((part) => part[0]).filter(Boolean).join("");
    if (translated) return translated;
  }
  throw new Error("Invalid response structure from Google Chrome-Ex");
}

// Provider 2: Google Translate client=gtx
async function translateViaGtx(text, targetIso) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetIso}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
      "Accept": "*/*",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`Google Translate GTX returned status ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = data[0].map((part) => part[0]).filter(Boolean).join("");
    if (translated) return translated;
  }
  throw new Error("Invalid response structure from Google Translate GTX");
}

// Provider 3: MyMemory Free Translation API
async function translateViaMyMemory(text, targetIso) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetIso}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "TVKOTT/1.0",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`MyMemory returned status ${res.status}`);
  }

  const data = await res.json();
  if (data && data.responseData && data.responseData.translatedText) {
    const translated = data.responseData.translatedText;
    // Check if MyMemory returned an invalid warning string
    if (!translated.toUpperCase().includes("MYMEMORY WARNING")) {
      return translated;
    }
  }
  throw new Error("Invalid translation response from MyMemory");
}

// Provider 4: Google Web Lite Scraper
async function translateViaGoogleWeb(text, targetIso) {
  const url = `https://translate.google.com/m?sl=auto&tl=${targetIso}&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      "Accept": "text/html",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) {
    throw new Error(`Google Web returned status ${res.status}`);
  }

  const html = await res.text();
  const match = html.match(/<div[^>]*class=["']result-container["'][^>]*>(.*?)<\/div>/s);
  if (match && match[1]) {
    // Decode HTML entities
    const decoded = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    if (decoded) return decoded;
  }
  throw new Error("Could not parse result from Google Web Lite");
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawText = body.text;
    const targetLang = body.targetLang;

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return Response.json(
        { success: false, message: "Text to translate is required and cannot be empty or whitespace only" },
        { status: 400 }
      );
    }

    const trimmedText = rawText.trim();
    const langLower = String(targetLang || "").toLowerCase().trim();
    const targetIso = LANGUAGE_MAP[langLower] || langLower || "en";

    // 1. Check in-memory cache
    const cacheKey = `${targetIso}:${trimmedText}`;
    const cached = getCachedTranslation(cacheKey);
    if (cached) {
      return Response.json({
        success: true,
        translatedText: cached,
        targetIso,
        fromCache: true,
      });
    }

    // 2. Sequential fallback execution across resilient providers
    const providers = [
      { name: "Google Chrome-Ex", fn: () => translateViaChromeEx(trimmedText, targetIso) },
      { name: "Google GTX", fn: () => translateViaGtx(trimmedText, targetIso) },
      { name: "MyMemory", fn: () => translateViaMyMemory(trimmedText, targetIso) },
      { name: "Google Web", fn: () => translateViaGoogleWeb(trimmedText, targetIso) },
    ];

    let lastError = null;
    for (const provider of providers) {
      try {
        const translated = await provider.fn();
        if (translated && typeof translated === "string" && translated.trim()) {
          setCachedTranslation(cacheKey, translated.trim());
          return Response.json({
            success: true,
            translatedText: translated.trim(),
            targetIso,
            provider: provider.name,
          });
        }
      } catch (err) {
        lastError = err;
        // Continue to the next fallback provider
      }
    }

    // If all providers failed (e.g. rate limit across all or offline), return graceful error
    console.error("[POST /api/admin/translate] All translation providers failed. Last error:", lastError?.message);

    const is429 = lastError?.message?.includes("429") || false;
    const userMessage = is429
      ? "Translation rate limit reached. Your original text has been kept intact. Please try again in a few moments."
      : "Translation service is temporarily unavailable. Your original text has been preserved.";

    return Response.json(
      {
        success: false,
        message: userMessage,
        isRateLimit: is429,
      },
      { status: is429 ? 429 : 502 }
    );
  } catch (err) {
    console.error("[POST /api/admin/translate] Unexpected error:", err);
    return Response.json(
      {
        success: false,
        message: "An unexpected error occurred during translation. Your text was preserved.",
      },
      { status: 500 }
    );
  }
}
