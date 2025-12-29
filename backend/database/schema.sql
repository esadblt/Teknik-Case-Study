-- 8D Problem Solving Database Schema
-- Created for Railway MySQL deployment

CREATE DATABASE IF NOT EXISTS `8d_problem_solving` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `8d_problem_solving`;

-- Problems Table
CREATE TABLE IF NOT EXISTS `problems` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `responsible` VARCHAR(100),
    `team` VARCHAR(100),
    `deadline` DATE,
    `status` ENUM('open', 'in_progress', 'd4_completed', 'd5_completed', 'closed') DEFAULT 'open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Root Causes Table (5 Why Analysis)
CREATE TABLE IF NOT EXISTS `root_causes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `problem_id` INT NOT NULL,
    `parent_id` INT DEFAULT NULL,
    `description` TEXT NOT NULL,
    `is_root_cause` TINYINT(1) DEFAULT 0,
    `action_plan` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `root_causes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for better performance
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_root_causes_problem ON root_causes(problem_id);
CREATE INDEX idx_root_causes_parent ON root_causes(parent_id);
