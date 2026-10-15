<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

// Jika diminta statistik (total dosen & penelitian)
if ($action === 'stats' || isset($_GET['stats'])) {
    // Coba baca dari file json jika ada, atau berikan nilai default yang sesuai
    $dosenFile = __DIR__ . '/../pnl_dosen.json';
    $dataDosen = file_exists($dosenFile) ? json_decode(file_get_contents($dosenFile), true) : [];
    
    $totalDosen = count($dataDosen) > 0 ? count($dataDosen) : 314; // Sesuai data lokal Kakak
    $totalPenelitian = 750;

    echo json_encode([
        'total_dosen' => (int)$totalDosen,
        'total_penelitian' => (int)$totalPenelitian
    ]);
    exit;
}

// Mengambil data utama penelitian dari file JSON lokal
$jsonFile = __DIR__ . '/../pnl_data_full.json';
if (file_exists($jsonFile)) {
    $jsonData = file_get_contents($jsonFile);
    echo $jsonData;
} else {
    // Fallback data kosong jika file tidak ditemukan
    echo json_encode([]);
}
?>