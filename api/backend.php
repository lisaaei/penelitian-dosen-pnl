<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfigurasi Supabase PostgreSQL
$dbHost = 'aws-0-ap-southeast-1.pooler.supabase.com';
$dbPort = '6543';
$dbUser = 'postgres.xxxx'; // Sesuaikan user Supabase Anda
$dbPass = 'password_supabase_anda'; // Sesuaikan password Supabase Anda
$dbName = 'postgres';

try {
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);

    // Mengambil parameter aksi dari frontend (misal: statistik atau list penelitian)
    $action = $_GET['action'] ?? 'list';

    if ($action === 'stats') {
        // Hitung total dosen dan penelitian dari Supabase
        $stmtDosen = $pdo->query("SELECT COUNT(*) as total FROM dosen");
        $totalDosen = $stmtDosen->fetch()['total'] ?? 0;

        $stmtPenelitian = $pdo->query("SELECT COUNT(*) as total FROM penelitian");
        $totalPenelitian = $stmtPenelitian->fetch()['total'] ?? 0;

        echo json_encode([
            'total_dosen' => $totalDosen,
            'total_penelitian' => $totalPenelitian
        ]);
    } else {
        // Ambil data utama penelitian untuk tabel/list
        $stmt = $pdo->query("SELECT * FROM penelitian LIMIT 50");
        $data = $stmt->fetchAll();
        echo json_encode($data);
    }

} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?>