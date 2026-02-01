import { useState, useRef, useEffect } from "react";
import { X, Send, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { useChatSound } from "@/hooks/useChatSound";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  onClose: () => void;
}

const quickSuggestions = [
  "Where do I start?",
  "What's color grading about?",
  "Put me on to a course",
  "Break down rule of thirds",
];

// Animated typing dots component
function TypingIndicator() {
  return (
    <div className="flex gap-3 p-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center animate-pulse">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing-dot-1" />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing-dot-2" />
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-typing-dot-3" />
      </div>
    </div>
  );
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const { playMessageSound } = useChatSound();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const prevMessageCountRef = useRef(messages.length);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Play sound when AI starts responding
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      messages.length > prevMessageCountRef.current &&
      lastMessage?.role === "assistant"
    ) {
      playMessageSound();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, playMessageSound]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-scale-up",
        isMobile
          ? "fixed inset-0 z-50 rounded-none"
          : "w-[400px] h-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Hoodtorial AI</h3>
            <p className="text-xs text-muted-foreground">Film & Platform Help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="h-8 w-8 hover:scale-110 transition-transform"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:scale-110 transition-transform">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-float">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Yo, What's Good! 🎬</h4>
            <p className="text-sm text-muted-foreground mb-4">
              I'm your film plug. Ask me anything - camera game, editing tips, or how to navigate the school. Let's get it!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickSuggestions.map((suggestion, idx) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs hover:scale-105 transition-transform"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, idx) => (
              <ChatMessage 
                key={idx} 
                role={msg.role} 
                content={msg.content} 
                isNew={idx === messages.length - 1}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <TypingIndicator />
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-background/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Drop your question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
