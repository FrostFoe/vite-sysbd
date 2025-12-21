import { Loader, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import { showToastMsg } from "../../utils";

interface AdminUser {
  id?: number;
  email: string;
  role: "admin" | "user";
  password?: string;
}

interface UserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AdminUser>({
    email: "",
    role: "user",
    password: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        email: "",
        role: "user",
        password: "",
      });
    }
    setError("");
  }, [user]);

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError("ইমেল প্রয়োজন");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("বৈধ ইমেল প্রবেश করুন");
      return false;
    }
    if (!user && !formData.password) {
      setError("নতুন ব্যবহারকারীর জন্য পাসওয়ার্ড প্রয়োজন");
      return false;
    }
    if (!user && formData.password && formData.password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে 6 অক্ষর হওয়া উচিত");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (user?.id) {
        const response = await adminApi.updateUser(user.id, {
          email: formData.email,
          role: formData.role,
          password: formData.password || undefined,
        });
        if (response.success) {
          showToastMsg("ব্যবহারকারী সফলভাবে আপডেট হয়েছে");
          onSuccess();
          onClose();
        } else {
          setError(response.error || "ব্যবহারকারী আপডেট করতে ব্যর্থ");
        }
      } else {
        const response = await adminApi.createUser({
          email: formData.email,
          password: formData.password || "",
          role: formData.role,
        });
        if (response.success) {
          showToastMsg("ব্যবহারকারী সফলভাবে তৈরি হয়েছে");
          onSuccess();
          onClose();
        } else {
          setError(response.error || "ব্যবহারকারী তৈরি করতে ব্যর্থ");
        }
      }
    } catch (_error) {
      setError("সার্ভার ত্রুটি");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl border border-border-color w-full max-w-md mx-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color">
          <h2 className="text-lg font-bold">
            {user?.id
              ? "ব্যবহারকারী সম্পাদনা করুন"
              : "নতুন ব্যবহারকারী তৈরি করুন"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2">
              ইমেল
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                setError("");
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-color bg-muted-bg text-card-text focus:ring-2 focus:ring-bbcRed/20 focus:border-bbcRed outline-none transition-all"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-bold mb-2">
              ভূমিকা
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  role: e.target.value as "admin" | "user",
                }))
              }
              className="w-full px-4 py-2 rounded-lg border border-border-color bg-muted-bg text-card-text focus:ring-2 focus:ring-bbcRed/20 focus:border-bbcRed outline-none transition-all"
            >
              <option value="user">ব্যবহারকারী</option>
              <option value="admin">অ্যাডমিন</option>
            </select>
          </div>

          {(!user?.id || formData.password) && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold mb-2"
              >
                {user?.id ? "নতুন পাসওয়ার্ড (ঐচ্ছিক)" : "পাসওয়ার্ড"}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  setError("");
                }}
                className="w-full px-4 py-2 rounded-lg border border-border-color bg-muted-bg text-card-text focus:ring-2 focus:ring-bbcRed/20 focus:border-bbcRed outline-none transition-all"
                placeholder={
                  user?.id ? "ছেড়ে যান অপরিবর্তিত" : "পাসওয়ার্ড প্রবেশ করুন"
                }
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-muted-bg hover:bg-border-color text-card-text font-bold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-bbcRed hover:bg-bbcRed/90 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader className="w-4 h-4 animate-spin" />}
              {user?.id ? "আপডেট করুন" : "তৈরি করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
