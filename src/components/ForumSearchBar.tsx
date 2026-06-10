"use client";

import { useState } from "react";
import { Search, Mic } from "lucide-react";
import { useRouter } from "next/navigation";

export function ForumSearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
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
      if (transcript.trim()) {
        router.push(`/forum?q=${encodeURIComponent(transcript)}`);
      } else {
        router.push(`/forum`);
      }
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
      router.push(`/forum?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/forum`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full flex items-center bg-card border border-border rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all ${isListening ? 'ring-2 ring-teal/50 shadow-[0_0_15px_rgba(45,212,191,0.3)]' : ''}`}>
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        name="q"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isListening ? "Escuchando..." : "Buscar debates (texto o voz)..."}
        className="flex-1 bg-transparent border-none text-foreground px-3 py-2 focus:outline-none placeholder:text-muted-foreground/70"
      />
      <button
        type="button"
        onClick={handleVoiceSearch}
        className={`${isListening ? 'bg-teal text-white animate-pulse' : 'bg-primary/10 hover:bg-primary/20 text-primary'} p-2 rounded-full transition-colors ml-2 mr-1`}
        title="Búsqueda por voz"
      >
        <Mic className="w-4 h-4" />
      </button>
    </form>
  );
}
