import axios from "axios";
import type {
  Article,
  ArticleWithDocCount,
  Category,
  Document as DocType,
  HomeData,
  Section,
  User,
  UserProfile,
} from "../types";
import { setupApiInterceptors } from "./apiInterceptors";

export interface AdminArticle {
  id: string;
  title_bn?: string;
  title_en?: string;
  title?: string;
  summary_bn?: string;
  summary_en?: string;
  content_bn?: string;
  content_en?: string;
  status: "published" | "draft" | "archived";
  image: string;
  created_at?: string;
  published_at?: string;
  category_id?: string | undefined;
  section_id?: string;
  category?: string;
  allow_submissions?: boolean;
}

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

setupApiInterceptors(api);

export const authApi = {
  checkAuth: async (): Promise<{ authenticated: boolean; user?: User }> => {
    const response = await api.get("/check_auth.php");
    return response.data;
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const response = await api.post("/login.php", { email, password });
    return response.data;
  },

  register: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    const response = await api.post("/register.php", { email, password });
    return response.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await api.get("/logout.php");
    return response.data;
  },
};

export const publicApi = {
  getHomeData: async (lang: string, category?: string): Promise<HomeData> => {
    const params = {
      lang,
      ...(category && category !== "home" ? { category } : {}),
    };
    const response = await api.get("/get_data.php", { params });
    return response.data;
  },

  getArticle: async (
    id: string,
    lang: string
  ): Promise<{ success: boolean; article?: Article; error?: string }> => {
    const response = await api.get(`/get_article.php`, {
      params: { id, lang },
    });
    return response.data;
  },

  getComments: async (
    articleId: string,
    page: number,
    perPage: number,
    sort: string,
    lang: string
  ): Promise<{
    success: boolean;
    comments?: Array<{
      id: number;
      text: string;
      created_at: string;
      user_name: string;
      user_id: number;
      upvotes: number;
      downvotes: number;
      score: number;
      user_muted: boolean;
    }>;
    pagination?: {
      current_page: number;
      total_pages: number;
      total_count: number;
    };
    error?: string;
  }> => {
    const response = await api.post("/get_comments.php", {
      articleId,
      page,
      perPage,
      sort,
      lang,
    });
    return response.data;
  },

  postComment: async (
    articleId: string,
    text: string,
    lang: string,
    userName?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await api.post("/post_comment.php", {
      articleId,
      text,
      lang,
      user: userName,
    });
    return response.data;
  },

  voteComment: async (
    commentId: number,
    voteType: "upvote" | "downvote"
  ): Promise<{
    success: boolean;
    action?: string;
    upvotes: number;
    downvotes: number;
    score: number;
    error?: string;
  }> => {
    const response = await api.post("/vote_comment.php", {
      commentId,
      voteType,
    });
    return response.data;
  },

  searchArticles: async (query: string, lang: string): Promise<Article[]> => {
    const response = await api.get("/search.php", {
      params: { q: query, lang },
    });
    return response.data;
  },

  submitDocument: async (
    formData: FormData
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await api.post("/submit_document.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUserProfile: async (identifier: {
    userId?: number;
    userName?: string;
  }): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
    const response = await api.post("/get_user_profile.php", identifier);
    return response.data;
  },

  postReply: async (
    parentCommentId: number,
    text: string,
    lang?: string
  ): Promise<{
    success: boolean;
    replyId?: number;
    message?: string;
    error?: string;
  }> => {
    const response = await api.post("/post_reply.php", {
      parentCommentId,
      text,
      lang: lang || "bn",
    });
    return response.data;
  },
};

