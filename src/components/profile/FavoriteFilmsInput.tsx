import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Film, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteFilmsInputProps {
  films: string[];
  onChange: (films: string[]) => void;
  maxFilms?: number;
}

export function FavoriteFilmsInput({
  films,
  onChange,
  maxFilms = 5,
}: FavoriteFilmsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addFilm = () => {
    const film = inputValue.trim();
    if (film && films.length < maxFilms && !films.includes(film)) {
      onChange([...films, film]);
      setInputValue("");
    }
  };

  const removeFilm = (filmToRemove: string) => {
    onChange(films.filter((f) => f !== filmToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFilm();
    }
  };

  return (
    <div className="space-y-3">
      {/* Film tags */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
        <AnimatePresence mode="popLayout">
          {films.map((film) => (
            <motion.div
              key={film}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Badge
                variant="secondary"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium",
                  "bg-primary/20 text-primary border border-primary/30",
                  "flex items-center gap-2 group"
                )}
              >
                <Film className="h-3 w-3" />
                <span>{film}</span>
                <button
                  type="button"
                  onClick={() => removeFilm(film)}
                  className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>

        {films.length === 0 && (
          <span className="text-sm text-muted-foreground py-1.5">
            No favorite films added yet
          </span>
        )}
      </div>

      {/* Input */}
      {films.length < maxFilms && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a favorite film..."
            className="flex-1 bg-background border-2 border-border focus:border-primary"
          />
          <button
            type="button"
            onClick={addFilm}
            disabled={!inputValue.trim()}
            className={cn(
              "px-3 py-2 rounded-md border-2 border-dashed transition-all",
              "flex items-center gap-1 text-sm font-medium",
              inputValue.trim()
                ? "border-primary text-primary hover:bg-primary/10"
                : "border-border text-muted-foreground cursor-not-allowed"
            )}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-muted-foreground">
        {films.length} / {maxFilms} films
      </p>
    </div>
  );
}
