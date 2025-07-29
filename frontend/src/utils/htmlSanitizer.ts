import DOMPurify from 'dompurify';

/**
 * Safely sanitize HTML content to prevent XSS attacks
 * This utility provides secure alternatives to dangerouslySetInnerHTML
 */
export const sanitizeHtml = (dirty: string): string => {
  // Configure DOMPurify with strict settings
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class', 'id'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'style']
  };

  return DOMPurify.sanitize(dirty, config);
};

/**
 * Safely render text with line breaks (alternative to dangerouslySetInnerHTML for simple text)
 */
export const renderTextWithBreaks = (text: string): string => {
  // First escape any HTML entities, then replace newlines with <br>
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
    
  return escaped.replace(/\n/g, '<br />');
};

/**
 * Strip all HTML tags and return plain text
 */
export const stripHtml = (html: string): string => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
};

/**
 * Safe HTML component wrapper for React
 */
export const createSafeHtmlProps = (content: string) => ({
  dangerouslySetInnerHTML: { __html: sanitizeHtml(content) }
});