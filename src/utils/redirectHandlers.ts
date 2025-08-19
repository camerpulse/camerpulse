/**
 * Handles legacy URL redirects, including language-based paths
 */
export function handleLegacyRedirects(pathname: string): string | null {
  // Handle old language-prefixed paths
  const languageMatch = pathname.match(/^\/(?:en|fr)(\/.*)$/);
  if (languageMatch) {
    return languageMatch[1] || '/'; // Return path without language prefix
  }

  // Add any other legacy path handling here
  return null;
}