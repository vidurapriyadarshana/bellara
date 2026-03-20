import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Product } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => (
  <Link to={`/product/${product.id}`} className="group block">
    <div className="relative overflow-hidden rounded-lg bg-secondary aspect-square mb-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {product.originalPrice && (
        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-body font-semibold px-2.5 py-1 rounded-full">
          Sale
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{product.category}</p>
      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body font-semibold text-foreground">${product.price}</span>
        {product.originalPrice && (
          <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
        )}
      </div>
    </div>
  </Link>
);

export default ProductCard;
