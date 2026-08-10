import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Send, MapPin, Phone, Mail } from "lucide-react";

export default function Contact() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = "Invalid email formatting";
    }
    if (!formData.message.trim()) nextErrors.message = "Message cannot be blank";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast("Please fix input errors", "error");
      return;
    }
    setSubmitted(true);
    addToast("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-fade-in">
      <section className="text-center space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Contact Us</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Get In Touch</h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
          Have an inquiry about large custom sticker drops, corporate keychain collaborations, or delivery timelines? Fill out the form below.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Columns */}
        <div className="space-y-6 md:col-span-1">
          <div className="flex items-start gap-4">
            <span className="p-3 bg-stone-100 dark:bg-stone-850 rounded-2xl text-stone-900 dark:text-stone-100">
              <Mail size={18} />
            </span>
            <div>
              <h4 className="font-bold text-sm">Email Support</h4>
              <p className="text-xs text-stone-500 mt-1">nkeys.coofficial@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="p-3 bg-stone-100 dark:bg-stone-850 rounded-2xl text-stone-900 dark:text-stone-100">
              <MapPin size={18} />
            </span>
            <div>
              <h4 className="font-bold text-sm">Fulfillment Hubs</h4>
              <p className="text-xs text-stone-500 mt-1">New Delhi & Kolkata, India</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="p-3 bg-stone-100 dark:bg-stone-850 rounded-2xl text-stone-900 dark:text-stone-100">
              <Phone size={18} />
            </span>
            <div>
              <h4 className="font-bold text-sm">WhatsApp Inquiry</h4>
              <p className="text-xs text-stone-500 mt-1">+91 99999 99999</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-6 md:p-8 shadow-soft">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <h3 className="font-bold text-lg">Thank you!</h3>
              <p className="text-xs text-stone-500">We have received your message and will respond within 24 business hours.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 border border-stone-200 hover:border-stone-400 px-6 py-2 rounded-full text-xs font-semibold"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  className={`w-full rounded-xl border ${errors.name ? "border-stone-950" : "border-stone-200 dark:border-stone-700"} bg-stone-50 dark:bg-stone-850 px-4 py-3 text-sm outline-none`}
                  placeholder="Enter name"
                />
                {errors.name && <p className="text-xs text-stone-500 mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  className={`w-full rounded-xl border ${errors.email ? "border-stone-950" : "border-stone-200 dark:border-stone-700"} bg-stone-50 dark:bg-stone-850 px-4 py-3 text-sm outline-none`}
                  placeholder="name@email.com"
                />
                {errors.email && <p className="text-xs text-stone-500 mt-1 font-semibold">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">Message</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: null });
                  }}
                  className={`w-full rounded-xl border ${errors.message ? "border-stone-950" : "border-stone-200 dark:border-stone-700"} bg-stone-50 dark:bg-stone-850 px-4 py-3 text-sm outline-none resize-none`}
                  placeholder="How can we help?"
                />
                {errors.message && <p className="text-xs text-stone-500 mt-1 font-semibold">{errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-stone-950 hover:bg-stone-900 text-white dark:bg-white dark:text-stone-950 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Send size={14} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
