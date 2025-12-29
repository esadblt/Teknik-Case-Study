<?php
/**
 * Problems API
 * Handles CRUD operations for problems
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/migrate.php';

// Initialize CORS
handleCors();

$database = new Database();
$db = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        // ===== GET - Tüm problemleri getir =====
        case 'GET':
            if (isset($_GET['id'])) {
                // Tek problem getir
                $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);

                if ($id === false || $id === null || $id <= 0) {
                    errorResponse('Invalid ID', 400);
                }

                $stmt = $db->prepare("SELECT * FROM problems WHERE id = ?");
                $stmt->execute([$id]);
                $problem = $stmt->fetch();

                if ($problem) {
                    jsonResponse($problem);
                } else {
                    errorResponse('Problem not found', 404);
                }
            } else {
                // Tüm problemleri getir
                $stmt = $db->query("SELECT * FROM problems ORDER BY created_at DESC");
                $problems = $stmt->fetchAll();
                jsonResponse($problems);
            }
            break;

        // ===== POST - Yeni problem ekle =====
        case 'POST':
            $data = getJsonInput();

            // Input validation
            $title = validateInput($data, 'title', 'string');
            $description = validateInput($data, 'description', 'string');
            $responsible_person = validateInput($data, 'responsible_person', 'string');
            $team = validateInput($data, 'team', 'string');
            $deadline = validateInput($data, 'deadline', 'date');
            $status = validateInput($data, 'status', 'string') ?? 'OPEN';

            // Required field check
            if (empty($title)) {
                errorResponse('Title is required', 400);
            }

            if (empty($responsible_person)) {
                errorResponse('Responsible person is required', 400);
            }

            // Status validation
            if (!in_array($status, ['OPEN', 'CLOSED'])) {
                $status = 'OPEN';
            }

            // INSERT
            $stmt = $db->prepare("
                INSERT INTO problems 
                (title, description, responsible_person, team, deadline, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");

            $result = $stmt->execute([
                $title,
                $description,
                $responsible_person,
                $team,
                $deadline,
                $status
            ]);

            if ($result) {
                jsonResponse([
                    'success' => true,
                    'id' => $db->lastInsertId(),
                    'message' => 'Problem created successfully'
                ], 201);
            } else {
                throw new Exception('Failed to create problem');
            }
            break;

        // ===== PUT - Problem güncelle =====
        case 'PUT':
            $data = getJsonInput();

            $id = validateInput($data, 'id', 'int');

            if (!$id || $id <= 0) {
                errorResponse('Invalid ID', 400);
            }

            // Problemin var olup olmadığını kontrol et
            $checkStmt = $db->prepare("SELECT id FROM problems WHERE id = ?");
            $checkStmt->execute([$id]);

            if (!$checkStmt->fetch()) {
                errorResponse('Problem not found', 404);
            }

            // Güncelleme verileri
            $title = validateInput($data, 'title', 'string');
            $description = validateInput($data, 'description', 'string');
            $responsible_person = validateInput($data, 'responsible_person', 'string');
            $team = validateInput($data, 'team', 'string');
            $deadline = validateInput($data, 'deadline', 'date');
            $status = validateInput($data, 'status', 'string');

            // Status validation
            if ($status && !in_array($status, ['OPEN', 'CLOSED'])) {
                errorResponse('Invalid status. Must be OPEN or CLOSED', 400);
            }

            // UPDATE
            $stmt = $db->prepare("
                UPDATE problems 
                SET title = ?, 
                    description = ?, 
                    responsible_person = ?, 
                    team = ?, 
                    deadline = ?, 
                    status = ?
                WHERE id = ?
            ");

            $result = $stmt->execute([
                $title,
                $description,
                $responsible_person,
                $team,
                $deadline,
                $status,
                $id
            ]);

            if ($result) {
                jsonResponse([
                    'success' => true,
                    'message' => 'Problem updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update problem');
            }
            break;

        // ===== DELETE - Problem sil =====
        case 'DELETE':
            $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);

            if ($id === false || $id === null || $id <= 0) {
                errorResponse('Invalid ID', 400);
            }

            // Problemin var olup olmadığını kontrol et
            $checkStmt = $db->prepare("SELECT id FROM problems WHERE id = ?");
            $checkStmt->execute([$id]);

            if (!$checkStmt->fetch()) {
                errorResponse('Problem not found', 404);
            }

            // DELETE
            $stmt = $db->prepare("DELETE FROM problems WHERE id = ?");
            $result = $stmt->execute([$id]);

            if ($result) {
                jsonResponse([
                    'success' => true,
                    'message' => 'Problem deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete problem');
            }
            break;

        default:
            errorResponse('Method not allowed', 405);
            break;
    }

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    errorResponse('Database error occurred', 500);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    errorResponse('An error occurred', 500);
}
?>