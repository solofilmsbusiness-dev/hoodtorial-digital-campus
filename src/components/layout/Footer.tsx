import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.png";

const footerLinks = {
  academics: [
    { name: "All Courses", href: "/academics" },
    { name: "Degree Paths", href: "/degrees" },
    { name: "Faculty", href: "/faculty" },
    { name: "Academic Calendar", href: "/calendar" },
  ],
  resources: [
    { name: "Student Center", href: "/student-center" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Academic Integrity", href: "/integrity" },
    { name: "Capstone Policy", href: "/capstone-policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal-dark border-t border-border">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img 
                src={mascot} 
                alt="Hoodtorial University Mascot" 
                className="h-12 w-12 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  HOODTORIAL
                </span>
                <span className="text-xs tracking-widest text-primary uppercase">
                  UNIVERSITY
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              Where Hustle Meets Hollywood. A cinematic film school for creators who want to shoot better, edit smarter, and graduate different.
            </p>
          </div>

          {/* Academics Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
              Academics
            </h4>
            <ul className="space-y-3">
              {footerLinks.academics.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hoodtorial University. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="stamp-badge text-[10px]">Est. 2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
