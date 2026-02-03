import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ThemePickerProps {
  accentColor: string;
  borderStyle: string;
  onAccentColorChange: (color: string) => void;
  onBorderStyleChange: (style: string) => void;
}

const PRESET_COLORS = [
  { name: "Gold", value: "#D4AF37" },
  { name: "Neon Purple", value: "#A855F7" },
  { name: "Neon Pink", value: "#EC4899" },
  { name: "Accent Green", value: "#00E5A0" },
  { name: "White", value: "#FFFFFF" },
  { name: "Crimson", value: "#DC2626" },
];

const BORDER_STYLES = [
  { name: "Solid", value: "solid", description: "Clean, professional" },
  { name: "Double", value: "double", description: "Classic film aesthetic" },
  { name: "Dashed", value: "dashed", description: "Playful, creative" },
  { name: "Glow", value: "glow", description: "Animated neon effect" },
];

export function ThemePicker({
  accentColor,
  borderStyle,
  onAccentColorChange,
  onBorderStyleChange,
}: ThemePickerProps) {
  const isCustomColor = !PRESET_COLORS.some((c) => c.value === accentColor);

  return (
    <div className="space-y-6">
      {/* Accent Color */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wide">
          Accent Color
        </Label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onAccentColorChange(color.value)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all duration-200",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                accentColor === color.value
                  ? "ring-2 ring-offset-2 ring-offset-background"
                  : "border-border"
              )}
              style={{
                backgroundColor: color.value,
                borderColor: accentColor === color.value ? color.value : undefined,
                boxShadow: accentColor === color.value ? `0 0 0 2px ${color.value}` : undefined,
              }}
              title={color.name}
            >
              {accentColor === color.value && (
                <Check
                  className="h-5 w-5 mx-auto"
                  style={{
                    color: color.value === "#FFFFFF" ? "#000" : "#FFF",
                  }}
                />
              )}
            </button>
          ))}

          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={isCustomColor ? accentColor : "#D4AF37"}
              onChange={(e) => onAccentColorChange(e.target.value)}
              className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
            />
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 border-dashed border-border",
                "flex items-center justify-center text-muted-foreground",
                "hover:border-primary transition-colors",
                isCustomColor && "ring-2 ring-offset-2 ring-offset-background"
              )}
              style={{
                backgroundColor: isCustomColor ? accentColor : "transparent",
                borderColor: isCustomColor ? accentColor : undefined,
              }}
            >
              {isCustomColor ? (
                <Check
                  className="h-5 w-5"
                  style={{ color: "#FFF" }}
                />
              ) : (
                <span className="text-xs font-bold">+</span>
              )}
            </div>
          </div>
        </div>

        {/* Color hex input */}
        <div className="flex items-center gap-2">
          <Input
            value={accentColor}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                onAccentColorChange(val);
              }
            }}
            className="w-28 font-mono text-sm"
            placeholder="#D4AF37"
          />
          <div
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Border Style */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wide">
          Avatar Border Style
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {BORDER_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onBorderStyleChange(style.value)}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all duration-200",
                "hover:border-primary focus:outline-none",
                borderStyle === style.value
                  ? "border-primary bg-primary/10"
                  : "border-border"
              )}
            >
              <div className="font-bold text-sm">{style.name}</div>
              <div className="text-xs text-muted-foreground">{style.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
