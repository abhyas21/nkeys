import { useEffect, useState, useRef } from "react";
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  getProductImageUrl
} from "../services/database";
import { useToast } from "../context/ToastContext";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  ChevronDown,
  Check,
  Package,
  Tag,
  IndianRupee
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: "cat-metal", name: "Metal" },
  { id: "cat-acrylic", name: "Acrylic" },
  { id: "cat-pvc", name: "PVC" },
  { id: "cat-rubber", name: "Rubber" },
  { id: "cat-wooden", name: "Wooden" },
  { id: "cat-anime", name: "Anime" },
  { id: "cat-gaming", name: "Gaming" },
  { id: "cat-custom", name: "Custom" },
  { id: "cat-other", name: "Other" }
];

export default function ProductsManager() {
  const { addToast } = useToast();
  const formRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    stock: "20",
    category_id: "",
    images: [] // Up to 5 image URLs or Base64 strings
  });

  // Modal State for + Add New Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Load Products and Categories
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setProducts(prodData || []);

      // Merge database categories with default categories (case-insensitive deduplication)
      const catMap = new Map();
      DEFAULT_CATEGORIES.forEach((c) => catMap.set(c.name.toLowerCase(), c));
      (catData || []).forEach((c) => catMap.set(c.name.toLowerCase(), c));
      const mergedCategories = Array.from(catMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCategories(mergedCategories);
    } catch (err) {
      console.error("Error loading products/categories:", err);
      if (addToast) addToast("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Handle Image Upload (up to 5 images)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - formData.images.length;
    if (remainingSlots <= 0) {
      if (addToast) addToast("Maximum 5 images allowed");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Create New Category Modal Handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();

    if (!trimmed) {
      setCategoryError("Please enter a category name");
      return;
    }

    // Check duplicate
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCategoryError("Category already exists");
      return;
    }

    setSavingCategory(true);
    try {
      const generatedId = `cat-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;
      let savedCat = null;
      try {
        savedCat = await createCategory({ id: generatedId, name: trimmed });
      } catch (err) {
        console.warn("DB createCategory fallback:", err);
      }

      const newCatObj = savedCat || { id: generatedId, name: trimmed };

      // Update categories list and select it
      setCategories((prev) => [...prev, newCatObj].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData((prev) => ({ ...prev, category_id: newCatObj.id }));

      setIsCategoryModalOpen(false);
      setNewCategoryName("");
      setCategoryError("");
      if (addToast) addToast(`Category "${trimmed}" created & selected!`);
    } catch (err) {
      setCategoryError("Failed to save category. Please try again.");
    } finally {
      setSavingCategory(false);
    }
  };

  // Edit Existing Product
  const handleEdit = (product) => {
    setEditingProduct(product);
    const existingImages = [];
    if (product.image_url) existingImages.push(product.image_url);
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((g) => {
        if (g && !existingImages.includes(g)) existingImages.push(g);
      });
    }

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      discount_price: product.discount_price?.toString() || "",
      stock: (product.stock ?? product.inventory ?? 20).toString(),
      category_id: product.category_id || product.categories?.id || "",
      images: existingImages.slice(0, 5)
    });

    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      discount_price: "",
      stock: "20",
      category_id: "",
      images: []
    });
  };

  // Delete Product
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (addToast) addToast("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product:", err);
      if (addToast) addToast("Failed to delete product");
    }
  };

  // Submit Product (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (addToast) addToast("Product name is required");
      return;
    }
    if (!formData.category_id) {
      if (addToast) addToast("Please select a category");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock, 10) || 0,
        inventory: parseInt(formData.stock, 10) || 0,
        category_id: formData.category_id,
        image_url: formData.images[0] || "/hero-keychain.svg",
        gallery: formData.images
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        if (addToast) addToast("Product updated successfully!");
      } else {
        await createProduct({
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          ...payload
        });
        if (addToast) addToast("Product created successfully!");
      }

      handleCancelEdit();
      await loadData();
    } catch (err) {
      console.error("Error saving product:", err);
      if (addToast) addToast("Failed to save product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-stone-900">Products Management</h1>
        <p className="text-xs text-stone-500 mt-1">
          Add, edit, manage inventory, and categorize your storefront products.
        </p>
      </div>

      {/* Product Form Card */}
      <div
        ref={formRef}
        className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm transition"
      >
        <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
          <h2 className="text-lg font-bold font-serif text-stone-900">
            {editingProduct ? `Edit: ${editingProduct.name}` : "Add New Product"}
          </h2>
          {editingProduct && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vintage Brass Custom Keychain"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs"
            />
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Regular Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Discount / Sale Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                placeholder="Optional, e.g. 199"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs"
              />
            </div>
          </div>

          {/* Clean Row: Total Stock Quantity & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Stock Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Total Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="20"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs"
              />
            </div>

            {/* Category Dropdown with Arrow & + Add New Category Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(true);
                    setCategoryError("");
                  }}
                  className="text-[11px] font-semibold text-[#B08D57] hover:text-[#91713d] hover:underline transition"
                >
                  + Add New Category
                </button>
              </div>

              <div className="relative">
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setIsCategoryModalOpen(true);
                      setCategoryError("");
                    } else {
                      setFormData({ ...formData, category_id: e.target.value });
                    }
                  }}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs pr-10 cursor-pointer text-stone-800"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__add_new__" className="font-bold text-[#B08D57]">
                    + Add New Category...
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="High quality laser-cut acrylic keychain with double-sided print..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs"
            />
          </div>

          {/* 5-Image Upload Engine */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Product Images ({formData.images.length}/5)
              </label>
              <span className="text-[11px] text-stone-400">First image will be the cover image</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Existing Image Slots with Remove Button */}
              {formData.images.map((imgSrc, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 group"
                >
                  <img
                    src={getProductImageUrl(imgSrc)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition shadow-sm"
                    title="Remove Image"
                  >
                    <X size={12} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-[#B08D57] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Trigger (visible if less than 5 images) */}
              {formData.images.length < 5 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#B08D57] bg-stone-50/50 hover:bg-stone-50 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group">
                  <Upload size={20} className="text-stone-400 group-hover:text-[#B08D57] mb-1 transition" />
                  <span className="text-[10px] font-bold text-stone-600 group-hover:text-[#B08D57]">
                    Upload Image
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting
              ? "Saving Product..."
              : editingProduct
                ? "Update Product"
                : "Add Product"
            }
          </button>
        </form>
      </div>

      {/* Modal Dialog: + Add New Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900">Add New Category</h3>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName("");
                  setCategoryError("");
                }}
                className="text-stone-400 hover:text-stone-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (categoryError) setCategoryError("");
                  }}
                  placeholder="e.g. Leather, Neon, Vintage"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm outline-none focus:border-[#B08D57] transition shadow-xs"
                  autoFocus
                />
                {categoryError && (
                  <p className="text-xs text-rose-500 font-medium mt-1">{categoryError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setNewCategoryName("");
                    setCategoryError("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 rounded-xl bg-[#1A1918] hover:bg-[#33302C] text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {savingCategory ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Products List Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <h2 className="text-lg font-bold font-serif text-stone-900">
            Catalog Inventory ({products.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-stone-400 text-xs">Loading products catalog...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs">No products in catalog yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Total Stock</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((prod) => {
                  const categoryName =
                    categories.find((c) => String(c.id) === String(prod.category_id))?.name ||
                    prod.categories?.name ||
                    "General";

                  return (
                    <tr key={prod.id} className="hover:bg-stone-50/60 transition group">
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={getProductImageUrl(prod.image_url)}
                          alt={prod.name}
                          className="w-11 h-11 object-cover rounded-xl border border-stone-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/hero-keychain.svg";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate max-w-xs">
                            {prod.description || "No description"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-block bg-stone-100 text-stone-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {categoryName}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-stone-900 text-xs sm:text-sm">
                        ₹{prod.discount_price || prod.price}
                        {prod.discount_price && (
                          <span className="text-[10px] text-stone-400 line-through ml-1.5">
                            ₹{prod.price}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-xs font-bold text-stone-700">
                        {prod.stock ?? prod.inventory ?? 0} units
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}