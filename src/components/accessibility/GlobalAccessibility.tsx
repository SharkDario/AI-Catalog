"use client";

import { useState, useEffect } from "react";
import { Volume2, Hand, X } from "lucide-react";
import { FingerSpeller } from "./FingerSpeller";

export function GlobalAccessibility() {
  const [isReading, setIsReading] = useState(false);
  const [showSpeller, setShowSpeller] = useState(false);
  const [pageText, setPageText] = useState("");

  const extractPageText = () => {
    // Priority 1: Selected text
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      return selectedText;
    }

    // Priority 2: Try to find the main content container, or fallback to the whole body
    const container = document.querySelector("main") || document.querySelector(".container") || document.body;
    
    // Simplest extraction: just get innerText of h1, h2, h3, p
    const elements = container.querySelectorAll("h1, h2, h3, p");
    if (elements.length > 0) {
      return Array.from(elements).map(e => (e as HTMLElement).innerText).join(". ");
    }
    return (container as HTMLElement).innerText;
  };

  const handleReadPage = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const text = extractPageText();
    if (!text) {
      alert("No hay texto para leer. Selecciona un fragmento de texto con el mouse primero.");
      return;
    }

    // Clean text for reading
    const cleanText = text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "es-ES";
    utterance.onend = () => setIsReading(false);
    
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const handleToggleSpeller = () => {
    if (showSpeller) {
      setShowSpeller(false);
    } else {
      const text = extractPageText();
      if (!text) {
        alert("Selecciona un fragmento de texto con el mouse para ver su dactilología.");
        return;
      }
      // Limit to 200 chars to avoid freezing the browser and an infinitely long animation
      setPageText(text.slice(0, 200) + (text.length > 200 ? "..." : "")); 
      setShowSpeller(true);
    }
  };

  // Ensure speech synthesis stops when component unmounts
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <>
      <div className="fixed top-6 right-6 z-[100] flex gap-3">
        <button
          onClick={handleReadPage}
          className={`p-3 rounded-full shadow-xl transition-all flex items-center justify-center ${isReading ? "bg-red-500 text-white animate-pulse" : "bg-primary text-primary-foreground hover:scale-110"}`}
          title={isReading ? "Detener lectura" : "Leer página en voz alta"}
        >
          <Volume2 className="w-6 h-6" />
        </button>
        <button
          onClick={handleToggleSpeller}
          className={`p-3 rounded-full shadow-xl transition-all flex items-center justify-center ${showSpeller ? "bg-red-500 text-white" : "bg-teal text-white hover:scale-110"}`}
          title={showSpeller ? "Cerrar Dactilología" : "Ver página en Dactilología"}
        >
          <Hand className="w-6 h-6" />
        </button>
      </div>

      {showSpeller && (
        <div className="fixed bottom-6 left-6 md:left-[260px] z-[100] w-[350px] animate-in slide-in-from-bottom-5">
          <div className="relative">
            <button 
              onClick={() => setShowSpeller(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full z-50 hover:scale-110 transition-transform shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
              <FingerSpeller text={pageText} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
