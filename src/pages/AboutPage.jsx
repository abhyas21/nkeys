import { BadgeCheck, Sparkles, Store } from "lucide-react";

const aboutCards = [
  {
    icon: Store,
    title: "Custom pieces",
    copy: "NKeys focuses on clean, personal stickers and keychains for gifting, events, and everyday carry."
  },
  {
    icon: Sparkles,
    title: "Fresh drops",
    copy: "New launches and product updates are designed to feel simple, modern, and easy to browse."
  },
  {
    icon: BadgeCheck,
    title: "Made for customers",
    copy: "The storefront is built so customers can view products clearly, save favorites, and explore details without clutter."
  }
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-5 shadow-soft sm:p-8 lg:p-10"
        style={{ "--delay": "40ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          About
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">About NKeys</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-stone-600">
          NKeys is a customer-first sticker and keychain storefront focused on clean product
          browsing, strong visuals, and a smooth path from discovery to saved favorites.
        </p>
      </section>

      <section className="page-reveal grid gap-6 sm:grid-cols-2 xl:grid-cols-3" style={{ "--delay": "120ms" }}>
        {aboutCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-terracotta">
              <card.icon size={20} />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-ink">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">{card.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
