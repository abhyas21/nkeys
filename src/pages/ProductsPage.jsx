import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowUpDown, Tag, Sparkles } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getProductReviewSummary } from "../lib/reviews";

export default function ProductsPage() {
  const { categories, categoriesById, isOwner, products, publishedReviews, formatMoney } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategoryId !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const ratingA = getProductReviewSummary(publishedReviews, a.id).average;
        const ratingB = getProductReviewSummary(publishedReviews, b.id).average;
        return ratingB - ratingA;
      });
    }

    return result;
  }, [products, selectedCategoryId, searchQuery, sortBy, publishedReviews]);

  return (
    <div className="space-y-6">
      <section
        className="page-reveal rounded-[2rem] border border-[#ddcdbc] bg-[#fffaf3] p-5 shadow-soft dark:border-[#3a2d25] dark:bg-[#211915] sm:p-8"
        style={{ "--delay": "40ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
          Product listing
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          All stickers and keychains
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-400">
          Browse, search, and sort our premium collections of custom acrylic charms, metal tags, leather loops, and vinyl stickers.
        </p>
      </section>

      {/* Controls Section */}
      <section 
        className="page-reveal space-y-4 rounded-3xl border border-[#ddcdbc] bg-[#fffaf3] p-5 shadow-soft dark:border-[#3a2d25] dark:bg-[#211915]" 
        style={{ "--delay": "80ms" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400 dark:text-stone-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, material, description..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 py-3 pl-11 pr-10 text-sm text-ink outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 dark:border-[#3a2d25] dark:bg-[#16110e] dark:text-white"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
              <ArrowUpDown size={14} />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-terracotta dark:border-[#3a2d25] dark:bg-[#16110e] dark:text-white appearance-none pr-8 bg-no-repeat"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`,
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem"
              }}
            >
              <option value="featured">Featured / Custom</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="alpha">Alphabetical: A-Z</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="border-t border-[#ddcdbc]/40 pt-4 dark:border-[#3a2d25]/40">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                selectedCategoryId === "all"
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-stone-50 text-stone-600 border border-stone-200/60 hover:bg-[#efe1cf]/50 dark:bg-[#16110e] dark:text-stone-400 dark:border-[#3a2d25] dark:hover:bg-[#2b211c]"
              }`}
            >
              <Sparkles size={12} />
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  selectedCategoryId === cat.id
                    ? "bg-terracotta text-white shadow-sm"
                    : "bg-stone-50 text-stone-600 border border-stone-200/60 hover:bg-[#efe1cf]/50 dark:bg-[#16110e] dark:text-stone-400 dark:border-[#3a2d25] dark:hover:bg-[#2b211c]"
                }`}
              >
                <Tag size={12} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active filters tag strip */}
        {selectedCategoryId !== "all" || searchQuery ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-stone-500 font-medium">Active filters:</span>
            {selectedCategoryId !== "all" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6ddd4] px-2.5 py-1 font-semibold text-[#9d4c2b] dark:bg-amber-950/40 dark:text-amber-300">
                Category: {categoriesById[selectedCategoryId]?.name}
                <button onClick={() => setSelectedCategoryId("all")}>
                  <X size={12} className="ml-1" />
                </button>
              </span>
            ) : null}
            {searchQuery ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6ddd4] px-2.5 py-1 font-semibold text-[#9d4c2b] dark:bg-amber-950/40 dark:text-amber-300">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")}>
                  <X size={12} className="ml-1" />
                </button>
              </span>
            ) : null}
            <button
              onClick={() => {
                setSelectedCategoryId("all");
                setSearchQuery("");
              }}
              className="text-stone-500 hover:text-terracotta underline font-semibold ml-auto"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </section>

      <section className="page-reveal space-y-6" style={{ "--delay": "120ms" }}>
        <div className="stagger-grid grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAndSortedProducts.length ? (
            filteredAndSortedProducts.map((product) => {
              const summary = getProductReviewSummary(publishedReviews, product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoriesById[product.categoryId]?.name}
                  averageRating={summary.average}
                  reviewCount={summary.total}
                  formatMoney={formatMoney}
                />
              );
            })
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d4bda8] bg-[#f7ecde] p-8 text-sm leading-7 text-stone-600 dark:border-[#4a382e] dark:bg-[#2a201a] dark:text-stone-400 sm:col-span-2 xl:col-span-3">
              <p className="font-semibold text-ink dark:text-white">No products found matching your criteria.</p>
              <p className="mt-2">
                Try resetting your filters or adjusting your search query.
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryId("all");
                  setSearchQuery("");
                  setSortBy("featured");
                }}
                className="mt-4 inline-flex items-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              >
                Reset catalog filters
              </button>
              {isOwner ? (
                <Link
                  to="/admin"
                  className="mt-4 ml-3 inline-flex items-center rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b75f38]"
                >
                  Open admin dashboard
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
