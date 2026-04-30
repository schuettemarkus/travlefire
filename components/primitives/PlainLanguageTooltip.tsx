'use client';

import { useState } from 'react';

interface PlainLanguageTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function PlainLanguageTooltip({ term, definition, children }: PlainLanguageTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        className="underline decoration-dotted underline-offset-4 decoration-ink/30 cursor-help min-h-[44px] min-w-[44px] inline-flex items-center"
        onClick={() => setShow(!show)}
        onBlur={() => setShow(false)}
        aria-label={`What does "${term}" mean?`}
        aria-expanded={show}
      >
        {children}
      </button>
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-brand bg-ink text-paper text-[0.8rem] w-max max-w-[240px] shadow-brand z-10"
        >
          {definition}
        </span>
      )}
    </span>
  );
}
