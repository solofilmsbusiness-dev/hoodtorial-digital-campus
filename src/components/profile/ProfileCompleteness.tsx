import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileField {
  key: string;
  label: string;
  weight: number;
}

const PROFILE_FIELDS: ProfileField[] = [
  { key: "display_name", label: "Display name", weight: 15 },
  { key: "avatar_url", label: "Profile photo", weight: 15 },
  { key: "bio", label: "Bio", weight: 15 },
  { key: "location", label: "Location", weight: 5 },
  { key: "camera_gear", label: "Camera gear", weight: 10 },
  { key: "filmmaking_style", label: "Filmmaking style", weight: 10 },
  { key: "favorite_films", label: "Favorite films", weight: 10 },
  { key: "portfolio_url", label: "Portfolio link", weight: 10 },
  { key: "instagram_url", label: "Social media", weight: 5 },
  { key: "current_project", label: "Current project", weight: 5 },
];

interface ProfileCompletenessProps {
  formData: Record<string, any>;
  avatarUrl: string | null;
}

export function ProfileCompleteness({ formData, avatarUrl }: ProfileCompletenessProps) {
  const getFieldValue = (key: string) => {
    if (key === "avatar_url") return avatarUrl;
    if (key === "favorite_films") {
      const films = formData[key];
      return Array.isArray(films) && films.length > 0;
    }
    return formData[key];
  };

  const completedFields = PROFILE_FIELDS.filter(field => {
    const value = getFieldValue(field.key);
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && value.trim && value.trim() !== "");
  });

  const completionScore = completedFields.reduce((acc, field) => acc + field.weight, 0);
  const missingFields = PROFILE_FIELDS.filter(field => !completedFields.includes(field));

  const getProgressColor = () => {
    if (completionScore >= 80) return "bg-green-500";
    if (completionScore >= 50) return "bg-primary";
    return "bg-accent";
  };

  const getMessage = () => {
    if (completionScore >= 100) return "🎬 Your profile is complete!";
    if (completionScore >= 80) return "Almost there! Just a few more details.";
    if (completionScore >= 50) return "Good progress! Keep going.";
    return "Add more to stand out!";
  };

  return (
    <Card className="card-urban">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-wide">
              Profile Completeness
            </span>
          </div>
          <motion.span 
            key={completionScore}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-lg font-black text-primary"
          >
            {completionScore}%
          </motion.span>
        </div>

        <div className="relative mb-3">
          <Progress 
            value={completionScore} 
            className="h-3"
          />
          <motion.div
            className={`absolute inset-0 h-3 rounded-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${completionScore}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ maxWidth: "100%" }}
          />
        </div>

        <p className="text-sm text-muted-foreground mb-3">{getMessage()}</p>

        {missingFields.length > 0 && completionScore < 100 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium mb-2">Add to stand out:</p>
            <div className="flex flex-wrap gap-2">
              {missingFields.slice(0, 4).map((field) => (
                <span 
                  key={field.key}
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full"
                >
                  <Circle className="h-2 w-2" />
                  {field.label}
                </span>
              ))}
              {missingFields.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{missingFields.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {completionScore >= 100 && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">All sections complete!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
