import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const StarRating = ({ rating = 0, size = 14, showValue = true, count }) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1" data-testid="star-rating">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={cn(
              "transition-colors",
              n <= rounded ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground">
          {rating > 0 ? rating.toFixed(1) : "New"}
          {typeof count === "number" && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
};
