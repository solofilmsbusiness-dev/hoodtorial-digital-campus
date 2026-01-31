import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  MapPin, 
  Camera, 
  Instagram, 
  Youtube, 
  Twitter, 
  ArrowLeft,
  Save
} from "lucide-react";

export default function StudentProfile() {
  const { profile, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    camera_gear: profile?.camera_gear || "",
    instagram_url: profile?.instagram_url || "",
    youtube_url: profile?.youtube_url || "",
    twitter_url: profile?.twitter_url || "",
    tiktok_url: profile?.tiktok_url || "",
  });

  // Update form data when profile loads
  useState(() => {
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
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await updateProfile(formData);

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

  const getInitials = (name?: string | null) => {
    if (!name) return "S";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
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
      <div className="py-12 px-4">
        <div className="container-wide max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="heading-2">Edit Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture & Basic Info */}
            <Card className="card-urban">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {getInitials(formData.display_name || profile?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">
                      Profile picture upload coming soon
                    </p>
                  </div>
                </div>

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

            {/* Social Links */}
            <Card className="card-urban">
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
