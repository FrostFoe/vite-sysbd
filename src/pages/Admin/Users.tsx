import { CheckCircle, Edit, Loader, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api";
import { UserModal } from "../../components/admin/UserModal";
import { handleItemSelect, showToastMsg } from "../../utils";

interface AdminUser {
  id: number;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

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

  const openUserModal = (user?: AdminUser) => {
    setEditingUser(user || null);
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (
      !window.confirm(
        `আপনি কি নিশ্চিত যে আপনি ${email} ব্যবহারকারীকে ডিলিট করতে চান?`,
      )
    )
      return;
    try {
      const response = await adminApi.deleteUser(userId);
      if (response.success) {
        showToastMsg("ব্যবহারকারী সফলভাবে ডিলিট হয়েছে");
        fetchUsers();
      } else {
        showToastMsg(
          response.error || "ব্যবহারকারী ডিলিট করতে ব্যর্থ",
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">ব্যবহারকারী</h1>
        <button
          type="button"
          onClick={() => openUserModal()}
          className="flex items-center gap-2 px-4 py-2 bg-bbcRed text-white rounded-lg font-bold hover:bg-bbcRed/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> নতুন ব্যবহারকারী
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-muted-text text-sm">
            কোনো ব্যবহারকারী পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4">
            {users.map((user) => {
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 dark:bg-success/20 text-success whitespace-nowrap">
                            <CheckCircle className="w-3 h-3" /> সক্রিয়
                          </span>
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUserModal(user);
                          }}
                          className="text-muted-text hover:text-card-text hover:bg-muted-bg p-2 rounded transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id, user.email);
                          }}
                          className="text-danger hover:text-danger/80 hover:bg-danger/10 dark:hover:bg-danger/20 p-2 rounded transition-colors"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {}
      <UserModal
        isOpen={userModalOpen}
        user={editingUser}
        onClose={closeUserModal}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default Users;
