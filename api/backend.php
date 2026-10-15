<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfigurasi Langsung Supabase PostgreSQL untuk Vercel
$dbHost = 'aws-0-ap-southeast-1.pooler.supabase.com'; // Sesuaikan host Supabase Anda
$dbPort = '6543';                                   // Port pooling (biasanya 6543)
$dbUser = 'postgres.xxxx';                          // User Supabase Anda
$dbPass = 'password_supabase_anda';                 // Password Supabase Anda
$dbName = 'postgres';

try {
    $dsn = "pgsql:host=$dbHost;port=$dbPort;dbname=$dbName";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);

    // Contoh ambil data tabel dosen (sesuaikan nama tabel Anda jika beda)
    $stmt = $pdo->query("SELECT * FROM dosen LIMIT 10");
    $data = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>