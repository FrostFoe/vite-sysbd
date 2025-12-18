import { Edit, Layers as LayersIcon, Plus, Trash2 } from "lucide-react";
import type React from "react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CustomDropdown } from "../../components/common/CustomDropdown";
import { adminApi } from "../../lib/api";
import type { Section } from "../../types";

interface AdminSection {
  id: string;
  title_bn: string;
  title_en: string;
  type: Section["type"];
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
  }, [section]);

  useEffect(() => {
    setFormData(initialFormData as Partial<AdminSection>);
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
          {section?.id ? "বিভাগ সম্পাদনা করুন" : "নতুন বিভাগ"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="section-id"
              className="block text-sm font-bold mb-1"
            >
              আইডি (স্লাগ)
            </label>
            <input
              id="section-id"
              name="id"
              value={formData.id || ""}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              readOnly={!!section?.id}
              className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none text-sm sm:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="section-title-bn"
              className="block text-sm font-bold mb-1"
            >
              শিরোনাম (বাংলা)
            </label>
            <input
              id="section-title-bn"
              name="title_bn"
              value={formData.title_bn || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_bn: e.target.value })
              }
              required
              className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind text-sm sm:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="section-title-en"
              className="block text-sm font-bold mb-1"
            >
              শিরোনাম (ইংরেজি)
            </label>
            <input
              id="section-title-en"
              name="title_en"
              value={formData.title_en || ""}
              onChange={(e) =>
                setFormData({ ...formData, title_en: e.target.value })
              }
              required
              className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none font-hind text-sm sm:text-base"
            />
          </div>
          <div>
            <label
              htmlFor="section-type"
              className="block text-sm font-bold mb-1"
            >
              ধরন
            </label>
            <CustomDropdown
              id="section-type"
              value={formData.type || "grid"}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as AdminSection["type"],
                })
              }
              options={[
                { value: "hero", label: "হিরো" },
                { value: "grid", label: "গ্রিড" },
                { value: "list", label: "তালিকা" },
                { value: "carousel", label: "ক্যারোজেল" },
                { value: "highlight", label: "হাইলাইট" },
              ]}
            />
          </div>
          <div>
            <label
              htmlFor="section-sort-order"
              className="block text-sm font-bold mb-1"
            >
              সাজানোর ক্রম
            </label>
            <input
              id="section-sort-order"
              type="number"
              name="sort_order"
              value={formData.sort_order || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-3 sm:p-2.5 rounded-lg border border-border-color bg-card focus:border-bbcRed outline-none text-sm sm:text-base"
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

const Sections: React.FC = () => {
  const [sections, setSections] = useState<AdminSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<Partial<AdminSection> | null>(null);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSections();
      if (res.success && res.data) {
        const typedData = res.data as unknown as AdminSection[];
        setSections(
          typedData.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        );
      } else {
        throw new Error(res.message || "Failed to fetch sections");
      }
    } catch (_err) {
      setError("বিভাগগুলি আনতে ব্যর্থ হয়েছে");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

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
      await adminApi.saveSection(formData as Partial<Section>);
      handleCloseModal();
      fetchSections();
    } catch (_err) {}
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই বিভাগটি মুছে ফেলতে চান?")) {
      try {
        await adminApi.deleteSection(id);
        fetchSections();
      } catch (_err) {}
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
        ) : sections.length === 0 ? (
          <div className="p-8 text-center text-muted-text">
            <LayersIcon className="w-16 h-16 mx-auto mb-4 text-border-color" />
            <p className="text-lg font-bold mb-2">কোনো বিভাগ পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-card p-4 rounded-lg border border-border-color group hover:bg-muted-bg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-muted-bg flex items-center justify-center text-card-text text-sm font-bold border border-border-color">
                      {sec.sort_order}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-sm truncate">
                        {sec.title_bn}
                      </div>
                      <div className="text-xs text-muted-text truncate">
                        {sec.title_en}
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted-bg text-card-text text-xs font-bold">
                          {sec.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-text">
                    {sec.id}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(sec)}
                      className="p-2 text-card-text hover:bg-muted-bg rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(sec.id)}
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

export default Sections;
