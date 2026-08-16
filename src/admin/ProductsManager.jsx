import { useEffect, useState } from "react";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, replaceProductImages, getProductImageUrl, createCategory } from "../services/database";
import { Plus, Edit, Trash2, Tag, ImagePlus, X, FolderPlus } from "lucide-react";
import { uploadProductImages, processImageSource } from "../lib/productImageStorage";

export default function ProductsManager() {
  const safeGetProductImageUrl = (p) => {
    try {
      return getProductImageUrl(p?.image_url || p?.image || p?.gallery?.[0] || p);
    } catch {
      return "/hero-keychain.svg";
    }
  };
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("20");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Category creation modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await getProducts();
      const c = await getCategories();
      setProducts(p);
      setCategories(c);
      if (c.length > 0 && !categoryId) setCategoryId(c[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setCreatingCategory(true);
      const catId = `cat-${Date.now()}`;
      const created = await createCategory({
        id: catId,
        name: newCategoryName.trim(),
        image_url: "/hero-keychain.svg"
      });
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setCategoryId(created?.id || catId);
      setNewCategoryName("");
      setShowCategoryModal(false);
      setMsg(`New category "${newCategoryName.trim()}" added!`);
    } catch (err) {
      console.error("Create category error:", err);
      setError("Failed to create category: " + (err.message || String(err)));
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError("Product Name and Selling Price are required.");
      return;
    }

    const totalStock = Number(stock || 20);
    const activeImage = imageUrl || imageUrls[0] || "/hero-keychain.svg";
    const gallery = imageUrls.slice(0, 5);
    const numPrice = Number(price);
    const numDiscount = discountPrice ? Number(discountPrice) : null;

    const payload = {
      name,
      description: description || name,
      price: numPrice,
      discount_price: numDiscount,
      compare_at_price: numDiscount,
      stock: totalStock,
      inventory: totalStock,
      stock_d: Math.floor(totalStock / 2),
      stock_k: Math.ceil(totalStock / 2),
      category_id: categoryId || categories[0]?.id || null,
      image_url: activeImage,
      image: activeImage,
      images: gallery,
      gallery,
      is_active: isActive
    };

    try {
      setError("");
      let resultProduct = null;
      if (editingId) {
        resultProduct = await updateProduct(editingId, payload);
        try {
          await replaceProductImages(editingId, gallery);
        } catch (e) {
          console.warn("Images update notice:", e);
        }
      } else {
        const id = `prod-${Date.now()}`;
        resultProduct = await createProduct({ id, ...payload });
        try {
          await replaceProductImages(id, gallery);
        } catch (e) {
          console.warn("Images save notice:", e);
        }
      }

      if (resultProduct?._error) {
        setError(`Supabase Database Alert: ${resultProduct._error}`);
      } else {
        setMsg(editingId ? "Product updated successfully!" : "Product added successfully!");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Save product error:", err);
      setError(err?.message || String(err) || "Failed to save product.");
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const readPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((base64Strings) => {
      const validStrings = base64Strings.filter(Boolean);
      if (validStrings.length > 0) {
        setImageUrls((prev) => {
          const combined = [...prev, ...validStrings];
          const capped = combined.slice(0, 5);
          if (!imageUrl && capped.length > 0) setImageUrl(capped[0]);
          return capped;
        });
      }
      setUploading(false);
    });
    event.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (next.length > 0) setImageUrl(next[0]);
      else setImageUrl("");
      return next;
    });
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setDescription(prod.description || "");
    setPrice(prod.price);
    setDiscountPrice(prod.discount_price || "");
    setStock(prod.stock || (prod.stock_d || 0) + (prod.stock_k || 0) || 20);
    setCategoryId(prod.category_id || "");
    setImageUrl(prod.image_url || "");
    const galleryArr = Array.isArray(prod.gallery) && prod.gallery.length
      ? prod.gallery
      : (prod.product_images || []).map((img) => img.image_url);
    setImageUrls(galleryArr.slice(0, 5));
    setIsActive(prod.is_active);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      if (res?._warning) {
        setMsg(`Product removed (DB Notice: ${res._warning})`);
      } else {
        setMsg("Product deleted successfully.");
      }
      loadData();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to delete product.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStock("20");
    setImageUrl("");
    setImageUrls([]);
    setIsActive(true);
    setError("");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Products Manager</h2>
          <p className="text-xs text-stone-500 mt-1">Manage and edit your keychain & sticker inventories</p>
        </div>
      </div>

      {msg && <div className="bg-stone-100 text-stone-900 dark:bg-stone-850 dark:text-stone-100 p-4 rounded-2xl text-sm font-medium">{msg}</div>}
      {error && <div className="bg-stone-200 text-stone-950 dark:bg-stone-800 dark:text-stone-50 p-4 rounded-2xl text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl h-fit space-y-4 shadow-sm">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Plus size={18} className="text-terracotta" /> {editingId ? "Edit Product" : "Add Product"}
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laser Engraved Wooden Tag"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short overview..."
              rows={3}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Selling Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Original / MRP Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Optional e.g. 350"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Total Stock Quantity *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="20"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-[#B08D57]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Category</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(!showCategoryModal)}
                  className="text-[11px] font-bold text-[#B08D57] hover:underline flex items-center gap-1"
                >
                  <FolderPlus size={12} /> + Add New
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-[#B08D57] appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Inline Add Category Toggle */}
          {showCategoryModal && (
            <div className="p-3 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 rounded-2xl space-y-2 animate-fade-in">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Create New Category</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-stone-700 dark:bg-stone-900"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                  className="bg-[#B08D57] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#987643] transition"
                >
                  {creatingCategory ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Primary Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-[#B08D57]"
            />
          </div>

          {/* 5-Image Upload Engine */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 dark:bg-stone-850 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Product Images (Up to 5)</label>
              <span className="text-[11px] font-semibold text-stone-400">{imageUrls.length}/5 uploaded</span>
            </div>
            
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1A1918] dark:bg-white text-white dark:text-stone-950 px-4 py-2 text-xs font-bold transition hover:opacity-90">
              <ImagePlus size={14} /> {uploading ? "Uploading..." : "Select Images (Max 5)"}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading || imageUrls.length >= 5} className="hidden" />
            </label>

            {/* 5 Preview Slots with Remove X Buttons */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {[0, 1, 2, 3, 4].map((slotIndex) => {
                const imgUrl = imageUrls[slotIndex];
                return (
                  <div key={slotIndex} className="relative aspect-square rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden bg-stone-100 dark:bg-stone-800 flex items-center justify-center group">
                    {imgUrl ? (
                      <>
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(slotIndex)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-sm"
                          title="Remove image"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-bold">#{slotIndex + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-[#B08D57] h-4 w-4"
            />
            <span className="text-sm font-semibold">Product is Active</span>
          </label>

          {/* Full-width Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#1A1918] text-white dark:bg-white dark:text-stone-955 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#33302C] dark:hover:bg-stone-200 transition-colors shadow-soft"
            >
              {editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full mt-2 py-2.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </form>

        {/* Product Table View */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-xs font-bold uppercase text-stone-500">
                <th className="pb-3">Image</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {products.map((prod) => (
                <tr key={prod.id}>
                  <td className="py-3">
                    <img
                      src={prod.image_url || prod.image || safeGetProductImageUrl(prod)}
                      alt={prod.name || "Product"}
                      className="w-10 h-10 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/hero-keychain.svg";
                      }}
                    />
                  </td>
                  <td className="py-3">
                    <p className="font-bold">{prod.name}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Tag size={10} /> {prod.categories?.name}
                    </p>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold">₹{prod.price}</span>
                  </td>
                  <td className="py-3">
                    <span className={(prod.stock ?? ((prod.stock_d || 0) + (prod.stock_k || 0))) <= 5 ? "text-red-500 font-bold" : "font-semibold"}>
                      {prod.stock ?? ((prod.stock_d || 0) + (prod.stock_k || 0))} units
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(prod)} className="p-1.5 rounded-full text-stone-500 hover:bg-stone-100">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(prod.id)} className="p-1.5 rounded-full text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
