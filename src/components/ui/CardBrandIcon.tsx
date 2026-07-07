/**
 * Card Brand Icon Component
 * Displays card brand logos as inline SVGs for reliability.
 */

import { CreditCard } from 'lucide-react';

interface CardBrandIconProps {
  brand: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardBrandIcon({ brand, className = '', size = 'md' }: CardBrandIconProps) {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  const brandLower = brand?.toLowerCase() || '';

  // Visa logo
  if (brandLower === 'visa') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Visa"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#0E4595" width="750" height="471" rx="40" />
          <path
            d="M278.198 334.228l33.36-195.763h53.358l-33.384 195.763h-53.334zm246.11-191.417c-10.57-3.966-27.135-8.222-47.822-8.222-52.725 0-89.863 26.551-90.18 64.604-.297 28.129 26.515 43.822 46.754 53.185 20.77 9.597 27.752 15.716 27.652 24.283-.133 13.123-16.586 19.115-31.924 19.115-21.355 0-32.701-2.967-50.225-10.274l-6.878-3.111-7.487 43.822c12.463 5.466 35.508 10.199 59.438 10.445 56.09 0 92.502-26.248 92.916-66.884.199-22.27-14.016-39.215-44.801-53.188-18.65-9.056-30.072-15.099-29.951-24.269 0-8.137 9.668-16.838 30.559-16.838 17.447-.271 30.088 3.534 39.936 7.5l4.781 2.259 7.232-42.427m137.308-4.223h-41.23c-12.772 0-22.332 3.486-27.94 16.234l-79.245 179.404h56.031s9.159-24.121 11.231-29.418c6.123 0 60.555.084 68.336.084 1.596 6.854 6.492 29.334 6.492 29.334h49.512l-43.187-195.638zm-65.417 126.408c4.414-11.279 21.26-54.724 21.26-54.724-.314.521 4.381-11.334 7.074-18.684l3.606 16.878s10.217 46.729 12.353 56.53h-44.293zM209.168 138.465l-52.24 133.496-5.565-27.129c-9.726-31.274-40.025-65.157-73.898-82.12l47.767 171.204 56.455-.063 84.004-195.388h-56.523"
            fill="#fff"
          />
          <path
            d="M131.92 138.465H45.879l-.682 4.073c66.939 16.204 111.232 55.363 129.618 102.415l-18.709-89.96c-3.229-12.396-12.597-16.095-24.186-16.528"
            fill="#F2AE14"
          />
        </g>
      </svg>
    );
  }

  // Mastercard logo
  if (brandLower === 'mastercard') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Mastercard"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#000" width="750" height="471" rx="40" />
          <circle fill="#EB001B" cx="250" cy="235" r="150" />
          <circle fill="#F79E1B" cx="500" cy="235" r="150" />
          <path
            d="M375 116.3a150 150 0 0 0 0 237.4 150 150 0 0 0 0-237.4z"
            fill="#FF5F00"
          />
        </g>
      </svg>
    );
  }

  // RuPay logo
  if (brandLower === 'rupay') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="RuPay"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#097A44" width="750" height="471" rx="40" />
          <text
            fill="#fff"
            fontFamily="Arial, sans-serif"
            fontSize="120"
            fontWeight="bold"
            x="375"
            y="270"
            textAnchor="middle"
          >
            RuPay
          </text>
        </g>
      </svg>
    );
  }

  // American Express logo
  if (brandLower === 'amex' || brandLower === 'american express') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="American Express"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#006FCF" width="750" height="471" rx="40" />
          <text
            fill="#fff"
            fontFamily="Arial, sans-serif"
            fontSize="80"
            fontWeight="bold"
            x="375"
            y="250"
            textAnchor="middle"
          >
            AMEX
          </text>
          <text
            fill="#fff"
            fontFamily="Arial, sans-serif"
            fontSize="30"
            x="375"
            y="300"
            textAnchor="middle"
          >
            AMERICAN EXPRESS
          </text>
        </g>
      </svg>
    );
  }

  // Maestro logo
  if (brandLower === 'maestro') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Maestro"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#000" width="750" height="471" rx="40" />
          <circle fill="#6C6BBD" cx="250" cy="235" r="150" />
          <circle fill="#EB001B" cx="500" cy="235" r="150" />
          <path
            d="M375 116.3a150 150 0 0 0 0 237.4 150 150 0 0 0 0-237.4z"
            fill="#7375CF"
          />
        </g>
      </svg>
    );
  }

  // Diners Club logo
  if (brandLower === 'diners' || brandLower === 'diners club') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Diners Club"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#0079BE" width="750" height="471" rx="40" />
          <circle fill="#fff" cx="375" cy="235" r="140" />
          <circle fill="#0079BE" cx="375" cy="235" r="100" />
        </g>
      </svg>
    );
  }

  // Discover logo
  if (brandLower === 'discover') {
    return (
      <svg
        viewBox="0 0 750 471"
        className={`${sizeClasses[size]} w-auto ${className}`}
        aria-label="Discover"
      >
        <g fill="none" fillRule="evenodd">
          <rect fill="#fff" width="750" height="471" rx="40" />
          <rect fill="#F47216" x="0" y="235" width="750" height="236" rx="40" />
          <text
            fill="#000"
            fontFamily="Arial, sans-serif"
            fontSize="90"
            fontWeight="bold"
            x="375"
            y="200"
            textAnchor="middle"
          >
            DISCOVER
          </text>
        </g>
      </svg>
    );
  }

  // Default: show generic card icon
  return <CreditCard className={`${sizeClasses[size]} w-auto text-neutral-400 ${className}`} />;
}

export { CardBrandIcon };
