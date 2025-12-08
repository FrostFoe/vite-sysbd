-- Database Migrations for BreachTimes
-- This file adds indexes, foreign keys, and additional columns for improved performance and security

-- Add missing columns to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expiry DATETIME NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add missing timestamps to other tables
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE sections ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes for performance
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_category_id (category_id);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_section_id (section_id);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_user_id (user_id);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_status (status);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_created_at (created_at);

ALTER TABLE comments ADD INDEX IF NOT EXISTS idx_article_id (article_id);
ALTER TABLE comments ADD INDEX IF NOT EXISTS idx_user_id (user_id);
ALTER TABLE comments ADD INDEX IF NOT EXISTS idx_parent_comment_id (parent_comment_id);
ALTER TABLE comments ADD INDEX IF NOT EXISTS idx_created_at (created_at);

ALTER TABLE documents ADD INDEX IF NOT EXISTS idx_article_id (article_id);
ALTER TABLE documents ADD INDEX IF NOT EXISTS idx_user_id (user_id);

ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_sender_id (sender_id);
ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_recipient_id (recipient_id);
ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_created_at (created_at);

ALTER TABLE article_submissions ADD INDEX IF NOT EXISTS idx_article_id (article_id);
ALTER TABLE article_submissions ADD INDEX IF NOT EXISTS idx_user_id (user_id);

ALTER TABLE comment_votes ADD INDEX IF NOT EXISTS idx_comment_id (comment_id);
ALTER TABLE comment_votes ADD INDEX IF NOT EXISTS idx_user_id (user_id);

-- Add foreign key constraints (with ON DELETE CASCADE for data integrity)
ALTER TABLE articles 
  ADD CONSTRAINT IF NOT EXISTS fk_articles_category 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE articles 
  ADD CONSTRAINT IF NOT EXISTS fk_articles_section 
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL;

ALTER TABLE articles 
  ADD CONSTRAINT IF NOT EXISTS fk_articles_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE comments 
  ADD CONSTRAINT IF NOT EXISTS fk_comments_article 
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

ALTER TABLE comments 
  ADD CONSTRAINT IF NOT EXISTS fk_comments_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE comments 
  ADD CONSTRAINT IF NOT EXISTS fk_comments_parent 
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;

ALTER TABLE documents 
  ADD CONSTRAINT IF NOT EXISTS fk_documents_article 
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

ALTER TABLE documents 
  ADD CONSTRAINT IF NOT EXISTS fk_documents_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE messages 
  ADD CONSTRAINT IF NOT EXISTS fk_messages_sender 
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages 
  ADD CONSTRAINT IF NOT EXISTS fk_messages_recipient 
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE article_submissions 
  ADD CONSTRAINT IF NOT EXISTS fk_submissions_article 
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE;

ALTER TABLE article_submissions 
  ADD CONSTRAINT IF NOT EXISTS fk_submissions_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE comment_votes 
  ADD CONSTRAINT IF NOT EXISTS fk_votes_comment 
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

ALTER TABLE comment_votes 
  ADD CONSTRAINT IF NOT EXISTS fk_votes_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Ensure all text columns can handle proper character encoding
ALTER TABLE articles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE sections CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes on text search columns
ALTER TABLE articles ADD FULLTEXT INDEX ft_articles_title (title_en, title_bn);
ALTER TABLE articles ADD FULLTEXT INDEX ft_articles_content (content_en, content_bn);

-- Grant appropriate permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON breachtimes.* TO 'app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE breachtimes.* TO 'app_user'@'localhost';
