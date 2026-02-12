import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  category: "Jacket" | "Tee" | "Accessory";
  price: number;
  image: string;
  status: "available" | "sold-out" | "coming-soon";
  sizes?: string[];
  description?: string;
  stock?: number;
  color?: string;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const statusBadge = {
    "sold-out": { label: "SOLD OUT", className: "bg-destructive text-destructive-foreground" },
    "coming-soon": { label: "COMING SOON", className: "bg-muted text-muted-foreground" },
    available: null,
  };

  const badge = statusBadge[product.status];
  const isDisabled = product.status !== "available";

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        "group relative bg-card border-2 border-border overflow-hidden transition-all duration-500",
        !isDisabled && "cursor-pointer hover:border-primary",
        !isDisabled && "hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_hsl(var(--primary)/0.3)]",
        isDisabled && "opacity-70"
      )}
    >
      {/* Category Tag */}
      <div className="absolute top-3 left-3 z-10">
        <span className="tag-sticker text-[10px]">
          {product.category}
        </span>
      </div>

      {/* Status Badge */}
      {badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={cn("text-[10px] font-bold tracking-wider", badge.className)}>
            {product.status === "coming-soon" && <Lock className="w-3 h-3 mr-1" />}
            {badge.label}
          </Badge>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-charcoal-light">
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            !isDisabled && "group-hover:scale-110"
          )}
        />
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-foreground uppercase tracking-wide text-sm line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-primary font-black text-xl">
            ${product.price}
          </p>
          {product.status === "available" && product.stock != null && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              product.stock <= 3 ? "text-destructive" : product.stock <= 10 ? "text-amber-500" : "text-emerald-500"
            )}>
              {product.stock <= 3 ? `Only ${product.stock} left` : product.stock <= 10 ? `${product.stock} left` : "In Stock"}
            </span>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      </div>
    </div>
  );
}
