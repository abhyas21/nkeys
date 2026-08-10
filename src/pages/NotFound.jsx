import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6">
      <span className="text-4xl font-extrabold tracking-widest text-stone-300">404</span>
      <h2 className="text-2xl font-extrabold">Page Not Found</h2>
      <p className="text-sm text-stone-500">The keys to this page seem to have been lost. Let's redirect you back to the main catalog.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-bold transition">
        <ArrowLeft size={14} /> Back to Home
      </Link>
    </div>
  );
}
