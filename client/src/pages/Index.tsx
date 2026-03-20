import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Gem, Truck, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import ProductCard from "@/components/ProductCard";
import { products, homeReviews } from "@/data/products";
import { Button } from "@/components/ui/button";
import bag2 from "@/assets/products/bag-2.jpg";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.from(".hero-title", { y: 60, opacity: 0, duration: 1, ease: "power3.out" });
      gsap.from(".hero-subtitle", { y: 40, opacity: 0, duration: 1, delay: 0.3, ease: "power3.out" });
      gsap.from(".hero-cta", { y: 30, opacity: 0, duration: 0.8, delay: 0.6, ease: "power3.out" });
      gsap.from(".hero-image", { scale: 1.1, opacity: 0, duration: 1.2, delay: 0.2, ease: "power2.out" });

      // About section
      gsap.from(aboutRef.current!.querySelectorAll(".about-item"), {
        scrollTrigger: { trigger: aboutRef.current, start: "top 80%" },
        y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power2.out",
      });

      // Featured products
      gsap.from(featuredRef.current!.querySelectorAll(".product-card"), {
        scrollTrigger: { trigger: featuredRef.current, start: "top 80%" },
        y: 50, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
      });

      // Reviews
      gsap.from(reviewsRef.current!.querySelectorAll(".review-card"), {
        scrollTrigger: { trigger: reviewsRef.current, start: "top 80%" },
        y: 40, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Gem, title: "Premium Leather", desc: "Ethically sourced Italian leather, handcrafted by artisans." },
    { icon: Truck, title: "Free Shipping", desc: "Complimentary worldwide shipping on all orders over $150." },
    { icon: ShieldCheck, title: "2-Year Warranty", desc: "Every Bellara bag comes with a comprehensive warranty." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="pt-24 md:pt-32 section-padding">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="hero-title font-display text-5xl md:text-6xl lg:text-7xl leading-tight text-foreground">
              Elegance in <br />
              <span className="text-primary">Every Stitch</span>
            </h1>
            <p className="hero-subtitle mt-6 text-lg text-muted-foreground font-body leading-relaxed max-w-md">
              Discover Bellara's collection of handcrafted leather bags — where timeless design meets modern luxury.
            </p>
            <div className="hero-cta mt-8 flex gap-4">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-blush-dark px-8 py-6 font-body tracking-wide">
                <Link to="/store">Shop Collection <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
          <div className="hero-image relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-secondary">
              <img src={bag2} alt="Bellara Rosa Shoulder Bag" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg px-5 py-3 shadow-lg">
              <p className="font-display text-sm text-foreground">Best Seller</p>
              <p className="text-xs text-muted-foreground font-body">Rosa Shoulder Bag</p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Features */}
      <section ref={aboutRef} className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="about-item font-display text-3xl md:text-4xl text-foreground">Why Bellara?</h2>
          <p className="about-item mt-4 text-muted-foreground font-body max-w-2xl mx-auto">
            Born from a love for timeless accessories, Bellara blends Italian craftsmanship with contemporary design. Every bag tells a story of elegance, quality, and attention to detail.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="about-item text-center p-6">
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section ref={featuredRef} className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">Featured Bags</h2>
              <p className="mt-2 text-muted-foreground font-body">Curated picks from our latest collection.</p>
            </div>
            <Link to="/store" className="hidden md:flex items-center gap-1 text-sm text-primary font-body font-semibold hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="product-card">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section ref={reviewsRef} className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-10">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {homeReviews.map((r) => (
              <div key={r.id} className="review-card">
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
