"use client";

import { useState, useEffect } from "react";
import { Hand } from "lucide-react";

export const tokenizeLSA = (text: string) => {
  const withoutAccents = text.toUpperCase()
    .replace(/[ÁÄÂÀ]/g, "A")
    .replace(/[ÉËÊÈ]/g, "E")
    .replace(/[ÍÏÎÌ]/g, "I")
    .replace(/[ÓÖÔÒ]/g, "O")
    .replace(/[ÚÜÛÙ]/g, "U");

  const clean = withoutAccents.replace(/[^A-ZÑ\s]/g, "");
  const tokens = [];
  let i = 0;
  while (i < clean.length) {
    if (clean[i] === 'C' && clean[i + 1] === 'H') {
      tokens.push('CH');
      i += 2;
    } else {
      tokens.push(clean[i]);
      i++;
    }
  }
  return tokens;
};

export const FingerSpeller = ({ text }: { text: string }) => {
  const tokens = tokenizeLSA(text);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentIndex < tokens.length) {
      timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setImageError(false);
      }, 700);
    } else if (currentIndex >= tokens.length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [currentIndex, isPlaying, tokens.length]);

  const startSpelling = () => {
    setCurrentIndex(0);
    setImageError(false);
    setIsPlaying(true);
  };

  const currentLetter = tokens[currentIndex];

  return (
    <div className="bg-background border-2 border-border p-6 rounded-xl mt-4 flex flex-col items-center shadow-inner">
      <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 text-center">
        Traducción Visual<br /><span className="text-xs opacity-75">(Lengua de Señas Argentina - LSA)</span>
      </h4>

      <button
        onClick={startSpelling}
        disabled={isPlaying || tokens.length === 0}
        className="bg-teal text-white font-bold px-6 py-2 rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md mb-6"
      >
        {isPlaying ? "Traduciendo..." : "Reproducir Deletreo"}
      </button>

      <div className="relative w-40 h-40 bg-secondary/50 rounded-2xl flex items-center justify-center shadow-lg border-2 border-border mb-6 overflow-hidden">
        {isPlaying && currentLetter ? (
          currentLetter === " " ? (
            <span className="text-muted-foreground italic text-sm">Espacio</span>
          ) : (
            <div className="flex flex-col items-center w-full h-full p-2 bg-white animate-in zoom-in duration-200 justify-center relative">
              <span className="absolute top-2 left-2 text-xs font-bold text-teal bg-teal/10 px-2 py-1 rounded z-20">LSA</span>

              {!imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/lsa/${currentLetter.toLowerCase()}.jpg`}
                  alt={`Seña para ${currentLetter}`}
                  className="w-full h-full object-contain z-10 relative"
                  onError={() => setImageError(true)}
                />
              ) : (
                <>
                  <Hand className="w-20 h-20 text-teal opacity-20 absolute" />
                  <span className="text-6xl font-black text-foreground z-10 drop-shadow-md">{currentLetter}</span>
                </>
              )}
            </div>
          )
        ) : (
          <Hand className="w-12 h-12 text-muted-foreground/30" />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-1 mb-4 px-4 max-h-[100px] overflow-y-auto w-full">
        {tokens.map((char, idx) => (
          <span
            key={idx}
            className={`text-lg font-mono w-6 text-center ${idx === currentIndex
              ? "bg-teal text-white font-bold rounded-sm scale-125 transition-transform shadow-sm"
              : "text-muted-foreground"
              }`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      <div className="mt-2 px-4 py-3 bg-secondary/30 rounded-lg text-[10px] text-muted-foreground/80 leading-relaxed max-w-xs text-center border border-border/50">
        <p className="font-semibold text-foreground/70 mb-1">Fuente de imágenes LSA:</p>
        <p>Confederación Argentina de Sordos (CAS), 2019.</p>
        <p className="italic">"Señario de términos y expresiones básicas en la LSA".</p>
        <p className="text-[9px] mt-1 opacity-70">ISBN 978-987-47104-0-6. Ley 11.723.</p>
      </div>
    </div>
  );
};
