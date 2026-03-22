'use client';

import { useEffect, useState } from 'react';

const TITLE = 'BitTaxly';
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

export default function AnimatedTitle() {
  const [displayText, setDisplayText] = useState(TITLE);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation on mount and every 10 seconds
    const animate = () => {
      setIsAnimating(true);

      const chars = TITLE.split('');
      const iterations = 20; // How many times each letter cycles
      let currentIteration = 0;

      const interval = setInterval(() => {
        setDisplayText(
          chars
            .map((char, index) => {
              if (char === ' ') return ' ';

              // Calculate when this letter should settle (wave effect)
              const letterDelay = index * 0.5;
              const progress = currentIteration - letterDelay;

              if (progress < 0) {
                return char; // Not started yet
              } else if (progress >= iterations) {
                return char; // Already settled
              } else {
                // Still animating - show random character
                return CHARS[Math.floor(Math.random() * CHARS.length)];
              }
            })
            .join('')
        );

        currentIteration++;

        // Stop when all letters have settled
        if (currentIteration >= iterations + chars.length) {
          clearInterval(interval);
          setDisplayText(TITLE);
          setIsAnimating(false);
        }
      }, 50); // Speed of character changes

      return () => clearInterval(interval);
    };

    // Initial animation
    const timeout = setTimeout(animate, 500);

    // Repeat animation every 30 seconds
    const repeatInterval = setInterval(animate, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(repeatInterval);
    };
  }, []);

  return (
    <h1
      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight break-words"
      style={{
        color: '#1a73e8',
        textShadow: `
          -1px -1px 0 rgba(255, 255, 255, 0.5),
          1px 1px 2px rgba(0, 0, 0, 0.2),
          2px 2px 4px rgba(0, 0, 0, 0.1)
        `,
        letterSpacing: '0.02em',
      }}
    >
      {displayText}
    </h1>
  );
}
