import React from 'react';

export function highlightText(text, query) {
  if (!query || !text) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return {
    before,
    match,
    after,
    hasMatch: true,
  };
}

export function HighlightedText({ text, query, className = '' }) {
  const highlighted = highlightText(text, query);

  if (!highlighted.hasMatch) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {highlighted.before}
      <mark className="bg-aurora-100 text-aurora-900 font-semibold">
        {highlighted.match}
      </mark>
      {highlighted.after}
    </span>
  );
}
