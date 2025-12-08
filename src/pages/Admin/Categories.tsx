import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { adminApi } from '../../lib/api';
import type { Category } from '../../types';
import { Plus, Edit2, Trash2, Folder as FolderIcon } from 'lucide-react';

const CategoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Category>) => void;
  category: Partial<Category> | null;
}> = ({ isOpen, onClose, onSave, category }) => {
  const [formData, setFormData] = useState<Partial<Category>>({});

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ id: '', title_bn: '', title_en: '', color: '#b80000' });
    }
  }, [category]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-card w-full max-w-md p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-4">
          {category?.id ? 'Edit Category' : 'New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">ID (Slug)</label>
            <input
              name="id"
              value={formData.id || ''}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              readOnly={!!category?.id}
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Title (Bangla)</label>
            <input
              name="title_bn"
              value={formData.title_bn || ''}
              onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
              required
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Title (English)</label>
            <input
              name="title_en"
              value={formData.title_en || ''}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Color</label>
            <input
              type="color"
              name="color"
              value={formData.color || '#b80000'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-muted-text hover:text-card-text"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-bbcRed text-white rounded-lg font-bold text-sm">
              Save
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
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      } else {
        throw new Error(res.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
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
      fetchCategories(); // Refetch to show changes
    } catch (err) {
      console.error('Failed to save category', err);
      // TODO: Show toast notification
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminApi.deleteCategory(id);
        fetchCategories(); // Refetch to show changes
      } catch (err) {
        console.error('Failed to delete category', err);
        // TODO: Show toast notification
      }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-text">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <FolderIcon className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">No Categories Found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted-bg text-muted-text text-xs uppercase">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Title (BN)</th>
                <th className="p-4">Title (EN)</th>
                <th className="p-4">Color</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted-bg transition-colors">
                  <td className="p-4 font-mono text-sm">{cat.id}</td>
                  <td className="p-4 font-bold">{cat.title_bn}</td>
                  <td className="p-4">{cat.title_en}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-border-color"
                        style={{ backgroundColor: cat.color }}
                      ></div>
                      <span className="text-xs text-muted-text">{cat.color}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(cat)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Categories;
