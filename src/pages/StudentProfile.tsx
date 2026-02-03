import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  AvatarEditor, 
  ThemePicker, 
  CoverBanner, 
  FavoriteFilmsInput 
} from "@/components/profile";
import { 
  User, 
  MapPin, 
  Camera, 
  Instagram, 
  Youtube, 
  Twitter, 
  ArrowLeft,
  Save,
  Palette,
  Film,
  Clapperboard,
  Globe,
  Sparkles
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FILMMAKING_STYLES = [
  "Documentary",
  "Narrative Fiction",
  "Experimental",
  "Music Video",
  "Commercial",
  "Animation",
  "Horror",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Other",
];

export default function StudentProfile() {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    camera_gear: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    tiktok_url: "",
    // New creative fields
    profile_accent_color: "#D4AF37",
    avatar_border_style: "solid",
    filmmaking_style: "",
    favorite_films: [] as string[],
    influences: "",
    current_project: "",
    portfolio_url: "",
    imdb_url: "",
    vimeo_url: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        camera_gear: profile.camera_gear || "",
        instagram_url: profile.instagram_url || "",
        youtube_url: profile.youtube_url || "",
        twitter_url: profile.twitter_url || "",
        tiktok_url: profile.tiktok_url || "",
        profile_accent_color: (profile as any).profile_accent_color || "#D4AF37",
        avatar_border_style: (profile as any).avatar_border_style || "solid",
        filmmaking_style: (profile as any).filmmaking_style || "",
        favorite_films: (profile as any).favorite_films || [],
        influences: (profile as any).influences || "",
        current_project: (profile as any).current_project || "",
        portfolio_url: (profile as any).portfolio_url || "",
        imdb_url: (profile as any).imdb_url || "",
        vimeo_url: (profile as any).vimeo_url || "",
      });
      setAvatarUrl(profile.avatar_url);
      setBannerUrl((profile as any).cover_banner_url);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await updateProfile(formData as any);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-pulse text-primary font-bold text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="container-wide max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="heading-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Edit Profile
              </h1>
              <p className="text-muted-foreground text-sm">Make it uniquely you</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
          {/* Cover Banner Section */}
          <div className="container-wide max-w-5xl mx-auto px-4">
            <Card className="card-urban overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Cover & Avatar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Cover Banner */}
                <CoverBanner
                  currentBannerUrl={bannerUrl}
                  onBannerChange={setBannerUrl}
                />

                {/* Avatar & Theme */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Avatar Editor */}
                  <div className="flex flex-col items-center">
                    <AvatarEditor
                      currentAvatarUrl={avatarUrl}
                      displayName={formData.display_name}
                      accentColor={formData.profile_accent_color}
                      borderStyle={formData.avatar_border_style}
                      onAvatarChange={setAvatarUrl}
                    />
                  </div>

                  {/* Theme Picker */}
                  <ThemePicker
                    accentColor={formData.profile_accent_color}
                    borderStyle={formData.avatar_border_style}
                    onAccentColorChange={(color) => 
                      setFormData((prev) => ({ ...prev, profile_accent_color: color }))
                    }
                    onBorderStyleChange={(style) => 
                      setFormData((prev) => ({ ...prev, avatar_border_style: style }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Info */}
          <div className="container-wide max-w-5xl mx-auto px-4">
            <Card className="card-urban">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="text-sm font-bold uppercase tracking-wide">
                      Display Name
                    </Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-bold uppercase tracking-wide">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-bold uppercase tracking-wide">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself and your filmmaking journey..."
                    rows={4}
                    className="bg-background border-2 border-border focus:border-primary resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="camera_gear" className="text-sm font-bold uppercase tracking-wide">
                    <Camera className="inline h-4 w-4 mr-1" />
                    Camera Gear
                  </Label>
                  <Input
                    id="camera_gear"
                    name="camera_gear"
                    value={formData.camera_gear}
                    onChange={handleChange}
                    placeholder="e.g., Sony A7III, Canon R5, Blackmagic Pocket 6K"
                    className="bg-background border-2 border-border focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creative Identity */}
          <div className="container-wide max-w-5xl mx-auto px-4">
            <Card className="card-urban">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clapperboard className="h-5 w-5 text-primary" />
                  Creative Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wide">
                      Filmmaking Style
                    </Label>
                    <Select
                      value={formData.filmmaking_style}
                      onValueChange={(value) => 
                        setFormData((prev) => ({ ...prev, filmmaking_style: value }))
                      }
                    >
                      <SelectTrigger className="bg-background border-2 border-border focus:border-primary">
                        <SelectValue placeholder="Select your style" />
                      </SelectTrigger>
                      <SelectContent>
                        {FILMMAKING_STYLES.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_project" className="text-sm font-bold uppercase tracking-wide">
                      Current Project
                    </Label>
                    <Input
                      id="current_project"
                      name="current_project"
                      value={formData.current_project}
                      onChange={handleChange}
                      placeholder="What are you working on?"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-wide">
                    <Film className="inline h-4 w-4 mr-1" />
                    Favorite Films
                  </Label>
                  <FavoriteFilmsInput
                    films={formData.favorite_films}
                    onChange={(films) => 
                      setFormData((prev) => ({ ...prev, favorite_films: films }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="influences" className="text-sm font-bold uppercase tracking-wide">
                    Influences & Inspirations
                  </Label>
                  <Textarea
                    id="influences"
                    name="influences"
                    value={formData.influences}
                    onChange={handleChange}
                    placeholder="Directors, cinematographers, or artists that inspire your work..."
                    rows={3}
                    className="bg-background border-2 border-border focus:border-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio & Social Links */}
          <div className="container-wide max-w-5xl mx-auto px-4">
            <Card className="card-urban">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Portfolio & Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Portfolio Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio_url" className="text-sm font-bold uppercase tracking-wide">
                      Portfolio Website
                    </Label>
                    <Input
                      id="portfolio_url"
                      name="portfolio_url"
                      value={formData.portfolio_url}
                      onChange={handleChange}
                      placeholder="https://yoursite.com"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imdb_url" className="text-sm font-bold uppercase tracking-wide">
                      IMDb
                    </Label>
                    <Input
                      id="imdb_url"
                      name="imdb_url"
                      value={formData.imdb_url}
                      onChange={handleChange}
                      placeholder="https://imdb.com/name/..."
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vimeo_url" className="text-sm font-bold uppercase tracking-wide">
                      Vimeo
                    </Label>
                    <Input
                      id="vimeo_url"
                      name="vimeo_url"
                      value={formData.vimeo_url}
                      onChange={handleChange}
                      placeholder="https://vimeo.com/yourname"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url" className="text-sm font-bold uppercase tracking-wide">
                      <Instagram className="inline h-4 w-4 mr-1" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram_url"
                      name="instagram_url"
                      value={formData.instagram_url}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourhandle"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className="text-sm font-bold uppercase tracking-wide">
                      <Youtube className="inline h-4 w-4 mr-1" />
                      YouTube
                    </Label>
                    <Input
                      id="youtube_url"
                      name="youtube_url"
                      value={formData.youtube_url}
                      onChange={handleChange}
                      placeholder="https://youtube.com/@yourchannel"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter_url" className="text-sm font-bold uppercase tracking-wide">
                      <Twitter className="inline h-4 w-4 mr-1" />
                      Twitter / X
                    </Label>
                    <Input
                      id="twitter_url"
                      name="twitter_url"
                      value={formData.twitter_url}
                      onChange={handleChange}
                      placeholder="https://twitter.com/yourhandle"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok_url" className="text-sm font-bold uppercase tracking-wide">
                      TikTok
                    </Label>
                    <Input
                      id="tiktok_url"
                      name="tiktok_url"
                      value={formData.tiktok_url}
                      onChange={handleChange}
                      placeholder="https://tiktok.com/@yourhandle"
                      className="bg-background border-2 border-border focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="container-wide max-w-5xl mx-auto px-4">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/student")}
                className="border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="btn-brutal"
              >
                {saving ? "Saving..." : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
