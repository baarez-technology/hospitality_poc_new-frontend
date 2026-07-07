import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Glimmora Design System v4.0 - SearchHighlight
 * Highlights search query matches in text with brand colors
 */
const SearchHighlight = ({ text, query, className = '' }) => {
  if (!query || query.trim() === '' || !text) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = String(text).split(regex);

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <mark
            key={idx}
            className={cn(
              'bg-terra-100 text-terra-800 font-medium',
              'px-0.5 rounded-sm'
            )}
          >
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </span>
  );
};

export default SearchHighlight;
