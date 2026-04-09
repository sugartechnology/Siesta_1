/**
 * WKWebView native bridge: UserDefaults key `app_language_preference` (Swift @AppStorage).
 *
 * From JS (matches native parsing contract):
 *   window.webkit.messageHandlers.setAppLanguage.postMessage("tr" | "en" | "system");
 *   window.webkit.messageHandlers.setAppLanguage.postMessage({ language: "en" });
 * Values are case-insensitive, trimmed; unknown values are ignored.
 */

const ALLOWED = new Set(["tr", "en", "system"]);

/**
 * @param {unknown} raw - string or { language: string }
 * @returns {"tr"|"en"|"system"|null}
 */
export function normalizeAppLanguagePreference(raw) {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    return ALLOWED.has(v) ? v : null;
  }
  if (typeof raw === "object" && raw !== null && "language" in raw) {
    return normalizeAppLanguagePreference(raw.language);
  }
  return null;
}

/** First supported locale from browser (tr | en), else tr. */
export function resolveSystemLanguageForI18n() {
  const supported = ["tr", "en"];
  const list =
    typeof navigator !== "undefined" && navigator.languages?.length
      ? navigator.languages
      : [navigator?.language || "en"];
  for (const loc of list) {
    const code = String(loc || "")
      .split("-")[0]
      .trim()
      .toLowerCase();
    if (supported.includes(code)) return code;
  }
  return "tr";
}

/**
 * Notifies native layer only (no i18n change).
 * @param {"tr"|"en"|"system"} preference
 */
export function notifyNativeAppLanguage(preference) {
  const normalized = normalizeAppLanguagePreference(preference);
  if (!normalized) return;
  try {
    const handler = window.webkit?.messageHandlers?.setAppLanguage;
    if (handler) {
      handler.postMessage(normalized);
    }
  } catch (e) {
    console.warn("setAppLanguage bridge failed", e);
  }
}

/**
 * Applies language in i18next and syncs preference to native (WKWebView).
 * @param {import('i18next').i18n} i18n
 * @param {"tr"|"en"|"system"|string|{language?: string}} preference
 * @returns {Promise<boolean>} true if preference was recognized
 */
export async function setAppLanguagePreference(i18n, preference) {
  const normalized = normalizeAppLanguagePreference(preference);
  if (!normalized) return false;
  const i18nLng =
    normalized === "system"
      ? resolveSystemLanguageForI18n()
      : normalized;
  await i18n.changeLanguage(i18nLng);
  notifyNativeAppLanguage(normalized);
  return true;
}
