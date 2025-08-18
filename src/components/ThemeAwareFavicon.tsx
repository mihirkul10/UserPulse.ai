'use client';

import { useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeAwareFavicon() {
  const { mode } = useTheme();

  useEffect(() => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add theme-appropriate favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = '/favicon-new.svg';
    
    document.head.appendChild(favicon);

    // Cleanup function
    return () => {
      const currentFavicon = document.querySelector('link[rel="icon"]');
      if (currentFavicon) {
        currentFavicon.remove();
      }
    };
  }, [mode]);

  return null;
}
