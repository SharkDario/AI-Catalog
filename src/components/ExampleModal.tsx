"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, PlayCircle, Info } from "lucide-react";
import { useState } from "react";

interface ExampleProps {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
}

export function ExampleModal({ example }: { example: ExampleProps }) {
  const [open, setOpen] = useState(false);

  let embedUrl = "";
  if (example.videoUrl) {
    try {
      const url = new URL(example.videoUrl);
      if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
        const v = url.searchParams.get("v") || url.pathname.split("/").pop();
        embedUrl = `https://www.youtube.com/embed/${v}`;
      } else {
        embedUrl = example.videoUrl;
      }
    } catch (e) {
      // Ignorar urls inválidas
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="bg-background border border-border rounded-lg p-4 flex flex-col hover:border-primary/50 hover:shadow-glow cursor-pointer transition-all group h-full">
          {example.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={example.imageUrl} alt={example.name} className="w-full h-32 object-cover rounded-md mb-3 group-hover:scale-[1.02] transition-transform" />
          ) : (
            <div className="w-full h-32 bg-muted rounded-md mb-3 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          )}
          <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{example.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{example.description}</p>
          <div className="mt-auto inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary">
            Ver Ejemplo <PlayCircle className="ml-1 w-4 h-4" />
          </div>
        </div>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
          <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
            <Dialog.Title className="text-xl font-bold text-foreground flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> {example.name}
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          
          <div className="p-6 overflow-y-auto">
            {embedUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black mb-6">
                <iframe 
                  src={embedUrl} 
                  title={example.name} 
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            ) : example.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={example.imageUrl} alt={example.name} className="w-full h-auto max-h-[50vh] object-cover rounded-xl mb-6" />
            ) : null}

            <div className="bg-muted/20 p-4 rounded-xl border border-border">
              <h3 className="font-bold text-foreground mb-2">Descripción del Ejemplo</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{example.description}</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
