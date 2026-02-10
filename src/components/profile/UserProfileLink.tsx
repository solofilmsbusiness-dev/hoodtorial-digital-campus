 import { Link } from "react-router-dom";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { cn } from "@/lib/utils";
 
interface UserProfileLinkProps {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  showAvatar?: boolean;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  accentColor?: string | null;
  borderStyle?: string | null;
}
 
 const sizeClasses = {
   sm: "h-6 w-6",
   md: "h-8 w-8",
   lg: "h-10 w-10",
 };
 
 const textSizeClasses = {
   sm: "text-xs",
   md: "text-sm",
   lg: "text-base",
 };
 
export function UserProfileLink({
  userId,
  displayName,
  avatarUrl,
  showAvatar = true,
  showName = true,
  size = "md",
  className,
  avatarClassName,
  nameClassName,
  accentColor,
  borderStyle,
}: UserProfileLinkProps) {
   const getInitials = (name?: string | null) => {
     if (!name) return "?";
     return name
       .split(" ")
       .map((n) => n.charAt(0))
       .join("")
       .toUpperCase()
       .slice(0, 2);
   };
 
   return (
     <Link
       to={`/profile/${userId}`}
       className={cn(
         "flex items-center gap-2 hover:opacity-80 transition-opacity",
         className
       )}
       onClick={(e) => e.stopPropagation()}
     >
       {showAvatar && (
         <Avatar className={cn(sizeClasses[size], "border-2 border-border", avatarClassName)}>
           <AvatarImage src={avatarUrl || undefined} />
           <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
             {getInitials(displayName)}
           </AvatarFallback>
         </Avatar>
       )}
       {showName && (
         <span className={cn("font-semibold hover:underline", textSizeClasses[size], nameClassName)}>
           {displayName || "Anonymous"}
         </span>
       )}
     </Link>
   );
 }