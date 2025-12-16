import { ExternalLink, MessageCircle, Trash2 } from "lucide-react";
import type React from "react";
import { createElement, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EmptyState,
  LoadingState,
} from "../../components/common/StateWrappers";
import { adminApi } from "../../lib/api";
import { useDataFetch } from "../../lib/useDataFetch";
import {
  escapeHtml,
  formatTimestamp,
  handleItemSelect,
  sanitizeHtml,
  showToastMsg,
} from "../../lib/utils";

const Comments: React.FC = () => {
  const navigate = useNavigate();

  interface AdminComment {
    id: number;
    text: string;
    created_at: string;
    user_name: string;
    title_en?: string;
    title_bn?: string;
    article_id: string;
  }

  interface AdminCommentsResponse {
    success: boolean;
    comments?: AdminComment[];
    error?: string;
  }

  const { data, isLoading, refetch } = useDataFetch<AdminCommentsResponse>(
    useCallback(() => adminApi.getAllComments(), []),
    {
      showErrorToast: true,
    },
  );

  const comments = data?.comments || [];

  const handleDeleteComment = useCallback(
    async (id: number) => {
      if (!window.confirm("এই মন্তব্য মুছে ফেলতে চান?")) return;
      try {
        const response = await adminApi.deleteComment(id);
        if (response.success) {
          showToastMsg("মন্তব্য মুছে ফেলা হয়েছে!");
          refetch();
        } else {
          showToastMsg(response.error || "মন্তব্য মোছতে ব্যর্থ!", "error");
        }
      } catch (_error) {
        showToastMsg("সার্ভার ত্রুটি!", "error");
      }
    },
    [refetch],
  );

  return (
    <LoadingState isLoading={isLoading}>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">পর্যবেক্ষণ</h1>
        </div>

        <div className="bg-card rounded-xl border border-border-color shadow-sm overflow-hidden">
          <EmptyState
            isEmpty={comments.length === 0}
            title="No Comments Found"
            description="There are currently no comments to moderate."
            icon={<MessageCircle className="w-16 h-16 mx-auto" />}
          >
            <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4">
              {comments.map((c: AdminComment) => (
                <button
                  key={c.id}
                  onClick={() =>
                    handleItemSelect(
                      window.innerWidth < 768,
                      navigate,
                      `/admin/comments/${c.id}`,
                    )
                  }
                  type="button"
                  className="bg-card p-4 rounded-lg border border-border-color group hover:bg-muted-bg transition-colors cursor-pointer w-full text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bbcRed to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                        {c.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-sm truncate">
                          {escapeHtml(c.user_name)}
                        </div>
                        <div className="text-xs text-muted-text truncate">
                          {escapeHtml(c.title_bn) || "অজানা নিবন্ধ"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <div className="text-xs text-muted-text hidden sm:block whitespace-nowrap">
                        {formatTimestamp(c.created_at, "bn")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/article/${c.article_id}`}
                          target="_blank"
                          title="View Article"
                          className="text-muted-text hover:text-bbcRed hover:bg-bbcRed/10 p-2 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-danger hover:text-danger/80 hover:bg-danger/10 dark:hover:bg-danger/20 p-2 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-card-text max-h-16 overflow-hidden prose prose-sm dark:prose-invert">
                    {(() => {
                      const sanitizedText = sanitizeHtml(c.text);
                      const tempDiv = document.createElement("div");
                      tempDiv.innerHTML = sanitizedText;

                      const convertNodeToReactElement = (
                        node: Node,
                      ): React.ReactNode => {
                        if (node.nodeType === Node.TEXT_NODE) {
                          return node.textContent;
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                          const element = node as HTMLElement;
                          const props: Record<string, unknown> = {};

                          // Copy attributes (converting class to className)
                          for (let i = 0; i < element.attributes.length; i++) {
                            const attr = element.attributes[i];
                            const propName =
                              attr.name === "class" ? "className" : attr.name;
                            props[propName] = attr.value;
                          }

                          // Process child nodes
                          const children = Array.from(element.childNodes).map(
                            convertNodeToReactElement,
                          );

                          return createElement(
                            element.tagName.toLowerCase(),
                            props,
                            ...children,
                          );
                        }
                        return null;
                      };

                      return Array.from(tempDiv.childNodes).map(
                        (node, _index) => convertNodeToReactElement(node),
                      );
                    })()}
                  </div>
                  <div className="text-xs text-muted-text mt-2 sm:hidden">
                    {formatTimestamp(c.created_at, "bn")}
                  </div>
                </button>
              ))}
            </div>
          </EmptyState>
        </div>
      </div>
    </LoadingState>
  );
};

export default Comments;
