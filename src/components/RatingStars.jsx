import { Star } from "lucide-react";

export default function RatingStars({ rating = 0, size = 16, className = "" }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }, (_, index) => {
        const active = index + 1 <= Math.round(safeRating);
        return (
          <Star
            key={index}
            size={size}
            className={active ? "fill-amber-400 text-amber-400" : "text-stone-300"}
          />
        );
      })}
    </div>
  );
}
