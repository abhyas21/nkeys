export function getProductReviewSummary(reviews, productId) {
  const relevant = reviews.filter(
    (review) => review.productId === productId && review.status === "published"
  );

  const total = relevant.length;
  const average = total
    ? relevant.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;

  return {
    total,
    average
  };
}
