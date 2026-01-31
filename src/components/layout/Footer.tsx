import { Link } from "react-router-dom";

const footerLinks = {
  academics: [
    { name: "All Courses", href: "/academics" },
    { name: "Degree Paths", href: "/degrees" },
    { name: "Faculty", href: "/faculty" },
  ],
  resources: [
    { name: "Student Center", href: "/student-center" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Academic Integrity", href: "/integrity" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal-dark border-t-2 border-border">
      {/* Marquee Banner */}
      <div className="py-4 bg-primary overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-sm font-black uppercase tracking-wider text-primary-foreground mx-8">
              SHOOT BETTER • EDIT SMARTER • GRADUATE DIFFERENT •
            </span>
          ))}
        </div>
      </div>

      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-black tracking-tighter text-foreground">
                HOODTORIAL
              </span>
              <span className="block text-xs font-bold tracking-[0.3em] text-primary">
                UNIVERSITY
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              Where hustle meets Hollywood. Film school for the culture.
            </p>
          </div>

          {/* Academics Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-4">
              Academics
            </h4>
            <ul className="space-y-3">
              {footerLinks.academics.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} HOODTORIAL UNIVERSITY. ALL RIGHTS RESERVED.
          </p>
          <div className="tag-sticker">
            EST. 2024
          </div>
        </div>
      </div>
    </footer>
  );
}
