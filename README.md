# 🌯 Kebab Rizki - Sistem Manajemen Keuangan & Operasional Outlet

Aplikasi kasir, pencatatan omzet harian, manajemen belanja bahan baku, absensi kru, generator slip gaji resmi, dan **Database Relasional SQLite 3 & Web Management Panel** untuk **1 Outlet Kebab Rizki**.

---

## 🚀 Cara Menjalankan

### Opsi 1: Jalankan dengan Database SQLite (Direkomendasikan)
1. **Cara 1-Klik (Windows)**: Dobel-klik file **`jalankan-server.bat`**.
2. **Atau via Terminal**:
   ```bash
   npm start
   ```
3. Buka browser:
   - **Aplikasi Kasir & Keuangan**: [http://localhost:3000](http://localhost:3000)
   - **Panel Akses Database (Web Studio)**: [http://localhost:3000/panel-database.html](http://localhost:3000/panel-database.html)

### Opsi 2: Standalone Mode (Tanpa Server / LocalStorage)
Cukup dobel-klik file `index.html` langsung di laptop, tablet, atau smartphone Anda!

---

## 🛠️ Stack Teknologi

- **Database Engine**: **SQLite 3** (`database/kebab_rizki.db`) dengan mode performa tinggi WAL (*Write-Ahead Logging*).
- **Backend API**: **Node.js & Express** menyediakan REST API endpoints untuk sinkronisasi data kasir dan eksekutor kueri SQL.
- **Panel Akses Database Web**: **SQLite Web Studio** (`panel-database.html`) untuk melihat tabel data, menjalankan query SQL kustom (dengan tombol kueri preset), ekspor `.db`, dan optimasi VACUUM.
- **Frontend**: HTML5 Semantik, CSS3 Vanilla Modern (*Warm Culinary Slate & Amber*), JavaScript Vanilla SPA.
- **Kompatibilitas Desktop GUI**: Dapat dibuka langsung menggunakan software desktop gratis seperti **DB Browser for SQLite** atau DBeaver.
- **Libraries via CDN**:
  - `Chart.js` → Grafik visual tren omzet 7 hari & komposisi belanja.
  - `jsPDF` + `AutoTable` → Export Slip Gaji resmi format `.pdf`.
  - `SheetJS (xlsx)` → Export Rekapitulasi Laba Rugi format `.xlsx`.
  - `Lucide Icons` → Ikon modern dan bersih.

---

## 📦 Fitur-Fitur Utama

1. **Dashboard Ringkasan & KPI**
   - KPI Omzet Bulan Ini, Omzet Hari Ini, Total Pengeluaran, Estimasi Laba Bersih, Margin Laba (%), dan Total Porsi Terjual.
   - Indikator Status Database Live (🟢 **SQLite Aktif**).
   - Grafik Tren Omzet Harian & Komposisi Pengeluaran Bahan.

2. **Pemasukan & Omzet Kasir**
   - Form input penjualan: Tanggal, Porsi Terjual, Menu, Nominal (Rp), Metode Bayar (QRIS/Tunai/Transfer), Catatan.
   - Filter pencarian menu, filter bulan, aksi edit & hapus.

3. **Pengeluaran & Belanja Bahan**
   - Form belanja: Bahan Baku (Daging, Tortilla, Saus, Sayur), Kemasan, Gas LPG/Listrik, Sewa.

4. **Data Karyawan & Kasbon**
   - Master data kru outlet (Nama, Posisi, No. WhatsApp, Gaji per Hari Masuk).
   - Pencatatan Kasbon / Pinjaman karyawan berjalan.

5. **Absensi & Kehadiran Harian**
   - Pemilih tanggal absensi dengan tombol cepat: Hadir, Izin, Sakit, Alpha, Lembur.

6. **Slip Gaji Generator (Export PDF)**
   - Perhitungan otomatis: `(Hari Hadir x Gaji Harian) + Bonus Target - Kasbon - Potongan`.
   - Export format dokumen PDF formal A5 siap cetak dan tanda tangan.

7. **Laporan Keuangan (Export Excel)**
   - Laporan Laba Rugi bulanan format spreadsheet multi-sheet (`.xlsx`).

8. **Panel Akses Database SQLite (Web Studio GUI)**
   - Penjelajah tabel (*Table Browser*) dengan live search dan filter.
   - SQL Console untuk menjalankan kueri kustom bebas (`SELECT`, `JOIN`, `GROUP BY`).
   - Download langsung file mentah `kebab_rizki.db`.
   - Optimasi database (VACUUM) dan Backup/Restore JSON.

---

## 📁 Struktur Folder

```
kebabrizki/
│
├── database/
│   ├── kebab_rizki.db       # File database SQLite utama
│   ├── schema.sql           # Skema tabel relasional SQL
│   └── db.js                # Driver & query repository SQLite
│
├── css/
│   └── style.css            # Desain UI, typography, responsive layout
│
├── js/
│   ├── app.js               # Controller utama SPA & state management
│   ├── db.js                # Data layer (SQLite API + LocalStorage cache)
│   ├── pdf-export.js        # Generator Slip Gaji PDF via jsPDF
│   └── xlsx-export.js       # Generator Laporan Excel via SheetJS
│
├── images/                  # Ikon dan aset grafis
├── index.html               # Halaman utama aplikasi kasir (SPA)
├── panel-database.html      # Panel Akses Database Web (SQLite Studio)
├── server.js                # Server Node.js Express & REST API
├── jalankan-server.bat      # Launcher 1-klik untuk Windows
├── package.json             # Konfigurasi dependensi project
├── PANDUAN_DATABASE.md      # Panduan lengkap penggunaan database & panel
└── README.md                # Dokumentasi utama proyek
```

---

## 📖 Dokumentasi Lengkap Database

Untuk panduan lengkap cara kueri SQL, membuka database dengan DB Browser for SQLite, dan manajemen data, silakan baca berkas:
👉 **[PANDUAN_DATABASE.md](PANDUAN_DATABASE.md)**
