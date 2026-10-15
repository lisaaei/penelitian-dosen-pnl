# 🚀 Panduan Lengkap Hosting ke Vercel + Database Supabase
## Portal Penelitian Dosen Politeknik Negeri Lhokseumawe (PNL)

Aplikasi ini telah siap 100% untuk dideploy ke **Vercel** dengan database cloud **Supabase** (PostgreSQL) serta tetap mendukung jalannya aplikasi di server lokal (XAMPP).

---

## 📁 File yang Telah Disediakan Khusus untuk Vercel & Supabase

1. **`supabase_schema.sql`**
   - Berisi skema database PostgreSQL lengkap: tabel `dosen` dan `penelitian`, relasi foreign key, indeks pencarian, pengaturan keamanan RLS (*Row Level Security*), serta **seluruh 314 Dosen dan 1.564 Judul Penelitian** siap impor sekali klik.
2. **`api/backend.js`**
   - Vercel Serverless Function berbasis Node.js yang bertindak sebagai backend cloud pengganti `backend.php`. Terintegrasi langsung dengan Supabase SDK (`@supabase/supabase-js`) dan API resmi PDDikti Kemdiktisaintek.
3. **`vercel.json`**
   - Konfigurasi routing Vercel yang otomatis meneruskan request dari frontend (`backend.php?action=...`) ke Serverless Function `/api/backend` tanpa mengubah alur frontend.
4. **`package.json`**
   - Dependensi cloud Vercel untuk otomatis menginstal `@supabase/supabase-js`.
5. **`pnl_data_full.json`**
   - Data cadangan (*instant fallback*) 314 dosen dan 1.564 penelitian agar aplikasi langsung berjalan lancar bahkan sebelum Supabase dikonfigurasi.
6. **`.env.example`**
   - Contoh format variabel lingkungan (*Environment Variables*) untuk Vercel.

---

## 🛠️ Langkah 1: Setup Database di Supabase (Hanya 2 Menit)

1. Buka [https://supabase.com](https://supabase.com) dan masuk / daftar akun gratis.
2. Klik **"New Project"**, beri nama proyek (misal: `penelitian-dosen-pnl`), masukkan database password, dan pilih region terdekat (misal: `Singapore`).
3. Setelah proyek selesai dibuat, klik menu **SQL Editor** (ikon terminal/kode di menu sebelah kiri).
4. Klik **"New Query"**, lalu buka file **`supabase_schema.sql`** di teks editor Anda, salin seluruh isinya (Ctrl + A, Ctrl + C), dan tempelkan (*paste*) ke dalam SQL Editor Supabase.
5. Klik tombol **"Run"** di pojok kanan bawah.
   - *Selesai! Seluruh tabel `dosen` (314 orang) dan `penelitian` (1.564 judul) beserta indeks dan policy keamanan RLS langsung aktif di Supabase.*
6. Buka menu **Project Settings** (ikon gerigi di kiri bawah) ➔ pilih menu **API**.
7. Salin 2 nilai berikut:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **Project API Keys** bagian **`anon` / `public`** (kunci panjang diawali `eyJhbGci...`)

---

## ☁️ Langkah 2: Deploy ke Vercel

### Opsi A: Melalui GitHub (Paling Direkomendasikan)
1. Buat repository baru di akun GitHub Anda (misal: `penelitian-dosen-pnl`).
2. Unggah/Push semua file dari folder `c:\xampp\htdocs\PenelitianDosen` ke repository GitHub tersebut:
   ```bash
   git init
   git add .
   git commit -m "Siap deploy Vercel dan Supabase"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/penelitian-dosen-pnl.git
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
4. Klik **"Add New..."** ➔ **"Project"**, lalu pilih repository `penelitian-dosen-pnl`.
5. Pada bagian **Environment Variables**, tambahkan 2 variabel berikut:
   - **Key**: `SUPABASE_URL` | **Value**: *(Project URL dari Supabase Anda)*
   - **Key**: `SUPABASE_ANON_KEY` | **Value**: *(anon public key dari Supabase Anda)*
6. Klik tombol **"Deploy"**.
7. Tunggu sekitar 30 detik. Website Anda akan langsung aktif dengan domain resmi gratis Vercel (contoh: `https://penelitian-dosen-pnl.vercel.app`)!

---

### Opsi B: Menggunakan Vercel CLI (Langsung dari Terminal Komputer)
Jika Anda memiliki Node.js / Vercel CLI di komputer:
```bash
npx vercel
```
Ikuti instruksi di layar, dan saat selesai tambahkan Environment Variable `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di Dashboard Vercel project settings.

---

## ✨ Keunggulan Arsitektur Ini

1. **Dual-Environment Support**:
   - Jika dijalankan di **XAMPP Lokal**: Kode otomatis menggunakan Apache `backend.php` dan database MySQL lokal.
   - Jika dijalankan di **Vercel Cloud**: Request otomatis dialihkan ke Serverless Function `api/backend.js` yang terhubung ke cloud database Supabase PostgreSQL.
2. **Instant Fallback**:
   - Jika Environment Variable Supabase belum diisi di Vercel, serverless function secara cerdas menyajikan data dari `pnl_data_full.json`, memastikan website tidak akan pernah mengalami crash atau layar putih.
3. **Live API PDDikti Kemdiktisaintek**:
   - Fitur tarik data real-time, sinkronisasi portofolio, dan modal detail dosen tetap berfungsi penuh di cloud Vercel tanpa terkendala CORS.
