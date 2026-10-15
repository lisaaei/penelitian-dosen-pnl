# 🎓 Sistem Integrasi Database Penelitian Dosen PNL & PDDikti Kemdiktisaintek

Sistem ini dibuat untuk mengambil data profil dan portofolio penelitian dosen dari portal resmi **PDDikti Kemdiktisaintek** secara real-time melalui API, serta menyimpannya ke dalam database MySQL lokal (XAMPP) secara terintegrasi untuk seluruh dosen **Politeknik Negeri Lhokseumawe (PNL)**.

---

## 📌 1. Data yang Diambil Sesuai Permintaan
Berdasarkan URL yang Anda berikan:
`https://pddikti.kemdiktisaintek.go.id/detail-dosen/9ZNJIsT_B68ZZTaBt-dZmlnWZAzPDWx6Uf5P3bSlAHqE8Z-J5J2ZOibbdOEkh0fT8w157Q==`

Sistem secara otomatis menarik dan memetakan:
1. **Detail Dosen**:
   - **Nama Dosen**: GUNTUR SYAHPUTRA
   - **Jenis Kelamin**: Laki-laki
   - **Perguruan Tinggi**: Politeknik Negeri Lhokseumawe
   - **Program Studi**: Teknologi Rekayasa Perangkat Lunak (D4)
   - **Jurusan**: Teknologi Informasi & Komputer (TIK)
   - **Jabatan Fungsional**: Lektor
   - **Pendidikan Terakhir**: S2
   - **Status Ikatan Kerja**: Dosen Tetap
   - **Status Aktivitas**: Aktif
2. **Portofolio Lengkap (4 Kategori Sesuai Tab PDDikti)**:
   - **Penelitian** (5 judul penelitian riil dari PDDikti)
   - **Pengabdian Masyarakat** (8 judul pengabdian masyarakat)
   - **Publikasi Karya**
   - **HKI / Paten**

---

## 🗄️ 2. Struktur Database (`database.sql`)
Database bernama **`penelitian_dosen_pnl`** terdiri dari 5 tabel terelasi:

1. **`dosen`**:
   - `id`, `pddikti_id`, `nama_dosen`, `nidn`, `nuptk`, `perguruan_tinggi`, `jurusan`, `program_studi`, `jenjang`, `jenis_kelamin`, `jabatan_fungsional`, `pendidikan_terakhir`, `status_ikatan_kerja`, `status_aktivitas`, `status_pegawai`
2. **`penelitian`**:
   - `id`, `dosen_id`, `judul_penelitian`, `tahun`, `jenis_kegiatan`, `sumber`
3. **`pengabdian`**:
   - `id`, `dosen_id`, `judul_pengabdian`, `tahun`, `jenis_kegiatan`, `sumber`
4. **`publikasi_karya`**:
   - `id`, `dosen_id`, `judul`, `tahun`, `jenis_kegiatan`, `sumber`
5. **`hki_paten`**:
   - `id`, `dosen_id`, `judul`, `tahun`, `nomor_paten`, `jenis_kegiatan`

> *Catatan: Sistem backend memiliki fitur **Auto-Create Database & Tables**. Begitu Anda membuka web, sistem langsung memeriksa dan membuat tabel serta data awal secara otomatis.*

---

## 🚀 3. Cara Menjalankan di XAMPP

1. **Pastikan Apache dan MySQL Berjalan di XAMPP Control Panel**:
   - Buka XAMPP Control Panel, klik **Start** pada modul **Apache** dan **MySQL**.
2. **Buka Aplikasi di Browser**:
   ```text
   http://localhost/PenelitianDosen/
   ```
3. **(Opsional) Impor Manual via phpMyAdmin**:
   - Buka `http://localhost/phpmyadmin/`
   - Buka tab **Import**, pilih file `database.sql` yang ada di folder ini, lalu klik **Go**.

---

## 🔄 4. Fitur Sinkronisasi API PDDikti

1. **Tarik Data Dosen dari URL PDDikti**:
   - Klik tombol **"Sinkronisasi PDDikti"** di bagian atas web.
   - Tempel tautan detail dosen PDDikti (contoh: `https://pddikti.kemdiktisaintek.go.id/detail-dosen/...`).
   - Klik **"Tarik Data & Simpan ke Database"**.
   - Sistem akan langsung menghubungi API PDDikti, menyimpan data profil dan seluruh portofolio ke database, dan membuka modal detail dosen.
2. **Sinkronisasi Massal Semua Dosen PNL**:
   - Klik tombol **"Sinkronkan Semua Dosen PNL"**.
   - Sistem akan menarik seluruh dosen dari seluruh program studi di Politeknik Negeri Lhokseumawe dan menyimpannya ke database.
3. **Modal Portofolio Interaktif**:
   - Tampilan modal dirancang persis dengan tata letak resmi PDDikti yang Anda lampirkan (Tab: Penelitian, Pengabdian Masyarakat, Publikasi Karya, HKI/Paten lengkap dengan navigasi dan paginasi).
