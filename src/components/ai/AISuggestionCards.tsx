import React from 'react';
import { aiSuggestions } from '../../data/aiSuggestions';

/**
 * AI Suggestion Cards Component
 * Displays grid of pre-built prompt suggestions
 */
export default function AISuggestionCards({ onSuggestionClick, currentPage = 'dashboard' }) {
  // Get contextual suggestions based on current page
  const getSuggestions = () => {
    // Show all suggestions by default
    return aiSuggestions;
  };

  const suggestions = getSuggestions();

  return (
    <div className="px-6 py-5 border-t border-[#A57865]/20 bg-gradient-to-br from-[#FAF8F6] via-white to-[#FAF8F6]">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-neutral-800 mb-1 flex items-center gap-2">
          <span className="text-lg">✨</span>
          Suggested Prompts
        </h4>
        <p className="text-xs text-neutral-600">Click any card to instantly start a conversation</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {suggestions.slice(0, 4).map((suggestion, index) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="group relative p-4 bg-gradient-to-br from-white to-[#FAF8F6] border-2 border-neutral-200 rounded-2xl hover:border-[#A57865] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#A57865]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

            <div className="relative flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#A57865]/10 to-[#CDB261]/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-2xl">
                  {suggestion.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-neutral-800 mb-1 group-hover:text-[#A57865] transition-colors">
                  {suggestion.title}
                </h5>
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000"></div>
            </div>
          </button>
        ))}
      </div>

      {suggestions.length > 4 && (
        <button className="mt-4 w-full py-2.5 text-sm font-semibold text-[#A57865] hover:text-white bg-white hover:bg-[#A57865] border-2 border-[#A57865]/20 hover:border-[#A57865] rounded-xl transition-all duration-300 hover:shadow-md">
          Show more suggestions →
        </button>
      )}
    </div>
  );
}
