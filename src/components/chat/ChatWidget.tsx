import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <ChatPanel onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "hover:scale-105 hover:shadow-glow-gold",
          !isOpen && "animate-glow-pulse",
          isOpen && "rotate-0"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
