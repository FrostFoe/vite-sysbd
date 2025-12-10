-- Database Schema for BreachTimes (Unified Language Support)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`email`, `password`, `role`) VALUES
('admin@breachtimes.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Categories Table (Already Unified)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(50) NOT NULL,
  `title_bn` varchar(255) NOT NULL,
  `title_en` varchar(255) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sections Table (Unified)
CREATE TABLE IF NOT EXISTS `sections` (
  `id` varchar(50) NOT NULL,
  `title_bn` varchar(255) NOT NULL,
  `title_en` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `highlight_color` varchar(20) DEFAULT NULL,
  `associated_category` varchar(50) DEFAULT NULL,
  `style` varchar(50) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Articles Table (Unified)
CREATE TABLE IF NOT EXISTS `articles` (
  `id` varchar(50) NOT NULL,
  `section_id` varchar(50) DEFAULT NULL,
  `category_id` varchar(50) DEFAULT NULL,
  
  -- Bangla Content
  `title_bn` varchar(255) DEFAULT NULL,
  `summary_bn` text,
  `title_en` varchar(255) DEFAULT NULL,
  `summary_en` text,
    `content_bn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `content_en` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `read_time_bn` varchar(50) DEFAULT NULL,
    `read_time_en` varchar(50) DEFAULT NULL,

  `image` longtext,
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('published', 'draft', 'archived') DEFAULT 'draft',
  `leaked_documents` longtext DEFAULT NULL,
  `allow_submissions` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `fk_articles_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_articles_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `article_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `article_id` VARCHAR(50) NOT NULL,
    `user_id` INT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `message` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comments Table (Simplified, not language specific usually, but stored per article ID)
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `parent_comment_id` int(11) DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `pin_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `parent_comment_id` (`parent_comment_id`),
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comment Votes Table
CREATE TABLE IF NOT EXISTS `comment_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_ip` varchar(45) DEFAULT NULL,
  `vote_type` enum('upvote','downvote') NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote` (`comment_id`, `user_id`, `user_ip`),
  KEY `comment_id` (`comment_id`),
  CONSTRAINT `fk_votes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_votes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Muted Users Table
CREATE TABLE IF NOT EXISTS `muted_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `muted_by_admin_id` int(11) NOT NULL,
  `reason` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_muted_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_muted_by_admin` FOREIGN KEY (`muted_by_admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messaging System Table
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `sender_type` enum('user','admin') NOT NULL DEFAULT 'user',
  `recipient_id` int(11) NOT NULL,
  `recipient_type` enum('user','admin') NOT NULL DEFAULT 'admin',
  `content` longtext NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`, `sender_type`),
  KEY `idx_recipient` (`recipient_id`, `recipient_type`),
  KEY `idx_conversation` (`sender_id`, `recipient_id`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `fk_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messaging Preferences Table
CREATE TABLE IF NOT EXISTS `messaging_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL UNIQUE,
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `email_notifications` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_messaging_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Documents Table (For downloadable files associated with articles)
CREATE TABLE IF NOT EXISTS `documents` (
  `id` varchar(50) NOT NULL,
  `article_id` varchar(50) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `download_url` varchar(500) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `display_name_bn` varchar(255) NOT NULL,
  `display_name_en` varchar(255) NOT NULL,
  `description_bn` text,
  `description_en` text,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `fk_documents_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- For TEXT columns in InnoDB, specify prefix length for FULLTEXT indexes
ALTER TABLE articles ADD FULLTEXT idx_ft_title_bn (title_bn(255));
ALTER TABLE articles ADD FULLTEXT idx_ft_summary_bn (summary_bn(500));
ALTER TABLE articles ADD FULLTEXT idx_ft_content_bn (content_bn(1000));
ALTER TABLE articles ADD FULLTEXT idx_ft_title_en (title_en(255));
ALTER TABLE articles ADD FULLTEXT idx_ft_summary_en (summary_en(500));
ALTER TABLE articles ADD FULLTEXT idx_ft_content_en (content_en(1000));

COMMIT;
