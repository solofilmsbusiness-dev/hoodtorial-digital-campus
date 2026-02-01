import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMentions, MentionUser } from "@/hooks/useMentions";
import { cn } from "@/lib/utils";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}

export function MentionInput({ 
  value, 
  onChange, 
  placeholder, 
  rows = 3,
  className,
  id 
}: MentionInputProps) {
  const { filteredUsers, setSearchQuery, setIsSearching } = useMentions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Find the current mention being typed
  const getCurrentMention = useCallback(() => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    return mentionMatch ? mentionMatch[1] : null;
  }, [value, cursorPosition]);

  // Update search query when typing a mention
  useEffect(() => {
    const mention = getCurrentMention();
    if (mention !== null) {
      setSearchQuery(mention);
      setIsSearching(true);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setSearchQuery("");
      setIsSearching(false);
      setShowSuggestions(false);
    }
  }, [getCurrentMention, setSearchQuery, setIsSearching]);

  // Insert mention into text
  const insertMention = useCallback((user: MentionUser) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    // Find where the @ starts
    const mentionStartMatch = textBeforeCursor.match(/@(\w*)$/);
    if (!mentionStartMatch) return;
    
    const mentionStart = textBeforeCursor.length - mentionStartMatch[0].length;
    const username = user.display_name?.replace(/\s+/g, '') || 'user';
    
    const newValue = 
      value.slice(0, mentionStart) + 
      `@${username} ` + 
      textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = mentionStart + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  }, [value, cursorPosition, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredUsers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredUsers.length - 1
        );
        break;
      case 'Enter':
        if (showSuggestions) {
          e.preventDefault();
          insertMention(filteredUsers[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      case 'Tab':
        if (showSuggestions) {
          e.preventDefault();
          insertMention(filteredUsers[selectedIndex]);
        }
        break;
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Handle selection change
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition((e.target as HTMLTextAreaElement).selectionStart || 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
      
      {/* Mention hint */}
      <p className="text-xs text-muted-foreground mt-1">
        Type <span className="text-primary font-mono">@username</span> to mention someone
      </p>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-w-xs bg-background border-2 border-border rounded-lg shadow-lg overflow-hidden"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                index === selectedIndex 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              )}
            >
              <Avatar className="h-7 w-7 border border-border">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-muted">
                  {getInitials(user.display_name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm truncate">
                {user.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
