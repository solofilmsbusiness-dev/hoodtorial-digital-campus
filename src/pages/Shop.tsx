import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Section, SectionHeader } from "@/components/layout/Section";
import { ProductCard, type Product } from "@/components/cards/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";

// Product images
import varsityJacketCrown from "@/assets/shop/varsity-jacket-crown.png";
import varsityJacket2025 from "@/assets/shop/varsity-jacket-2025.png";
import teeBali25 from "@/assets/shop/tee-bali-25.png";
import teeClassicHT from "@/assets/shop/tee-classic-ht.png";
import teeClass2025 from "@/assets/shop/tee-class-2025.png";

const products: Product[] = [
  {
    id: "varsity-crown",
    name: "Varsity Jacket – Crown Logo",
    category: "Jacket",
    price: 249,
    image: varsityJacketCrown,
    status: "available",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "varsity-2025",
    name: "Varsity Jacket – Class of 2025",
    category: "Jacket",
    price: 249,
    image: varsityJacket2025,
    status: "available",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "tee-bali",
    name: "Bali 25 Tee",
    category: "Tee",
    price: 45,
    image: teeBali25,
    status: "available",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "tee-classic",
    name: "Classic HT Tee",
    category: "Tee",
    price: 40,
    image: teeClassicHT,
    status: "available",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "tee-2025",
    name: "Class of 2025 Tee",
    category: "Tee",
    price: 45,
    image: teeClass2025,
    status: "coming-soon",
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
];

type Category = "all" | "Jacket" | "Tee" | "Accessory";

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[1] || "");
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative z-10 text-center container-wide py-20">
          <span className="tag-sticker mb-6 inline-block animate-reveal">
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Official Merch
          </span>
          
          <h1 className="heading-1 text-foreground mt-6 animate-reveal stagger-1">
            GEAR <span className="text-gold-gradient">UP</span>
          </h1>
          
          <p className="body-large text-muted-foreground mt-6 max-w-xl mx-auto animate-reveal stagger-2">
            Rep the culture. Show the world you're film school different.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-neon-purple/10 blur-3xl rounded-full" />
      </section>

      {/* Products Section */}
      <Section>
        <SectionHeader
          eyebrow="The Collection"
          title="WEAR THE VISION"
          centered
        />

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)}>
            <TabsList className="bg-charcoal-light border border-border">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-wider"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="Jacket"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-wider"
              >
                Jackets
              </TabsTrigger>
              <TabsTrigger 
                value="Tee"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase tracking-wider"
              >
                Tees
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-sm">More drops loading...</span>
          </div>
        </div>
      </Section>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="bg-card border-border max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="heading-4 text-foreground">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {/* Image */}
                <div className="aspect-square bg-charcoal-light overflow-hidden">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <span className="tag-sticker text-[10px]">{selectedProduct.category}</span>
                    <p className="text-primary font-black text-3xl mt-4">
                      ${selectedProduct.price}
                    </p>
                  </div>

                  {/* Size Selector */}
                  {selectedProduct.sizes && (
                    <div>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Select Size
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`
                              w-12 h-12 border-2 font-bold text-sm uppercase transition-all
                              ${selectedSize === size 
                                ? "border-primary bg-primary text-primary-foreground" 
                                : "border-border hover:border-primary text-foreground"
                              }
                            `}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart */}
                  <Button 
                    className="w-full btn-brutal"
                    disabled={selectedProduct.status !== "available"}
                  >
                    {selectedProduct.status === "available" 
                      ? "Add to Cart" 
                      : selectedProduct.status === "sold-out" 
                        ? "Sold Out" 
                        : "Coming Soon"
                    }
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Free shipping on orders over $100
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
