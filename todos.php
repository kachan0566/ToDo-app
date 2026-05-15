<?php
header('Content-Type: application/json; charset=utf-8');

// ローカル開発用（本番では削除すること）
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// プリフライトリクエストへの応答
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

// ── GET: タスク一覧を取得 ─────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM todos ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll());
    exit;
}

// ── POST: タスクを新規作成 ────────────────────────────────────
if ($method === 'POST') {
    $title       = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');

    if ($title === '') {
        http_response_code(422);
        echo json_encode(['error' => 'タイトルは必須です']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO todos (title, description) VALUES (?, ?)');
    $stmt->execute([$title, $description]);

    $newId = (int)$pdo->lastInsertId();
    $row   = $pdo->query("SELECT * FROM todos WHERE id = $newId")->fetch();

    http_response_code(201);
    echo json_encode($row);
    exit;
}

// ── PUT: タスクを更新 ─────────────────────────────────────────
if ($method === 'PUT') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'idが指定されていません']);
        exit;
    }

    $title       = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $completed   = isset($input['completed']) ? (int)(bool)$input['completed'] : 0;

    if ($title === '') {
        http_response_code(422);
        echo json_encode(['error' => 'タイトルは必須です']);
        exit;
    }

    $stmt = $pdo->prepare(
        'UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?'
    );
    $stmt->execute([$title, $description, $completed, $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'タスクが見つかりません']);
        exit;
    }

    $row = $pdo->query("SELECT * FROM todos WHERE id = $id")->fetch();
    echo json_encode($row);
    exit;
}

// ── DELETE: タスクを削除 ──────────────────────────────────────
if ($method === 'DELETE') {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'idが指定されていません']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM todos WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'タスクが見つかりません']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}

// ── 未対応メソッド ────────────────────────────────────────────
http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
