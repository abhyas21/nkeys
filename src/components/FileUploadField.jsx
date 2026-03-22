import { Paperclip } from "lucide-react";

export default function FileUploadField({ onChange, fileName, accept = "image/*" }) {
  return (
    <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 transition hover:border-stone-900">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Paperclip size={18} className="text-terracotta" />
        </span>
        <div>
          <p className="font-semibold text-ink">Upload your design</p>
          <p className="text-sm text-stone-500">
            PNG, JPG, PDF, or vector export for custom sticker and photo keychain orders.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
          Choose file
        </span>
        <span className="truncate text-sm text-stone-600">
          {fileName || "No file selected"}
        </span>
      </div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}
