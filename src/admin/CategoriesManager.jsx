import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "../services/database";
import { Plus, Trash2 } from "lucide-react";

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) {
      setError("Category Name is required.");
      return;
    }

    try {
      const id = `cat-${name.toLowerCase().replace(/\s+/g, "-")}`;
      await createCategory({ id, name, image_url: imageUrl });
      setMsg("Category created successfully.");
      setName("");
      setImageUrl("");
      setError("");
      loadCategories();
    } catch (err) {
      console.error(err);
      setError("Failed to create category.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      setMsg("Category deleted successfully.");
      loadCategories();
    } catch (err) {
      console.error(err);
      setError("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Categories Manager</h2>
        <p className="text-xs text-stone-500 mt-1">Manage shop collections and category filters</p>
      </div>

      {msg && <div className="bg-stone-100 text-stone-900 dark:bg-stone-850 dark:text-stone-100 p-4 rounded-2xl text-sm font-medium">{msg}</div>}
      {error && <div className="bg-stone-200 text-stone-950 dark:bg-stone-800 dark:text-stone-50 p-4 rounded-2xl text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl h-fit space-y-4 shadow-sm">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Plus size={18} className="text-terracotta" /> Add Category
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stickers"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-500">Cover Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm dark:border-stone-700 dark:bg-stone-850 outline-none focus:border-terracotta"
            />
          </div>

          <button type="submit" className="w-full bg-terracotta text-white font-bold py-2.5 rounded-full text-xs transition">
            Save Category
          </button>
        </form>

        {/* Categories List Table */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-xs font-bold uppercase text-stone-500">
                <th className="pb-3">Cover Image</th>
                <th className="pb-3">Category Name</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="py-3">
                    <img src={cat.image_url || "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300"} alt="" className="w-16 h-10 object-cover rounded-lg" />
                  </td>
                  <td className="py-3 font-bold">{cat.name}</td>
                  <td className="py-3">
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-full text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
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
