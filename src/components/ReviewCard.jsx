import { BadgeCheck, ChevronUp, Image as ImageIcon } from "lucide-react";
import RatingStars from "./RatingStars";

export default function ReviewCard({ review, onHelpful, hasVoted }) {
  const createdAt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(review.createdAt));
  const canVoteHelpful = typeof onHelpful === "function";

  return (
    <article className="lift-card rounded-3xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <RatingStars rating={review.rating} />
            <h4 className="font-semibold text-ink">{review.title}</h4>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span>{review.authorName}</span>
            <span>{createdAt}</span>
            {review.verifiedPurchase ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <BadgeCheck size={14} />
                Verified Purchase
              </span>
            ) : null}
          </div>
        </div>

        {canVoteHelpful ? (
          <button
            type="button"
            onClick={() => onHelpful(review.id)}
            disabled={hasVoted}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition duration-300 hover:-translate-y-0.5 hover:border-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
          >
            <ChevronUp size={16} />
            Helpful ({review.helpfulCount || 0})
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-500">
            Helpful ({review.helpfulCount || 0})
          </span>
        )}
      </div>

      <p className="mt-4 text-sm leading-7 text-stone-600">{review.comment}</p>

      {review.photos?.length ? (
        <div className="mt-4">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            <ImageIcon size={14} />
            Customer photos
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {review.photos.map((photo, index) => (
              <img
                key={`${review.id}-${index}`}
                src={photo}
                alt={`${review.authorName} review upload ${index + 1}`}
                className="motion-media aspect-square w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
