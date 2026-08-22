/**
 * db.js - Unified Database Engine untuk Kebab Rizki (kebab-finance)
 * Mendukung penyimpanan Hybrid: SQLite 3 Backend API + LocalStorage Fast-Cache.
 */

const DB_KEYS = {
  SETTINGS: 'kebab_settings',
  INCOME: 'kebab_income',
  EXPENSES: 'kebab_expenses',
  EMPLOYEES: 'kebab_employees',
  ATTENDANCE: 'kebab_attendance',
  ADVANCES: 'kebab_advances', // Kasbon / Potongan
};

const DEFAULT_SETTINGS = {
  outletName: 'Kebab Rizki',
  tagline: 'Porsi Jumbo, Rasa Juara, Selalu Segar!',
  address: 'Jl. Ahmad Yani No. 88, Gerai Ruko Depan Sentra Kuliner',
  phone: '0812-3456-7890',
  ownerName: 'Rizki Pratama',
  currency: 'IDR',
  targetMonthlyIncome: 35000000,
  dailyTarget: 300000, // Target omzet harian (Rp 300.000)
  incentivePercent: 10, // 10% dari kelebihan target masuk ke pembagian bonus
  overtimeRate: 70000, // Tarif lembur per hari (Rp 70.000)
  logoEmoji: '🌯'
};

// Inisialisasi Data Bersih (Tanpa Dummy Data)
function generateSeedData() {
  return {
    [DB_KEYS.SETTINGS]: DEFAULT_SETTINGS,
    [DB_KEYS.EMPLOYEES]: [],
    [DB_KEYS.INCOME]: [],
    [DB_KEYS.EXPENSES]: [],
    [DB_KEYS.ATTENDANCE]: [],
    [DB_KEYS.ADVANCES]: []
  };
}

