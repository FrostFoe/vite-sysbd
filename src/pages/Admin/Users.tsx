import { AlertCircle, Ban, CheckCircle, Loader } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api";
import { escapeHtml, handleItemSelect, showToastMsg } from "../../lib/utils";

interface AdminUser {
  id: number;
  email: string;
  role: "admin" | "user";
  is_muted: number | null;
  reason: string | null;
  muted_at: string | null;
  created_at: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [muteModalOpen, setMuteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [muteReason, setMuteReason] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getUsers();
      if (response.success && response.users) {
        setUsers(response.users as unknown as AdminUser[]);
      } else {
        showToastMsg(response.error || "Failed to fetch users", "error");
      }
    } catch (_error) {
      showToastMsg("সার্ভার ত্রুটি!", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openMuteDialog = (userId: number, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setMuteReason("");
    setMuteModalOpen(true);
  };

  const closeMuteDialog = () => {
    setMuteModalOpen(false);
    setSelectedUserId(null);
  };

  const handleMuteUser = async () => {
    if (!selectedUserId) return;
    try {
      const response = await adminApi.muteUser(selectedUserId, muteReason);
      if (response.success) {
        showToastMsg("ব্যবহারকারীকে সফলভাবে মিউট করা হয়েছে");
        fetchUsers();
        closeMuteDialog();
      } else {
        showToastMsg(
          response.error || "ব্যবহারকারীকে মিউট করতে ব্যর্থ",
          "error",
        );
      }
    } catch (_error) {
      showToastMsg("সার্ভার ত্রুটি!", "error");
    }
  };

  const handleUnmuteUser = async (userId: number) => {
    if (
      !window.confirm(
        "আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীকে আনমিউট করতে চান?",
      )
    )
      return;
    try {
      const response = await adminApi.unmuteUser(userId);
      if (response.success) {
        showToastMsg("ব্যবহারকারীকে সফলভাবে আনমিউট করা হয়েছে");
        fetchUsers();
      } else {
        showToastMsg(
          response.error || "ব্যবহারকারীকে আনমিউট করতে ব্যর্থ",
          "error",
        );
      }
    } catch (_error) {
      showToastMsg("সার্ভার ত্রুটি!", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">ব্যবহারকারী</h1>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-muted-text text-sm">
            কোনো ব্যবহারকারী পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4">
            {users.map((user) => {
              const isMuted = !!user.is_muted;
              return (
                <button
                  key={user.id}
                  onClick={() =>
                    handleItemSelect(
                      window.innerWidth < 768,
                      navigate,
                      `/admin/users/${user.id}`,
                    )
                  }
                  type="button"
                  className="bg-card p-3 sm:p-4 rounded-lg border border-border-color group hover:bg-muted-bg transition-colors cursor-pointer w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs sm:text-sm truncate">
                          {user.email}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-text truncate">
                          ID: {user.id}
                        </div>
                        <div className="mt-1 text-[10px] sm:text-xs font-bold">
                          {isMuted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 dark:bg-danger/20 text-danger whitespace-nowrap">
                              <Ban className="w-3 h-3" /> মিউট করা হয়েছে
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 dark:bg-success/20 text-success whitespace-nowrap">
                              <CheckCircle className="w-3 h-3" /> সক্রিয়
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-danger/10 dark:bg-danger/20 text-danger" : "bg-muted-bg text-card-text"}`}
                      >
                        {user.role}
                      </div>
                      <div className="text-xs text-muted-text hidden sm:block">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        {user.role !== "admin" &&
                          (isMuted ? (
                            <button
                              type="button"
                              onClick={() => handleUnmuteUser(user.id)}
                              className="text-success hover:text-success/80 hover:bg-success/10 dark:hover:bg-success/20 p-2 rounded transition-colors"
                              title="আনমিউট"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openMuteDialog(user.id, user.email)
                              }
                              className="text-warning hover:text-warning/80 hover:bg-warning/10 dark:hover:bg-warning/20 p-2 rounded transition-colors"
                              title="মিউট"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  {isMuted && user.reason && (
                    <div className="mt-2 text-xs text-muted-text bg-danger/5 p-2 rounded">
                      Reason: {escapeHtml(user.reason)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mute Modal */}
      {muteModalOpen && (
        <button
          type="button"
          onClick={closeMuteDialog}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              closeMuteDialog();
            }
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 border-none"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mute-dialog-title"
            className="bg-card rounded-xl border border-border-color shadow-xl max-w-md w-full p-6 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 dark:bg-warning/20 flex items-center justify-center text-warning dark:text-warning">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-card-text">
                ব্যবহারকারীকে মিউট করুন
              </h2>
            </div>
            <p className="text-sm text-muted-text mb-4">
              আপনি{" "}
              <span className="font-bold text-card-text">
                {selectedUserEmail}
              </span>
              কে মিউট করতে চলেছেন। এই ব্যবহারকারী আর মন্তব্য পোস্ট করতে পারবেন
              না।
            </p>
            <div className="mb-4">
              <label
                htmlFor="mute-reason"
                className="block text-xs font-bold text-muted-text mb-2 uppercase tracking-wide"
              >
                কারণ (ঐচ্ছিক)
              </label>
              <textarea
                id="mute-reason"
                value={muteReason}
                onChange={(e) => setMuteReason(e.target.value)}
                placeholder="এই ব্যবহারকারীকে মিউট করার কারণ লিখুন..."
                className="w-full p-3 rounded-lg border border-border-color bg-muted-bg text-card-text focus:ring-2 focus:ring-warning/20 focus:border-warning outline-none transition-all resize-none text-sm"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeMuteDialog}
                className="px-4 py-2 rounded-lg bg-muted-bg hover:bg-border-color text-card-text font-bold transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleMuteUser}
                className="px-4 py-2 rounded-lg bg-warning hover:bg-warning/80 text-white font-bold transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" /> ব্যবহারকারীকে মিউট করুন
              </button>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default Users;
