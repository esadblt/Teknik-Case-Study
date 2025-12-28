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
        case 'email':
            return filter_var($value, FILTER_VALIDATE_EMAIL) ?: null;
        case 'date':
            $date = DateTime::createFromFormat('Y-m-d', $value);
            return $date ? $date->format('Y-m-d') : null;
        default:
            return $value;
    }
}

try {
    switch($method) {
        // ===== GET - Tüm problemleri getir =====
        case 'GET':
            if (isset($_GET['id'])) {
                // ✅ Tek problem getir - Prepared Statement
                $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
                
                // ✅ BURADA KONTROL EDİYORUZ
                if ($id === false || $id === null || $id <= 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid ID']);
                    exit();
                }
                
                $stmt = $db->prepare("SELECT * FROM problems WHERE id = ?");
                $stmt->execute([$id]);
                $problem = $stmt->fetch();
                
                if ($problem) {
                    echo json_encode($problem);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Problem not found']);
                }
            } else {
                // ✅ Tüm problemleri getir
                $stmt = $db->query("SELECT * FROM problems ORDER BY created_at DESC");
                $problems = $stmt->fetchAll();
                echo json_encode($problems);
            }
            break;
            
        // ===== POST - Yeni problem ekle =====
        case 'POST':
            $rawData = file_get_contents("php://input");
            $data = json_decode($rawData, true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            
            // ✅ Input validation
            $title = validateInput($data, 'title', 'string');
            $description = validateInput($data, 'description', 'string');
            $responsible_person = validateInput($data, 'responsible_person', 'string');
            $team = validateInput($data, 'team', 'string');
            $deadline = validateInput($data, 'deadline', 'date');
            $status = validateInput($data, 'status', 'string') ?? 'OPEN';
            
            // ✅ Required field check
            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                exit();
            }
            
            if (empty($responsible_person)) {
                http_response_code(400);
                echo json_encode(['error' => 'Responsible person is required']);
                exit();
            }
            
            // ✅ Status validation
            if (!in_array($status, ['OPEN', 'CLOSED'])) {
                $status = 'OPEN';
            }
            
            // ✅ Prepared Statement ile INSERT
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
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'id' => $db->lastInsertId(),
                    'message' => 'Problem created successfully'
                ]);
            } else {
                throw new Exception('Failed to create problem');
            }
            break;
            
        // ===== PUT - Problem güncelle =====
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
            
            // ✅ Önce problemin var olup olmadığını kontrol et
            $checkStmt = $db->prepare("SELECT id FROM problems WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Problem not found']);
                exit();
            }
            
            // ✅ Güncelleme verileri
            $title = validateInput($data, 'title', 'string');
            $description = validateInput($data, 'description', 'string');
            $responsible_person = validateInput($data, 'responsible_person', 'string');
            $team = validateInput($data, 'team', 'string');
            $deadline = validateInput($data, 'deadline', 'date');
            $status = validateInput($data, 'status', 'string');
            
            // ✅ Status validation
            if ($status && !in_array($status, ['OPEN', 'CLOSED'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid status. Must be OPEN or CLOSED']);
                exit();
            }
            
            // ✅ Prepared Statement ile UPDATE
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
                echo json_encode([
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
            
            // ✅ ID kontrolü
            if ($id === false || $id === null || $id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid ID']);
                exit();
            }
            
            // ✅ Önce problemin var olup olmadığını kontrol et
            $checkStmt = $db->prepare("SELECT id FROM problems WHERE id = ?");
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Problem not found']);
                exit();
            }
            
            // ✅ Prepared Statement ile DELETE
            $stmt = $db->prepare("DELETE FROM problems WHERE id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Problem deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete problem');
            }
            break;
            
        // ===== Diğer method'lar =====
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
        // Production'da detay gösterme:
        // 'details' => $e->getMessage()
    ]);
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred'
        // Production'da detay gösterme:
        // 'details' => $e->getMessage()
    ]);
}
?>