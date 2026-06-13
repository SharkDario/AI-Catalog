"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CollapsibleMessage } from "./CollapsibleMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function VoiceSearchAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "es-ES";
        
        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          handleNewUserMessage(text);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [messages]);

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

  const handleNewUserMessage = async (queryText: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: queryText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 1. Obtener contexto del backend
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      
      const systemPrompt = data.systemPrompt || "Eres un asistente virtual.";

      const ollamaMessages = [
        { role: "system", content: systemPrompt },
        ...newMessages,
      ];

      // 2. Hacer la petición local a Ollama (Cliente)
      const ollamaRes = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:3b",
          messages: ollamaMessages,
          stream: false,
        }),
      });

      if (!ollamaRes.ok) throw new Error("Error en Ollama");

      const ollamaData = await ollamaRes.json();
      const answer = ollamaData.message.content;

      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
      speakAnswer(answer);
      
    } catch (e: any) {
      setMessages(prev => [
        ...prev, 
        { role: "assistant", content: `Hubo un error al conectar con Ollama en localhost:11434. Asegúrate de tenerlo instalado y ejecutándose localmente.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakAnswer = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Eliminar markdown para leer
      const cleanText = text.replace(/[*_#]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col h-full h-[800px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/20 p-2 rounded-lg">
          <Mic className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Asistente de Voz (Chat)</h2>
      </div>
      <p className="text-muted-foreground mb-6">
        Pulsa el micrófono para hablar. El asistente buscará en la base de datos y recordará nuestra conversación.
      </p>

      <div className="flex-1 bg-background border border-border rounded-xl p-4 overflow-y-auto mb-6 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground italic">
            El historial de conversación aparecerá aquí...
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                m.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted/50 border border-border text-foreground rounded-tl-sm prose prose-invert prose-sm"
              }`}>
                {m.role === "assistant" ? (
                  <>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Ollama RAG
                    </span>
                    <CollapsibleMessage content={m.content} isMarkdown={true} />
                  </>
                ) : (
                  <CollapsibleMessage content={m.content} isMarkdown={false} />
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 border border-border text-foreground rounded-2xl rounded-tl-sm px-5 py-3 animate-pulse">
              Escribiendo respuesta...
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <button 
          onClick={toggleListen}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? "bg-gradient-to-br from-red-400 to-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.6)] animate-pulse" 
              : isLoading
                ? "bg-muted shadow-none cursor-wait"
                : "bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105"
          }`}
          disabled={isLoading}
        >
          <Mic className={`w-8 h-8 ${isLoading ? 'text-muted-foreground' : 'text-white'}`} />
        </button>
      </div>
    </div>
  );
}
