# 🌯 Kebab Rizki - Sistem Manajemen Keuangan & Operasional Outlet

Aplikasi kasir, pencatatan omzet harian, manajemen belanja bahan baku, absensi kru, dan generator slip gaji resmi untuk **1 Outlet Kebab Rizki**.

Dibangun dengan arsitektur **Zero-Config / Client-Side Clean & Fast** (langsung jalan di browser, Vercel, tablet kasir, maupun smartphone tanpa perlu database server yang rumit).

---

## 🚀 Cara Menjalankan

### Opsi 1: Buka Langsung (Offline / Local)
Cukup **dobel-klik file `index.html`** di laptop, tablet, atau HP Anda!

### Opsi 2: Jalankan di Web / Vercel (Online & Mobile PWA)
- Buka URL deployment Vercel Anda di browser (Google Chrome / Safari).
- **Tambahkan ke Layar Utama (Add to Home Screen)** pada HP untuk membuka seperti aplikasi native Android/iOS berikon kebab 🌯.

---

## 🛠️ Stack Teknologi

- **HTML5**: Semantik, cepat, ringan, dan ramah SEO.
- **CSS3 (Vanilla)**: Tema modern *Simple & Clean Culinary Warm Slate & Amber*, ultra-responsif untuk HP, Tablet, dan Monitor Desktop.
- **JavaScript (Vanilla)**: Single Page Application (SPA) reaktif tanpa framework berat.
- **LocalStorage**: Penyimpanan data instan di memori browser pengguna (100% aman, permanen, dan tidak butuh kuota internet).
- **Libraries via CDN**:
  - `Chart.js` → Grafik visual tren omzet 7 hari & donat komposisi belanja bahan.
  - `jsPDF` + `AutoTable` → Export Slip Gaji resmi format `.pdf` (Standar A5).
  - `SheetJS (xlsx)` → Export Rekapitulasi Laba Rugi format `.xlsx` multi-sheet.
  - `Lucide Icons` → Ikon modern, rapi, dan bersih.

---

## 📦 Fitur-Fitur Utama

1. **Dashboard Ringkasan & KPI**
   - KPI: Omzet Bulan Ini, Omzet Hari Ini, Total Pengeluaran, Estimasi Laba Bersih, Margin Laba (%), dan Total Porsi Terjual.
   - Grafik Tren Omzet Harian & Donat Kategori Pengeluaran.
   - Tabel Aktivitas Transaksi Terbaru.

2. **Pemasukan & Omzet Kasir**
   - Form input penjualan: Tanggal, Porsi Terjual, Menu, Nominal (Rp), Metode Bayar (QRIS/Tunai/Transfer), Catatan.
   - Filter pencarian menu & filter periode bulan.
   - Aksi Edit & Hapus transaksi.

3. **Pengeluaran & Belanja Bahan**
   - Form input belanja: Bahan Baku (Daging, Tortilla, Saus, Sayur), Kemasan, Gas LPG/Listrik, Sewa Gerai.
   - Filter pencarian nota belanja & kategori pengeluaran.

4. **Data Karyawan & Kasbon**
   - Master data kru outlet (Nama, Posisi, No. WhatsApp, Gaji per Hari Masuk).
   - Pencatatan Kasbon / Pinjaman karyawan berjalan.

5. **Absensi & Kehadiran Harian**
   - Pemilih tanggal absensi dengan tombol cepat: Hadir, Izin, Sakit, Alpha, Lembur.
   - Rekapitulasi kehadiran bulanan otomatis terhubung ke perhitungan slip gaji.

6. **Slip Gaji Generator (Export PDF)**
   - Perhitungan otomatis: `(Hari Hadir x Gaji Harian) + Bonus Target + Lembur - Kasbon`.
   - Pratinjau slip gaji interaktif menyerupai struk resmi lengkap dengan Terbilang Rupiah.
   - Tombol **[ EXPORT PDF SLIP GAJI ]** menghasilkan dokumen PDF formal siap cetak dan tanda tangan.

7. **Laporan & Rekapitulasi Keuangan (Export Excel)**
   - Laporan Laba Rugi periode bulanan.
   - Tombol **[ EXPORT EXCEL (.XLSX) ]** menghasilkan file spreadsheet multi-sheet (Ringkasan, Pemasukan, Pengeluaran, Karyawan).

8. **Pencadangan & Pemulihan (Backup & Restore JSON)**
   - Tombol **[ BACKUP DATA (JSON) ]** untuk mengunduh seluruh database ke file `.json`.
   - Tombol **[ RESTORE DATA ]** untuk memulihkan seluruh data dari file JSON cadangan.
   - Data tersimpan aman dan tidak akan hilang saat website di-refresh atau browser ditutup.

---

## 📁 Struktur Folder

```
kebabrizki/
│
├── index.html          # Halaman utama aplikasi (SPA)
├── README.md           # Panduan penggunaan
├── vercel.json         # Konfigurasi deployment Vercel
├── manifest.json       # Web App Manifest untuk PWA Mobile
│
├── css/
│   └── style.css       # Desain UI simple, clean, modern & responsif
│
├── js/
│   ├── app.js          # Controller utama, routing tab, event listener & state management
│   ├── db.js           # Database engine LocalStorage & JSON Backup/Restore
│   ├── pdf-export.js   # Generator Slip Gaji PDF via jsPDF
│   └── xlsx-export.js  # Generator Laporan Excel via SheetJS
│
└── images/             # Ikon logo kebab & favicon
```
