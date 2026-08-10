export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-fade-in">
      <section className="text-center space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Established 2026</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The NKeys Story</h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Crafting custom daily-carry keychains and high-detail sticker configurations for style curators and collectors.
        </p>
      </section>

      <section className="aspect-[21/9] bg-stone-150 rounded-3xl overflow-hidden shadow-soft">
        <img
          src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1000"
          alt="Keychain Workshop"
          className="w-full h-full object-cover grayscale opacity-90"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        <div className="space-y-4">
          <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">Uncompromising Materials</h3>
          <p>
            Each loop, clasp, and ring is selected from industrial-grade metals and scratch-resistant acrylics. We hand-pack each order to ensure that when your keys hit the table, they make a statement.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">Precision Customization</h3>
          <p>
            Whether it's custom text engraving or high-res graphic sticker laminations, our print studio ensures sub-millimeter detailing with longevity built to withstand daily scratches, pockets, and weather.
          </p>
        </div>
      </section>

      <section className="border-t border-stone-200 dark:border-stone-850 pt-8 text-center">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Minimalist Design • High Utility • Personal Touch</p>
      </section>
    </div>
  );
}
