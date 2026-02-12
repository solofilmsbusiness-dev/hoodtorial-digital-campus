import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TierCardProps {
  name: string;
  price: number;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export function TierCard({
  name,
  price,
  period = "/mo",
  description,
  features,
  highlighted = false,
  ctaText = "Enroll Now",
  ctaHref = "/enrollment",
  className,
}: TierCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col border-2 p-6 md:p-8 transition-all duration-300 bg-card",
        highlighted
          ? "border-primary glow-gold scale-[1.02]"
          : "border-border hover:border-primary",
        className
      )}
    >
      {/* Highlighted Badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="tag-sticker">Most Popular</span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="heading-4 text-foreground mb-2">{name}</h3>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-5xl md:text-6xl font-black text-primary">
          ${price}
        </span>
        <span className="text-muted-foreground font-medium">{period}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 bg-primary/20 border border-primary flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {highlighted ? (
        <Link to={ctaHref} className="btn-brutal w-full text-center">
          {ctaText}
        </Link>
      ) : (
        <Button
          asChild
          variant="outline"
          className="w-full font-bold uppercase tracking-wide border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground h-12"
        >
          <Link to={ctaHref}>{ctaText}</Link>
        </Button>
      )}
    </div>
  );
}
