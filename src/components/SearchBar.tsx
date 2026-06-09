import { Mic, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search AI software, models, papers…" }: Props) {
  const [listening, setListening] = useState(false);

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice search not supported in this browser");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); toast.error("Voice recognition failed"); };
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      onChange?.(text);
      toast.success(`Heard: "${text}"`);
    };
    rec.start();
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-primary/60 focus-within:shadow-glow transition-all">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      <button
        onClick={startVoice}
        className={`h-9 w-9 grid place-items-center rounded-lg transition-all shrink-0 ${
          listening ? "bg-accent text-accent-foreground animate-pulse" : "bg-primary/15 text-primary hover:bg-primary/25"
        }`}
        aria-label="Voice search"
      >
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}
