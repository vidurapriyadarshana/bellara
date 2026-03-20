import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const categories = ["All", "Crossbody", "Shoulder", "Satchel", "Bucket", "Clutch", "Backpack"];

const Store = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  useEffect(() => {
    if (gridRef.current) {
      gsap.from(gridRef.current.querySelectorAll(".store-card"), {
        y: 40, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out",
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    gsap.from(".store-header", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="store-header text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl text-foreground">Our Collection</h1>
            <p className="mt-3 text-muted-foreground font-body">Explore our full range of handcrafted luxury bags.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-body transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((p) => (
              <div key={p.id} className="store-card">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Store;
