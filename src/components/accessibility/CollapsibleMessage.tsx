"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ExternalLink } from "lucide-react";

interface CollapsibleMessageProps {
  content: string;
  isMarkdown: boolean;
  maxLength?: number;
}

export function CollapsibleMessage({ content, isMarkdown, maxLength = 300 }: CollapsibleMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > maxLength;

  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    <div className="relative">
      <div className={`transition-all duration-300 overflow-hidden ${!isExpanded && isLong ? 'max-h-[150px] relative' : 'max-h-full'}`}>
        {isMarkdown ? (
          <div className="text-sm space-y-3 leading-relaxed">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => (
                  <a 
                    {...props} 
                    className="inline-flex items-center gap-1 text-teal hover:text-teal/80 font-bold underline decoration-2 underline-offset-2 transition-colors drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {props.children}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ),
                p: ({ node, ...props }) => <p {...props} className="mb-3 last:mb-0" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 mb-3" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 mb-3" />,
                li: ({ node, ...props }) => <li {...props} className="mb-1" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
        
        {/* Gradiente para disimular el corte si está colapsado */}
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/50 to-transparent"></div>
        )}
      </div>

      {isLong && (
        <button 
          onClick={handleToggle}
          className="text-xs font-bold mt-2 hover:underline opacity-80"
        >
          {isExpanded ? "Ver menos" : "Leer más..."}
        </button>
      )}
    </div>
  );
}
