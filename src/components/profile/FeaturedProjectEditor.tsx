 import { useState, useRef } from "react";
 import { Film, Link, X, Upload, Play, Loader2 } from "lucide-react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { AspectRatio } from "@/components/ui/aspect-ratio";
 import { useCommunityUploads } from "@/hooks/useCommunityUploads";
 
 interface FeaturedProjectEditorProps {
   title: string;
   url: string;
   thumbnail: string | null;
   onChange: (updates: {
     featured_project_title?: string;
     featured_project_url?: string;
     featured_project_thumbnail?: string | null;
   }) => void;
 }
 
 export function FeaturedProjectEditor({
   title,
   url,
   thumbnail,
   onChange,
 }: FeaturedProjectEditorProps) {
   const { uploadImages, isUploading } = useCommunityUploads();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [localTitle, setLocalTitle] = useState(title);
   const [localUrl, setLocalUrl] = useState(url);
 
   // Sync local state with props
   useState(() => {
     setLocalTitle(title);
     setLocalUrl(url);
   });
 
   const handleTitleChange = (value: string) => {
     setLocalTitle(value);
     onChange({ featured_project_title: value });
   };
 
   const handleUrlChange = (value: string) => {
     setLocalUrl(value);
     onChange({ featured_project_url: value });
   };
 
   const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     if (files.length > 0) {
       const uploadedUrls = await uploadImages(files);
       if (uploadedUrls.length > 0) {
         onChange({ featured_project_thumbnail: uploadedUrls[0] });
       }
     }
     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
   };
 
   const handleClear = () => {
     setLocalTitle("");
     setLocalUrl("");
     onChange({
       featured_project_title: "",
       featured_project_url: "",
       featured_project_thumbnail: null,
     });
   };
 
   const getEmbedType = (url: string): "youtube" | "vimeo" | "other" | null => {
     if (!url) return null;
     if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
     if (url.includes("vimeo.com")) return "vimeo";
     return "other";
   };
 
   const getYouTubeId = (url: string): string | null => {
     const match = url.match(
       /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
     );
     return match ? match[1] : null;
   };
 
   const getVimeoId = (url: string): string | null => {
     const match = url.match(/vimeo\.com\/(\d+)/);
     return match ? match[1] : null;
   };
 
   const embedType = getEmbedType(localUrl);
   const hasContent = localTitle || localUrl;
 
   return (
     <Card className="card-urban">
       <CardHeader className="flex flex-row items-center justify-between">
         <CardTitle className="flex items-center gap-2">
           <Film className="h-5 w-5 text-primary" />
           Featured Project
         </CardTitle>
         {hasContent && (
           <Button
             variant="ghost"
             size="sm"
             onClick={handleClear}
             className="text-muted-foreground hover:text-destructive"
           >
             <X className="h-4 w-4 mr-1" />
             Clear
           </Button>
         )}
       </CardHeader>
       <CardContent className="space-y-6">
         {/* Form Fields */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label className="text-sm font-bold uppercase tracking-wide">
               Project Title
             </Label>
             <Input
               value={localTitle}
               onChange={(e) => handleTitleChange(e.target.value)}
               placeholder="My Latest Short Film"
               className="bg-background border-2 border-border focus:border-primary"
             />
           </div>
 
           <div className="space-y-2">
             <Label className="text-sm font-bold uppercase tracking-wide flex items-center gap-1">
               <Link className="h-3.5 w-3.5" />
               Project URL
             </Label>
             <Input
               value={localUrl}
               onChange={(e) => handleUrlChange(e.target.value)}
               placeholder="https://youtu.be/xyz123 or https://vimeo.com/..."
               className="bg-background border-2 border-border focus:border-primary"
             />
           </div>
         </div>
 
         {/* Custom Thumbnail */}
         <div className="space-y-2">
           <Label className="text-sm font-bold uppercase tracking-wide">
             Custom Thumbnail (Optional)
           </Label>
           <div className="flex gap-2">
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               className="hidden"
               onChange={handleThumbnailUpload}
             />
             <Button
               variant="outline"
               size="sm"
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="gap-2"
             >
               {isUploading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Upload className="h-4 w-4" />
               )}
               Upload Thumbnail
             </Button>
             {thumbnail && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => onChange({ featured_project_thumbnail: null })}
                 className="text-muted-foreground"
               >
                 Remove
               </Button>
             )}
           </div>
         </div>
 
         {/* Preview */}
         {(localUrl || thumbnail) && (
           <div className="space-y-2">
             <Label className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
               Preview
             </Label>
             <div className="rounded-lg overflow-hidden border-2 border-border bg-charcoal">
               <AspectRatio ratio={16 / 9}>
                 {embedType === "youtube" && getYouTubeId(localUrl) ? (
                   <iframe
                     src={`https://www.youtube.com/embed/${getYouTubeId(localUrl)}`}
                     title={localTitle || "Featured Project"}
                     className="w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   />
                 ) : embedType === "vimeo" && getVimeoId(localUrl) ? (
                   <iframe
                     src={`https://player.vimeo.com/video/${getVimeoId(localUrl)}`}
                     title={localTitle || "Featured Project"}
                     className="w-full h-full"
                     allow="autoplay; fullscreen; picture-in-picture"
                     allowFullScreen
                   />
                 ) : thumbnail ? (
                   <div className="relative w-full h-full">
                     <img
                       src={thumbnail}
                       alt={localTitle || "Featured Project"}
                       className="w-full h-full object-cover"
                     />
                     {localUrl && (
                       <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                         <div className="p-4 rounded-full bg-primary/90 text-primary-foreground">
                           <Play className="h-8 w-8" />
                         </div>
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-charcoal-light">
                     <Film className="h-12 w-12 text-muted-foreground/30" />
                   </div>
                 )}
               </AspectRatio>
               {localTitle && (
                 <div className="p-3 bg-background/5 backdrop-blur-sm">
                   <p className="font-semibold text-foreground">{localTitle}</p>
                 </div>
               )}
             </div>
           </div>
         )}
 
         <p className="text-xs text-muted-foreground text-center">
           💡 This will appear prominently at the top of your public profile.
         </p>
       </CardContent>
     </Card>
   );
 }