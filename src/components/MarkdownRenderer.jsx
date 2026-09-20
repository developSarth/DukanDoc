import React from 'react';

/**
 * Lightweight, zero-dependency Markdown renderer for legal reports and requirement guides.
 * Supports #, ##, ### headers, **bold**, *italics*, [links](url), lists, and paragraphs.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let currentListType = null; // 'ul' | 'ol'

  function flushList() {
    if (currentList.length > 0) {
      if (currentListType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-1.5 my-2.5 text-sm leading-relaxed">
            {currentList.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1.5 my-2.5 text-sm leading-relaxed">
            {currentList.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </ul>
        );
      }
      currentList = [];
      currentListType = null;
    }
  }

  function parseInline(text) {
    if (!text) return null;

    // Pattern for links [text](url)
    const parts = [];
    let lastIndex = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseFormatting(text.substring(lastIndex, match.index), `txt-${lastIndex}`));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors inline-flex items-center gap-0.5"
        >
          {linkText}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(parseFormatting(text.substring(lastIndex), `txt-end`));
    }

    return parts.length > 0 ? parts : parseFormatting(text, 'single');
  }

  function parseFormatting(text, keyPrefix) {
    // Parse bold **text** and italics *text*
    const segments = [];
    let remaining = text;
    let segIdx = 0;

    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let m;
    let last = 0;

    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) {
        segments.push(<span key={`${keyPrefix}-raw-${last}`}>{text.substring(last, m.index)}</span>);
      }
      if (m[2]) {
        // Bold
        segments.push(<strong key={`${keyPrefix}-b-${m.index}`} className="font-semibold text-foreground">{m[2]}</strong>);
      } else if (m[3]) {
        // Italics
        segments.push(<em key={`${keyPrefix}-i-${m.index}`} className="italic">{m[3]}</em>);
      } else if (m[4]) {
        // Code
        segments.push(<code key={`${keyPrefix}-c-${m.index}`} className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{m[4]}</code>);
      }
      last = regex.lastIndex;
      segIdx++;
    }

    if (last < text.length) {
      segments.push(<span key={`${keyPrefix}-tail`}>{text.substring(last)}</span>);
    }

    return segments.length > 0 ? segments : text;
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${index}`} className="text-base font-semibold tracking-tight mt-5 mb-2 text-foreground flex items-center gap-1.5">
          {parseInline(trimmed.replace('### ', ''))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${index}`} className="text-lg font-bold tracking-tight mt-6 mb-2.5 pb-1 border-b border-border/40 text-foreground">
          {parseInline(trimmed.replace('## ', ''))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${index}`} className="text-xl font-extrabold tracking-tight mt-6 mb-3 text-foreground">
          {parseInline(trimmed.replace('# ', ''))}
        </h2>
      );
      return;
    }

    // Bullet list items (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      currentList.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    // Numbered list items (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      currentList.push(trimmed.replace(/^\d+\.\s+/, ''));
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="my-2 text-sm leading-relaxed text-muted-foreground">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`markdown-content space-y-1 ${className}`}>{elements}</div>;
}
