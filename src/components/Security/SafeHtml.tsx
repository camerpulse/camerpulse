import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  children: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  sanitizeConfig?: DOMPurify.Config;
}

/**
 * Safe HTML component that sanitizes content before rendering
 * Replaces dangerous dangerouslySetInnerHTML usage
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({ 
  children, 
  allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  allowedAttributes = {
    '*': ['class', 'id'],
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'width', 'height']
  },
  className,
  as: Element = 'div'
}) => {
  const sanitizedHtml = React.useMemo(() => {
    return DOMPurify.sanitize(children, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: Object.values(allowedAttributes).flat(),
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
      FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'srcset', 'onblur', 'onchange', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmouseout', 'onmousemove', 'onmouseup', 'onreset', 'onselect', 'onsubmit'],
      KEEP_CONTENT: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/)|\/)/i,
      USE_PROFILES: { html: true },
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    });
  }, [children, allowedTags, allowedAttributes]);

  return (
    <Element 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

/**
 * Safe text component for displaying plain text (no HTML)
 */
export const SafeText: React.FC<{ 
  children: string; 
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, className, as: Element = 'span' }) => {
  const sanitizedText = React.useMemo(() => {
    return DOMPurify.sanitize(children, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
  }, [children]);

  return <Element className={className}>{sanitizedText}</Element>;
};