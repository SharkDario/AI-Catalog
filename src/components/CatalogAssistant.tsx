"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2, Mic, MicOff, Camera, Hand, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";
import { detectLetter } from "@/lib/handposeHelpers";
import { FingerSpeller } from "@/components/accessibility/FingerSpeller";

interface CatalogItem {
  name: string;
  objective?: string;
  description: string | null;
}

export function CatalogAssistant({ item, type = "software" }: { item: CatalogItem, type?: "software" | "classification" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados de accesibilidad
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [activeSpellerText, setActiveSpellerText] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Configuración de Reconocimiento de Voz
  useEffect(() => {
    let recognition: any;
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript + " ");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Error de voz:", event.error);
        setIsListening(false);
      };
    }

    if (isListening && recognition) {
      recognition.start();
    } else if (!isListening && recognition) {
      recognition.stop();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  const toggleListen = () => setIsListening(!isListening);

  // Configuración de Cámara (LSA)
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (!model) {
          const loadedModel = await handpose.load();
          setModel(loadedModel);
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        setIsCameraOn(false);
      }
    };

    if (isCameraOn) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
    };
  }, [isCameraOn, model]);

  // Detección de señas en loop
  useEffect(() => {
    let animationId: number;
    let lastLetter = "";
    let letterCount = 0;

    const detect = async () => {
      if (isCameraOn && videoRef.current && canvasRef.current && model) {
        if (videoRef.current.readyState === 4) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const predictions = await model.estimateHands(video);

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (predictions.length > 0) {
              const landmarks = predictions[0].landmarks;
              // Dibujar puntos
              for (let i = 0; i < landmarks.length; i++) {
                const [x, y] = landmarks[i];
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 3 * Math.PI);
                ctx.fillStyle = "teal";
                ctx.fill();
              }

              const letter = detectLetter(landmarks);
              if (letter) {
                if (letter === lastLetter) {
                  letterCount++;
                  // Si se mantiene la letra por ~20 frames, se añade al input
                  if (letterCount === 20) {
                    setInput(prev => prev + letter);
                    letterCount = 0;
                  }
                } else {
                  lastLetter = letter;
                  letterCount = 0;
                }
                
                // Dibujar la letra tentativa en el canvas
                ctx.font = "bold 48px sans-serif";
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeText(letter, 20, 50);
                ctx.fillText(letter, 20, 50);
                
                // Barra de progreso
                ctx.fillStyle = "rgba(20, 184, 166, 0.5)"; // teal
                ctx.fillRect(20, 60, (letterCount / 20) * 100, 10);
              }
            }
          }
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    if (isCameraOn) {
      detect();
    }

    return () => cancelAnimationFrame(animationId);
  }, [isCameraOn, model]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isCameraOn, activeSpellerText]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setActiveSpellerText(null); // Esconder el speller al mandar nuevo msj
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:3b",
          messages: [
            {
              role: "system",
              content: `Eres el asistente de Inteligencia Artificial del catálogo. Estás ayudando a un usuario con ${type === "software" ? "el software" : "la clasificación"} "${item.name}". 
${item.objective ? `Propósito: ${item.objective}` : ""}
Descripción: ${item.description || "Sin descripción adicional."}
Responde preguntas de forma clara y concisa en español, basándote en esta información.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userText }
          ],
          stream: false
        })
      });

      if (!response.ok) throw new Error("Error en Ollama");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Hubo un error al conectar con el asistente LLaMA. Por favor, asegúrate de que Ollama esté ejecutándose localmente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "es-ES";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-card border border-border shadow-2xl rounded-2xl w-[350px] sm:w-[450px] h-[600px] flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
          <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-2 font-bold">
              <Bot className="w-5 h-5" /> Asistente Inteligente
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 relative">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-4">
                ¡Hola! Soy el asistente de IA. ¿Tienes alguna duda sobre <strong>{item.name}</strong>?
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] rounded-xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground shadow-sm'}`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert prose-p:my-1 prose-a:text-teal">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {/* Botones de Output (Accesibilidad) solo para IA */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1 pl-1">
                    <button 
                      onClick={() => handleSpeak(msg.content)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                      title="Escuchar mensaje"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveSpellerText(activeSpellerText === msg.content ? null : msg.content)}
                      className={`p-1.5 rounded-md transition-colors ${activeSpellerText === msg.content ? 'text-teal bg-teal/10' : 'text-muted-foreground hover:text-teal hover:bg-muted'}`}
                      title="Ver Dactilología LSA"
                    >
                      <Hand className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border text-foreground rounded-xl px-4 py-2 flex items-center gap-2 text-sm shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Pensando...
                </div>
              </div>
            )}

            {/* Dactilología Inline (Bajo los mensajes) */}
            {activeSpellerText && (
              <div className="w-full flex justify-center py-2 animate-in fade-in">
                <div className="transform scale-90 origin-bottom">
                   <FingerSpeller text={activeSpellerText.slice(0, 100) + "..."} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Cámara preview (Handpose) */}
          {isCameraOn && (
            <div className="h-32 bg-black relative border-t border-border overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
              {!model && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/50">
                  Cargando modelo Handpose...
                </div>
              )}
              <div className="absolute top-1 right-1">
                 <button onClick={() => setIsCameraOn(false)} className="bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-border bg-card">
            <form onSubmit={handleSend} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Escribe, dicta o usa señas..."
                  className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Botones de Input (Accesibilidad) */}
              <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Bot className="w-3 h-3"/> IA Multimodal</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleListen}
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-muted'}`}
                    title="Dictar por voz"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${isCameraOn ? 'bg-teal text-white' : 'hover:bg-muted'}`}
                    title="Usar Lengua de Señas"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-105 transition-transform animate-bounce-subtle flex items-center justify-center"
        >
          <Bot className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
