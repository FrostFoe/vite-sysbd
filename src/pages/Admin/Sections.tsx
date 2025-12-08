import React, { useState, useEffect, useMemo } from "react";
import type { FormEvent } from "react";
import { adminApi } from "../../lib/api";
import type { Section } from "../../types";
import { Plus, Edit2, Trash2, Layers as LayersIcon } from "lucide-react";
import { CustomDropdown } from "../../components/common/CustomDropdown";

// The 'Section' type from types.ts is for the public API.
// This page needs a type that matches the database table.
interface AdminSection {
  id: string;
  title_bn: string;
  title_en: string;
  type: Section["type"]; // Reuse the type from the global Section type
  sort_order: number;
}

const SectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<AdminSection>) => void;
  section: Partial<AdminSection> | null;
}> = ({ isOpen, onClose, onSave, section }) => {
  const [formData, setFormData] = useState<Partial<AdminSection>>(() => {
    if (section) {
      return { ...section };
    } else {
      return {
        id: "",
        title_bn: "",
        title_en: "",
        type: "grid",
        sort_order: 0,
      };
    }
  });

  // Memoize initial form data to reset when the section changes
  const initialFormData = useMemo(() => {
    if (section) {
      return { ...section };
    } else {
      return {
        id: "",
        title_bn: "",
        title_en: "",
        type: "grid",
        sort_order: 0,
      };
    }
  }, [section]); // Only depend on section directly

  // Reset form data when modal opens with different section
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
          {section?.id ? "Edit Section" : "New Section"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">ID (Slug)</label>
            <input
              name="id"
              value={formData.id || ""}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              readOnly={!!section?.id}
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              Title (Bangla)
            </label>
            <input
              name="title_bn"
              value={formData.title_bn || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_bn: e.target.value })
              }
              required
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              Title (English)
            </label>
            <input
              name="title_en"
              value={formData.title_en || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_en: e.target.value })
              }
              required
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Type</label>
            <CustomDropdown
              value={formData.type || "grid"}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as AdminSection["type"],
                })
              }
              options={[
                { value: "hero", label: "Hero" },
                { value: "grid", label: "Grid" },
                { value: "list", label: "List" },
                { value: "carousel", label: "Carousel" },
                { value: "highlight", label: "Highlight" },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Sort Order</label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-2 rounded border border-border-color bg-muted-bg"
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
            <button
              type="submit"
              className="px-4 py-2 bg-bbcRed text-white rounded-lg font-bold text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Sections: React.FC = () => {
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<Partial<AdminSection> | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSections();
      if (res.success && res.data) {
        // The data from the API matches our AdminSection type
        const typedData = res.data as unknown as AdminSection[];
        setSections(
          typedData.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        );
      } else {
        throw new Error(res.message || "Failed to fetch sections");
      }
    } catch (err) {
      setError("Failed to fetch sections.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (section: AdminSection | null = null) => {
    setEditingSection(section);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSection(null);
  };

  const handleSave = async (formData: Partial<AdminSection>) => {
    try {
      // The saveSection API endpoint is flexible enough to handle this object
      await adminApi.saveSection(formData as Partial<Section>);
      handleCloseModal();
      fetchSections();
    } catch (err) {
      console.error("Failed to save section", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await adminApi.deleteSection(id);
        fetchSections();
      } catch (err) {
        console.error("Failed to delete section", err);
      }
    }
  };

  return (
    <div>
      <SectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        section={editingSection}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Sections</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-bbcRed text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Section
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-text">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : sections.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <LayersIcon className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">No Sections Found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted-bg text-muted-text text-xs uppercase">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">ID</th>
                <th className="p-4">Title (BN / EN)</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {sections.map((sec) => (
                <tr
                  key={sec.id}
                  className="hover:bg-muted-bg transition-colors"
                >
                  <td className="p-4 font-bold text-muted-text">
                    {sec.sort_order}
                  </td>
                  <td className="p-4 font-mono text-sm">{sec.id}</td>
                  <td className="p-4 font-bold">
                    <div className="flex flex-col">
                      <span>{sec.title_bn}</span>
                      <span className="text-xs text-muted-text">
                        {sec.title_en}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase">
                      {sec.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(sec)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sec.id)}
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

export default Sections;
