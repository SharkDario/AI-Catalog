"use client";

import { useEffect, useRef, useState } from "react";
import { Hand, Camera, XCircle, Search, Trash2, ArrowLeft } from "lucide-react";
import "@tensorflow/tfjs-backend-webgl";
import * as handpose from "@tensorflow-models/handpose";

import { detectLetter } from "@/lib/handposeHelpers";

import ReactMarkdown from "react-markdown";
import { CollapsibleMessage } from "./CollapsibleMessage";
import { FingerSpeller } from "./FingerSpeller";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SignSearch() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [query, setQuery] = useState("");
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [letterHoldTime, setLetterHoldTime] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAbecedario, setShowAbecedario] = useState(false);

  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await handpose.load();
        setModel(loadedModel);
      } catch (err) {
        console.error("Error cargando handpose", err);
      }
    };
    loadModel();
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsCameraOn(true);
      detectHands();
    } catch (err) {
      console.error("Error accediendo a la cámara", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const detectHands = async () => {
    if (videoRef.current && canvasRef.current && model) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (video.readyState === 4 && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const predictions = await model.estimateHands(video);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          const landmarks = predictions[0].landmarks;

          for (let i = 0; i < landmarks.length; i++) {
            const [x, y] = landmarks[i];
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#06b6d4";
            ctx.fill();
          }

          const drawPath = (points: number[]) => {
            const region = new Path2D();
            region.moveTo(landmarks[points[0]][0], landmarks[points[0]][1]);
            for (let i = 1; i < points.length; i++) {
              region.lineTo(landmarks[points[i]][0], landmarks[points[i]][1]);
            }
            ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke(region);
          };

          drawPath([0, 1, 2, 3, 4]);
          drawPath([0, 5, 6, 7, 8]);
          drawPath([0, 9, 10, 11, 12]);
          drawPath([0, 13, 14, 15, 16]);
          drawPath([0, 17, 18, 19, 20]);

          const letter = detectLetter(landmarks);
          setCurrentLetter(letter);
        } else {
          setCurrentLetter(null);
        }
      }
    }
    requestRef.current = requestAnimationFrame(detectHands);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentLetter) {
      timer = setTimeout(() => {
        setQuery(prev => prev + currentLetter);
        setLetterHoldTime(0);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [currentLetter]);

  const handleSearch = async () => {
    if (!query) return;
    
    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setIsLoading(true);
    setQuery("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      
      if (data.answer) {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error de red: ${e.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setQuery("");
    setMessages([]);
  };

  const hasSearched = messages.length > 0;
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");

  return (
    <div className={`bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col h-full transition-all duration-500 ${hasSearched ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-teal/20 p-2 rounded-lg">
          <Hand className="w-5 h-5 text-teal" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Lenguaje de Señas (Chat)</h2>
      </div>
      <p className="text-muted-foreground mb-8">
        Usa tu cámara para deletrear palabras. Mantén la seña 1 segundo para registrar la letra. El asistente buscará en la base de datos y recordará nuestra conversación.
      </p>

      <div className={`flex flex-col ${hasSearched ? 'lg:flex-row lg:gap-12' : ''} flex-1`}>
        {/* Panel Izquierdo: Cámara e Inputs */}
        <div className={`flex flex-col space-y-6 ${hasSearched ? 'lg:w-1/3' : 'flex-1'}`}>
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-border shadow-inner">
            {!isCameraOn && (
              <div className="absolute flex flex-col items-center text-muted-foreground">
                {model ? (
                  <>
                    <Camera className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-center px-4">Modelo cargado. Cámara inactiva.</p>
                  </>
                ) : (
                  <p className="animate-pulse">Cargando modelo Handpose...</p>
                )}
              </div>
            )}

            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            />

            {currentLetter && isCameraOn && (
              <div className="absolute top-4 right-4 bg-teal text-white font-bold text-4xl w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white/20">
                {currentLetter}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              {!isCameraOn ? (
                <button
                  onClick={startCamera}
                  disabled={!model}
                  className="flex-1 bg-teal text-white py-3 rounded-xl font-bold hover:bg-teal/90 transition-colors disabled:opacity-50"
                >
                  Activar Cámara
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-xl font-bold hover:bg-destructive/90 transition-colors"
                >
                  Detener Cámara
                </button>
              )}
              <button
                onClick={() => setShowAbecedario(!showAbecedario)}
                className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-bold hover:bg-secondary/80 transition-colors"
              >
                {showAbecedario ? "Ocultar LSA" : "Ver Abecedario LSA"}
              </button>
            </div>

            {showAbecedario && (
              <div className="bg-background border-2 border-border p-4 rounded-xl shadow-inner animate-in slide-in-from-top-4 flex flex-col items-center">
                <img src="/abecedario.jpg" alt="Abecedario LSA de Referencia" className="max-w-full h-auto rounded-lg object-contain max-h-[300px] mb-4" />
                <div className="px-4 py-3 bg-secondary/30 rounded-lg text-xs text-muted-foreground/80 leading-relaxed max-w-sm text-center border border-border/50">
                  <p className="font-semibold text-foreground/80 mb-1">Créditos de la imagen (LSA):</p>
                  <p>Confederación Argentina de Sordos (CAS), 2019.</p>
                  <p className="italic">"Señario de términos y expresiones básicas en la Lengua de Señas Argentina" (1a ed. bilingüe).</p>
                  <p className="text-[10px] mt-1 opacity-70">Coordinación: Diego Morales, Rocío Anabel Martínez. Diseño: Hugo Farfán.<br />ISBN 978-987-47104-0-6 | Reservados todos los derechos.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-background border border-border p-6 rounded-xl flex flex-col items-center">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Mensaje Actual</span>
            <div className="text-3xl font-mono tracking-[0.2em] font-bold text-foreground h-10 flex items-center justify-center break-all text-center">
              {query || "_"}
            </div>

            <div className="flex flex-col gap-3 mt-6 w-full">
              <button
                onClick={() => setQuery(prev => prev.slice(0, -1))}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                disabled={!query}
              >
                <Trash2 className="w-4 h-4" /> Borrar letra
              </button>
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-md"
                disabled={!query || isLoading}
              >
                {isLoading ? "Enviando..." : <><Search className="w-4 h-4" /> Enviar al Chat</>}
              </button>
              {hasSearched && (
                <button
                  onClick={resetSearch}
                  className="w-full flex items-center justify-center gap-2 text-teal font-bold hover:underline py-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Limpiar Chat
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Historial de Chat */}
        {hasSearched && (
          <div className="flex-1 flex flex-col h-[800px] mt-8 lg:mt-0 animate-in slide-in-from-right-8 duration-500">
            <div className="flex-1 bg-background border border-border rounded-xl p-4 overflow-y-auto mb-4 flex flex-col gap-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-2xl px-5 py-3 ${
                    m.role === "user" 
                      ? "bg-teal text-white rounded-tr-sm font-mono tracking-widest uppercase font-bold shadow-md" 
                      : "bg-muted/50 border border-border text-foreground rounded-tl-sm prose prose-invert prose-sm shadow-sm"
                  }`}>
                    {m.role === "assistant" ? (
                      <>
                        <span className="text-[10px] font-bold text-teal uppercase tracking-wider mb-2 flex items-center gap-1">
                          🤖 Asistente Virtual
                        </span>
                        <CollapsibleMessage content={m.content} isMarkdown={true} />
                      </>
                    ) : (
                      <CollapsibleMessage content={m.content} isMarkdown={false} />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 border border-border text-foreground rounded-2xl rounded-tl-sm px-5 py-3 animate-pulse">
                    Ollama está procesando tu mensaje...
                  </div>
                </div>
              )}
            </div>

            {/* Visualizador de deletreo dactilológico para la ÚLTIMA respuesta de Ollama */}
            {lastAssistantMessage && (
              <div className="mt-auto">
                 <FingerSpeller text={lastAssistantMessage.content.slice(0, 50) + "..."} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
