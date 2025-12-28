<?php
/**
 * Root Causes API
 * Handles CRUD operations for root cause analysis (5 Why)
 */

require_once '../config/cors.php';
require_once '../config/helpers.php';
require_once '../config/database.php';

// Initialize CORS
handleCors();

$database = new Database();
$db = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        // ===== GET - Root cause tree getir =====
        case 'GET':
            $problemId = filter_var($_GET['problem_id'] ?? null, FILTER_VALIDATE_INT);
            
            if ($problemId === false || $problemId === null || $problemId <= 0) {
                errorResponse('Invalid problem ID', 400);
            }
            
            $stmt = $db->prepare("
                SELECT * FROM root_causes 
                WHERE problem_id = ? 
                ORDER BY id ASC
            ");
            $stmt->execute([$problemId]);
            $rootCauses = $stmt->fetchAll();
            
            // Tree yapısını oluştur
            $tree = buildTree($rootCauses);
            jsonResponse($tree);
            break;
            
        // ===== POST - Yeni root cause ekle =====
        case 'POST':
            $data = getJsonInput();
            
            // Input validation
            $problemId = validateInput($data, 'problem_id', 'int');
            $parentId = validateInput($data, 'parent_id', 'int');
            $description = validateInput($data, 'description', 'string');
            $isRootCause = validateInput($data, 'is_root_cause', 'bool') ?? false;
            $actionPlan = validateInput($data, 'action_plan', 'string');
            
            // Required field check
            if (!$problemId || $problemId <= 0) {
                errorResponse('Valid problem ID is required', 400);
            }
            
            if (empty($description)) {
                errorResponse('Description is required', 400);
            }
            
            // Problem var mı kontrol et
            $checkStmt = $db->prepare("SELECT id FROM problems WHERE id = ?");
            $checkStmt->execute([$problemId]);
            
            if (!$checkStmt->fetch()) {
                errorResponse('Problem not found', 404);
            }
            
            // Parent var mı kontrol et
            if ($parentId && $parentId > 0) {
                $parentStmt = $db->prepare("SELECT id FROM root_causes WHERE id = ?");
                $parentStmt->execute([$parentId]);
                
                if (!$parentStmt->fetch()) {
                    errorResponse('Parent root cause not found', 404);
                }
            }
            
            // INSERT
            $stmt = $db->prepare("
                INSERT INTO root_causes 
                (problem_id, parent_id, description, is_root_cause, action_plan, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            
            $result = $stmt->execute([
                $problemId,
                $parentId,
                $description,
                $isRootCause ? 1 : 0,
                $actionPlan
            ]);
            
            if ($result) {
                jsonResponse([
                    'success' => true,
                    'id' => $db->lastInsertId(),
                    'message' => 'Root cause created successfully'
                ], 201);
            } else {
                throw new Exception('Failed to create root cause');
            }
            break;
            
        // ===== PUT - Root cause güncelle =====
        case 'PUT':
            $data = getJsonInput();
            
            $id = validateInput($data, 'id', 'int');
            
            if (!$id || $id <= 0) {
                errorResponse('Invalid ID', 400);
            }
            
            // Root cause var mı kontrol et
            $checkStmt = $db->prepare("SELECT * FROM root_causes WHERE id = ?");
            $checkStmt->execute([$id]);
            $existing = $checkStmt->fetch();
            
            if (!$existing) {
                errorResponse('Root cause not found', 404);
            }
            
            // Sadece gönderilen alanları güncelle
            $description = isset($data['description']) 
                ? validateInput($data, 'description', 'string') 
                : $existing['description'];
                
            $isRootCause = isset($data['is_root_cause']) 
                ? (int)$data['is_root_cause'] 
                : $existing['is_root_cause'];
                
            $actionPlan = isset($data['action_plan']) 
                ? validateInput($data, 'action_plan', 'string') 
                : $existing['action_plan'];
            
            // UPDATE
            $stmt = $db->prepare("
                UPDATE root_causes 
                SET description = ?, 
                    is_root_cause = ?, 
                    action_plan = ?
                WHERE id = ?
            ");
            
            $result = $stmt->execute([
                $description,
                $isRootCause,
                $actionPlan,
                $id
            ]);
            
            if ($result) {
                // Kalıcı çözüm aksiyonu tanımlandıysa problemi "CLOSED" yap
                $problemStatusUpdated = false;
                if ($isRootCause && !empty(trim($actionPlan))) {
                    $problemId = $existing['problem_id'];
                    $updateProblemStmt = $db->prepare("
                        UPDATE problems 
                        SET status = 'CLOSED' 
                        WHERE id = ?
                    ");
                    $problemStatusUpdated = $updateProblemStmt->execute([$problemId]);
                }
                // Kök neden işareti kaldırıldıysa veya aksiyon kaldırıldıysa problemi tekrar "OPEN" yap
                else if (!$isRootCause || empty(trim($actionPlan ?? ''))) {
                    $problemId = $existing['problem_id'];
                    $checkOtherRootCausesStmt = $db->prepare("
                        SELECT COUNT(*) as count FROM root_causes 
                        WHERE problem_id = ? 
                        AND is_root_cause = 1 
                        AND action_plan IS NOT NULL 
                        AND action_plan != ''
                    ");
                    $checkOtherRootCausesStmt->execute([$problemId]);
                    $otherRootCauses = $checkOtherRootCausesStmt->fetch();
                    
                    if ($otherRootCauses['count'] == 0) {
                        $updateProblemStmt = $db->prepare("
                            UPDATE problems 
                            SET status = 'OPEN' 
                            WHERE id = ?
                        ");
                        $problemStatusUpdated = $updateProblemStmt->execute([$problemId]);
                    }
                }
                
                jsonResponse([
                    'success' => true,
                    'message' => 'Root cause updated successfully',
                    'problem_status_updated' => $problemStatusUpdated
                ]);
            } else {
                throw new Exception('Failed to update root cause');
            }
            break;
            
        // ===== DELETE - Root cause sil =====
        case 'DELETE':
            $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
            
            if ($id === false || $id === null || $id <= 0) {
                errorResponse('Invalid ID', 400);
            }
            
            // CASCADE delete
            $stmt = $db->prepare("DELETE FROM root_causes WHERE id = ? OR parent_id = ?");
            $result = $stmt->execute([$id, $id]);
            
            if ($result) {
                jsonResponse([
                    'success' => true,
                    'message' => 'Root cause deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete root cause');
            }
            break;
            
        default:
            errorResponse('Method not allowed', 405);
            break;
    }
    
} catch(PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    errorResponse('Database error occurred', 500);
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    errorResponse('An error occurred', 500);
}

/**
 * Build hierarchical tree from flat array
 */
function buildTree($elements, $parentId = null) {
    $branch = [];
    
    foreach ($elements as $element) {
        if ($element['parent_id'] == $parentId) {
            $children = buildTree($elements, $element['id']);
            if ($children) {
                $element['children'] = $children;
            }
            $branch[] = $element;
        }
    }
    
    return $branch;
}
?>