import { useState, useEffect, useMemo } from "react";
 import { useNavigate, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useProfileContext } from "@/contexts/ProfileContext";
 import { useAuth } from "@/contexts/AuthContext";
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
  FavoriteFilmsInput,
  ProfilePreviewCard,
  ProfileCompleteness,
  GalleryEditor,
  FeaturedProjectEditor,
  SectionLayoutEditor,
  CardSectionLayoutEditor
} from "@/components/profile";
 import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useProfileGallery } from "@/hooks/useProfileGallery";
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
  Sparkles,
  Lock,
  Eye,
  AlertTriangle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { profile, loading, updateProfile, refetch } = useProfileContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    camera_gear: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    tiktok_url: "",
    profile_accent_color: "#D4AF37",
    avatar_border_style: "solid",
    filmmaking_style: "",
    favorite_films: [] as string[],
    influences: "",
    current_project: "",
    portfolio_url: "",
    imdb_url: "",
    vimeo_url: "",
    featured_project_url: "",
    featured_project_title: "",
    featured_project_thumbnail: null as string | null,
    profile_section_order: ["stats", "achievements", "gallery", "wall"] as string[],
    card_section_order: ["bio", "featured_project", "info_cards", "social_links"] as string[],
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  // Gallery hook for managing portfolio items
  const {
    addMedia,
    removeMedia,
    reorderGallery,
    isUploading: galleryUploading,
  } = useProfileGallery(gallery, true);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!initialFormData) return false;
    return Object.keys(formData).some((key) => {
      const currentVal = formData[key as keyof typeof formData];
      const initialVal = initialFormData[key as keyof typeof formData];
      if (Array.isArray(currentVal) && Array.isArray(initialVal)) {
        return JSON.stringify(currentVal) !== JSON.stringify(initialVal);
      }
      return currentVal !== initialVal;
    });
  }, [formData, initialFormData]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      const newFormData = {
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        camera_gear: profile.camera_gear || "",
        instagram_url: profile.instagram_url || "",
        youtube_url: profile.youtube_url || "",
        twitter_url: profile.twitter_url || "",
        tiktok_url: profile.tiktok_url || "",
        profile_accent_color: profile.profile_accent_color || "#D4AF37",
        avatar_border_style: profile.avatar_border_style || "solid",
        filmmaking_style: profile.filmmaking_style || "",
        favorite_films: profile.favorite_films || [],
        influences: profile.influences || "",
        current_project: profile.current_project || "",
        portfolio_url: profile.portfolio_url || "",
        imdb_url: profile.imdb_url || "",
        vimeo_url: profile.vimeo_url || "",
        featured_project_url: profile.featured_project_url || "",
        featured_project_title: profile.featured_project_title || "",
        featured_project_thumbnail: profile.featured_project_thumbnail || null,
        profile_section_order: profile.profile_section_order || ["stats", "achievements", "gallery", "wall"],
        card_section_order: profile.card_section_order || ["bio", "featured_project", "info_cards", "social_links"],
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setAvatarUrl(profile.avatar_url);
      setBannerUrl(profile.cover_banner_url);
      setGallery(profile.portfolio_gallery || []);
    }
  }, [profile]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Sync gallery with profile context
  useEffect(() => {
    if (profile?.portfolio_gallery) {
      setGallery(profile.portfolio_gallery);
    }
  }, [profile?.portfolio_gallery]);

  const handleGalleryAdd = async (files: File[]) => {
    await addMedia(files);
    // Refetch profile to get updated gallery
    await refetch();
  };

  const handleGalleryRemove = async (url: string) => {
    await removeMedia(url);
    await refetch();
  };

  const handleGalleryReorder = async (newOrder: string[]) => {
    setGallery(newOrder); // Optimistic update
    await reorderGallery(newOrder);
    await refetch();
  };

  const handleFeaturedProjectChange = (updates: {
    featured_project_title?: string;
    featured_project_url?: string;
    featured_project_thumbnail?: string | null;
  }) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSectionOrderChange = (newOrder: string[]) => {
    setFormData((prev) => ({ ...prev, profile_section_order: newOrder }));
  };
 
   const handleCardSectionOrderChange = (newOrder: string[]) => {
     setFormData((prev) => ({ ...prev, card_section_order: newOrder }));
   };

  const handleNavigateAway = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

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
      // Reset initial form data to current to clear unsaved state
      setInitialFormData(formData);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved and reflected across the site.",
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
        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Unsaved Changes
              </AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay & Edit</AlertDialogCancel>
              <AlertDialogAction onClick={confirmNavigation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Leave Without Saving
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Header */}
        <div className="container-wide max-w-6xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/student" className="hover:text-primary transition-colors">Student Hub</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
 
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => handleNavigateAway("/student")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <h1 className="heading-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Edit Profile
              </h1>
              <p className="text-muted-foreground text-sm">Make it uniquely you</p>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-xs text-accent font-medium px-2 py-1 bg-accent/10 rounded-full">
                  Unsaved changes
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigateAway(`/profile/${user?.id}`)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="container-wide max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Profile Preview */}
            <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
              <ProfileCompleteness formData={formData} avatarUrl={avatarUrl} />
              <ProfilePreviewCard
                displayName={formData.display_name}
                avatarUrl={avatarUrl}
                bannerUrl={bannerUrl}
                bio={formData.bio}
                location={formData.location}
                cameraGear={formData.camera_gear}
                filmmakingStyle={formData.filmmaking_style}
                currentProject={formData.current_project}
                favoriteFilms={formData.favorite_films}
                accentColor={formData.profile_accent_color}
                borderStyle={formData.avatar_border_style}
                portfolioUrl={formData.portfolio_url}
                instagramUrl={formData.instagram_url}
                youtubeUrl={formData.youtube_url}
                vimeoUrl={formData.vimeo_url}
              />
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                {/* Cover Banner Section */}
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
                      onUploadComplete={refetch}
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
                          onUploadComplete={refetch}
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

                {/* Basic Info */}
                <Card className="card-urban">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Basic Information
                      <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Public
                      </span>
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
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            <Lock className="inline h-3 w-3" /> Private
                          </span>
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

                {/* Creative Identity */}
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

                {/* Portfolio & Social Links */}
                {/* Featured Project */}
                <FeaturedProjectEditor
                  title={formData.featured_project_title}
                  url={formData.featured_project_url}
                  thumbnail={formData.featured_project_thumbnail}
                  onChange={handleFeaturedProjectChange}
                />

                {/* Portfolio Gallery */}
                <GalleryEditor
                  gallery={gallery}
                  onReorder={handleGalleryReorder}
                  onAdd={handleGalleryAdd}
                  onRemove={handleGalleryRemove}
                  isUploading={galleryUploading}
                />

                {/* Section Layout */}
                <CardSectionLayoutEditor
                  order={formData.card_section_order}
                  onChange={handleCardSectionOrderChange}
                />

                <SectionLayoutEditor
                  order={formData.profile_section_order}
                  onChange={handleSectionOrderChange}
                />

                {/* Portfolio & Social Links */}
                <Card className="card-urban">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Portfolio & Social Links
                      <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Public
                      </span>
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

                {/* Submit Button */}
                <div className="flex justify-end gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t border-border lg:static lg:bg-transparent lg:p-0 lg:mx-0 lg:border-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleNavigateAway("/student")}
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
