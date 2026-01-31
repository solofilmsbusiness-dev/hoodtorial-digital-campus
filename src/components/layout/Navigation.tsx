import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import mascot from "@/assets/mascot.png";

const navLinks = [
  { name: "Academics", href: "/academics" },
  { name: "Degree Paths", href: "/degrees" },
  { name: "Faculty", href: "/faculty" },
  { name: "About", href: "/about" },
  { name: "Shop", href: "/shop" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={mascot} 
              alt="Hoodtorial University Mascot" 
              className="h-10 w-10 md:h-12 md:w-12 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">
                HOODTORIAL
              </span>
              <span className="text-xs tracking-widest text-primary uppercase">
                UNIVERSITY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide">
              <Link to="/enroll">Enroll Now</Link>
            </Button>
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
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide py-2"
                >
                  {link.name}
                </Link>
              ))}
              <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide">
                <Link to="/enroll" onClick={() => setIsOpen(false)}>Enroll Now</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
