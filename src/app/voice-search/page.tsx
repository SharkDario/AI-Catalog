"use client";

import { VoiceSearchAssistant } from "@/components/accessibility/VoiceSearchAssistant";
import { SignSearch } from "@/components/accessibility/SignSearch";
import { EyeTracker } from "@/components/accessibility/EyeTracker";

export default function AccessibilityPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-32">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Centro de Accesibilidad</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Una superficie de investigación explorando cómo el reconocimiento de voz natural, la detección de gestos manuales y el seguimiento ocular pueden potenciar la búsqueda y navegación web accesible, integrando <span className="text-teal font-medium">Modelos Locales de Lenguaje (Ollama)</span>, <span className="text-teal font-medium">MediaPipe Hands</span> y <span className="text-teal font-medium">WebGazer.js</span>.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row items-stretch gap-8 mb-8">
        {/* 1. Voice + LLM */}
        <section id="voice-search" className="w-full xl:w-[35%]">
          <VoiceSearchAssistant />
        </section>

        {/* 2. Sign Language + LLM */}
        <section id="sign-search" className="w-full xl:flex-1">
          <SignSearch />
        </section>
      </div>

      {/* 3. Eye Tracking */}
      <section id="eye-tracking" className="w-full">
        <EyeTracker />
      </section>
    </div>
  );
}
