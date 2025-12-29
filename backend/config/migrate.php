<?php
/**
 * Database Migration Script
 * Automatically creates tables if they don't exist
 */

require_once __DIR__ . '/database.php';

function runMigrations()
{
    $db = new Database();
    $conn = $db->connect();

    try {
        // Create problems table
        $conn->exec("
            CREATE TABLE IF NOT EXISTS problems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                responsible_person VARCHAR(100),
                team VARCHAR(100),
                deadline DATE,
                status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create root_causes table
        $conn->exec("
            CREATE TABLE IF NOT EXISTS root_causes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                problem_id INT NOT NULL,
                parent_id INT DEFAULT NULL,
                description TEXT NOT NULL,
                is_root_cause TINYINT(1) DEFAULT 0,
                action_plan TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES root_causes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        return true;
    } catch (PDOException $e) {
        error_log("Migration Error: " . $e->getMessage());
        return false;
    }
}

// Run migrations on include
runMigrations();
?>