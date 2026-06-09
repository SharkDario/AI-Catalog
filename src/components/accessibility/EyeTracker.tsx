"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, Power, MousePointerClick } from "lucide-react";
import { useEyeTracking } from "./useEyeTracking";

export function EyeTracker() {
  const [isActive, setIsActive] = useState(false);
  const { gazePos, isReady } = useEyeTracking(isActive);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Un pequeño botón que puede ser mirado
  const GazeButton = ({ id, label, onClick }: { id: string, label: string, onClick: () => void }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dwellProgress, setDwellProgress] = useState(0);
    const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
      if (!buttonRef.current || !gazePos) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const isLooking = 
        gazePos.x >= rect.left && 
        gazePos.x <= rect.right &&
        gazePos.y >= rect.top && 
        gazePos.y <= rect.bottom;

      if (isLooking) {
        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
        }
        
        // Calcular progreso (1500 ms)
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min((elapsed / 1500) * 100, 100);
        setDwellProgress(progress);

        if (progress === 100 && !dwellTimerRef.current) {
          // Trigger click!
          dwellTimerRef.current = setTimeout(() => {
            onClick();
            // Reset after click
            setDwellProgress(0);
            startTimeRef.current = null;
            dwellTimerRef.current = null;
          }, 100); // Pequeño debounce
        }
      } else {
        // Miró fuera del botón
        setDwellProgress(0);
        startTimeRef.current = null;
        if (dwellTimerRef.current) {
          clearTimeout(dwellTimerRef.current);
          dwellTimerRef.current = null;
        }
      }
    }, [gazePos, onClick]);

    return (
      <button 
        ref={buttonRef}
        onClick={onClick}
        className="relative px-8 py-6 bg-secondary text-secondary-foreground font-bold rounded-2xl text-xl overflow-hidden shadow-sm hover:scale-105 transition-transform"
      >
        <div className="relative z-10 flex items-center gap-3">
          {label}
        </div>
        
        {/* Dwell Progress Animation */}
        {dwellProgress > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 bg-primary/30 transition-all duration-75 ease-linear z-0"
            style={{ width: `${dwellProgress}%` }}
          />
        )}
      </button>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-orange-500/20 p-2 rounded-lg">
          <Eye className="w-5 h-5 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Control por Seguimiento Ocular</h2>
      </div>
      <p className="text-muted-foreground mb-8">
        Activa la cámara para permitir a WebGazer detectar tus pupilas. Fija la mirada en los botones inferiores por 1.5 segundos para "hacer clic". Nota: Puede que necesites mover el cursor un poco la primera vez para ayudar a WebGazer a calibrar.
      </p>

      <div className="flex items-center justify-between bg-background p-4 rounded-xl border border-border mb-12">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isActive ? (isReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500') : 'bg-destructive'}`} />
          <span className="font-medium text-foreground">
            Estado: {isActive ? (isReady ? "Mirada rastreándose" : "Calibrando cámara...") : "Apagado"}
          </span>
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            isActive ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          <Power className="w-4 h-4" />
          {isActive ? "Desactivar Eye Tracking" : "Activar Eye Tracking"}
        </button>
      </div>

      {isActive && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative z-50">
          {clickedButton ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 text-green-500 mb-4">
                <MousePointerClick className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-foreground">¡Clic realizado!</h3>
              <p className="text-xl text-muted-foreground">Activaste el botón: <span className="text-primary font-bold">{clickedButton}</span></p>
              
              <button onClick={() => setClickedButton(null)} className="mt-8 text-primary hover:underline">
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <div className="flex gap-8">
              <GazeButton 
                id="btn1" 
                label="Ver Catálogo" 
                onClick={() => setClickedButton("Ver Catálogo")} 
              />
              <GazeButton 
                id="btn2" 
                label="Abrir Foro" 
                onClick={() => setClickedButton("Abrir Foro")} 
              />
            </div>
          )}
        </div>
      )}

      {/* Cursor de la mirada */}
      {isActive && gazePos && (
        <div 
          className="fixed w-10 h-10 rounded-full border-4 border-red-500 bg-red-500/30 pointer-events-none z-[9999] transition-all duration-75 ease-out shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          style={{ 
            left: 0, 
            top: 0, 
            transform: `translate(${gazePos.x - 20}px, ${gazePos.y - 20}px)`
          }}
        >
          <div className="absolute inset-0 m-auto w-1 h-1 bg-red-500 rounded-full" />
        </div>
      )}
    </div>
  );
}
