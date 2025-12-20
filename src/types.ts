export interface User {
  id: number;
  email: string;
  role: "admin" | "user";
}

export interface Category {
  id: string;
  title_bn: string;
  title_en: string;
  color: string;
}

export interface Article {
  id: string;
  section_id: string | null;
  category_id: string | null;
  title: string;
  title_bn?: string;
  title_en?: string;
  summary: string;
  summary_bn?: string;
  summary_en?: string;
  content: string;
  content_bn?: string;
  content_en?: string;
  readTime: string;
  image: string;
  image_bn?: string;
  image_en?: string;
  use_separate_images?: boolean;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: "published" | "draft" | "archived";
  leaked_documents?: Document[];
  documents?: Document[];
  allow_submissions: boolean;
  category: string;
  comments?: Comment[];
  fallback_lang?: boolean;
}

export interface AdminArticle {
  id: string;
  title_bn?: string;
  title_en?: string;
  title?: string;
  summary_bn?: string;
  summary_en?: string;
  content_bn?: string;
  content_en?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: "published" | "draft" | "archived";
  image: string;
  image_bn?: string;
  image_en?: string;
  use_separate_images?: boolean;
  created_at?: string;
  published_at?: string;
  category_id?: string;
  section_id?: string;
  category?: string;
  allow_submissions?: boolean;
}

export interface ArticleWithDocCount {
  id: string;
  title_bn: string;
  title_en: string;
  doc_count: number;
}

export interface Section {
  id: string;
  title: string;
  type: "hero" | "hero-grid" | "grid" | "list" | "carousel" | "highlight";
  highlightColor: string | null;
  associatedCategory: string | null;
  style: "light" | "dark" | null;
  articles: Article[];
}

export interface Comment {
  id: number;
  user: string;
  text: string;
  time: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  isPinned: boolean;
  replies: Reply[];
  userId: number | null;
}

export interface Reply {
  id: number;
  user: string;
  text: string;
  time: string;
  created_at: string;
  isAdmin: boolean;
}

export interface Document {
  id: string;
  display_name_bn: string;
  display_name_en: string;
  file_type: string;
  file_name: string;
  file_path: string;
  download_url: string | null;
  file_size: number | null;
  description_bn: string | null;
  description_en: string | null;
  sort_order: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HomeData {
  categories: Category[];
  sections: Section[];
  meta: {
    page: number;
    limit: number | null;
    categoryFilter: string | null;
    includeDrafts: boolean;
  };
}

export interface UserProfile {
  displayName: string;
  email: string;
  commentCount: number;
  upvotes: number;
  recentComments: Array<{
    text: string;
    upvotes: number;
    time: string;
  }>;
}

export interface Conversation {
  user_id: number;
  email: string;
  user_joined: string;
  last_message: string | null;
  last_message_time: string | null;
  last_sender_id: number | null;
  unread_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_type: "user" | "admin";
  recipient_id: number;
  content: string;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
  created_at: string;
  updated_at?: string;
}