export const adminApi = {
  getAdminStats: async (): Promise<{
    success: boolean;
    stats?: {
      articles: string;
      comments: string;
      drafts: string;
      users: string;
    };
    error?: string;
  }> => {
    const response = await api.get("/get_admin_stats.php");
    return response.data;
  },

  getArticles: async (params?: {
    status?: string;
    search?: string;
    cat?: string;
    lang?: string;
  }): Promise<{
    success: boolean;
    articles?: AdminArticle[];
    error?: string;
  }> => {
    const response = await api.get("/get_articles.php", { params });
    return response.data;
  },

  uploadImage: async (
    formData: FormData
  ): Promise<{
    success: boolean;
    url?: string;
    size?: number;
    message?: string;
    error?: string;
  }> => {
    const response = await api.post("/upload_image.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUsers: async (): Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }> => {
    const response = await api.get("/get_users.php");
    return response.data;
  },

  muteUser: async (
    userId: number,
    reason?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await api.post("/mute_user.php", {
      userId,
      action: "mute",
      reason,
    });
    return response.data;
  },

  unmuteUser: async (
    userId: number
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await api.post("/mute_user.php", {
      userId,
      action: "unmute",
    });
    return response.data;
  },

  getAllComments: async (): Promise<{
    success: boolean;
    comments?: {
      id: number;
      text: string;
      created_at: string;
      user_name: string;
      title_en?: string;
      title_bn?: string;
      article_id: string;
    }[];
    error?: string;
  }> => {
    const response = await api.get("/get_all_comments.php");
    return response.data;
  },

  deleteComment: async (
    id: number
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await api.post("/delete_comment.php", { id });
    return response.data;
  },

  getSubmissions: async (): Promise<{
    success: boolean;
    submissions?: {
      id: number;
      article_id: string;
      user_id?: number;
      file_path: string;
      message?: string;
      created_at: string;
      title_en?: string;
      title_bn?: string;
    }[];
    error?: string;
  }> => {
    const response = await api.get("/get_submissions.php");
    return response.data;
  },

  getAdminConversations: async (
    sort: string
  ): Promise<{
    success: boolean;
    conversations?: Record<string, unknown>[];
    count?: number;
    error?: string;
  }> => {
    const response = await api.get("/get_conversations.php", {
      params: { sort },
    });
    return response.data;
  },

  getAdminMessages: async (
    userId: number
  ): Promise<{
    success: boolean;
    messages?: Record<string, unknown>[];
    count?: number;
    error?: string;
  }> => {
    const response = await api.get("/get_messages.php", {
      params: { user_id: userId },
    });
    return response.data;
  },

  sendAdminMessage: async (
    recipientId: number,
    content: string
  ): Promise<{
    success: boolean;
    message_id?: number;
    timestamp?: string;
    error?: string;
  }> => {
    const response = await api.post("/send_message.php", {
      recipient_id: recipientId,
      content,
    });
    return response.data;
  },

  getCategories: async (): Promise<{
    success: boolean;
    data?: Category[];
    message?: string;
  }> => {
    const response = await api.get("/get_categories.php");
    return response.data;
  },

  saveCategory: async (
    category: Partial<Category>
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post("/save_category.php", category);
    return response.data;
  },

  deleteCategory: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post("/delete_category.php", { id });
    return response.data;
  },

  getSections: async (): Promise<{
    success: boolean;
    data?: Section[];
    message?: string;
  }> => {
    const response = await api.get("/get_sections.php");
    return response.data;
  },

  saveSection: async (
    section: Partial<Section>
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post("/save_section.php", section);
    return response.data;
  },

  deleteSection: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post("/delete_section.php", { id });
    return response.data;
  },

  saveArticle: async (
    formData: FormData
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    const response = await api.post("/save_article.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteArticle: async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await api.post("/delete_article.php", { id });
    return response.data;
  },

  getArticleDocuments: async (
    articleId: string
  ): Promise<{ success: boolean; documents?: DocType[]; error?: string }> => {
    const response = await api.get(`/get_article_documents.php`, {
      params: { id: articleId },
    });
    return response.data;
  },

  getDocument: async (
    docId: string
  ): Promise<{ success: boolean; document?: DocType; error?: string }> => {
    const response = await api.get(`/get_document.php`, {
      params: { id: docId },
    });
    return response.data;
  },

  saveDocument: async (
    formData: FormData
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await api.post("/save_document.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteDocument: async (
    id: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const response = await api.post("/delete_document.php", { id });
    return response.data;
  },

  getArticlesForDocs: async (): Promise<{
    success: boolean;
    data?: ArticleWithDocCount[];
    message?: string;
  }> => {
    const response = await api.get("/get_articles_for_docs.php");
    return response.data;
  },
};
