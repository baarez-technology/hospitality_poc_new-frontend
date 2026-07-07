import React from 'react'

const SearchHighlight = ({ text, query, className = '' }) => {
  if (!query || query.trim() === '') {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, idx) => (
        regex.test(part) ? (
          <mark key={idx} className="bg-yellow-200 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      ))}
    </span>
  )
}

export default SearchHighlight
