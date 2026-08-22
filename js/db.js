/**
 * db.js - LocalStorage Database Engine untuk Kebab Rizki (kebab-finance)
 * Mengelola penyimpanan lokal yang aman, cepat, dan permanen di browser.
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

const DB = {
  /**
   * Inisialisasi Database LocalStorage.
   * Menjamin semua key tersedia tanpa pernah menghapus data pengguna yang sudah tersimpan.
   */
  init() {
    try {
      if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        this.set(DB_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
      if (!localStorage.getItem(DB_KEYS.EMPLOYEES)) {
        this.set(DB_KEYS.EMPLOYEES, []);
      }
      if (!localStorage.getItem(DB_KEYS.INCOME)) {
        this.set(DB_KEYS.INCOME, []);
      }
      if (!localStorage.getItem(DB_KEYS.EXPENSES)) {
        this.set(DB_KEYS.EXPENSES, []);
      }
      if (!localStorage.getItem(DB_KEYS.ATTENDANCE)) {
        this.set(DB_KEYS.ATTENDANCE, []);
      }
      if (!localStorage.getItem(DB_KEYS.ADVANCES)) {
        this.set(DB_KEYS.ADVANCES, []);
      }
    } catch (e) {
      console.error('LocalStorage tidak dapat diakses:', e);
    }
  },

  /**
   * Bersihkan semua data transaksi & karyawan secara manual atas permintaan pengguna
   */
  clearAllData() {
    const curr = this.get(DB_KEYS.SETTINGS);
    this.set(DB_KEYS.SETTINGS, (curr && curr.outletName) ? curr : DEFAULT_SETTINGS);
    this.set(DB_KEYS.EMPLOYEES, []);
    this.set(DB_KEYS.INCOME, []);
    this.set(DB_KEYS.EXPENSES, []);
    this.set(DB_KEYS.ATTENDANCE, []);
    this.set(DB_KEYS.ADVANCES, []);
    return true;
  },

  /**
   * Mengambil data berdasarkan Key
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
   * Menyimpan data langsung ke Key
   */
  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
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
    this.set(key, list);
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
      this.set(key, list);
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
    this.set(key, filtered);
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
      version: '2.1.0',
      appName: 'KebabRizkiFinance',
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

      if (parsed.data.settings) this.set(DB_KEYS.SETTINGS, parsed.data.settings);
      if (Array.isArray(parsed.data.employees)) this.set(DB_KEYS.EMPLOYEES, parsed.data.employees);
      if (Array.isArray(parsed.data.income)) this.set(DB_KEYS.INCOME, parsed.data.income);
      if (Array.isArray(parsed.data.expenses)) this.set(DB_KEYS.EXPENSES, parsed.data.expenses);
      if (Array.isArray(parsed.data.attendance)) this.set(DB_KEYS.ATTENDANCE, parsed.data.attendance);
      if (Array.isArray(parsed.data.advances)) this.set(DB_KEYS.ADVANCES, parsed.data.advances);

      return { success: true, message: 'Data berhasil dipulihkan 100% dan tersimpan permanen!' };
    } catch (e) {
      console.error('Gagal restore data:', e);
      return { success: false, message: e.message || 'File JSON rusak atau tidak kompatibel.' };
    }
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
    return true;
  },

  /**
   * Helper Hapus Semua Data Kehadiran pada Bulan Tertentu (format: 'YYYY-MM')
   */
  deleteAttendanceByMonth(periodMonth) {
    const all = this.get(DB_KEYS.ATTENDANCE);
    const filtered = all.filter(a => !(a.date && a.date.startsWith(periodMonth)));
    this.set(DB_KEYS.ATTENDANCE, filtered);
    return true;
  },

  /**
   * Helper Hapus Data Kehadiran Karyawan Tertentu
   */
  deleteEmployeeAttendance(employeeId, periodMonth = null) {
    const all = this.get(DB_KEYS.ATTENDANCE);
    const filtered = all.filter(a => {
      if (a.employeeId !== employeeId) return true;
      if (periodMonth && a.date && !a.date.startsWith(periodMonth)) return true;
      return false;
    });
    this.set(DB_KEYS.ATTENDANCE, filtered);
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

// Export ke window
window.DB = DB;
window.DB_KEYS = DB_KEYS;
