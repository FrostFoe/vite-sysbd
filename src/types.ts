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
  published_at: string; // ISO date string
  status: "published" | "draft" | "archived";
  is_video: boolean;
  leaked_documents?: Document[]; // Array of Document type, if not empty
  documents?: Document[]; // Array of Document type
  allow_submissions: boolean;
  category: string; // Category name (translated)
  comments?: Comment[]; // Only for single article fetch
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
  status: "published" | "draft" | "archived";
  image: string;
  created_at?: string;
  published_at?: string;
  category_id?: string;
  section_id?: string;
  category?: string; // The translated category name
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
  title: string; // Translated title
  type:
    | "hero"
    | "hero-grid"
    | "grid"
    | "list"
    | "carousel"
    | "highlight"
    | "reel"
    | "audio";
  highlightColor: string | null;
  associatedCategory: string | null;
  style: "light" | "dark" | null;
  articles: Article[];
}

export interface Comment {
  id: number;
  user: string;
  text: string;
  time: string; // Time ago string
  created_at: string; // ISO date string
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
  time: string; // Time ago string
  created_at: string; // ISO date string
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

// For get_data.php response
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

// For get_user_profile.php response
export interface UserProfile {
  displayName: string;
  email: string;
  commentCount: number;
  upvotes: number; // This might be overall upvotes for user's comments
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
  is_read: 0 | 1;
  created_at: string;
}
