import { Edit2, Folder as FolderIcon, Plus, Trash2 } from "lucide-react";
import type React from "react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/api";
import type { Category } from "../../types";

const CategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Category>) => void;
  category: Partial<Category> | null;
}> = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState<Partial<Category>>(() => {
    if (category) {
      return { ...category };
    } else {
      return {
        id: "",
        title_bn: "",
        title_en: "",
        color: "var(--color-bbcRed)",
      };
    }
  });

  const initialFormData = useMemo(() => {
    if (category) {
      return { ...category };
    } else {
      return {
        id: "",
        title_bn: "",
        title_en: "",
        color: "var(--color-bbcRed)",
      };
    }
  }, [category]);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-card w-full max-w-md p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          {category?.id ? "বিভাগ সম্পাদনা করুন" : "নতুন বিভাগ"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="category-id"
              className="block text-sm font-bold mb-1"
            >
              আইডি (স্লাগ)
            </label>
            <input
              id="category-id"
              name="id"
              value={formData.id || ""}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              readOnly={!!category?.id}
              className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none text-sm sm:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="category-title-bn"
              className="block text-sm font-bold mb-1"
            >
              শিরোনাম (বাংলা)
            </label>
            <input
              id="category-title-bn"
              name="title_bn"
              value={formData.title_bn || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_bn: e.target.value })
              }
              required
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind"
            />
          </div>
          <div>
            <label
              htmlFor="category-title-en"
              className="block text-xs sm:text-sm font-bold mb-1"
            >
              শিরোনাম (ইংরেজি)
            </label>
            <input
              id="category-title-en"
              name="title_en"
              value={formData.title_en || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_en: e.target.value })
              }
              required
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind"
            />
          </div>
          <div>
            <label
              htmlFor="category-color"
              className="block text-sm font-bold mb-1"
            >
              রং
            </label>
            <input
              type="color"
              id="category-color"
              name="color"
              value={formData.color || "var(--color-bbcRed)"}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-full h-10 rounded cursor-pointer"
              style={{ color: formData.color || "var(--color-bbcRed)" }}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-muted-text hover:text-card-text hover:bg-muted-bg rounded-lg"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bbcRed text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              সংরক্ষণ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      } else {
        throw new Error(res.message || "Failed to fetch categories");
      }
    } catch (_err) {
      setError("বিভাগগুলি আনতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (formData: Partial<Category>) => {
    try {
      await adminApi.saveCategory(formData);
      handleCloseModal();
      fetchCategories();
    } catch (_err) {}
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই বিভাগটি মুছে ফেলতে চান?")) {
      try {
        await adminApi.deleteCategory(id);
        fetchCategories();
      } catch (_err) {}
    }
  };

  return (
    <div>
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        category={editingCategory}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">বিভাগ পরিচালনা করুন</h1>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-bbcRed text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> নতুন বিভাগ
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-text">লোড হচ্ছে...</div>
        ) : error ? (
          <div className="p-8 text-center text-danger">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <FolderIcon className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">কোনো বিভাগ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-card p-3 sm:p-4 rounded-lg border border-border-color group hover:bg-muted-bg transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="font-mono text-xs sm:text-sm font-bold text-card-text flex-shrink-0">
                      {cat.id}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs sm:text-sm truncate">
                        {cat.title_bn}
                      </div>
                      <div className="text-xs truncate">{cat.title_en}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg border border-border-color"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="text-xs text-muted-text hidden md:block">
                      {cat.color}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(cat)}
                      className="p-2 text-card-text hover:bg-muted-bg rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-danger hover:bg-danger/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
