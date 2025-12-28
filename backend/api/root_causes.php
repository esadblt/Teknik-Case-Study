<?php
// CORS Headers - Allow multiple origins
$allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];

// ✅ Input validation helper
function validateInput($data, $field, $type = 'string') {
    if (!isset($data[$field])) {
        return null;
    }
    
    $value = $data[$field];
    
    switch($type) {
        case 'string':
            return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
        case 'int':
            $filtered = filter_var($value, FILTER_VALIDATE_INT);
            return $filtered !== false ? $filtered : null;
        case 'bool':
            return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        default:
            return $value;
    }
}

try {
    switch($method) {
        // ===== GET - Root cause tree getir =====
        case 'GET':
            $problemId = filter_var($_GET['problem_id'] ?? null, FILTER_VALIDATE_INT);
            
            // ✅ ID kontrolü
            if ($problemId === false || $problemId === null || $problemId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid problem ID']);
                exit();
            }
            
            // ✅ Prepared Statement ile SELECT
            $stmt = $db->prepare("
                SELECT * FROM root_causes 
                WHERE problem_id = ? 
                ORDER BY id ASC
            ");
            $stmt->execute([$problemId]);
            $rootCauses = $stmt->fetchAll();
            
            // ✅ Tree yapısını oluştur
            $tree = buildTree($rootCauses);
            echo json_encode($tree);
            break;
            
        // ===== POST - Yeni root cause ekle =====
        case 'POST':
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            // ✅ Input validation
            $problemId = validateInput($data, 'problem_id', 'int');
            $parentId = validateInput($data, 'parent_id', 'int');
            $description = validateInput($data, 'description', 'string');
            $isRootCause = validateInput($data, 'is_root_cause', 'bool') ?? false;
            $actionPlan = validateInput($data, 'action_plan', 'string');
            
            // ✅ Required field check
            if (!$problemId || $problemId <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid problem ID is required']);
                exit();
            }
            
            if (empty($description)) {
                http_response_code(400);
                echo json_encode(['error' => 'Description is required']);
                exit();
            }
            
            // ✅ Problem var mı kontrol et
            $checkStmt = $db->prepare("SELECT id FROM problems WHERE id = ?");
            $checkStmt->execute([$problemId]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Problem not found']);
                exit();
            }
            
            // ✅ Parent var mı kontrol et
            if ($parentId && $parentId > 0) {
                $parentStmt = $db->prepare("SELECT id FROM root_causes WHERE id = ?");
                $parentStmt->execute([$parentId]);
                
                if (!$parentStmt->fetch()) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Parent root cause not found']);
                    exit();
                }
            }
            
            // ✅ Prepared Statement ile INSERT
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
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id' => $db->lastInsertId(),
                    'message' => 'Root cause created successfully'
                ]);
            } else {
                throw new Exception('Failed to create root cause');
            }
            break;
            
        // ===== PUT - Root cause güncelle =====
        case 'PUT':
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            $id = validateInput($data, 'id', 'int');
            
            // ✅ ID kontrolü
            if (!$id || $id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid ID']);
                exit();
            }
            
            // ✅ Root cause var mı kontrol et
            $checkStmt = $db->prepare("SELECT * FROM root_causes WHERE id = ?");
            $checkStmt->execute([$id]);
            $existing = $checkStmt->fetch();
            
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Root cause not found']);
                exit();
            }
            
            // ✅ Sadece gönderilen alanları güncelle
            $description = isset($data['description']) 
                ? validateInput($data, 'description', 'string') 
                : $existing['description'];
                
            $isRootCause = isset($data['is_root_cause']) 
                ? (int)$data['is_root_cause'] 
                : $existing['is_root_cause'];
                
            $actionPlan = isset($data['action_plan']) 
                ? validateInput($data, 'action_plan', 'string') 
                : $existing['action_plan'];
            
            // ✅ Prepared Statement ile UPDATE
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
                // ✅ Kalıcı çözüm aksiyonu tanımlandıysa problemi "CLOSED" yap
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
                // ✅ Kök neden işareti kaldırıldıysa veya aksiyon kaldırıldıysa problemi tekrar "OPEN" yap
                else if (!$isRootCause || empty(trim($actionPlan ?? ''))) {
                    // Başka kök neden + aksiyon var mı kontrol et
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
                    
                    // Eğer başka kök neden + aksiyon yoksa problemi OPEN yap
                    if ($otherRootCauses['count'] == 0) {
                        $updateProblemStmt = $db->prepare("
                            UPDATE problems 
                            SET status = 'OPEN' 
                            WHERE id = ?
                        ");
                        $problemStatusUpdated = $updateProblemStmt->execute([$problemId]);
                    }
                }
                
                echo json_encode([
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
            
            // ✅ ID kontrolü
            if ($id === false || $id === null || $id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid ID']);
                exit();
            }
            
            // ✅ Prepared Statement ile DELETE (cascade)
            $stmt = $db->prepare("DELETE FROM root_causes WHERE id = ? OR parent_id = ?");
            $result = $stmt->execute([$id, $id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Root cause deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete root cause');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
    
} catch(PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error occurred'
    ]);
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred'
    ]);
}

// ✅ Helper function - Tree builder
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