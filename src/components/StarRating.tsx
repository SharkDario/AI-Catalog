"use client";

import { Star } from "lucide-react";
import { useState, useRef } from "react";

export function StarRating({ value = 0, onChange, name, autoSubmit = false }: { value?: number; onChange?: (n: number) => void; name?: string; autoSubmit?: boolean }) {
  const [hover, setHover] = useState(0);
  const [selectedValue, setSelectedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const display = hover || selectedValue;

  const handleClick = (n: number) => {
    setSelectedValue(n);
    onChange?.(n);
    
    if (autoSubmit && containerRef.current) {
      // Allow state to update, then submit the form
      setTimeout(() => {
        const form = containerRef.current?.closest('form');
        if (form) form.requestSubmit();
      }, 0);
    }
  };

  return (
    <div className="flex items-center gap-1" ref={containerRef}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleClick(n)}
          className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${n}`}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              n <= display ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
