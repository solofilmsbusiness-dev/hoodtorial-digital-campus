 import { motion } from "framer-motion";
 import { Globe, Instagram, Youtube, Twitter, Film, ExternalLink } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface SocialLink {
   url: string | null;
   icon: React.ReactNode;
   label: string;
   hoverColor: string;
 }
 
 interface ProfileSocialLinksProps {
   portfolioUrl?: string | null;
   instagramUrl?: string | null;
   youtubeUrl?: string | null;
   vimeoUrl?: string | null;
   twitterUrl?: string | null;
   imdbUrl?: string | null;
 }
 
 export function ProfileSocialLinks({
   portfolioUrl,
   instagramUrl,
   youtubeUrl,
   vimeoUrl,
   twitterUrl,
   imdbUrl,
 }: ProfileSocialLinksProps) {
   const socialLinks: SocialLink[] = [
     { url: portfolioUrl, icon: <Globe className="h-5 w-5" />, label: "Portfolio", hoverColor: "hsl(var(--primary))" },
     { url: instagramUrl, icon: <Instagram className="h-5 w-5" />, label: "Instagram", hoverColor: "#E4405F" },
     { url: youtubeUrl, icon: <Youtube className="h-5 w-5" />, label: "YouTube", hoverColor: "#FF0000" },
     { url: vimeoUrl, icon: <Film className="h-5 w-5" />, label: "Vimeo", hoverColor: "#1AB7EA" },
     { url: twitterUrl, icon: <Twitter className="h-5 w-5" />, label: "Twitter", hoverColor: "#1DA1F2" },
     { url: imdbUrl, icon: <ExternalLink className="h-5 w-5" />, label: "IMDb", hoverColor: "#F5C518" },
   ].filter(link => link.url);
 
   if (socialLinks.length === 0) return null;
 
   return (
     <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5, delay: 0.5 }}
       className="flex flex-wrap justify-center gap-4 pt-4"
     >
       {socialLinks.map((link, index) => (
         <motion.a
           key={link.label}
           href={link.url!}
           target="_blank"
           rel="noopener noreferrer"
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
           whileHover={{ scale: 1.1, y: -2 }}
           className={cn(
             "relative flex items-center justify-center w-12 h-12 rounded-full",
             "bg-charcoal border-2 border-border",
             "text-muted-foreground transition-all duration-300",
             "hover:text-foreground hover:border-primary/50"
           )}
           style={{
             ["--hover-glow" as string]: link.hoverColor,
           }}
           onMouseEnter={(e) => {
             e.currentTarget.style.boxShadow = `0 0 20px ${link.hoverColor}40, 0 0 40px ${link.hoverColor}20`;
             e.currentTarget.style.color = link.hoverColor;
             e.currentTarget.style.borderColor = link.hoverColor;
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.boxShadow = 'none';
             e.currentTarget.style.color = '';
             e.currentTarget.style.borderColor = '';
           }}
           aria-label={link.label}
         >
           {link.icon}
         </motion.a>
       ))}
     </motion.div>
   );
 }