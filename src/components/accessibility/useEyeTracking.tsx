"use client";

import { useEffect, useState } from "react";

export function useEyeTracking(isActive: boolean) {
  const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let webgazerInstance: any = null;
    let scriptEl: HTMLScriptElement | null = null;

    const initWebGazer = () => {
      // Usamos el objeto global cargado por el script
      const webgazer = (window as any).webgazer;
      if (!webgazer) return;
      
      webgazerInstance = webgazer;

      webgazer.setGazeListener((data: any) => {
        if (data == null) return;
        setGazePos({ x: data.x, y: data.y });
      })
      .begin();
      
      webgazer.showVideoPreview(true).showPredictionPoints(true);
      setIsReady(true);
    };

    if (isActive) {
      if (!(window as any).webgazer) {
        // Inyectamos el script directo para evitar el error de Webpack con FaceMesh/MediaPipe
        scriptEl = document.createElement("script");
        scriptEl.src = "https://webgazer.cs.brown.edu/webgazer.js";
        scriptEl.async = true;
        scriptEl.onload = initWebGazer;
        document.head.appendChild(scriptEl);
      } else {
        initWebGazer();
      }
    }

    return () => {
      if (webgazerInstance && isActive) {
        webgazerInstance.pause();
        webgazerInstance.end(); 
        
        const wgVideo = document.getElementById("webgazerVideoFeed");
        const wgCanvas = document.getElementById("webgazerVideoCanvas");
        const wgFaceOverlay = document.getElementById("webgazerFaceOverlay");
        const wgFaceFeedback = document.getElementById("webgazerFaceFeedbackBox");
        const wgGazeDot = document.getElementById("webgazerGazeDot");
        
        if (wgVideo) wgVideo.remove();
        if (wgCanvas) wgCanvas.remove();
        if (wgFaceOverlay) wgFaceOverlay.remove();
        if (wgFaceFeedback) wgFaceFeedback.remove();
        if (wgGazeDot) wgGazeDot.remove();
        
        setIsReady(false);
        setGazePos(null);
      }
      
      if (scriptEl && document.head.contains(scriptEl)) {
        document.head.removeChild(scriptEl);
      }
    };
  }, [isActive]);

  return { gazePos, isReady };
}
