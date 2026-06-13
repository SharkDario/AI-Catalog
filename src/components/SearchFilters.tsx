"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Mic, MicOff, Filter } from "lucide-react";

export function SearchFilters({ classifications }: { classifications?: { id: number; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [classificationId, setClassificationId] = useState(searchParams.get("classificationId") || "");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
          handleSearch(transcript, type, classificationId);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [type, classificationId]);

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

  const handleSearch = (overrideQuery?: string, overrideType?: string, overrideClass?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    const t = overrideType !== undefined ? overrideType : type;
    const c = overrideClass !== undefined ? overrideClass : classificationId;

    const params = new URLSearchParams(searchParams.toString());

    if (q) params.set("q", q); else params.delete("q");
    if (t) params.set("type", t); else params.delete("type");
    if (c) params.set("classificationId", c); else params.delete("classificationId");

    router.push(`/catalog?${params.toString()}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
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

        <div className="flex gap-4 w-full lg:w-auto">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              handleSearch(query, e.target.value, classificationId);
            }}
            className="bg-background border border-input rounded-full py-3 px-4 focus:ring-2 focus:ring-primary focus:outline-none w-full lg:w-40"
          >
            <option value="">Todos los Tipos</option>
            <option value="App">App</option>
            <option value="Librería">Librería</option>
            <option value="Modelo">Modelo</option>
          </select>

          {classifications && (
            <select
              value={classificationId}
              onChange={(e) => {
                setClassificationId(e.target.value);
                handleSearch(query, type, e.target.value);
              }}
              className="bg-background border border-input rounded-full py-3 px-4 focus:ring-2 focus:ring-primary focus:outline-none w-full lg:w-60"
            >
              <option value="">Todas las Clasificaciones</option>
              {classifications.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Mic className="h-4 w-4 text-primary" />
        <span><strong>Búsqueda por voz:</strong> Haz clic en el ícono del micrófono para dictar tu búsqueda usando lenguaje natural (Web Speech API).</span>
      </div>
    </div>
  );
}
