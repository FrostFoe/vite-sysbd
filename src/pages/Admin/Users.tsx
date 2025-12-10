import { AlertCircle, Ban, CheckCircle, Loader } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { showToastMsg } from "../../lib/utils";

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
  const { language } = useLayout();
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
      showToastMsg(t("server_error", language), "error");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

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
        showToastMsg("User muted successfully");
        fetchUsers();
        closeMuteDialog();
      } else {
        showToastMsg(response.error || "Failed to mute user", "error");
      }
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
    }
  };

  const handleUnmuteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to unmute this user?")) return;
    try {
      const response = await adminApi.unmuteUser(userId);
      if (response.success) {
        showToastMsg("User unmuted successfully");
        fetchUsers();
      } else {
        showToastMsg(response.error || "Failed to unmute user", "error");
      }
    } catch (_error) {
      showToastMsg(t("server_error", language), "error");
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("users", language)}</h1>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-muted-text">No users found.</div>
        ) : (
          <table className="w-full text-left border-collapse responsive-table">
            <thead className="bg-muted-bg text-muted-text text-xs uppercase">
              <tr>
                <th className="p-3 sm:p-4">Email</th>
                <th className="p-3 sm:p-4">Role</th>
                <th className="hidden md:table-cell p-3 sm:p-4">Joined</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {users.map((user) => {
                const isMuted = !!user.is_muted;
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-muted-bg transition-colors ${isMuted ? "opacity-75" : ""}`}
                  >
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.email}</p>
                          <p className="text-xs text-muted-text">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-danger/10 dark:bg-danger/20 text-danger" : "bg-muted-bg text-card-text"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="hidden md:table-cell p-3 sm:p-4 text-sm text-muted-text">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 sm:p-4">
                      {isMuted ? (
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-danger/10 dark:bg-danger/20 text-danger flex items-center gap-1.5 w-fit">
                            <Ban className="w-3 h-3" /> Muted
                          </span>
                          {user.reason && (
                            <p className="text-xs text-muted-text mt-1">
                              Reason: {user.reason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-success/10 dark:bg-success/20 text-success flex items-center gap-1.5 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "admin" && // Assuming current user is admin, can't mute admins generally, but logic depends on reqs
                          (isMuted ? (
                            <button
                              type="button"
                              onClick={() => handleUnmuteUser(user.id)}
                              className="text-success hover:text-success/80 hover:bg-success/10 dark:hover:bg-success/20 p-2 rounded transition-colors"
                              title="Unmute"
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
                              title="Mute"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              <h2 className="text-lg font-bold text-card-text">Mute User</h2>
            </div>
            <p className="text-sm text-muted-text mb-4">
              You are about to mute{" "}
              <span className="font-bold text-card-text">
                {selectedUserEmail}
              </span>
              . This user will no longer be able to post comments.
            </p>
            <div className="mb-4">
              <label
                htmlFor="mute-reason"
                className="block text-xs font-bold text-muted-text mb-2 uppercase tracking-wide"
              >
                Reason (Optional)
              </label>
              <textarea
                id="mute-reason"
                value={muteReason}
                onChange={(e) => setMuteReason(e.target.value)}
                placeholder="Enter reason for muting this user..."
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMuteUser}
                className="px-4 py-2 rounded-lg bg-warning hover:bg-warning/80 text-white font-bold transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" /> Mute User
              </button>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default Users;
