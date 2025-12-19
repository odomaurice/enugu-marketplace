export function safeRedirect(url: string | undefined, defaultUrl: string): string {
  if (!url) return defaultUrl;
  
  try {
    new URL(url);
    return url;
  } catch {
    return defaultUrl;
  }
}