import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MapPin, 
  Camera, 
  Film, 
  Clapperboard,
  Globe,
  Instagram,
  Youtube
} from "lucide-react";

interface ProfilePreviewCardProps {
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string;
  location: string;
  cameraGear: string;
  creativeRole?: string;
  filmmakingStyle: string;
  currentProject: string;
  favoriteFilms: string[];
  accentColor: string;
  borderStyle: string;
  portfolioUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  vimeoUrl: string;
}

export function ProfilePreviewCard({
  displayName,
  avatarUrl,
  bannerUrl,
  bio,
  location,
  cameraGear,
  creativeRole,
  filmmakingStyle,
  currentProject,
  favoriteFilms,
  accentColor,
  borderStyle,
  portfolioUrl,
  instagramUrl,
  youtubeUrl,
  vimeoUrl,
}: ProfilePreviewCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "S";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const getBorderClass = () => {
    switch (borderStyle) {
      case "dashed": return "border-dashed";
      case "double": return "border-double border-4";
      case "dotted": return "border-dotted";
      default: return "border-solid";
    }
  };

  const hasLinks = portfolioUrl || instagramUrl || youtubeUrl || vimeoUrl;

  return (
    <Card className="card-urban overflow-hidden sticky top-24">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-primary" />
          How others see you
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mini Banner */}
        <div 
          className="h-16 bg-gradient-to-r from-primary/30 to-accent/30"
          style={bannerUrl ? { 
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          } : undefined}
        />

        {/* Profile Content */}
        <div className="px-4 pb-4 -mt-8">
          {/* Avatar */}
          <Avatar 
            className={`h-16 w-16 border-4 ${getBorderClass()} mb-3`}
            style={{ borderColor: accentColor }}
          >
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback 
              className="text-lg font-bold"
              style={{ backgroundColor: accentColor, color: "white" }}
            >
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          {/* Name & Style */}
          <h4 className="font-bold text-foreground mb-1">
            {displayName || "Your Name"}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
            {creativeRole && (
              <span className="flex items-center gap-1">
                <Clapperboard className="h-3 w-3" />
                {creativeRole}
              </span>
            )}
            {filmmakingStyle && (
              <span className="flex items-center gap-1">
                {!creativeRole && <Clapperboard className="h-3 w-3" />}
                {filmmakingStyle}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">
              "{bio}"
            </p>
          )}

          {/* Tools & Project */}
          <div className="space-y-1 text-xs mb-3">
            {cameraGear && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Camera className="h-3 w-3" />
                <span className="truncate">{cameraGear}</span>
              </p>
            )}
            {currentProject && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Film className="h-3 w-3" />
                <span className="truncate">Working on: {currentProject}</span>
              </p>
            )}
          </div>

          {/* Favorite Films */}
          {favoriteFilms.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Favorite Films:</p>
              <div className="flex flex-wrap gap-1">
                {favoriteFilms.slice(0, 3).map((film, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {film}
                  </Badge>
                ))}
                {favoriteFilms.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{favoriteFilms.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {hasLinks && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {portfolioUrl && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Globe className="h-3 w-3" /> Portfolio
                </span>
              )}
              {instagramUrl && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Instagram className="h-3 w-3" /> Instagram
                </span>
              )}
              {youtubeUrl && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Youtube className="h-3 w-3" /> YouTube
                </span>
              )}
            </div>
          )}

          {/* Empty State */}
          {!bio && !location && !filmmakingStyle && !cameraGear && (
            <p className="text-xs text-muted-foreground italic">
              Add more details to make your profile stand out!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
