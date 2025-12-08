import React, { useState, useEffect, useCallback } from "react";
import { useLayout } from "../../context/LayoutContext";
import { adminApi } from "../../lib/api";
import { t } from "../../lib/translations";
import { User, Ban, CheckCircle, Loader, AlertCircle } from "lucide-react";
import { showToastMsg } from "../../lib/utils";

interface AdminUser extends User {
  is_muted: number | null;
  reason: string | null;
  muted_at: string | null;
  created_at: string;
}

const Users: React.FC = () => {
  const { language } = useLayout();
  const [users, setUsers] = useState<any[]>([]); // Use any temporarily or define AdminUser properly
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
        setUsers(response.users);
      } else {
        showToastMsg(response.error || "Failed to fetch users", "error");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
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
    } catch (error) {
      console.error("Mute user error:", error);
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
    } catch (error) {
      console.error("Unmute user error:", error);
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
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
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
                    <td className="p-4">
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
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.role === "admin" ? "bg-red-100 dark:bg-red-900/20 text-bbcRed" : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-text">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {isMuted ? (
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-1.5 w-fit">
                            <Ban className="w-3 h-3" /> Muted
                          </span>
                          {user.reason && (
                            <p className="text-xs text-muted-text mt-1">
                              Reason: {user.reason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center gap-1.5 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== "admin" && // Assuming current user is admin, can't mute admins generally, but logic depends on reqs
                          (isMuted ? (
                            <button
                              onClick={() => handleUnmuteUser(user.id)}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded transition-colors"
                              title="Unmute"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                openMuteDialog(user.id, user.email)
                              }
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-2 rounded transition-colors"
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
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeMuteDialog}
        >
          <div
            className="bg-card rounded-xl border border-border-color shadow-xl max-w-md w-full p-6 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
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
              <label className="block text-xs font-bold text-muted-text mb-2 uppercase tracking-wide">
                Reason (Optional)
              </label>
              <textarea
                value={muteReason}
                onChange={(e) => setMuteReason(e.target.value)}
                placeholder="Enter reason for muting this user..."
                className="w-full p-3 rounded-lg border border-border-color bg-muted-bg text-card-text focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all resize-none text-sm"
                rows={3}
              ></textarea>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeMuteDialog}
                className="px-4 py-2 rounded-lg bg-muted-bg hover:bg-border-color text-card-text font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMuteUser}
                className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" /> Mute User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
