'use client';

import { useState, useEffect } from 'react';

export default function PokemonImage({ src, fallbackSrc, alt, className, style }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    // Keep state in sync with parent prop updates
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        ...style
      }}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
