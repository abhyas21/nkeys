import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import {
  getProductImageStorageLabel,
  hasRemoteProductImageStorage,
  uploadProductImages
} from "../lib/productImageStorage";

function createForm(categoryId = "") {
  return {
    name: "",
    description: "",
    price: "",
    type: "sticker",
    categoryId,
    displayMode: "list"
  };
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const { categories, isOwner, ownerEmail, saveProduct } = useStore();
  const [form, setForm] = useState(() => createForm(categories[0]?.id || ""));
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadFeedback, setUploadFeedback] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOwner) {
    return (
      <section className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Add product
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Owner access only</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Only the owner account ({ownerEmail}) can add products.
        </p>
      </section>
    );
  }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setUploadFeedback("");
      return;
    }

    setIsUploading(true);
    setUploadFeedback("");

    try {
      const { urls, provider } = await uploadProductImages(files);
      setGalleryImages((current) => [...current, ...urls]);
      setUploadFeedback(
        provider === "supabase"
          ? `${urls.length} image${urls.length === 1 ? "" : "s"} uploaded to Supabase storage.`
          : `${urls.length} image${urls.length === 1 ? "" : "s"} added using local demo storage.`
      );
    } catch {
      setUploadFeedback("Images could not be uploaded. Check your Supabase storage settings or try smaller files.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const description = form.description.trim();
    const productName = form.name.trim();
    const shortDescription = description.slice(0, 120) || productName;
    setIsSaving(true);
    setSaveFeedback("");

    try {
      const saved = await saveProduct({
        name: productName,
        description,
        shortDescription,
        price: Number(form.price),
        type: form.type,
        categoryId: form.categoryId || categories[0]?.id || "",
        gallery: galleryImages,
        compareAtPrice: 0,
        materials: [],
        turnaroundDays: "3-5 business days",
        uploadEnabled: false,
        featured: form.displayMode === "launch",
        inventory: 25,
        specs: []
      });

      if (!saved) {
        setSaveFeedback("Product could not be saved.");
        return;
      }

      navigate("/admin");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <section
        className="page-reveal rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft"
        style={{ "--delay": "40ms" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Add product
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-ink">
              Create a new product listing
            </h1>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-ink transition hover:border-stone-900"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Product Name</span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Description</span>
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Price</span>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: event.target.value }))
                }
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Type</span>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              >
                <option value="sticker">Sticker</option>
                <option value="keychain">Keychain</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Category</span>
              <select
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, categoryId: event.target.value }))
                }
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Display in storefront</span>
            <select
              value={form.displayMode}
              onChange={(event) =>
                setForm((current) => ({ ...current, displayMode: event.target.value }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-900"
            >
              <option value="list">Product list only</option>
              <option value="launch">New launch + product list</option>
            </select>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Use `New launch` when this product should also appear in the home page launch card.
            </p>
          </label>

          <div className="rounded-[1.8rem] border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ImagePlus size={16} className="text-terracotta" />
              Multiple Image Upload
            </div>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Storage: {getProductImageStorageLabel()}
              {hasRemoteProductImageStorage()
                ? " is active for uploaded product images."
                : " is being used until Supabase env vars are configured."}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={isUploading || isSaving}
              className="mt-4 block w-full text-sm text-stone-500 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {uploadFeedback ? (
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-stone-600">
                {uploadFeedback}
              </p>
            ) : null}
          </div>

          {saveFeedback ? (
            <p className="rounded-2xl bg-sand px-4 py-3 text-sm text-stone-600">
              {saveFeedback}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </form>
      </section>

      <aside
        className="page-reveal-right rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft"
        style={{ "--delay": "120ms" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Image preview
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">
          Product gallery
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {galleryImages.length ? (
            galleryImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-50"
              >
                <img
                  src={image}
                  alt={`${form.name || "Product"} preview ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-sm leading-7 text-stone-600 sm:col-span-2">
              Upload multiple images to build a clean product gallery for the detail page carousel.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
