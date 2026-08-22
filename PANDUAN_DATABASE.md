# 🌯 Panduan Lengkap Database SQLite & Panel Akses - Kebab Rizki

Panduan resmi penggunaan database relasional **SQLite 3** (*MySQL Lite / File-Based SQL Database*) dan **Panel Akses Database (Database Management Studio)** untuk outlet **Kebab Rizki**.

---

## 📌 Apa itu Database SQLite di Kebab Rizki?

Aplikasi Kebab Rizki kini menggunakan database relasional **SQLite 3**.
- Seluruh data transaksi penjualan kasir, belanja bahan baku, data karyawan, absensi kehadiran, dan kasbon tersimpan secara permanen dan terstruktur di dalam file:
  ```
  database/kebab_rizki.db
  ```
- **Keunggulan SQLite**:
  - **Sangat Ringan & Cepat**: Performa kueri instan dengan mode WAL (*Write-Ahead Logging*).
  - **Zero-Config**: Tidak perlu install server MySQL/XAMPP yang berat dan memakan RAM.
  - **Mudah Dibackup & Dipindah**: Cukup copy file `kebab_rizki.db` ke flashdisk/cloud untuk memindahkan seluruh data ke laptop atau kasir lain.
  - **Mendukung Standar SQL Lengkap**: Anda dapat menjalankan query SQL relasional (`SELECT`, `JOIN`, `GROUP BY`, `SUM`, `COUNT`, dll).

---

## 🚀 1. Cara Menjalankan Server & Database

### Opsi A: Cara 1-Klik (Paling Mudah di Windows)
1. Buka folder proyek `kebabrizki`.
2. Dobel-klik file **`jalankan-server.bat`**.
3. Sistem akan otomatis menyalakan server dan langsung membuka browser ke:
   - **Aplikasi Kasir**: `http://localhost:3000`
   - **Panel Akses Database**: `http://localhost:3000/panel-database.html`

---

### Opsi B: Melalui Terminal / Command Prompt
Buka terminal di folder `kebabrizki`, lalu jalankan:
```bash
# Menjalankan server aplikasi & API SQLite
npm start
```
Atau dalam mode development:
```bash
npm run dev
```

---

## 🗄️ 2. Panduan Menggunakan Panel Akses Database (Web Studio)

Panel Akses Database dapat dibuka langsung melalui browser di:
```
http://localhost:3000/panel-database.html
```
*(Atau klik menu **"Panel Database"** di navigasi sidebar aplikasi kasir)*.

Di dalam panel ini, tersedia 4 tab utama:

### 📋 Tab 1: Penjelajah Tabel (Table Browser)
- **Pilih Tabel**: Klik tombol pil tabel di bagian atas (`income`, `expenses`, `employees`, `attendance`, `advances`, `settings`).
- **Lihat Data Real-Time**: Melihat seluruh baris data transaksi yang tersimpan di SQLite lengkap dengan jumlah baris (*row count*).
- **Refresh Data**: Klik tombol **Refresh Tabel** untuk memuat data terbaru dari transaksi kasir.

### ⚡ Tab 2: SQL Query Console (Eksekutor SQL)
- Menjalankan kueri SQL kustom secara bebas langsung ke database `kebab_rizki.db`.
- **Shortcut Eksekusi**: Tekan tombol **`Ctrl + Enter`** pada keyboard untuk menjalankan kueri seketika.
- **Tombol Query Cepat Siap Pakai**:
  Tersedia tombol pintas kueri analisis bisnis yang dapat diklik langsung:
  - 📊 *20 Penjualan Terakhir*
  - 🌯 *Menu Terlaris & Total Omzet*
  - 💳 *Omzet per Metode Bayar (QRIS / Tunai)*
  - 💸 *Belanja Bahan per Kategori*
  - 👥 *Rekap Kehadiran Karyawan*
  - 📉 *Kasbon Karyawan Belum Lunas*

### 📁 Tab 3: Struktur Skema (Schema Viewer)
- Menampilkan definisi tabel, tipe data setiap kolom (`TEXT`, `REAL`, `INTEGER`, `DATETIME`), status Primary Key (PK), dan batasan *Not Null*.

### 🛠️ Tab 4: Backup, Restore & Tools
- **Unduh File Database (`.db`)**: Tombol 1-klik untuk mendownload salinan mentah file `kebab_rizki.db`.
- **Backup JSON**: Ekspor seluruh tabel ke dalam file berkas `.json`.
- **Restore / Impor Data JSON**: Pulihkan database dari file cadangan JSON yang pernah diunduh.
- **Optimasi Database (VACUUM)**: Merapikan ruang kosong dan mempercepat performa kueri file database.
- **Reset Bersih**: Mengosongkan data transaksi jika ingin memulai pembukuan periode baru dari nol.

---

