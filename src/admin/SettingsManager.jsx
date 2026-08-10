import { useEffect, useState } from "react";

const defaultColors = { accent: "#000000", surface: "#ffffff", background: "#ffffff" };

export default function SettingsManager() {
  const [colors, setColors] = useState(() => {
    try { return { ...defaultColors, ...JSON.parse(localStorage.getItem("nkeys-theme") || "{}") }; } catch { return defaultColors; }
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--color-terracotta", colors.accent);
    document.documentElement.style.setProperty("--color-sand", colors.background);
    localStorage.setItem("nkeys-theme", JSON.stringify(colors));
  }, [colors]);

  const update = (key, value) => setColors((current) => ({ ...current, [key]: value }));

  return (
    <section className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold">Storefront Settings</h2>
        <p className="mt-1 text-xs text-stone-500">Change the storefront palette on this device.</p>
      </div>
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="space-y-5">
          {[["accent", "Accent color"], ["background", "Background color"]].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4 dark:bg-stone-800">
              <span className="text-sm font-semibold">{label}</span>
              <input type="color" value={colors[key]} onChange={(event) => update(key, event.target.value)} className="h-10 w-16 cursor-pointer rounded-lg border-0 bg-transparent" />
            </label>
          ))}
        </div>
        <button type="button" onClick={() => setColors(defaultColors)} className="mt-6 rounded-full border border-stone-200 px-5 py-2.5 text-sm font-semibold dark:border-stone-700">Reset colors</button>
      </div>
    </section>
  );
}
