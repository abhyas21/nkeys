import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "How long does custom engraving take?",
      a: "Our standard processing and engraving time is 3 to 5 business days. Once packing is complete, shipping takes an additional 2 to 4 days depending on your location."
    },
    {
      q: "Do you ship across India?",
      a: "Yes, we ship nationwide. Orders are dispatched from either our New Delhi or Kolkata hubs to ensure the fastest delivery route to your doorstep."
    },
    {
      q: "Can I upload custom photos for keychain prints?",
      a: "Absolutely! Go to the 'Photo Keychains' section, select your base, and use our custom uploader to supply your graphics, illustrations, or family photos."
    },
    {
      q: "What is your refund policy?",
      a: "Since all custom keychains and sticker packs are custom made to order with personalized details, we cannot offer refunds once production has started. If an item arrives damaged, contact us within 48 hours for a replacement."
    },
    {
      q: "How are shipping rates calculated?",
      a: "We offer flat-rate standard shipping of ₹50 across India. Orders exceeding ₹999 qualify for free express delivery."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-8 animate-fade-in">
      <section className="text-center space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">FAQ</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Quick answers regarding orders, packaging, shipping limits, and personalized custom design uploads.
        </p>
      </section>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 rounded-3xl overflow-hidden transition shadow-soft"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-stone-900 dark:text-stone-100 outline-none"
              >
                <span>{faq.q}</span>
                <span className="text-stone-400">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-xs leading-relaxed text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-850 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
