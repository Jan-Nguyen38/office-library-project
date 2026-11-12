import sanitizeHtml from 'sanitize-html';

const PX = /^\d+(\.\d+)?px$/;

// Allowlist matching what the Tiptap editor (StarterKit, Underline, Table, TextAlign) and mammoth produce.
// Document HTML is rendered with dangerouslySetInnerHTML, including on public share links.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'a',
    'table', 'colgroup', 'col', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    ol: ['start'],
    th: ['colspan', 'rowspan', 'colwidth', 'style'],
    td: ['colspan', 'rowspan', 'colwidth', 'style'],
    '*': ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedStyles: {
    '*': { 'text-align': [/^(left|right|center|justify)$/] },
    table: { width: [PX], 'min-width': [PX] },
    col: { width: [PX], 'min-width': [PX] },
  },
};

export const sanitizeContent = (html: string) => sanitizeHtml(html, OPTIONS);
