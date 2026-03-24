-- Welltalk Database Schema
-- This file can be directly imported into MySQL

-- Create Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Blogs table
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` LONGTEXT NOT NULL,
  `shortDescription` TEXT,
  `author` VARCHAR(255) NOT NULL,
  `categoryId` INT,
  `featuredImage` VARCHAR(255),
  `readingTime` INT DEFAULT 5,
  `tags` JSON,
  `status` ENUM('draft', 'published') DEFAULT 'draft',
  `seoTitle` VARCHAR(255),
  `seoDescription` TEXT,
  `focusKeyword` VARCHAR(255),
  `flag_category` VARCHAR(50) NOT NULL DEFAULT 'BLOG',
  `publishedAt` DATETIME,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_categoryId` (`categoryId`),
  INDEX `idx_status` (`status`),
  INDEX `idx_publishedAt` (`publishedAt`),
  INDEX `idx_flag_category` (`flag_category`),
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Events table
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` LONGTEXT NOT NULL,
  `eventDate` DATETIME NOT NULL,
  `eventTime` TIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `organizerName` VARCHAR(255),
  `ticketLink` VARCHAR(500),
  `coverImage` VARCHAR(255),
  `galleryImages` JSON,
  `status` ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_eventDate` (`eventDate`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Contact Forms table
CREATE TABLE IF NOT EXISTS `contact_forms` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(255),
  `lastName` VARCHAR(255),
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `serviceType` ENUM('general', 'support', 'feedback', 'complaint') DEFAULT 'general',
  `status` ENUM('pending', 'in-progress', 'resolved', 'closed') DEFAULT 'pending',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_createdAt` (`createdAt`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
