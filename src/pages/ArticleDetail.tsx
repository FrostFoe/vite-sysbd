import {
  Bookmark,
  Clock,
  Download,
  FileText,
  FileWarning,
  Loader,
  Lock,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ContentRenderer from "../components/common/ContentRenderer";
import { CustomDropdown } from "../components/common/CustomDropdown";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";
import { adminApi, publicApi } from "../lib/api";
import { t } from "../lib/translations";
import {
  escapeHtml,
  formatTimestamp,
  normalizeMediaUrl,
  PLACEHOLDER_IMAGE,
  sanitizeHtml,
  showToastMsg,
} from "../lib/utils";
import type { Article, UserProfile } from "../types";

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLayout();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [commentInput, setCommentInput] = useState("");
  const [commentError, setCommentError] = useState("");
  const [userVotes, setUserVotes] = useState<
    Record<number, "upvote" | "downvote">
  >({});
  const [commentSort, setCommentSort] = useState<
    "newest" | "oldest" | "helpful" | "discussed"
  >("newest");
  const [replyInput, setReplyInput] = useState<Record<number, string>>({});
  const [activeReplyForm, setActiveReplyForm] = useState<number | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalLoading, setProfileModalLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem("breachtimes-bookmarks");
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

      if (id) {
        const savedVotes = localStorage.getItem(`votes-${id}`);
        if (savedVotes) setUserVotes(JSON.parse(savedVotes));
        const savedSort = localStorage.getItem(`sort-${id}`);
        if (savedSort) setCommentSort(savedSort as typeof commentSort);
      }
    } catch (_e) {
      // Silently fail if local storage is corrupted
    }
  }, [id]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await publicApi.getArticle(id, language);
        if (response.success && response.article) {
          setArticle(response.article);
        } else {
          // Failed to fetch article
          setArticle(null);
        }
      } catch (_error) {
        // API error occurred
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [id, language]);

  const handleFontSizeChange = useCallback((size: typeof fontSize) => {
    setFontSize(size);
    const proseEl = document.querySelector(".prose");
    if (proseEl) {
      const sizes = {
        sm: ["text-[0.95rem]", "leading-[1.6]"],
        md: ["text-lg", "leading-[1.8]"],
        lg: ["text-[1.35rem]", "leading-loose"],
      };

      Object.values(sizes)
        .flat()
        .forEach((cls) => {
          proseEl.classList.remove(
            `[&_p]:${cls.replace("text-lg", "text-base")}`,
          );
          proseEl.classList.remove(`[&_p]:${cls}`);
        });
      sizes[size].forEach((cls) => {
        proseEl.classList.add(`[&_p]:${cls}`);
      });
    }
  }, []);

  useEffect(() => {
    handleFontSizeChange(fontSize);
  }, [fontSize, handleFontSizeChange]);

  const handleBookmarkToggle = useCallback(() => {
    if (!id) return;
    setBookmarks((prevBookmarks) => {
      const index = prevBookmarks.indexOf(id);
      const newBookmarks =
        index > -1
          ? prevBookmarks.filter((bookmarkId) => bookmarkId !== id)
          : [...prevBookmarks, id];
      localStorage.setItem(
        "breachtimes-bookmarks",
        JSON.stringify(newBookmarks),
      );
      showToastMsg(
        index > -1 ? t("removed", language) : t("saved_successfully", language),
      );
      return newBookmarks;
    });
  }, [id, language]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title || document.title,
          url: window.location.href,
        })
        .catch(() => {
          // Share failed silently
        });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToastMsg(t("link_copied", language));
      });
    }
  }, [article, language]);

  const postComment = useCallback(async () => {
    if (!id) return;
    setCommentError("");
    const trimmedText = commentInput.trim();
    if (trimmedText.length < 3) {
      setCommentError(t("comment_too_short", language));
      return;
    }
    if (trimmedText.length > 5000) {
      setCommentError(t("comment_too_long", language));
      return;
    }

    try {
      const response = await publicApi.postComment(id, trimmedText, language);
      if (response.success) {
        setCommentInput("");
        showToastMsg(t("comment_posted", language));
        const updatedArticleResponse = await publicApi.getArticle(id, language);
        if (updatedArticleResponse.success && updatedArticleResponse.article) {
          setArticle(updatedArticleResponse.article);
        }
      } else {
        setCommentError(
          response.error || t("failed_to_post_comment", language),
        );
      }
    } catch (_error) {
      // Post comment error occurred
      setCommentError(t("server_error", language));
    }
  }, [id, commentInput, language]);

  const voteComment = useCallback(
    async (commentId: number, voteType: "upvote" | "downvote") => {
      try {
        const response = await publicApi.voteComment(commentId, voteType);
        if (response.success) {
          setUserVotes((prev) => {
            const newVotes = { ...prev };
            if (newVotes[commentId] === voteType) {
              delete newVotes[commentId];
            } else {
              newVotes[commentId] = voteType;
            }
            localStorage.setItem(`votes-${id}`, JSON.stringify(newVotes));
            return newVotes;
          });

          setArticle((prevArticle) => {
            if (!prevArticle) return null;
            const updatedComments = prevArticle.comments?.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    upvotes: response.upvotes,
                    downvotes: response.downvotes,
                  }
                : comment,
            );
            return { ...prevArticle, comments: updatedComments };
          });
          showToastMsg(t("vote_recorded", language));
        } else {
          showToastMsg(
            response.error || t("failed_to_vote", language),
            "error",
          );
        }
      } catch (_error) {
        // Vote comment error occurred
        showToastMsg(t("server_error", language), "error");
      }
    },
    [id, language],
  );

  const handleCommentSortChange = useCallback(
    (newSort: string) => {
      setCommentSort(newSort as typeof commentSort);
      localStorage.setItem(`sort-${id}`, newSort);
    },
    [id],
  );

  const toggleReplyForm = useCallback((commentId: number) => {
    setActiveReplyForm((prev) => (prev === commentId ? null : commentId));
    setReplyInput((prev) => ({ ...prev, [commentId]: "" }));
  }, []);

  const postReply = useCallback(
    async (parentCommentId: number) => {
      if (!id) return;
      const text = replyInput[parentCommentId]?.trim();

      if (!text || text.length < 3) {
        showToastMsg(t("reply_too_short", language), "error");
        return;
      }

      try {
        const response = await publicApi.postReply(
          parentCommentId,
          text,
          language,
        );
        if (response.success) {
          setReplyInput((prev) => ({ ...prev, [parentCommentId]: "" }));
          setActiveReplyForm(null);
          showToastMsg(t("reply_posted", language));
          const updatedArticleResponse = await publicApi.getArticle(
            id,
            language,
          );
          if (
            updatedArticleResponse.success &&
            updatedArticleResponse.article
          ) {
            setArticle(updatedArticleResponse.article);
          }
        } else {
          showToastMsg(
            response.error || t("failed_to_post_reply", language),
            "error",
          );
        }
      } catch (_error) {
        // Post reply error occurred
        showToastMsg(t("server_error", language), "error");
      }
    },
    [id, replyInput, language],
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!isAdmin || !window.confirm(t("confirm_delete_comment", language)))
        return;

      try {
        const response = await adminApi.deleteComment(commentId);
        if (response.success) {
          showToastMsg(t("comment_deleted", language));
          if (!id) return;
          const updatedArticleResponse = await publicApi.getArticle(
            id,
            language,
          );
          if (
            updatedArticleResponse.success &&
            updatedArticleResponse.article
          ) {
            setArticle(updatedArticleResponse.article);
          }
        } else {
          showToastMsg(
            response.error || t("failed_to_delete_comment", language),
            "error",
          );
        }
      } catch (_error) {
        // Delete comment error occurred
        showToastMsg(t("server_error", language), "error");
      }
    },
    [id, isAdmin, language],
  );

  const openProfileModal = useCallback(
    async (userName: string) => {
      setProfileModalOpen(true);
      setProfileModalLoading(true);
      setUserProfile(null);
      try {
        const response = await publicApi.getUserProfile({ userName });
        if (response.success && response.profile) {
          setUserProfile(response.profile);
        } else {
          showToastMsg(
            response.error || t("failed_to_fetch_profile", language),
            "error",
          );
        }
      } catch (_error) {
        // Fetch profile error occurred
        showToastMsg(t("server_error", language), "error");
      } finally {
        setProfileModalLoading(false);
      }
    },
    [language],
  );

  const closeProfileModal = useCallback(() => {
    setProfileModalOpen(false);
    setUserProfile(null);
  }, []);

  const submissionFormRef = useRef<HTMLFormElement>(null);
  const handleDocumentSubmission = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!id) return;
      const formData = new FormData(e.currentTarget);

      try {
        const response = await publicApi.submitDocument(formData);
        if (response.success) {
          showToastMsg(t("submission_success", language));
          submissionFormRef.current?.reset();
        } else {
          showToastMsg(
            response.error || t("submission_failed", language),
            "error",
          );
        }
      } catch (_error) {
        // Document submission error occurred
        showToastMsg(t("server_error", language), "error");
      }
    },
    [id, language],
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-10 h-10 animate-spin text-bbcRed" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-8 text-danger">
        {t("article_not_found", language)}
      </div>
    );
  }

  const isArticleBookmarked = bookmarks.includes(article.id);

  return (
    <div className="max-w-[1280px] mx-auto px-2 sm:px-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-12">
        <div className="lg:col-span-8">
          <article className="bg-card p-3 sm:p-4 md:p-5 rounded-2xl shadow-soft border border-border-color">
            {/* Article Header */}
            <div className="mb-4 sm:mb-6">
              <span className="bg-bbcRed text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                {escapeHtml(article.category)}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4 text-card-text">
                {escapeHtml(article.title)}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-text font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />{" "}
                  {formatTimestamp(article.published_at, language)}
                </span>
                {article.readTime && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />{" "}
                    {escapeHtml(article.readTime)}
                  </span>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-10 relative aspect-video bg-muted-bg rounded-2xl overflow-hidden shadow-lg">
              <img
                src={normalizeMediaUrl(article.image) || PLACEHOLDER_IMAGE}
                alt={article.title}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-y border-border-color py-3 sm:py-4 mb-6 sm:mb-8 gap-3 sm:gap-0">
              <div className="flex items-center gap-1 bg-muted-bg rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange("sm")}
                  className={`w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center hover:bg-card rounded transition-colors text-xs font-bold text-card-text ${fontSize === "sm" ? "bg-card" : ""}`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange("md")}
                  className={`w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center hover:bg-card rounded transition-colors text-xs sm:text-sm font-bold text-card-text ${fontSize === "md" ? "bg-card" : ""}`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange("lg")}
                  className={`w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center hover:bg-card rounded transition-colors text-sm sm:text-base font-bold text-card-text ${fontSize === "lg" ? "bg-card" : ""}`}
                >
                  A
                </button>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  aria-label="Share article"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-muted-bg hover:bg-bbcRed hover:text-white transition-all text-xs sm:text-sm font-bold text-card-text flex-1 sm:flex-none"
                >
                  <Share2 className="w-4 h-4" /> {t("share", language)}
                </button>
                <button
                  type="button"
                  aria-label="Toggle bookmark"
                  onClick={handleBookmarkToggle}
                  className="p-2.5 rounded-full bg-muted-bg hover:bg-bbcRed hover:text-white text-card-text transition-all shadow-sm flex items-center justify-center group"
                >
                  <Bookmark
                    className="w-5 h-5"
                    fill={isArticleBookmarked ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <ContentRenderer
              content={article.content}
              className="prose max-w-none [&_p]:text-base sm:[&_p]:text-lg [&_p]:leading-[1.8] [&_p]:mb-[1em] space-y-6 sm:space-y-8 text-card-text transition-all duration-300"
            />
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 w-full">
          <div className="w-full space-y-4 sm:space-y-6 lg:sticky lg:top-28">
            {/* Leaked Documents */}
            {article.leaked_documents &&
              article.leaked_documents.length > 0 && (
                <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-soft border border-border-color">
                  <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-card-text border-b border-border-color pb-2 flex items-center gap-2">
                    <FileWarning className="w-5 h-5 text-bbcRed" />
                    {t("leaked_documents", language)}
                  </h4>
                  <ul className="space-y-3">
                    {article.leaked_documents.map((doc) => (
                      <li
                        key={doc.id || doc.display_name_en}
                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted-bg transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-danger/10 dark:bg-danger/20 flex items-center justify-center flex-shrink-0 text-bbcRed font-bold text-xs border border-bbcRed/20">
                          {doc.file_type || "DOC"}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-bold text-card-text truncate group-hover:text-bbcRed transition-colors">
                            {doc.display_name_bn || doc.display_name_en}
                          </p>
                          <span className="text-[10px] text-muted-text uppercase tracking-wider">
                            Download
                          </span>
                        </div>
                        <a
                          href={
                            doc.download_url ||
                            `/downloads/?file=${doc.file_path}`
                          }
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-bbcRed/10 text-bbcRed group-hover:bg-bbcRed group-hover:text-white transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Downloadable Documents */}
            {article.documents && article.documents.length > 0 && (
              <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-soft border border-border-color">
                <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-card-text border-b border-border-color pb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-bbcRed" />
                  {t("downloadable_documents", language)}
                </h4>
                <ul className="space-y-3">
                  {article.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted-bg transition-colors cursor-pointer border border-transparent hover:border-bbcRed/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted-bg dark:bg-muted-bg flex items-center justify-center flex-shrink-0 text-card-text dark:text-card-text font-bold text-xs border border-border-color/50">
                        {doc.file_type}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p
                          className="text-sm font-bold text-card-text truncate group-hover:text-bbcRed transition-colors"
                          title={doc.display_name_bn || doc.display_name_en}
                        >
                          {language === "bn"
                            ? doc.display_name_bn || doc.display_name_en
                            : doc.display_name_en || doc.display_name_bn}
                        </p>
                        {doc.file_size && (
                          <span className="text-[10px] text-muted-text uppercase tracking-wider">
                            {Math.round(doc.file_size / 1024)} KB
                          </span>
                        )}
                      </div>
                      <a
                        href={
                          doc.download_url ||
                          `/downloads/?file=${encodeURIComponent(doc.file_path)}`
                        }
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-bbcRed/10 text-bbcRed group-hover:bg-bbcRed group-hover:text-white transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Documents / Status */}
            <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-soft border border-border-color">
              {article.allow_submissions ? (
                <>
                  <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-card-text border-b border-border-color pb-2 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-bbcRed" />
                    {t("submit_documents", language)}
                  </h4>
                  <form
                    ref={submissionFormRef}
                    onSubmit={handleDocumentSubmission}
                    className="space-y-4"
                  >
                    <input type="hidden" name="article_id" value={article.id} />
                    <div>
                      <label
                        htmlFor="document-input"
                        className="block text-xs font-bold mb-2 text-muted-text"
                      >
                        {t("your_file", language)}
                      </label>
                      <input
                        id="document-input"
                        type="file"
                        name="document"
                        required
                        className="w-full text-xs text-card-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-bbcRed/10 file:text-bbcRed hover:file:bg-bbcRed/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message-textarea"
                        className="block text-xs font-bold mb-2 text-muted-text"
                      >
                        {t("message_optional", language)}
                      </label>
                      <textarea
                        id="message-textarea"
                        name="message"
                        rows={3}
                        className="w-full p-3 rounded-lg border border-border-color bg-muted-bg text-card-text text-sm focus:border-bbcRed outline-none"
                        placeholder={t("write_details", language)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-bbcRed text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      {t("submit", language)}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-bold mb-2 text-card-text flex items-center gap-2">
                    <Lock className="w-5 h-5 text-muted-text" />
                    {t("submissions_closed", language)}
                  </h4>
                  <p className="text-sm text-muted-text font-bold text-danger">
                    {t("submissions_turned_off_by_admin", language)}
                  </p>
                </>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-soft border border-border-color">
              <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-card-text">
                {t("article_info", language)}
              </h4>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-border-color">
                  <span className="text-muted-text">
                    {t("category", language)}
                  </span>
                  <span className="font-bold text-card-text">
                    {escapeHtml(article.category)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 sm:pb-3 border-b border-border-color">
                  <span className="text-muted-text">
                    {t("published", language)}
                  </span>
                  <span className="font-bold text-card-text">
                    {formatTimestamp(article.published_at, language)}
                  </span>
                </div>
                {article.readTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-text">
                      {t("read_time", language)}
                    </span>
                    <span className="font-bold text-card-text">
                      {escapeHtml(article.readTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="lg:col-span-8 bg-card p-4 sm:p-6 md:p-8 rounded-2xl shadow-soft border border-border-color">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-card-text flex items-center gap-2">
              <MessageCircle className="w-5 sm:w-6 h-5 sm:h-6 text-bbcRed" />{" "}
              {t("comments", language)}
            </h3>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-comments"
                className="text-xs font-bold text-muted-text"
              >
                {t("sort_by", language)}
              </label>
              <CustomDropdown
                id="sort-comments"
                value={commentSort}
                onChange={handleCommentSortChange}
                options={[
                  { value: "newest", label: t("newest", language) },
                  { value: "oldest", label: t("oldest", language) },
                  {
                    value: "helpful",
                    label: t("most_helpful", language),
                  },
                  {
                    value: "discussed",
                    label: t("most_discussed", language),
                  },
                ]}
                className="w-32"
              />
            </div>
          </div>

          {/* Comments List */}
          <div className="bg-card rounded-xl border border-border-color overflow-hidden">
            {article.comments && article.comments.length > 0 ? (
              <div className="divide-y divide-border-color">
                {[...article.comments]
                  .sort((a, b) => {
                    if (commentSort === "newest") {
                      return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                      );
                    } else if (commentSort === "oldest") {
                      return (
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                      );
                    } else if (commentSort === "helpful") {
                      return (
                        b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
                      );
                    } else if (commentSort === "discussed") {
                      const aReplies = a.replies?.length || 0;
                      const bReplies = b.replies?.length || 0;
                      return bReplies - aReplies;
                    }
                    return 0;
                  })
                  .map((comment) => (
                    <div key={comment.id} className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bbcRed to-orange-500 flex items-center justify-center font-bold text-white text-sm shadow-md flex-shrink-0">
                          {comment.user[0].toUpperCase()}
                        </div>
                        <div className="flex-grow min-w-0">
                          <button
                            type="button"
                            onClick={() => openProfileModal(comment.user)}
                            className="font-bold text-sm text-card-text block hover:text-bbcRed cursor-pointer transition-colors bg-transparent border-none p-0"
                          >
                            {escapeHtml(comment.user)}
                          </button>
                          <span className="text-xs text-muted-text">
                            {comment.time}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-card-text ml-12 leading-relaxed mb-3">
                        {(() => {
                          const sanitizedText = sanitizeHtml(comment.text);
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
                              for (
                                let i = 0;
                                i < element.attributes.length;
                                i++
                              ) {
                                const attr = element.attributes[i];
                                const propName =
                                  attr.name === "class"
                                    ? "className"
                                    : attr.name;
                                props[propName] = attr.value;
                              }

                              // Process child nodes
                              const children = Array.from(
                                element.childNodes,
                              ).map(convertNodeToReactElement);

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
                      </p>

                      <div className="ml-12 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => voteComment(comment.id, "upvote")}
                            className={`p-1 hover:text-success transition-colors text-muted-text vote-btn-up flex items-center justify-center min-w-[36px] min-h-[36px] ${userVotes[comment.id] === "upvote" ? "text-success font-bold" : ""}`}
                            title="Upvote"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-muted-text min-w-[20px] text-center">
                            {comment.upvotes - comment.downvotes}
                          </span>
                          <button
                            type="button"
                            onClick={() => voteComment(comment.id, "downvote")}
                            className={`p-1 hover:text-danger transition-colors text-muted-text vote-btn-down flex items-center justify-center min-w-[36px] min-h-[36px] ${userVotes[comment.id] === "downvote" ? "text-danger font-bold" : ""}`}
                            title="Downvote"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleReplyForm(comment.id)}
                          className="px-3 py-1 hover:bg-bbcRed/10 dark:hover:bg-bbcRed/20 text-bbcRed rounded transition-colors font-bold text-sm"
                        >
                          {t("reply", language)}
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => deleteComment(comment.id)}
                            className="text-danger hover:text-danger/80 p-1 rounded hover:bg-danger/10 dark:hover:bg-danger/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-12 mt-4 space-y-3 border-l-2 border-border-color pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id}>
                              <div className="flex items-start gap-2 mb-1">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md flex-shrink-0">
                                  {reply.user[0].toUpperCase()}
                                </div>
                                <div className="flex-grow min-w-0">
                                  <span className="font-bold text-xs text-card-text block">
                                    {escapeHtml(reply.user)}
                                  </span>
                                  <span className="text-xs text-muted-text">
                                    {reply.time}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-card-text ml-9 leading-relaxed">
                                {(() => {
                                  const sanitizedText = sanitizeHtml(
                                    reply.text,
                                  );
                                  const tempDiv = document.createElement("div");
                                  tempDiv.innerHTML = sanitizedText;

                                  const convertNodeToReactElement = (
                                    node: Node,
                                  ): React.ReactNode => {
                                    if (node.nodeType === Node.TEXT_NODE) {
                                      return node.textContent;
                                    } else if (
                                      node.nodeType === Node.ELEMENT_NODE
                                    ) {
                                      const element = node as HTMLElement;
                                      const props: Record<string, unknown> = {};

                                      // Copy attributes (converting class to className)
                                      for (
                                        let i = 0;
                                        i < element.attributes.length;
                                        i++
                                      ) {
                                        const attr = element.attributes[i];
                                        const propName =
                                          attr.name === "class"
                                            ? "className"
                                            : attr.name;
                                        props[propName] = attr.value;
                                      }

                                      // Process child nodes
                                      const children = Array.from(
                                        element.childNodes,
                                      ).map(convertNodeToReactElement);

                                      return createElement(
                                        element.tagName.toLowerCase(),
                                        props,
                                        ...children,
                                      );
                                    }
                                    return null;
                                  };

                                  return Array.from(tempDiv.childNodes).map(
                                    (node, _index) =>
                                      convertNodeToReactElement(node),
                                  );
                                })()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeReplyForm === comment.id && (
                        <div className="ml-12 mt-4 p-4 rounded-lg">
                          <h4 className="text-xs font-bold text-card-text mb-3">
                            {t("write_your_reply", language)}
                          </h4>
                          <textarea
                            value={replyInput[comment.id] || ""}
                            onChange={(e) =>
                              setReplyInput((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            placeholder={t("write_your_reply", language)}
                            className="w-full p-3 rounded-lg bg-card border border-border-color text-card-text focus:ring-2 focus:ring-bbcRed/30 focus:border-bbcRed outline-none transition-all resize-none text-sm mb-3 min-h-[80px]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleReplyForm(comment.id)}
                              className="px-4 py-2 rounded-lg bg-card border border-border-color hover:bg-border-color transition-colors text-sm font-bold text-card-text"
                            >
                              {t("cancel", language)}
                            </button>
                            <button
                              type="button"
                              onClick={() => postReply(comment.id)}
                              className="px-4 py-2 rounded-lg bg-bbcRed hover:bg-bbcRed-hover text-white transition-colors text-sm font-bold shadow-soft hover:shadow-soft-hover"
                            >
                              {t("send_reply", language)}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-text">
                {t("no_comments_yet", language)}
              </div>
            )}
          </div>

          {/* Comment Input Form - at the bottom */}
          <div className="border-t border-border-color pt-6">
            <h4 className="font-bold text-sm text-card-text mb-4">
              {t("write_your_comment", language)}
            </h4>
            <textarea
              id="comment-input"
              className="w-full p-4 rounded-xl border border-border-color bg-card text-card-text focus:ring-2 focus:ring-bbcRed/20 focus:border-bbcRed outline-none transition-all resize-y text-base min-h-[150px]"
              placeholder={t("write_your_comment", language)}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3 gap-4">
              <div className="text-xs text-muted-text">
                {commentInput.length}/5000
              </div>
              {commentError && (
                <div className="text-xs text-danger font-bold">
                  {commentError}
                </div>
              )}
              <button
                type="button"
                onClick={postComment}
                className="bg-bbcRed text-white px-6 py-2.5 rounded-full font-bold hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
              >
                {t("post_comment", language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {profileModalOpen && (
        <button
          type="button"
          onClick={closeProfileModal}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              closeProfileModal();
            }
          }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[200] flex items-center justify-center p-4 border-none"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            className="bg-card rounded-2xl shadow-2xl border border-border-color max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border-color p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-card-text">
                👤 {t("user_profile", language)}
              </h3>
              <button
                type="button"
                onClick={closeProfileModal}
                className="p-2 hover:bg-muted-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="profile-content" className="p-6 space-y-4">
              {profileModalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-bbcRed" />
                </div>
              ) : userProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-border-color">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bbcRed to-orange-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg">
                      {userProfile.displayName[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-card-text">
                        {userProfile.displayName}
                      </h4>
                      <p className="text-xs text-muted-text">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted-bg p-3 rounded-lg border border-border-color">
                      <div className="text-2xl font-bold text-bbcRed">
                        {userProfile.commentCount}
                      </div>
                      <div className="text-xs text-muted-text">
                        {t("comments_count", language)}
                      </div>
                    </div>
                    <div className="bg-muted-bg p-3 rounded-lg border border-border-color">
                      <div className="text-2xl font-bold text-success">
                        {userProfile.upvotes}
                      </div>
                      <div className="text-xs text-muted-text">
                        {t("received_likes", language)}
                      </div>
                    </div>
                  </div>

                  {userProfile.recentComments &&
                    userProfile.recentComments.length > 0 && (
                      <div>
                        <div className="text-sm font-bold text-card-text mb-2">
                          {t("recent_comments", language)}
                        </div>
                        <div className="space-y-2">
                          {userProfile.recentComments.map((comment) => (
                            <div
                              key={`comment-${comment.text.substring(0, 20)}`}
                              className="bg-muted-bg p-2 rounded-lg text-xs text-card-text border border-border-color"
                            >
                              <p className="mb-1">"{comment.text}"</p>
                              <div className="flex items-center justify-between text-muted-text text-xs">
                                <span>{comment.time}</span>
                                <span>
                                  <ThumbsUp className="w-3 h-3 inline-block mr-1" />{" "}
                                  {comment.upvotes}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-text">
                    {t("user_profile_not_found", language)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default ArticleDetail;
