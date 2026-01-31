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
  ctaHref = "/enroll",
  className,
}: TierCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col bg-card border rounded-lg p-6 md:p-8 transition-all duration-300",
        highlighted
          ? "border-primary shadow-glow-gold scale-[1.02]"
          : "border-border hover:border-primary/50",
        className
      )}
    >
      {/* Highlighted Badge */}
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="label-tape">Most Popular</span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="heading-4 text-foreground mb-2">{name}</h3>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl md:text-5xl font-bold text-primary">
          ${price}
        </span>
        <span className="text-muted-foreground">{period}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        asChild
        className={cn(
          "w-full font-bold uppercase tracking-wide",
          highlighted
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-foreground"
        )}
      >
        <Link to={ctaHref}>{ctaText}</Link>
      </Button>
    </div>
  );
}
