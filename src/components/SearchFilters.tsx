"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Mic, MicOff, Filter } from "lucide-react";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "es-ES";
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          handleSearch(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error", e);
      }
    }
  };

  const handleSearch = (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, autor, objetivo..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-background border border-input rounded-full py-3 pl-10 pr-12 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button 
            type="button"
            onClick={toggleListen}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-muted-foreground hover:bg-secondary'}`}
            title="Buscar por Voz"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>
        <button 
          onClick={() => handleSearch()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity w-full md:w-auto flex items-center justify-center gap-2"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Mic className="h-4 w-4 text-primary" />
        <span><strong>Búsqueda por voz:</strong> Haz clic en el ícono del micrófono para dictar tu búsqueda usando lenguaje natural (Web Speech API).</span>
      </div>
    </div>
  );
}
