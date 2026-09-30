/**
 * WKWebView bridge used by the iPad app.
 * Native side registers `downloadImage` and saves the remote image.
 * A normal <a download> does not run inside that web view.
 *
 *   window.webkit.messageHandlers.downloadImage.postMessage({ url });
 */

export function downloadImageInNativeApp(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const handler = window.webkit?.messageHandlers?.downloadImage;
    if (!handler) return false;
    handler.postMessage({ url });
    return true;
  } catch (error) {
    console.warn("downloadImage bridge failed", error);
    return false;
  }
}
