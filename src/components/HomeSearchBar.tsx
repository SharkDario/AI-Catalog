"use client";

import { useState, useEffect } from "react";
import { Search, Mic } from "lucide-react";
import { useRouter } from "next/navigation";

export function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const handleVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Automatically search when voice is recognized
      router.push(`/catalog?q=${encodeURIComponent(transcript)}`);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative max-w-3xl flex items-center bg-background/50 backdrop-blur-md border border-border rounded-full p-2 pl-6 focus-within:ring-2 focus-within:ring-primary/50 transition-all ${isListening ? 'ring-2 ring-teal/50 shadow-[0_0_15px_rgba(45,212,191,0.3)]' : ''}`}>
      <Search className="w-5 h-5 text-muted-foreground" />
      <input 
        name="q"
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isListening ? "Escuchando..." : "Buscar software de IA, modelos, papers..."} 
        className="flex-1 bg-transparent border-none text-foreground px-4 py-3 focus:outline-none placeholder:text-muted-foreground/70"
      />
      <button 
        type="button" 
        onClick={handleVoiceSearch}
        className={`${isListening ? 'bg-teal text-white animate-pulse' : 'bg-primary/10 hover:bg-primary/20 text-primary'} p-3 rounded-full transition-colors`} 
        title="Búsqueda por voz"
      >
        <Mic className="w-5 h-5" />
      </button>
    </form>
  );
}
