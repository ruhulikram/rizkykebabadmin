# 🌯 Kebab Rizki - Sistem Manajemen Keuangan & Operasional Outlet

Aplikasi kasir, pencatatan omzet harian, manajemen belanja bahan baku, absensi kru, dan generator slip gaji resmi untuk **1 Outlet Kebab Rizki**.

Dibangun dengan arsitektur **Zero-Config / Tanpa Backend** (cukup buka langsung di browser).

---

## 🚀 Cara Menjalankan

Tidak perlu install Node.js, PHP, database, atau build tools.
Cukup **dobel-klik file `index.html`** di laptop, tablet kasir, atau smartphone Anda!

Atau jika menggunakan Live Server (VS Code / browser extension), buka:
```
http://localhost:5500/index.html
```

---

## 🛠️ Stack Teknologi

- **HTML5**: Semantik, cepat, dan ringan.
- **CSS3 (Vanilla)**: Tema modern *Warm Culinary Slate & Amber*, glassmorphism card, ultra-responsif untuk HP/Tablet/Desktop.
- **JavaScript (Vanilla)**: Single Page Application (SPA) reaktif tanpa framework berat.
- **LocalStorage**: Penyimpanan data instan di memori browser pengguna (aman dan tidak butuh internet).
- **Libraries via CDN**:
  - `Chart.js` → Grafik visual tren omzet 7 hari & komposisi belanja.
  - `jsPDF` + `AutoTable` → Export Slip Gaji resmi format `.pdf`.
  - `SheetJS (xlsx)` → Export Rekapitulasi Laba Rugi format `.xlsx`.
  - `Lucide Icons` → Ikon modern dan bersih.

---

## 📦 Fitur-Fitur Utama

1. **Dashboard Ringkasan**
   - KPI: Omzet Bulan Ini, Omzet Hari Ini, Total Pengeluaran, Estimasi Laba Bersih, Margin Laba (%), dan Total Porsi Kebab Terjual.
   - Grafik Tren Omzet Harian & Donat Kategori Pengeluaran.
   - Tabel 6 Transaksi Terakhir (Pemasukan & Pengeluaran).

2. **Pemasukan & Omzet Kasir**
   - Form input penjualan: Tanggal, Porsi Terjual, Menu, Nominal (Rp), Metode Bayar (QRIS/Tunai/Transfer), Catatan.
   - Filter pencarian nama menu & filter periode bulan.
   - Aksi Edit & Hapus transaksi.

3. **Pengeluaran & Belanja Bahan**
   - Form input belanja: Bahan Baku (Daging, Tortilla, Saus, Sayur), Kemasan, Gas LPG/Listrik, Sewa, dll.
   - Filter pencarian nota belanja & kategori pengeluaran.

4. **Data Karyawan & Kasbon**
   - Master data kru outlet (Nama, Posisi, No. WhatsApp, Gaji per Hari Masuk).
   - Pencatatan Kasbon / Pinjaman karyawan berjalan.

5. **Absensi & Kehadiran Harian**
   - Pemilih tanggal absensi dengan tombol cepat: Hadir, Izin, Sakit, Alpha, Libur.
   - Rekapitulasi kehadiran bulanan otomatis terhubung ke perhitungan slip gaji.

6. **Slip Gaji Generator (Export PDF)**
   - Perhitungan otomatis: `(Hari Hadir x Gaji Harian) + Bonus Target - Kasbon - Potongan`.
   - Pratinjau slip gaji interaktif menyerupai struk resmi.
   - Tombol **[ EXPORT PDF SLIP GAJI ]** menghasilkan dokumen PDF formal siap cetak dan tanda tangan.

7. **Laporan & Rekapitulasi Keuangan (Export Excel)**
   - Laporan Laba Rugi periode bulanan.
   - Tombol **[ EXPORT EXCEL (.XLSX) ]** menghasilkan file spreadsheet multi-sheet (Ringkasan, Pemasukan, Pengeluaran, Karyawan).

8. **Backup & Restore JSON**
   - Tombol **[ BACKUP DATA (JSON) ]** untuk mengunduh seluruh database ke file `.json`.
   - Tombol **[ RESTORE DATA ]** untuk memulihkan seluruh data dari file JSON cadangan.
   - Tombol **Reset Demo Data** untuk mengembalikan ke data contoh Agustus 2026.

---

## 📁 Struktur Folder

```
kebabrizki/
│
├── index.html          # Halaman utama aplikasi (SPA)
├── README.md           # Panduan penggunaan
│
├── css/
│   └── style.css       # Desain UI, typography, responsive layout
│
└── js/
    ├── app.js          # Controller utama, routing tab, event listener & state management
    ├── db.js           # Database engine LocalStorage, seed data, Backup & Restore
    ├── pdf-export.js   # Generator Slip Gaji PDF via jsPDF
    └── xlsx-export.js  # Generator Laporan Excel via SheetJS
```
