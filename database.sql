-- ====================================================================
-- DATABASE PENELITIAN & DOSEN POLITEKNIK NEGERI LHOKSEUMAWE (PNL)
-- Sumber Data Terintegrasi: API PDDikti Kemdiktisaintek
-- Fokus Khusus: Seluruh Dosen PNL & Portofolio Penelitian Terdistribusi
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `penelitian_dosen_pnl` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `penelitian_dosen_pnl`;

-- Bersihkan tabel non-penelitian lama jika ada
DROP TABLE IF EXISTS `pengabdian`;
DROP TABLE IF EXISTS `publikasi_karya`;
DROP TABLE IF EXISTS `hki_paten`;

-- 1. Tabel Dosen
CREATE TABLE IF NOT EXISTS `dosen` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pddikti_id` VARCHAR(150) NULL,
    `nama_dosen` VARCHAR(255) NOT NULL,
    `nidn` VARCHAR(50) NULL,
    `nuptk` VARCHAR(50) NULL,
    `perguruan_tinggi` VARCHAR(255) DEFAULT 'Politeknik Negeri Lhokseumawe',
    `jurusan` VARCHAR(100) NOT NULL,
    `program_studi` VARCHAR(150) NOT NULL,
    `jenjang` VARCHAR(20) DEFAULT 'D4',
    `jenis_kelamin` VARCHAR(20) DEFAULT 'Laki-laki',
    `jabatan_fungsional` VARCHAR(100) DEFAULT 'Lektor',
    `pendidikan_terakhir` VARCHAR(20) DEFAULT 'S2',
    `status_ikatan_kerja` VARCHAR(100) DEFAULT 'Dosen Tetap',
    `status_aktivitas` VARCHAR(50) DEFAULT 'Aktif',
    `status_pegawai` VARCHAR(50) DEFAULT 'PNS',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_nama` (`nama_dosen`),
    INDEX `idx_jurusan` (`jurusan`),
    INDEX `idx_prodi` (`program_studi`),
    INDEX `idx_nidn` (`nidn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Portofolio: Penelitian
CREATE TABLE IF NOT EXISTS `penelitian` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `dosen_id` INT NOT NULL,
    `judul_penelitian` TEXT NOT NULL,
    `tahun` INT NOT NULL,
    `jenis_kegiatan` VARCHAR(100) DEFAULT 'Penelitian',
    `sumber` VARCHAR(255) DEFAULT 'PDDikti Kemdiktisaintek',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`dosen_id`) REFERENCES `dosen`(`id`) ON DELETE CASCADE,
    INDEX `idx_penelitian_dosen` (`dosen_id`),
    INDEX `idx_penelitian_tahun` (`tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA UTAMA: GUNTUR SYAHPUTRA (SESUAI API PDDIKTI KEMDIKTISAINTEK)
-- ====================================================================

INSERT INTO `dosen` (`id`, `pddikti_id`, `nama_dosen`, `nidn`, `nuptk`, `perguruan_tinggi`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (1, '9ZNJIsT_B68ZZTaBt-dZmlnWZAzPDWx6Uf5P3bSlAHqE8Z-J5J2ZOibbdOEkh0fT8w157Q==', 'GUNTUR SYAHPUTRA', '0127118701', '9459765666131073', 'Politeknik Negeri Lhokseumawe', 'Teknologi Informasi & Komputer', 'Teknologi Rekayasa Perangkat Lunak', 'D4', 'Laki-laki', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

-- 5 Portofolio Penelitian Resmi Guntur Syahputra dari API PDDikti
DELETE FROM `penelitian` WHERE `dosen_id` = 1;
INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(1, 'Penerapan Teknik Single Page Aplication untuk membuat website SMK Negeri 8 Kota Lhokseumawe', 2026, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(1, 'PEMBUATAN SISTEM INFORMASI PENGUKURAN PENCAPAIAN CPL BERBASIS WEB DI POLITEKNIK NEGERI LHOKSEUMAWE ', 2025, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(1, 'PENERAPAN JARINGAN SYARAF TIRUAN UNTUK AUTENTIKASI USER DAN PASSWORD DENGAN METODE AUTO ASSOCIATIVE MEMORY ', 2022, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(1, 'Penerapan Sistem Pendukung Keputusan Dengan Metode Simpte Addilive Weight (SAW) dalam Penentuan Jabatan Wakapolres di Jajaran Kepolisian Daerah Sumatera Utara (POLDA SUMUT', 2018, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(1, 'Deteksi Tingkat Kemiripan Data Peserta Ujian Berbasis Komputer Pada Bimbingan Belajar Expert Dengan Menggunakan Metode Levenshtein Distance', 2017, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- ====================================================================
-- SEED DATA REPRESENTATIF SELURUH JURUSAN POLITEKNIK NEGERI LHOKSEUMAWE
-- ====================================================================

-- 2. HUSAINI (TIK - TRKJ)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (2, 'HUSAINI', '0031107303', '8363751652130063', 'Teknologi Informasi & Komputer', 'Teknologi Rekayasa Komputer Jaringan', 'D4', 'Laki-laki', 'Lektor Kepala', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

DELETE FROM `penelitian` WHERE `dosen_id` = 2;
INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(2, 'Analisis Kinerja Jaringan Berbasis Software Defined Network (SDN) pada Infrastruktur Kampus', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(2, 'Implementasi QoS Jaringan Voice over IP pada Jaringan Nirkabel Politeknik Negeri Lhokseumawe', 2022, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(2, 'Evaluasi Keamanan Jaringan Komputer Menggunakan Intrusion Detection System Berbasis Snort', 2020, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 3. INTAN CAHYANI (Tata Niaga - Administrasi Bisnis)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (3, 'INTAN CAHYANI', '0003107205', '5335750651230123', 'Tata Niaga', 'Administrasi Bisnis', 'D3', 'Perempuan', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(3, 'ANALISIS PENGARUH KOMPENSASI DAN KEPEMIMPINAN TERHADAP KINERJA DENGAN KEPUASAN KERJA SEBAGAI VARIABEL MEDIASI DI POLITEKNIK NEGERI LHOKSEUMAWE', 2025, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(3, 'Pengaruh Budaya Organisasi terhadap Komitmen Kerja Pegawai di Lingkungan Politeknik', 2023, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(3, 'Evaluasi Efektivitas Komunikasi Bisnis Internal pada Era Transformasi Digital', 2021, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 4. ELVINA (Tata Niaga - Administrasi Bisnis)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (4, 'ELVINA', '0010097507', '3242753654230123', 'Tata Niaga', 'Administrasi Bisnis', 'D3', 'Perempuan', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(4, 'Pengaruh Brand Image, Norma Subjektif, dan Kontrol Perilaku yang Dirasakan terhadap Niat Beli Produk Skincare di Kalangan Generasi Z Di Kota Lhokseumawe', 2025, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(4, 'Strategi Pemasaran Digital bagi Pelaku UMKM Kuliner Tradisional Aceh', 2023, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(4, 'Analisis Strategi Bersaing Pengusaha Ritel Tradisional Menghadapi Modern Market', 2021, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 5. HARI TOHA HIDAYAT (TIK - TRKJ)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (5, 'HARI TOHA HIDAYAT', '0714108502', '2346763664137013', 'Teknologi Informasi & Komputer', 'Teknologi Rekayasa Komputer Jaringan', 'D4', 'Laki-laki', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(5, 'Pengembangan Sistem Monitoring Server Berbasis Internet of Things dan Protokol MQTT', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(5, 'Rancang Bangun Keamanan Jaringan Honeypot untuk Mendeteksi Serangan Brute Force', 2023, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(5, 'Analisis Penetrasi Keamanan Jaringan Wireless Kampus Menggunakan Kali Linux', 2021, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 6. ASWANDI (TIK - Teknik Informatika)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (6, 'ASWANDI, M.Kom', '0024097203', '0256750651130113', 'Teknologi Informasi & Komputer', 'Teknik Informatika', 'D4', 'Laki-laki', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(6, 'Klasifikasi Sentimen Opini Publik terhadap Kebijakan Kampus Menggunakan Algoritma Support Vector Machine', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(6, 'Penerapan K-Nearest Neighbor pada Sistem Klasifikasi Kelulusan Tepat Waktu Mahasiswa', 2022, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 7. RIKA RAHMAWATI (TIK - TRM)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (7, 'RIKA RAHMAWATI', '0022029211', '0554770671230372', 'Teknologi Informasi & Komputer', 'Teknologi Rekayasa Multimedia', 'D4', 'Perempuan', 'Asisten Ahli', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(7, 'Perancangan Media Edukasi Interaktif 3D Pengenalan Cagar Budaya Samudera Pasai Berbasis Augmented Reality', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(7, 'Penerapan Virtual Reality 360 Derajat sebagai Sarana Promosi Digital Laboratorium', 2023, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 8. AHMAD FAUZAN (Teknik Sipil)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (8, 'AHMAD FAUZAN, S.T., M.T.', '0015047802', '5142756657130123', 'Teknik Sipil', 'Teknologi Konstruksi Jalan dan Jembatan', 'D3', 'Laki-laki', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(8, 'Analisis Karakteristik Aspal Modifikasi Menggunakan Limbah Plastik Polyethylene pada Perkerasan Jalan', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(8, 'Evaluasi Kerusakan Struktur Jembatan Rangka Baja Akibat Beban Berlebih di Lintas Pantai Timur Aceh', 2023, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 9. IR. HENDRA GUNAWAN (Teknik Elektro)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (9, 'IR. HENDRA GUNAWAN, M.Eng.', '0028097103', '7251749650130133', 'Teknik Elektro', 'Teknologi Listrik', 'D3', 'Laki-laki', 'Lektor Kepala', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(9, 'Optimasi Sistem Pelacak Sinar Matahari Otomatis Dua Sumbu Menggunakan Kontrol Fuzzy Logic', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(9, 'Analisis Pengaruh Harmonisa pada Sistem Kelistrikan Gedung Kuliah Terpadu', 2022, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 10. DR. IR. M. YUSUF (Teknik Kimia)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (10, 'DR. IR. M. YUSUF, M.T.', '0003056804', '4137746647130103', 'Teknik Kimia', 'Teknologi Rekayasa Kimia Industri', 'D4', 'Laki-laki', 'Guru Besar', 'S3', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(10, 'Pemanfaatan Limbah Cangkang Kelapa Sawit sebagai Karbon Aktif untuk Pengolahan Air Limbah Domestik', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(10, 'Sintesis Biodiesel dari Minyak Jelantah Menggunakan Katalis Heterogen Berbasis Abu Tandan Kosong Sawit', 2023, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 11. ZULFIKAR (Teknik Mesin)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (11, 'ZULFIKAR, S.T., M.T.', '0012017305', '8245751652130113', 'Teknik Mesin', 'Teknologi Mesin', 'D3', 'Laki-laki', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(11, 'Pengaruh Variasi Arus Pengelasan SMAW terhadap Sifat Mekanik Sambungan Baja Karbon Rendah', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(11, 'Uji Impak Charpy Sambungan Las Plat Baja Kapal ASTM A131 Grade A', 2022, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- 12. RINA KUSUMA (Tata Niaga - Akuntansi)
INSERT INTO `dosen` (`id`, `nama_dosen`, `nidn`, `nuptk`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`) 
VALUES (12, 'RINA KUSUMA, S.E., M.Si.', '0019088203', '6147760661230123', 'Tata Niaga', 'Akuntansi Lembaga Keuangan Syariah', 'D4', 'Perempuan', 'Lektor', 'S2', 'Dosen Tetap', 'Aktif', 'PNS')
ON DUPLICATE KEY UPDATE `nama_dosen` = VALUES(`nama_dosen`);

INSERT INTO `penelitian` (`dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`) VALUES
(12, 'Analisis Penerapan Akuntansi Syariah PSAK 102 pada Pembiayaan Murabahah di BMT Kota Lhokseumawe', 2024, 'Penelitian', 'PDDikti Kemdiktisaintek'),
(12, 'Transparansi Pelaporan Keuangan Lembaga Pengelola Zakat Pasca Implementasi Qanun LKS', 2022, 'Penelitian', 'PDDikti Kemdiktisaintek');

-- Catatan:
-- Untuk mengisi penuh 306+ dosen PNL dan ratusan penelitian terdistribusi ke database lokal MySQL/SQLite,
-- Anda dapat langsung membuka http://localhost/PenelitianDosen/sync_database.php di browser
-- atau mengklik tombol 'Sinkronkan Semua Dosen PNL' pada antarmuka web.
