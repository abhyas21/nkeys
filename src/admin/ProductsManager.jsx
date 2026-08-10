import { useEffect, useState } from "react";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, replaceProductImages } from "../services/database";
import { Plus, Edit, Trash2, Tag, ImagePlus } from "lucide-react";
import { uploadProductImages } from "../lib/productImageStorage";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stockD, setStockD] = useState("");
  const [stockK, setStockK] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isActive, setIsActive] = useState(true);

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
      if (c.length > 0) setCategoryId(c[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !price || stockD === "" || stockK === "") {
      setError("Name, Price, and Stocks are required.");
      return;
    }

    if (Number(discountPrice || 0) > Number(price)) {
      setError("Discount price cannot be higher than the regular price.");
      return;
    }
    const gallery = imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [];
    const payload = {
      name,
      description,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : null,
      stock_d: Number(stockD),
      stock_k: Number(stockK),
      category_id: categoryId || null,
      image_url: gallery[0] || null,
      is_active: isActive
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        await replaceProductImages(editingId, gallery);
        setMsg("Product updated successfully.");
      } else {
        const id = `prod-${Date.now()}`;
        await createProduct({ id, ...payload });
        await replaceProductImages(id, gallery);
        setMsg("Product added successfully.");
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const result = await uploadProductImages(files);
      setImageUrls((current) => [...current, ...result.urls]);
      if (!imageUrl && result.urls[0]) setImageUrl(result.urls[0]);
      setMsg(result.provider === "supabase" ? "Images uploaded to Supabase storage." : "Images added locally; configure Supabase for shared images.");
    } catch (err) {
      setError(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setDescription(prod.description || "");
    setPrice(prod.price);
    setDiscountPrice(prod.discount_price || "");
    setStockD(prod.stock_d || 0);
    setStockK(prod.stock_k || 0);
    setCategoryId(prod.category_id || "");
    setImageUrl(prod.image_url || "");
    setImageUrls((prod.product_images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((image) => image.image_url));
    setIsActive(prod.is_active);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setMsg("Product deleted successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete product.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStockD("");
    setStockK("");
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
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Discount Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Delhi Stock</label>
                <input
                  type="number"
                  value={stockD}
                  onChange={(e) => setStockD(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Kolkata Stock</label>
                <input
                  type="number"
                  value={stockK}
                  onChange={(e) => setStockK(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
            />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Upload Product Images</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-bold text-white">
              <ImagePlus size={15} /> {uploading ? "Uploading..." : "Choose images"}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
            </label>
            <span className="ml-3 text-xs text-stone-500">{imageUrls.length} selected</span>
            {imageUrls.length ? <div className="mt-3 grid grid-cols-4 gap-2">{imageUrls.map((url, index) => <img key={`${url}-${index}`} src={url} alt="" className="aspect-square rounded-xl object-cover" />)}</div> : null}
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-terracotta h-4 w-4"
            />
            <span className="text-sm font-semibold">Product is Active</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-terracotta text-white font-bold py-2.5 rounded-full text-xs transition">
              {editingId ? "Update" : "Save Product"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="border border-stone-200 px-4 py-2.5 rounded-full text-xs font-bold transition">
                Cancel
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
                    <img src={prod.image_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
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
                    <span className={((prod.stock_d || 0) + (prod.stock_k || 0)) <= 5 ? "text-stone-500 font-bold underline" : ""}>
                      D: {prod.stock_d || 0} | K: {prod.stock_k || 0}
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
