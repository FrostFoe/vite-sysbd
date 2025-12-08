-- Performance Indexes for BreachTimes Database

-- Indexes for articles table - critical for content retrieval
ALTER TABLE articles ADD INDEX idx_status_published_at (status, published_at DESC);
ALTER TABLE articles ADD INDEX idx_category_status (category_id, status);
ALTER TABLE articles ADD INDEX idx_section_status (section_id, status);
ALTER TABLE articles ADD INDEX idx_status_created_at (status, created_at DESC);

-- Indexes for comments table - critical for comment loading
ALTER TABLE comments ADD INDEX idx_article_parent_time (article_id, parent_comment_id, created_at DESC);
ALTER TABLE comments ADD INDEX idx_article_created_at (article_id, created_at DESC);

-- Indexes for comment_votes table - needed for sorting comments by helpfulness
ALTER TABLE comment_votes ADD INDEX idx_comment_type (comment_id, vote_type);

-- Indexes for documents table
ALTER TABLE documents ADD INDEX idx_article_sort (article_id, sort_order ASC);

-- Indexes for categories and sections (lookup tables)
ALTER TABLE categories ADD INDEX idx_id (id);
ALTER TABLE sections ADD INDEX idx_sort_order (sort_order ASC);
ALTER TABLE sections ADD INDEX idx_category (associated_category);

-- Indexes for search functionality
ALTER TABLE articles ADD INDEX idx_title_content (title_bn(100), title_en(100));

-- Indexes for user-related tables
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_role (role);

-- Index for search performance (fulltext)
ALTER TABLE articles ADD FULLTEXT(title_bn, summary_bn, content_bn);
ALTER TABLE articles ADD FULLTEXT(title_en, summary_en, content_en);