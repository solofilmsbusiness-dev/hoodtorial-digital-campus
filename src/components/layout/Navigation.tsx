import { Link } from "react-router-dom";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { isAdmin } = useAdminAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email?: string | null) => {
    if (!email) return "S";
    return email.charAt(0).toUpperCase();
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

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors">
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/student" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Student Center
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            className="md:hidden p-2 text-foreground"
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
                    to="/student" 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                  >
                    Student Center
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
