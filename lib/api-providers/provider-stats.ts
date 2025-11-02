import { ProviderStats, ImageProcessorProvider } from "./types";

const STATS_KEY = "ai_provider_stats";

// Daily limits for each provider
const PROVIDER_LIMITS: Record<ImageProcessorProvider, number> = {
  gemini: 500,      // 500 requests per day official limit
  replicate: 100,   // Conservative limit to preserve free credits (~$25 = 2500 images, but we limit daily usage)
  auto: Infinity,
};

export function getProviderStats(): Record<ImageProcessorProvider, ProviderStats> {
  if (typeof window === "undefined") {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) {
      return getDefaultStats();
    }

    const stats = JSON.parse(stored);

    // Reset stats if it's a new day
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    Object.keys(stats).forEach((provider) => {
      if (stats[provider].lastRequest < oneDayAgo) {
        stats[provider].requestsToday = 0;
        stats[provider].isAvailable = true;
      }

      // Check if provider hit limit
      if (stats[provider].requestsToday >= PROVIDER_LIMITS[provider as ImageProcessorProvider]) {
        stats[provider].isAvailable = false;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error loading provider stats:", error);
    return getDefaultStats();
  }
}

export function updateProviderStats(provider: ImageProcessorProvider, success: boolean): void {
  if (typeof window === "undefined") return;

  try {
    const stats = getProviderStats();

    if (success) {
      stats[provider].requestsToday += 1;
      stats[provider].lastRequest = Date.now();

      // Check if limit reached
      if (stats[provider].requestsToday >= PROVIDER_LIMITS[provider]) {
        stats[provider].isAvailable = false;
      }
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error updating provider stats:", error);
  }
}

export function getAvailableProvider(): ImageProcessorProvider | null {
  const stats = getProviderStats();

  // Priority order: Replicate -> Gemini
  // Replicate primero porque tiene mejor calidad y créditos gratis
  const priority: ImageProcessorProvider[] = ["replicate", "gemini"];

  for (const provider of priority) {
    if (stats[provider].isAvailable && (stats[provider].errorCount || 0) < 3) {
      return provider;
    }
  }

  return null;
}

function getDefaultStats(): Record<ImageProcessorProvider, ProviderStats> {
  return {
    gemini: {
      provider: "gemini",
      requestsToday: 0,
      lastRequest: 0,
      isAvailable: true,
      dailyLimit: PROVIDER_LIMITS.gemini,
      errorCount: 0,
    },
    replicate: {
      provider: "replicate",
      requestsToday: 0,
      lastRequest: 0,
      isAvailable: true,
      dailyLimit: PROVIDER_LIMITS.replicate,
      errorCount: 0,
    },
    auto: {
      provider: "auto",
      requestsToday: 0,
      lastRequest: 0,
      isAvailable: true,
      dailyLimit: PROVIDER_LIMITS.auto,
      errorCount: 0,
    },
  };
}
