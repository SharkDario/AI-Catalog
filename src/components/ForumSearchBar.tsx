"use client";

import { useState } from "react";
import { Search, Mic } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ForumSearchBarProps {
  defaultValue?: string;
  classifications?: { id: number; name: string }[];
}

export function ForumSearchBar({ defaultValue = "", classifications = [] }: ForumSearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') || '';
  const currentClassification = searchParams.get('classificationId') || '';

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
      if (transcript.trim()) {
        updateUrl(transcript, currentType, currentClassification);
      } else {
        updateUrl("", currentType, currentClassification);
      }
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const updateUrl = (q: string, t: string, c: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (t) params.set('type', t);
    if (c) params.set('classificationId', c);
    router.push(`/forum?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, currentType, currentClassification);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <form onSubmit={handleSubmit} className={`relative flex-1 flex items-center bg-card border border-border rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all ${isListening ? 'ring-2 ring-teal/50 shadow-[0_0_15px_rgba(45,212,191,0.3)]' : ''}`}>
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

      <div className="flex gap-4">
        <select
          value={currentType}
          onChange={(e) => updateUrl(query, e.target.value, currentClassification)}
          className="bg-card border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los Tipos</option>
          <option value="App">App</option>
          <option value="Librería">Librería</option>
          <option value="Modelo">Modelo</option>
        </select>

        <select
          value={currentClassification}
          onChange={(e) => updateUrl(query, currentType, e.target.value)}
          className="bg-card border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todas las Clasificaciones</option>
          {classifications.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
