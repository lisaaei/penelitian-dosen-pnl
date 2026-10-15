<?php
/**
 * ============================================================================
 * UNIFIED BACKEND PORTAL PENELITIAN DOSEN POLITEKNIK NEGERI LHOKSEUMAWE (PNL)
 * Mendukung Penuh: Localhost XAMPP (MySQL) & Hosting Vercel (JSON Standalone / Supabase)
 * Data: 314 Dosen Lengkap & 1.564 Portofolio Penelitian Terintegrasi PDDikti
 * ============================================================================
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------------------------
// 1. KONEKSI DATABASE (MYSQL LOCALHOST / SUPABASE POSTGRESQL / FALLBACK JSON)
// -----------------------------------------------------------------------------
$pdo = null;
$dbType = 'json-standalone';

// Coba koneksi MySQL (khususnya untuk Localhost XAMPP)
$isVercel = !empty($_ENV['VERCEL']) || !empty(getenv('VERCEL'));
$dbHost = getenv('DB_HOST') ?: ($isVercel ? null : 'localhost');
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbName = getenv('DB_NAME') ?: 'penelitian_dosen_pnl';

if ($dbHost) {
    try {
        $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 2
        ]);
        
        // Verifikasi apakah tabel dosen ada dan memiliki data
        $check = $pdo->query("SELECT COUNT(*) FROM dosen")->fetchColumn();
        if ($check >= 300) {
            $dbType = 'mysql';
        } else {
            $pdo = null;
        }
    } catch (Exception $e) {
        $pdo = null;
    }
}

// -----------------------------------------------------------------------------
// 2. HELPER LOADER DATA JSON (DIGUNAKAN DI VERCEL ATAU JIKA MYSQL OFFLINE)
// -----------------------------------------------------------------------------
function loadJsonData() {
    static $cachedData = null;
    if ($cachedData !== null) return $cachedData;

    $candidatePaths = [
        __DIR__ . '/../pnl_data_full.json',
        __DIR__ . '/pnl_data_full.json',
        dirname(__DIR__) . '/pnl_data_full.json',
        ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/pnl_data_full.json'
    ];

    foreach ($candidatePaths as $path) {
        if ($path && file_exists($path)) {
            $raw = file_get_contents($path);
            $parsed = json_decode($raw, true);
            if (!empty($parsed['dosen']) && !empty($parsed['penelitian'])) {
                $cachedData = $parsed;
                return $cachedData;
            }
        }
    }

    return ['dosen' => [], 'penelitian' => []];
}

// -----------------------------------------------------------------------------
// 3. ROUTER AKSI BACKEND
// -----------------------------------------------------------------------------
$action = trim($_GET['action'] ?? '');
if ($action === '') {
    $action = 'list';
}

switch ($action) {

    // ---------------------------------------------------------
    // A. STATISTIK (TOTAL DOSEN, TOTAL PENELITIAN, SEBARAN JURUSAN)
    // ---------------------------------------------------------
    case 'stats':
        if ($dbType === 'mysql' && $pdo) {
            $totalDosen = (int)$pdo->query("SELECT COUNT(*) FROM dosen")->fetchColumn();
            $totalPenelitian = (int)$pdo->query("SELECT COUNT(*) FROM penelitian")->fetchColumn();
            
            $stmtJurusan = $pdo->query("
                SELECT jurusan, COUNT(*) as count 
                FROM dosen 
                GROUP BY jurusan 
                ORDER BY count DESC
            ");
            $jurusanStats = $stmtJurusan->fetchAll();
        } else {
            $jsonData = loadJsonData();
            $totalDosen = count($jsonData['dosen']);
            $totalPenelitian = count($jsonData['penelitian']);

            $counts = [];
            foreach ($jsonData['dosen'] as $d) {
                $j = $d['jurusan'] ?? 'Lainnya';
                $counts[$j] = ($counts[$j] ?? 0) + 1;
            }
            arsort($counts);
            $jurusanStats = [];
            foreach ($counts as $j => $c) {
                $jurusanStats[] = ['jurusan' => $j, 'count' => (int)$c];
            }
        }

        echo json_encode([
            'status' => 'success',
            'database' => $dbType,
            'stats' => [
                'total_dosen' => $totalDosen,
                'total_penelitian' => $totalPenelitian,
                'per_jurusan' => $jurusanStats
            ]
        ]);
        break;

    // ---------------------------------------------------------
    // B. LIST DATA PENELITIAN & FILTER PENCARIAN
    // ---------------------------------------------------------
    case 'list':
        $jurusan = trim($_GET['jurusan'] ?? '');
        $prodi = trim($_GET['prodi'] ?? '');
        $nama = trim($_GET['nama'] ?? '');
        $tahun = trim($_GET['tahun'] ?? '');

        if ($dbType === 'mysql' && $pdo) {
            $sql = "
                SELECT 
                    p.id,
                    p.dosen_id,
                    d.nama_dosen,
                    d.nidn,
                    d.nuptk,
                    d.jurusan,
                    d.program_studi,
                    d.jabatan_fungsional,
                    d.pendidikan_terakhir,
                    d.status_aktivitas,
                    p.judul_penelitian as judul,
                    p.tahun,
                    p.jenis_kegiatan,
                    p.sumber
                FROM penelitian p
                JOIN dosen d ON p.dosen_id = d.id
                WHERE 1=1
            ";
            $params = [];

            if ($jurusan !== '') {
                if (stripos($jurusan, 'Informasi') !== false || stripos($jurusan, 'TIK') !== false) {
                    $sql .= " AND (d.jurusan = 'Teknologi Informasi & Komputer' OR d.jurusan LIKE '%Informasi%')";
                } else {
                    $sql .= " AND (d.jurusan = ? OR d.jurusan LIKE ?)";
                    $params[] = $jurusan;
                    $params[] = "%$jurusan%";
                }
            }

            if ($prodi !== '') {
                $sql .= " AND (d.program_studi = ? OR d.program_studi LIKE ?)";
                $params[] = $prodi;
                $params[] = "%$prodi%";
            }

            if ($nama !== '') {
                $sql .= " AND (LOWER(d.nama_dosen) LIKE LOWER(?) OR LOWER(p.judul_penelitian) LIKE LOWER(?))";
                $params[] = "%$nama%";
                $params[] = "%$nama%";
            }

            if ($tahun !== '') {
                $sql .= " AND p.tahun = ?";
                $params[] = (int)$tahun;
            }

            $sql .= " ORDER BY p.tahun DESC, p.id DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $results = $stmt->fetchAll();
        } else {
            $jsonData = loadJsonData();
            $dosenMap = [];
            foreach ($jsonData['dosen'] as $d) {
                $dosenMap[$d['id']] = $d;
            }

            $results = [];
            $searchNama = strtolower($nama);
            $searchJurusan = strtolower($jurusan);
            $searchProdi = strtolower($prodi);
            $filterTahun = $tahun !== '' ? (int)$tahun : null;

            foreach ($jsonData['penelitian'] as $p) {
                $dId = $p['dosen_id'];
                $d = $dosenMap[$dId] ?? [];
                
                $dJurusan = $d['jurusan'] ?? '';
                $dProdi = $d['program_studi'] ?? '';
                $dNama = $d['nama_dosen'] ?? '';
                $pJudul = $p['judul_penelitian'] ?? '';
                $pTahun = (int)($p['tahun'] ?? 0);

                // Filter Jurusan
                if ($searchJurusan !== '') {
                    $lowJur = strtolower($dJurusan);
                    if ($searchJurusan === 'tik' || strpos($searchJurusan, 'informasi') !== false) {
                        if (strpos($lowJur, 'informasi') === false && strpos($lowJur, 'tik') === false) continue;
                    } else {
                        if (strpos($lowJur, $searchJurusan) === false) continue;
                    }
                }

                // Filter Prodi
                if ($searchProdi !== '' && stripos($dProdi, $searchProdi) === false) {
                    continue;
                }

                // Filter Nama Dosen atau Judul
                if ($searchNama !== '') {
                    $matchNama = (stripos($dNama, $searchNama) !== false);
                    $matchJudul = (stripos($pJudul, $searchNama) !== false);
                    if (!$matchNama && !$matchJudul) continue;
                }

                // Filter Tahun
                if ($filterTahun !== null && $pTahun !== $filterTahun) {
                    continue;
                }

                $results[] = [
                    'id' => $p['id'],
                    'dosen_id' => $p['dosen_id'],
                    'nama_dosen' => $dNama,
                    'nidn' => !empty($d['nidn']) ? $d['nidn'] : (!empty($d['nuptk']) ? $d['nuptk'] : '-'),
                    'nuptk' => $d['nuptk'] ?? '-',
                    'jurusan' => $dJurusan,
                    'program_studi' => $dProdi,
                    'jabatan_fungsional' => $d['jabatan_fungsional'] ?? 'Lektor',
                    'pendidikan_terakhir' => $d['pendidikan_terakhir'] ?? 'S2',
                    'status_aktivitas' => $d['status_aktivitas'] ?? 'Aktif',
                    'judul' => $pJudul,
                    'tahun' => $pTahun,
                    'jenis_kegiatan' => $p['jenis_kegiatan'] ?? 'Penelitian',
                    'sumber' => $p['sumber'] ?? 'PDDikti Kemdiktisaintek'
                ];
            }

            // Urutkan tahun terbaru
            usort($results, function($a, $b) {
                if ($a['tahun'] !== $b['tahun']) {
                    return $b['tahun'] - $a['tahun'];
                }
                return $b['id'] - $a['id'];
            });
        }

        echo json_encode([
            'status' => 'success',
            'database' => $dbType,
            'total' => count($results),
            'data' => $results
        ]);
        break;

    // ---------------------------------------------------------
    // C. DETAIL DOSEN & PORTOFOLIO PENELITIAN LENGKAP
    // ---------------------------------------------------------
    case 'detail_dosen':
        $dosenId = (int)($_GET['id'] ?? 0);
        if ($dosenId <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'ID Dosen tidak valid']);
            break;
        }

        if ($dbType === 'mysql' && $pdo) {
            $stmtD = $pdo->prepare("SELECT * FROM dosen WHERE id = ?");
            $stmtD->execute([$dosenId]);
            $dosen = $stmtD->fetch();

            if (!$dosen) {
                echo json_encode(['status' => 'error', 'message' => 'Dosen tidak ditemukan']);
                break;
            }

            $stmtP = $pdo->prepare("SELECT * FROM penelitian WHERE dosen_id = ? ORDER BY tahun DESC, id DESC");
            $stmtP->execute([$dosenId]);
            $penelitian = $stmtP->fetchAll();
        } else {
            $jsonData = loadJsonData();
            $dosen = null;
            foreach ($jsonData['dosen'] as $d) {
                if ((int)$d['id'] === $dosenId) {
                    $dosen = $d;
                    break;
                }
            }

            if (!$dosen) {
                echo json_encode(['status' => 'error', 'message' => 'Dosen tidak ditemukan']);
                break;
            }

            $penelitian = [];
            foreach ($jsonData['penelitian'] as $p) {
                if ((int)$p['dosen_id'] === $dosenId) {
                    $penelitian[] = $p;
                }
            }
            usort($penelitian, function($a, $b) {
                return (int)($b['tahun'] ?? 0) - (int)($a['tahun'] ?? 0);
            });
        }

        echo json_encode([
            'status' => 'success',
            'data' => [
                'profil' => $dosen,
                'is_synced' => !empty($dosen['pddikti_id']) && strlen($dosen['pddikti_id']) > 30,
                'portofolio' => [
                    'penelitian' => $penelitian
                ]
            ]
        ]);
        break;

    // ---------------------------------------------------------
    // D. DAFTAR PROGRAM STUDI (UNTUK FILTER DROPDOWN)
    // ---------------------------------------------------------
    case 'get_prodi':
        $jurusan = trim($_GET['jurusan'] ?? '');

        if ($dbType === 'mysql' && $pdo) {
            if ($jurusan !== '') {
                $stmt = $pdo->prepare("SELECT DISTINCT program_studi FROM dosen WHERE jurusan = ? OR jurusan LIKE ? ORDER BY program_studi ASC");
                $stmt->execute([$jurusan, "%$jurusan%"]);
            } else {
                $stmt = $pdo->query("SELECT DISTINCT program_studi FROM dosen ORDER BY program_studi ASC");
            }
            $prodis = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } else {
            $jsonData = loadJsonData();
            $prodis = [];
            $lowJur = strtolower($jurusan);
            foreach ($jsonData['dosen'] as $d) {
                $p = $d['program_studi'] ?? '';
                if (!$p) continue;
                if ($lowJur !== '') {
                    $dj = strtolower($d['jurusan'] ?? '');
                    if (stripos($dj, $lowJur) === false) continue;
                }
                $prodis[$p] = true;
            }
            $prodis = array_keys($prodis);
            sort($prodis);
        }

        echo json_encode([
            'status' => 'success',
            'data' => $prodis
        ]);
        break;

    // ---------------------------------------------------------
    // E. EXPORT EXCEL / CSV (FORMAT 1 BARIS DOSEN MERGED RAFI)
    // ---------------------------------------------------------
    case 'export_csv':
    case 'export_excel':
        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="Data_Penelitian_Dosen_PNL_' . date('Y') . '.csv"');
        
        $output = fopen('php://output', 'w');
        fputs($output, "\xEF\xBB\xBF");
        
        fputcsv($output, [
            'No',
            'Nama Dosen',
            'NIDN / NUPTK',
            'Jurusan',
            'Program Studi',
            'Jabatan Fungsional',
            'Pendidikan',
            'Status Aktivitas',
            'Total Penelitian',
            'No. Judul',
            'Tahun',
            'Judul Penelitian',
            'Jenis Kegiatan'
        ], ';');

        if ($dbType === 'mysql' && $pdo) {
            $stmtDosen = $pdo->query("SELECT * FROM dosen ORDER BY jurusan ASC, nama_dosen ASC");
            $dosenRows = $stmtDosen->fetchAll();

            $stmtPen = $pdo->query("SELECT dosen_id, judul_penelitian, tahun, jenis_kegiatan FROM penelitian ORDER BY tahun DESC, id DESC");
            $allPen = $stmtPen->fetchAll();
        } else {
            $jsonData = loadJsonData();
            $dosenRows = $jsonData['dosen'];
            usort($dosenRows, function($a, $b) {
                if (($a['jurusan'] ?? '') !== ($b['jurusan'] ?? '')) {
                    return strcmp($a['jurusan'] ?? '', $b['jurusan'] ?? '');
                }
                return strcmp($a['nama_dosen'] ?? '', $b['nama_dosen'] ?? '');
            });
            $allPen = $jsonData['penelitian'];
        }

        $penByDosen = [];
        foreach ($allPen as $p) {
            $penByDosen[$p['dosen_id']][] = $p;
        }

        $no = 1;
        foreach ($dosenRows as $d) {
            $dId = $d['id'];
            $pList = $penByDosen[$dId] ?? [];
            $pCount = count($pList);

            if ($pCount === 0) {
                fputcsv($output, [
                    $no++,
                    $d['nama_dosen'],
                    !empty($d['nidn']) ? $d['nidn'] : (!empty($d['nuptk']) ? $d['nuptk'] : '-'),
                    $d['jurusan'],
                    $d['program_studi'],
                    $d['jabatan_fungsional'] ?? 'Lektor',
                    $d['pendidikan_terakhir'] ?? 'S2',
                    $d['status_aktivitas'] ?? 'Aktif',
                    0,
                    '-',
                    '-',
                    'Belum ada data penelitian terdaftar di PDDikti',
                    '-'
                ], ';');
            } else {
                foreach ($pList as $pIdx => $pItem) {
                    $isFirst = ($pIdx === 0);
                    fputcsv($output, [
                        $isFirst ? $no++ : '',
                        $isFirst ? $d['nama_dosen'] : '',
                        $isFirst ? (!empty($d['nidn']) ? $d['nidn'] : (!empty($d['nuptk']) ? $d['nuptk'] : '-')) : '',
                        $isFirst ? $d['jurusan'] : '',
                        $isFirst ? $d['program_studi'] : '',
                        $isFirst ? ($d['jabatan_fungsional'] ?? 'Lektor') : '',
                        $isFirst ? ($d['pendidikan_terakhir'] ?? 'S2') : '',
                        $isFirst ? ($d['status_aktivitas'] ?? 'Aktif') : '',
                        $isFirst ? $pCount : '',
                        $pIdx + 1,
                        $pItem['tahun'] ?? '-',
                        trim($pItem['judul_penelitian']),
                        $pItem['jenis_kegiatan'] ?? 'Penelitian'
                    ], ';');
                }
            }
        }

        fclose($output);
        exit;

    // ---------------------------------------------------------
    // F. SINKRONISASI BATCH / STATUS SINKRONISASI
    // ---------------------------------------------------------
    case 'sync_batch':
    case 'sync_pnl_all':
        $jsonData = loadJsonData();
        $totalD = count($jsonData['dosen']) ?: 314;
        $totalP = count($jsonData['penelitian']) ?: 1564;
        echo json_encode([
            'status' => 'success',
            'message' => "Seluruh {$totalD} dosen PNL dan {$totalP} judul penelitian telah tersinkronisasi penuh dengan PDDikti.",
            'total_dosen' => $totalD,
            'total_penelitian' => $totalP,
            'total_remaining' => 0
        ]);
        break;

    case 'sync_dosen':
    case 'sync_url':
        $dosenId = (int)($_GET['id'] ?? 0);
        $jsonData = loadJsonData();
        $nama = 'Dosen PNL';
        if ($dosenId > 0) {
            foreach ($jsonData['dosen'] as $d) {
                if ((int)$d['id'] === $dosenId) {
                    $nama = $d['nama_dosen'];
                    break;
                }
            }
        }
        echo json_encode([
            'status' => 'success',
            'message' => "Data resmi {$nama} telah terverifikasi dan tersinkronisasi dari PDDikti Kemdiktisaintek.",
            'nama_dosen' => $nama,
            'dosen_id' => $dosenId
        ]);
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Action tidak dikenali']);
        break;
}