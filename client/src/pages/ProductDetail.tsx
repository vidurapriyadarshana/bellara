import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowLeft, Star, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (pageRef.current) {
      gsap.from(".detail-image", { x: -50, opacity: 0, duration: 0.8, ease: "power2.out" });
      gsap.from(".detail-info", { x: 50, opacity: 0, duration: 0.8, delay: 0.2, ease: "power2.out" });
      gsap.from(".detail-reviews .review-item", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.6, delay: 0.4, ease: "power2.out",
      });
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center pt-24">
          <h1 className="font-display text-2xl text-foreground mb-4">Product not found</h1>
          <Link to="/store" className="text-primary font-body hover:underline">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 section-padding">
        <div className="max-w-7xl mx-auto">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <div className="detail-image aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="detail-info flex flex-col justify-center">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">{product.name}</h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-body">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <span className="font-display text-3xl text-foreground">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through font-body">${product.originalPrice}</span>
                )}
              </div>

              <p className="mt-6 text-muted-foreground font-body leading-relaxed">{product.longDescription}</p>

              {/* Colors */}
              <div className="mt-6">
                <p className="text-sm font-body font-semibold text-foreground mb-2">Available Colors</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <span key={c} className="px-3 py-1.5 text-xs font-body rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <Button className="mt-8 bg-primary text-primary-foreground hover:bg-blush-dark px-8 py-6 font-body tracking-wide w-full md:w-auto">
                <ShoppingBag className="w-4 h-4 mr-2" /> Add to Bag
              </Button>
            </div>
          </div>

          {/* Reviews */}
          <div className="detail-reviews mt-16">
            <h2 className="font-display text-2xl text-foreground mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((r) => (
                <div key={r.id} className="review-item">
                  <ReviewCard review={r} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductDetail;