## 💡 3. Contoh Query SQL Praktis untuk Analisis Outlet Kebab

Anda dapat menyalin dan mencoba query berikut di tab **SQL Query Console**:

### A. Total Omzet & Porsi Terjual per Menu
```sql
SELECT 
    menu AS "Nama Menu",
    COUNT(*) AS "Jumlah Transaksi",
    SUM(portions) AS "Total Porsi Terjual",
    SUM(amount) AS "Total Omzet (Rp)"
FROM income
GROUP BY menu
ORDER BY "Total Porsi Terjual" DESC;
```

### B. Perbandingan Penjualan QRIS vs Tunai vs Transfer
```sql
SELECT 
    payment_method AS "Metode Pembayaran",
    COUNT(*) AS "Jumlah Transaksi",
    SUM(amount) AS "Total Nominal (Rp)"
FROM income
GROUP BY payment_method;
```

### C. Total Pengeluaran Belanja Bahan per Kategori
```sql
SELECT 
    category AS "Kategori Belanja",
    COUNT(*) AS "Banyak Nota",
    SUM(amount) AS "Total Pengeluaran (Rp)"
FROM expenses
GROUP BY category
ORDER BY "Total Pengeluaran (Rp)" DESC;
```

### D. Rekap Kehadiran Seluruh Karyawan
```sql
SELECT 
    e.name AS "Nama Karyawan",
    e.role AS "Posisi",
    e.daily_wage AS "Gaji Harian",
    COUNT(CASE WHEN a.status = 'hadir' THEN 1 END) AS "Hari Hadir",
    COUNT(CASE WHEN a.is_overtime = 1 THEN 1 END) AS "Hari Lembur",
    COUNT(CASE WHEN a.status = 'izin' THEN 1 END) AS "Izin",
    COUNT(CASE WHEN a.status = 'sakit' THEN 1 END) AS "Sakit"
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
GROUP BY e.id, e.name;
```

### E. Daftar Kasbon Karyawan yang Masih Berjalan (Pending)
```sql
SELECT 
    e.name AS "Nama Karyawan",
    a.date AS "Tanggal Pinjam",
    a.amount AS "Nominal Kasbon",
    a.description AS "Keperluan",
    a.status AS "Status"
FROM advances a
JOIN employees e ON a.employee_id = e.id
WHERE a.status = 'pending'
ORDER BY a.date DESC;
```

---

## 🖥️ 4. Cara Membuka Database Menggunakan Software Desktop (DB Browser for SQLite)

Jika Anda ingin membuka dan mengedit database menggunakan aplikasi desktop GUI visual:

1. **Download DB Browser for SQLite** (Gratis & Open-Source):
   - Kunjungi: [https://sqlitebrowser.org/dl/](https://sqlitebrowser.org/dl/)
   - Unduh dan pasang versi **Windows Standard Installer**.
2. **Buka Database**:
   - Jalankan program **DB Browser for SQLite**.
   - Klik menu **Open Database** (Buka Database).
   - Arahkan ke folder proyek Anda dan pilih file:
     ```
     kebabrizki/database/kebab_rizki.db
     ```
3. **Mulai Kelola**:
   - Masuk ke tab **Browse Data** untuk melihat/mengedit baris data secara visual seperti spreadsheet Excel.
   - Masuk ke tab **Execute SQL** untuk menjalankan perintah SQL lanjutan.
   - Klik **Write Changes** setelah melakukan pengeditan manual.

---

## 📦 5. Struktur Tabel Database

| Nama Tabel | Deskripsi Data |
| :--- | :--- |
| **`settings`** | Profil outlet, target omzet bulanan, target harian (Rp 300rb), % bonus insentif. |
| **`employees`** | Master kru outlet (Nama, Posisi, No. WhatsApp, Gaji per hari, Status). |
| **`income`** | Catatan omzet kasir (Tanggal, Waktu, Nominal, Porsi, Menu, Metode Bayar, Catatan). |
| **`expenses`** | Catatan belanja (Bahan baku daging/tortilla, kemasan, gas LPG, sewa, nota). |
| **`attendance`** | Presensi harian kru (Hadir, Izin, Sakit, Alpha, Lembur, Jam Masuk/Pulang). |
| **`advances`** | Pinjaman kasbon & potongan karyawan berjalan. |

---

## 🔒 6. Tips Pencadangan & Pemindahan Komputer

- **Pencadangan Harian/Mingguan**: Cukup salin file `database/kebab_rizki.db` atau gunakan tombol **Download .db** di Panel Database.
- **Pindah Komputer Kasir Baru**:
  1. Copy seluruh folder `kebabrizki` ke komputer baru.
  2. Pastikan komputer baru telah terinstall **Node.js**.
  3. Dobel-klik file `jalankan-server.bat`. Seluruh data transaksi Anda akan langsung termuat 100%!