const DB = {
  isBackendConnected: false,
  apiBaseUrl: (window.location.protocol.startsWith('http')) 
    ? window.location.origin 
    : 'http://localhost:3000',

  /**
   * Inisialisasi Database.
   * Memeriksa penyimpanan lokal dan menyinkronkan dengan backend SQLite jika online.
   */
  async init() {
    try {
      // Pastikan struktur penyimpanan ada tanpa mereset data pengguna yang sudah ada
      if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        this.set(DB_KEYS.SETTINGS, DEFAULT_SETTINGS, false);
      }
      if (!localStorage.getItem(DB_KEYS.EMPLOYEES)) {
        this.set(DB_KEYS.EMPLOYEES, [], false);
      }
      if (!localStorage.getItem(DB_KEYS.INCOME)) {
        this.set(DB_KEYS.INCOME, [], false);
      }
      if (!localStorage.getItem(DB_KEYS.EXPENSES)) {
        this.set(DB_KEYS.EXPENSES, [], false);
      }
      if (!localStorage.getItem(DB_KEYS.ATTENDANCE)) {
        this.set(DB_KEYS.ATTENDANCE, [], false);
      }
      if (!localStorage.getItem(DB_KEYS.ADVANCES)) {
        this.set(DB_KEYS.ADVANCES, [], false);
      }

      // Hubungkan ke server SQLite backend secara asinkron (jika backend aktif)
      await this.checkBackendAndSync();
    } catch (e) {
      console.error('Database init error:', e);
    }
  },

  /**
   * Periksa ketersediaan backend SQLite REST API dan sinkronkan data
   */
  async checkBackendAndSync() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/api/status`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.isBackendConnected = true;
          this.updateConnectionUI(true, json.engine);
          await this.pullFromSQLite(json);
          return true;
        }
      }
    } catch (e) {
      // Backend offline / mode standalone file
      this.isBackendConnected = false;
      this.updateConnectionUI(false);
    }
    return false;
  },

  /**
   * Update indikator koneksi di antarmuka
   */
  updateConnectionUI(isConnected, engineName = 'SQLite 3') {
    const badge = document.getElementById('dbStatusBadge');
    if (badge) {
      if (isConnected) {
        badge.className = 'db-status-badge online';
        badge.innerHTML = `<span class="pulse-dot"></span> <span>Database: <strong>${engineName} (Aktif)</strong></span>`;
        badge.title = 'Terkoneksi ke database relasional SQLite file kebab_rizki.db';
      } else {
        badge.className = 'db-status-badge offline';
        badge.innerHTML = `<span class="pulse-dot offline"></span> <span>Database: <strong>LocalStorage</strong></span>`;
        badge.title = 'Berjalan dalam mode offline / cache browser. Data tersimpan aman di perangkat ini.';
      }
    }
  },

  /**
   * Mengambil data terbaru dari SQLite server atau mengunggah data lokal jika server kosong
   */
  async pullFromSQLite(statusData = null) {
    if (!this.isBackendConnected) return;
    try {
      const statusRes = statusData || await fetch(`${this.apiBaseUrl}/api/status`).then(r => r.json()).catch(() => null);
      
      const localTotal = (this.get(DB_KEYS.INCOME).length) +
                         (this.get(DB_KEYS.EXPENSES).length) +
                         (this.get(DB_KEYS.EMPLOYEES).length) +
                         (this.get(DB_KEYS.ATTENDANCE).length) +
                         (this.get(DB_KEYS.ADVANCES).length);

      const serverTotal = (statusRes && statusRes.totalRecords) ? (statusRes.totalRecords - (statusRes.tableCounts?.settings || 1)) : 0;

      // Jika server SQLite masih kosong tapi di localStorage browser sudah ada data (misal baru restore JSON)
      // Maka otomatis unggah data lokal ke SQLite server agar data lokal tidak tertimpa kosong!
      if (serverTotal === 0 && localTotal > 0) {
        console.log('📤 Mengunggah data lokal ke SQLite server...');
        await this.pushToSQLite();
        return;
      }

      // Jika server memiliki data, tarik dari SQLite server
      const [settingsRes, empRes, incRes, expRes, attRes, advRes] = await Promise.all([
        fetch(`${this.apiBaseUrl}/api/settings`).then(r => r.json()).catch(() => null),
        fetch(`${this.apiBaseUrl}/api/employees`).then(r => r.json()).catch(() => null),
        fetch(`${this.apiBaseUrl}/api/income`).then(r => r.json()).catch(() => null),
        fetch(`${this.apiBaseUrl}/api/expenses`).then(r => r.json()).catch(() => null),
        fetch(`${this.apiBaseUrl}/api/attendance`).then(r => r.json()).catch(() => null),
        fetch(`${this.apiBaseUrl}/api/advances`).then(r => r.json()).catch(() => null)
      ]);

      if (settingsRes && settingsRes.data) this.set(DB_KEYS.SETTINGS, settingsRes.data, false);
      if (empRes && Array.isArray(empRes.data) && empRes.data.length > 0) this.set(DB_KEYS.EMPLOYEES, empRes.data, false);
      if (incRes && Array.isArray(incRes.data) && incRes.data.length > 0) this.set(DB_KEYS.INCOME, incRes.data, false);
      if (expRes && Array.isArray(expRes.data) && expRes.data.length > 0) this.set(DB_KEYS.EXPENSES, expRes.data, false);
      if (attRes && Array.isArray(attRes.data) && attRes.data.length > 0) this.set(DB_KEYS.ATTENDANCE, attRes.data, false);
      if (advRes && Array.isArray(advRes.data) && advRes.data.length > 0) this.set(DB_KEYS.ADVANCES, advRes.data, false);

      console.log('🔄 Data berhasil disinkronkan dari SQLite Backend');
    } catch (e) {
      console.warn('Gagal sinkronisasi data dari SQLite:', e);
    }
  },

  /**
   * Mengunggah seluruh data lokal saat ini ke SQLite backend
   */
  async pushToSQLite() {
    if (!this.isBackendConnected) return;
    try {
      const payload = {
        version: '2.0.0',
        data: {
          settings: this.get(DB_KEYS.SETTINGS),
          employees: this.get(DB_KEYS.EMPLOYEES),
          income: this.get(DB_KEYS.INCOME),
          expenses: this.get(DB_KEYS.EXPENSES),
          attendance: this.get(DB_KEYS.ATTENDANCE),
          advances: this.get(DB_KEYS.ADVANCES)
        }
      };

      const res = await fetch(`${this.apiBaseUrl}/api/db/import-json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error('Gagal push ke SQLite:', e);
    }
  },

  /**
   * Bersihkan semua data transaksi & karyawan (Reset Bersih)
   */
  clearAllData() {
    const emptyState = generateSeedData();
    Object.keys(emptyState).forEach(key => {
      if (key === DB_KEYS.SETTINGS) {
        const curr = this.get(DB_KEYS.SETTINGS);
        this.set(key, (curr && curr.outletName) ? curr : DEFAULT_SETTINGS);
      } else {
        this.set(key, []);
      }
    });

    if (this.isBackendConnected) {
      fetch(`${this.apiBaseUrl}/api/db/reset`, { method: 'POST' }).catch(console.error);
    }
    return true;
  },

  /**
   * Mengambil data berdasarkan Key (Synchronous Fast Cache)
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return key === DB_KEYS.SETTINGS ? { ...DEFAULT_SETTINGS } : [];
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Gagal mengambil data ${key}:`, e);
      return key === DB_KEYS.SETTINGS ? { ...DEFAULT_SETTINGS } : [];
    }
  },

  /**
   * Menyimpan data langsung ke Key & kirim update ke SQLite jika online
   */
  set(key, data, syncBackend = true) {
    try {
      localStorage.setItem(key, JSON.stringify(data));

      if (syncBackend && this.isBackendConnected) {
        if (key === DB_KEYS.SETTINGS) {
          fetch(`${this.apiBaseUrl}/api/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          }).catch(console.error);
        }
      }
      return true;
    } catch (e) {
      console.error(`Gagal menyimpan data ${key}:`, e);
      return false;
    }
  },

  /**
   * Menambah item baru ke koleksi array
   */
  add(key, item) {
    const list = this.get(key);
    if (!item.id) {
      const prefixMap = {
        [DB_KEYS.EMPLOYEES]: 'emp-',
        [DB_KEYS.INCOME]: 'inc-',
        [DB_KEYS.EXPENSES]: 'exp-',
        [DB_KEYS.ATTENDANCE]: 'att-',
        [DB_KEYS.ADVANCES]: 'adv-'
      };
      const prefix = prefixMap[key] || 'id-';
      item.id = prefix + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    list.unshift(item);
    this.set(key, list, false);

    // Sync ke SQLite backend API
    if (this.isBackendConnected) {
      const endpointMap = {
        [DB_KEYS.EMPLOYEES]: '/api/employees',
        [DB_KEYS.INCOME]: '/api/income',
        [DB_KEYS.EXPENSES]: '/api/expenses',
        [DB_KEYS.ATTENDANCE]: '/api/attendance',
        [DB_KEYS.ADVANCES]: '/api/advances'
      };
      const endpoint = endpointMap[key];
      if (endpoint) {
        fetch(`${this.apiBaseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        }).catch(err => console.warn(`Gagal simpan ke SQLite (${endpoint}):`, err));
      }
    }

    return item;
  },

  /**
   * Update item di koleksi array berdasarkan ID
   */
  update(key, id, updatedFields) {
    const list = this.get(key);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields, updatedAt: new Date().toISOString() };
      this.set(key, list, false);

      // Sync ke SQLite backend API
      if (this.isBackendConnected) {
        const endpointMap = {
          [DB_KEYS.EMPLOYEES]: `/api/employees/${id}`,
          [DB_KEYS.INCOME]: `/api/income/${id}`,
          [DB_KEYS.EXPENSES]: `/api/expenses/${id}`
        };
        const endpoint = endpointMap[key];
        if (endpoint) {
          fetch(`${this.apiBaseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields)
          }).catch(err => console.warn(`Gagal update ke SQLite (${endpoint}):`, err));
        }
      }

      return list[index];
    }
    return null;
  },

  /**
   * Hapus item dari koleksi array berdasarkan ID
   */
  remove(key, id) {
    const list = this.get(key);
    const filtered = list.filter(item => item.id !== id);
    this.set(key, filtered, false);

    // Sync ke SQLite backend API
    if (this.isBackendConnected) {
      const endpointMap = {
        [DB_KEYS.EMPLOYEES]: `/api/employees/${id}`,
        [DB_KEYS.INCOME]: `/api/income/${id}`,
        [DB_KEYS.EXPENSES]: `/api/expenses/${id}`,
        [DB_KEYS.ATTENDANCE]: `/api/attendance/${id}`,
        [DB_KEYS.ADVANCES]: `/api/advances/${id}`
      };
      const endpoint = endpointMap[key];
      if (endpoint) {
        fetch(`${this.apiBaseUrl}${endpoint}`, { method: 'DELETE' })
          .catch(err => console.warn(`Gagal delete di SQLite (${endpoint}):`, err));
      }
    }

    return true;
  },

  /**
   * Ambil item tunggal berdasarkan ID
   */
  getById(key, id) {
    const list = this.get(key);
    return list.find(item => item.id === id) || null;
  },

  /**
   * Export seluruh database ke file JSON Backup
   */
  backup() {
    const fullData = {
      version: '2.0.0',
      appName: 'KebabRizkiFinance',
      databaseEngine: this.isBackendConnected ? 'SQLite 3 (kebab_rizki.db)' : 'LocalStorage Cache',
      backupDate: new Date().toISOString(),
      data: {
        settings: this.get(DB_KEYS.SETTINGS),
        employees: this.get(DB_KEYS.EMPLOYEES),
        income: this.get(DB_KEYS.INCOME),
        expenses: this.get(DB_KEYS.EXPENSES),
        attendance: this.get(DB_KEYS.ATTENDANCE),
        advances: this.get(DB_KEYS.ADVANCES)
      }
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `kebab-backup-${dateStr}.json`;
    const jsonStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return filename;
  },

  /**
   * Restore database dari konten string JSON
   */
  restore(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        throw new Error('Format file backup tidak valid! Objek data tidak ditemukan.');
      }

      if (parsed.data.settings) this.set(DB_KEYS.SETTINGS, parsed.data.settings, false);
      if (parsed.data.employees) this.set(DB_KEYS.EMPLOYEES, parsed.data.employees, false);
      if (parsed.data.income) this.set(DB_KEYS.INCOME, parsed.data.income, false);
      if (parsed.data.expenses) this.set(DB_KEYS.EXPENSES, parsed.data.expenses, false);
      if (parsed.data.attendance) this.set(DB_KEYS.ATTENDANCE, parsed.data.attendance, false);
      if (parsed.data.advances) this.set(DB_KEYS.ADVANCES, parsed.data.advances, false);

      if (this.isBackendConnected) {
        fetch(`${this.apiBaseUrl}/api/db/import-json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        }).catch(console.error);
      }

      return { success: true, message: 'Data berhasil dipulihkan 100% dan tersimpan permanen!' };
    } catch (e) {
      console.error('Gagal restore data:', e);
      return { success: false, message: e.message || 'File JSON rusak atau tidak kompatibel.' };
    }
  },

  /**
   * Reset database kembali ke seed data demo
   */
  resetDemo() {
    const seed = generateSeedData();
    Object.keys(seed).forEach(key => {
      this.set(key, seed[key]);
    });
    return true;
  },

  /**
   * Helper Hapus Data Kehadiran per ID
   */
  deleteAttendance(id) {
    return this.remove(DB_KEYS.ATTENDANCE, id);
  },

  /**
   * Helper Hapus Semua Data Kehadiran pada Tanggal Tertentu (format: 'YYYY-MM-DD')
   */
  deleteAttendanceByDate(date) {
    const all = this.get(DB_KEYS.ATTENDANCE);
    const filtered = all.filter(a => a.date !== date);
    this.set(DB_KEYS.ATTENDANCE, filtered);

    if (this.isBackendConnected) {
      fetch(`${this.apiBaseUrl}/api/attendance/by-date/${date}`, { method: 'DELETE' }).catch(console.error);
    }
    return true;
  },

  /**
   * Helper Hapus Semua Data Kehadiran pada Bulan Tertentu (format: 'YYYY-MM')
   */
  deleteAttendanceByMonth(periodMonth) {
    const all = this.get(DB_KEYS.ATTENDANCE);
    const filtered = all.filter(a => !(a.date && a.date.startsWith(periodMonth)));
    this.set(DB_KEYS.ATTENDANCE, filtered);

    if (this.isBackendConnected) {
      fetch(`${this.apiBaseUrl}/api/attendance/by-month/${periodMonth}`, { method: 'DELETE' }).catch(console.error);
    }
    return true;
  },

  /**
   * Helper Hapus Data Kehadiran Karyawan Tertentu (Bisa dibatasi per bulan)
   */
  deleteEmployeeAttendance(employeeId, periodMonth = null) {
    const all = this.get(DB_KEYS.ATTENDANCE);
    const filtered = all.filter(a => {
      if (a.employeeId !== employeeId) return true;
      if (periodMonth && a.date && !a.date.startsWith(periodMonth)) return true;
      return false;
    });
    this.set(DB_KEYS.ATTENDANCE, filtered);

    if (this.isBackendConnected) {
      const url = periodMonth 
        ? `${this.apiBaseUrl}/api/attendance/by-employee/${employeeId}?month=${periodMonth}`
        : `${this.apiBaseUrl}/api/attendance/by-employee/${employeeId}`;
      fetch(url, { method: 'DELETE' }).catch(console.error);
    }
    return true;
  },

  /**
   * Helper Bersihkan Seluruh Data Kehadiran (Reset Kosong)
   */
  clearAttendanceData() {
    this.set(DB_KEYS.ATTENDANCE, []);
    return true;
  },

  /**
   * Helper Hitung Kehadiran Karyawan pada Periode Bulan (format: 'YYYY-MM')
   */
  getEmployeeAttendanceSummary(employeeId, periodMonth) {
    const allAttendance = this.get(DB_KEYS.ATTENDANCE);
    const filtered = allAttendance.filter(a => a.employeeId === employeeId && a.date.startsWith(periodMonth));

    const summary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
      libur: 0,
      lembur: 0,
      totalHari: filtered.length
    };

    filtered.forEach(item => {
      if (summary[item.status] !== undefined) {
        summary[item.status]++;
      }
      if (item.isOvertime === true || item.isOvertime === 'true' || item.status === 'lembur') {
        summary.lembur++;
      }
    });

    return summary;
  },

  /**
   * Helper Hitung Kasbon / Potongan Karyawan pada Periode Bulan
   */
  getEmployeeAdvances(employeeId, periodMonth) {
    const advances = this.get(DB_KEYS.ADVANCES);
    return advances.filter(a => a.employeeId === employeeId && a.date.startsWith(periodMonth));
  },

  /**
   * Helper Hitung Bonus / Insentif Target Karyawan
   * Aturan: Saat omzet tembus di atas target harian, kelebihannya dibagikan ke karyawan yang hadir
   */
  calculateEmployeeIncentive(employeeId, periodMonth) {
    const settings = this.get(DB_KEYS.SETTINGS);
    const dailyTarget = Number(settings.dailyTarget || 300000);
    const incentivePercent = Number(settings.incentivePercent || 10);
    const incentiveRate = incentivePercent / 100;

    const allIncome = this.get(DB_KEYS.INCOME) || [];
    const allAttendance = this.get(DB_KEYS.ATTENDANCE) || [];
    const allEmployees = this.get(DB_KEYS.EMPLOYEES) || [];

    const monthIncome = allIncome.filter(i => i.date && i.date.startsWith(periodMonth));
    const monthAttendance = allAttendance.filter(a => a.date && a.date.startsWith(periodMonth));

    // Agregasi omzet harian
    const dailyIncomeMap = {};
    monthIncome.forEach(inc => {
      dailyIncomeMap[inc.date] = (dailyIncomeMap[inc.date] || 0) + Number(inc.amount || 0);
    });

    let totalBonus = 0;
    let qualifiedDays = 0;
    let totalOutletSurplus = 0;
    let totalOutletBonusPool = 0;
    const dayDetails = [];

    Object.keys(dailyIncomeMap).sort().forEach(date => {
      const dayOmzet = dailyIncomeMap[date];
      if (dayOmzet > dailyTarget) {
        const surplus = dayOmzet - dailyTarget;
        const pool = surplus * incentiveRate;
        totalOutletSurplus += surplus;
        totalOutletBonusPool += pool;

        // Cek presensi karyawan yang hadir pada tanggal ini
        const attendees = monthAttendance.filter(a => a.date === date && a.status === 'hadir');
        const isPresent = attendees.some(a => a.employeeId === employeeId);

        if (attendees.length > 0) {
          if (isPresent) {
            const share = Math.round(pool / attendees.length);
            totalBonus += share;
            qualifiedDays++;
            dayDetails.push({
              date,
              dayOmzet,
              surplus,
              pool,
              share,
              attendeesCount: attendees.length
            });
          }
        } else {
          // Jika absensi belum dicatat untuk hari itu, bagi rata antar karyawan aktif
          const activeEmps = allEmployees.filter(e => e.status === 'active');
          const isEmpActive = allEmployees.some(e => e.id === employeeId && e.status === 'active');
          if (isEmpActive) {
            const count = Math.max(1, activeEmps.length);
            const share = Math.round(pool / count);
            totalBonus += share;
            qualifiedDays++;
            dayDetails.push({
              date,
              dayOmzet,
              surplus,
              pool,
              share,
              attendeesCount: count
            });
          }
        }
      }
    });

    return {
      totalBonus,
      qualifiedDays,
      dailyTarget,
      incentivePercent,
      totalOutletSurplus,
      totalOutletBonusPool,
      dayDetails
    };
  },

  /**
   * Helper Hitung Total Bonus Insentif Outlet di Suatu Bulan
   */
  calculateMonthlyOutletBonus(periodMonth) {
    const settings = this.get(DB_KEYS.SETTINGS);
    const dailyTarget = Number(settings.dailyTarget || 300000);
    const incentivePercent = Number(settings.incentivePercent || 10);
    const incentiveRate = incentivePercent / 100;

    const allIncome = this.get(DB_KEYS.INCOME) || [];
    const monthIncome = allIncome.filter(i => i.date && i.date.startsWith(periodMonth));

    const dailyIncomeMap = {};
    monthIncome.forEach(inc => {
      dailyIncomeMap[inc.date] = (dailyIncomeMap[inc.date] || 0) + Number(inc.amount || 0);
    });

    let totalBonusPool = 0;
    let totalSurplus = 0;
    let qualifiedDays = 0;

    Object.keys(dailyIncomeMap).forEach(date => {
      const dayOmzet = dailyIncomeMap[date];
      if (dayOmzet > dailyTarget) {
        const surplus = dayOmzet - dailyTarget;
        const pool = surplus * incentiveRate;
        totalSurplus += surplus;
        totalBonusPool += pool;
        qualifiedDays++;
      }
    });

    return {
      totalBonusPool: Math.round(totalBonusPool),
      totalSurplus: Math.round(totalSurplus),
      qualifiedDays,
      dailyTarget,
      incentivePercent
    };
  }
};

// Export ke window agar mudah diakses di seluruh file tanpa bundler
window.DB = DB;
window.DB_KEYS = DB_KEYS;
