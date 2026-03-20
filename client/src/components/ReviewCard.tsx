import { Star } from "lucide-react";
import type { Review } from "@/data/products";

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-card rounded-lg p-6 border border-border">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-body font-semibold text-sm">
        {review.avatar}
      </div>
      <div>
        <p className="font-body font-semibold text-sm text-foreground">{review.name}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < review.rating ? "fill-gold text-gold" : "text-border"}`}
            />
          ))}
        </div>
      </div>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
  </div>
);

export default ReviewCard;
