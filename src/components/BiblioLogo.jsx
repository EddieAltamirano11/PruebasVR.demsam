import React from 'react';

/**
 * Isotipo de rombo geométrico dorado de BiblioVR Admin
 */
export function BiblioLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rombo exterior dorado */}
      <rect
        x="20"
        y="3"
        width="24"
        height="24"
        rx="4"
        transform="rotate(45 20 3)"
        fill="#E5A00D"
      />
      {/* Detalle interno azul marino */}
      <rect
        x="20"
        y="9"
        width="15.5"
        height="15.5"
        rx="2.5"
        transform="rotate(45 20 9)"
        fill="#0B1A30"
      />
      {/* Núcleo dorado */}
      <rect
        x="20"
        y="14.5"
        width="7.8"
        height="7.8"
        rx="1.5"
        transform="rotate(45 20 14.5)"
        fill="#E5A00D"
      />
    </svg>
  );
}

export default BiblioLogo;
