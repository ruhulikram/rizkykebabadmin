-- =============================================================================
-- SKEMA DATABASE SQLITE: KEBAB RIZKI
-- File: database/kebab_rizki.db
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. Tabel Pengaturan Outlet
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    outlet_name TEXT NOT NULL DEFAULT 'Kebab Rizki',
    tagline TEXT DEFAULT 'Porsi Jumbo, Rasa Juara, Selalu Segar!',
    address TEXT DEFAULT 'Jl. Ahmad Yani No. 88, Gerai Ruko Depan Sentra Kuliner',
    phone TEXT DEFAULT '0812-3456-7890',
    owner_name TEXT DEFAULT 'Rizki Pratama',
    currency TEXT DEFAULT 'IDR',
    target_monthly_income REAL DEFAULT 35000000,
    daily_target REAL DEFAULT 300000,
    incentive_percent REAL DEFAULT 10,
    overtime_rate REAL DEFAULT 70000,
    logo_emoji TEXT DEFAULT '🌯',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Master Data Karyawan
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Kru Outlet',
    phone TEXT,
    daily_wage REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 3. Tabel Pemasukan & Omzet Kasir
CREATE TABLE IF NOT EXISTS income (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    time TEXT,          -- Format HH:mm
    amount REAL NOT NULL,
    portions INTEGER DEFAULT 1,
    menu TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Tunai',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 4. Tabel Pengeluaran & Belanja Bahan
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    amount REAL NOT NULL,
    category TEXT NOT NULL, -- Bahan Baku, Kemasan, Gas/Listrik, Sewa, Gaji, Lain-lain
    description TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Tunai',
    receipt_no TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 5. Tabel Presensi & Kehadiran Karyawan
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    status TEXT NOT NULL DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha', 'libur', 'lembur')),
    is_overtime INTEGER DEFAULT 0,
    check_in TEXT,
    check_out TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

-- 6. Tabel Kasbon & Potongan Karyawan
CREATE TABLE IF NOT EXISTS advances (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    amount REAL NOT NULL,
    type TEXT DEFAULT 'kasbon' CHECK (type IN ('kasbon', 'potongan')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deducted', 'paid')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

-- Indeks Performa untuk Pencarian & Filter Cepat
CREATE INDEX IF NOT EXISTS idx_income_date ON income (date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance (employee_id);
CREATE INDEX IF NOT EXISTS idx_advances_employee ON advances (employee_id);
CREATE INDEX IF NOT EXISTS idx_advances_date ON advances (date);
