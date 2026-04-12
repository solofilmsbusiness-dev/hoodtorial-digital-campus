import { Link, useNavigate } from "react-router-dom";
 import { Menu, X, User, LogOut, Shield, Users, MessageCircle, UserPlus, Eye, Settings, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
 import { useFriendships } from "@/hooks/useFriendships";
 import { useConversations } from "@/hooks/useConversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/community/NotificationBell";
import { LivePresenceIndicator } from "@/components/animations/LivePresenceIndicator";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Academics", href: "/academics" },
  { name: "Degrees", href: "/degrees" },
  { name: "Faculty", href: "/faculty" },
  { name: "About", href: "/about" },
  { name: "Shop", href: "/shop" },
];
export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfileContext();
  const { isAdmin } = useAdminAuth();
  const { pendingCount } = useFriendships();
  const { totalUnread } = useConversations();

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "S";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-border">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <img 
              src={logo} 
              alt="Hoodtorial University" 
              className="h-12 md:h-14 w-auto object-contain invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LivePresenceIndicator />
            {user ? (
              <>
                <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors">
                    <Avatar 
                      className="h-9 w-9 border-2"
                      style={{ borderColor: profile?.profile_accent_color || 'hsl(var(--primary))' }}
                    >
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {getInitials(profile?.display_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                 <DropdownMenuItem asChild>
                   <Link to={`/profile/${user.id}`} className="flex items-center gap-2 cursor-pointer">
                     <Eye className="h-4 w-4" />
                     View My Profile
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link to="/student/profile" className="flex items-center gap-2 cursor-pointer">
                     <Settings className="h-4 w-4" />
                     Edit Profile
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/student" className="flex items-center gap-2 cursor-pointer">
                     <GraduationCap className="h-4 w-4" />
                     Student Hub
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/community" className="flex items-center gap-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      Community
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/friends" className="flex items-center gap-2 cursor-pointer">
                      <UserPlus className="h-4 w-4" />
                      Friends
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 flex items-center justify-center text-xs">
                          {pendingCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center gap-2 cursor-pointer">
                      <MessageCircle className="h-4 w-4" />
                      Messages
                      {totalUnread > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 min-w-5 flex items-center justify-center text-xs">
                          {totalUnread}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                 <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                 {isAdmin && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Link 
                  to="/auth"
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
                >
                  Login
                </Link>
                <Link 
                  to="/enrollment"
                  className="btn-brutal text-sm"
                >
                  Enroll Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t-2 border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link 
                    to={`/profile/${user.id}`}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/student/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                  >
                    Edit Profile
                  </Link>
                  <div className="border-t border-border my-2" />
                  <Link 
                    to="/student" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                  >
                   Student Hub
                  </Link>
                  <Link 
                    to="/community" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                  >
                    Community
                  </Link>
                  <Link 
                    to="/friends" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2 flex items-center gap-2"
                  >
                    Friends
                    {pendingCount > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </Link>
                  <Link 
                    to="/messages" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2 flex items-center gap-2"
                  >
                    Messages
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs">
                        {totalUnread}
                      </Badge>
                    )}
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="text-lg font-bold text-destructive hover:text-destructive/80 transition-colors uppercase tracking-wide py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/enrollment" 
                    onClick={() => setIsOpen(false)}
                    className="btn-brutal text-center mt-4"
                  >
                    Enroll Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
