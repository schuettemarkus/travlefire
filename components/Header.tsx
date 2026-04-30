'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const TEXT_SIZES = ['normal', 'larger', 'largest'] as const;
type TextSize = (typeof TEXT_SIZES)[number];

export function Header() {
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tf-text-size') as TextSize | null;
    if (saved && TEXT_SIZES.includes(saved)) {
      setTextSize(saved);
      applyTextSize(saved);
    }
  }, []);

  function applyTextSize(size: TextSize) {
    const html = document.documentElement;
    html.classList.remove('text-larger', 'text-largest');
    if (size === 'larger') html.classList.add('text-larger');
    if (size === 'largest') html.classList.add('text-largest');
  }

  function cycleTextSize() {
    const idx = TEXT_SIZES.indexOf(textSize);
    const next = TEXT_SIZES[(idx + 1) % TEXT_SIZES.length];
    setTextSize(next);
    applyTextSize(next);
    localStorage.setItem('tf-text-size', next);
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/recommendations', label: 'For You' },
    { href: '/trips', label: 'Trips' },
    { href: '/atlas', label: 'Atlas' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-md border-b border-mist">
      <div className="max-w-content mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="display text-2xl font-bold text-ember tracking-tight">
          Travelfire
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink/70 hover:text-ink transition-colors text-[0.9rem] font-medium min-h-[44px] flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={cycleTextSize}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-brand border border-mist hover:border-ember transition-colors text-[0.85rem] font-medium px-3"
            aria-label={`Make text ${textSize === 'normal' ? 'larger' : textSize === 'larger' ? 'largest' : 'normal size'}`}
            title="Make text larger"
          >
            {textSize === 'normal' ? 'A' : textSize === 'larger' ? 'A+' : 'A++'}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-mist bg-paper px-4 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-ink/70 hover:text-ink transition-colors font-medium min-h-[44px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
