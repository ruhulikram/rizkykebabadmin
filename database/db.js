/**
 * database/db.js - SQLite Database Driver & API Layer
 * Mengelola koneksi SQLite3, inisialisasi tabel, dan fungsi CRUD asinkron.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'kebab_rizki.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;

function getDB() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Gagal membuka database SQLite:', err.message);
      } else {
        console.log(`✅ Terhubung ke database SQLite: ${DB_PATH}`);
      }
    });
    dbInstance.run('PRAGMA foreign_keys = ON');
    dbInstance.run('PRAGMA journal_mode = WAL');
  }
  return dbInstance;
}

// Helper Async untuk SQLite Query
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function dbExec(sql) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

/**
 * Inisialisasi Skema & Default Data
 */
async function initDatabase() {
  try {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await dbExec(schemaSql);

    // Inisialisasi default settings jika belum ada
    const existingSettings = await dbGet('SELECT * FROM settings WHERE id = 1');
    if (!existingSettings) {
      await dbRun(`
        INSERT INTO settings (
          id, outlet_name, tagline, address, phone, owner_name, 
          currency, target_monthly_income, daily_target, incentive_percent, 
          overtime_rate, logo_emoji
        ) VALUES (
          1, 'Kebab Rizki', 'Porsi Jumbo, Rasa Juara, Selalu Segar!',
          'Jl. Ahmad Yani No. 88, Gerai Ruko Depan Sentra Kuliner',
          '0812-3456-7890', 'Rizki Pratama', 'IDR', 35000000, 300000, 10, 70000, '🌯'
        )
      `);
      console.log('📌 Default settings initialized in SQLite');
    }

    console.log('🚀 Database SQLite Kebab Rizki siap digunakan!');
  } catch (err) {
    console.error('❌ Error saat inisialisasi skema database:', err);
    throw err;
  }
}

/**
 * Konversi nama kolom camelCase <-> snake_case untuk kompatibilitas frontend
 */
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  const newObj = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
}

function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
}

// =============================================================================
// DATABASE REPOSITORY METHODS
// =============================================================================

const DBRepository = {
  getDBPath: () => DB_PATH,

  // --- SETTINGS ---
  async getSettings() {
    const row = await dbGet('SELECT * FROM settings WHERE id = 1');
    return toCamelCase(row) || null;
  },

  async updateSettings(data) {
    const s = toSnakeCase(data);
    await dbRun(`
      UPDATE settings SET
        outlet_name = COALESCE(?, outlet_name),
        tagline = COALESCE(?, tagline),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        owner_name = COALESCE(?, owner_name),
        currency = COALESCE(?, currency),
        target_monthly_income = COALESCE(?, target_monthly_income),
        daily_target = COALESCE(?, daily_target),
        incentive_percent = COALESCE(?, incentive_percent),
        overtime_rate = COALESCE(?, overtime_rate),
        logo_emoji = COALESCE(?, logo_emoji),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      s.outlet_name, s.tagline, s.address, s.phone, s.owner_name,
      s.currency, s.target_monthly_income, s.daily_target, s.incentive_percent,
      s.overtime_rate, s.logo_emoji
    ]);
    return this.getSettings();
  },

  // --- EMPLOYEES ---
  async getEmployees() {
    const rows = await dbAll('SELECT * FROM employees ORDER BY created_at DESC');
    return toCamelCase(rows);
  },

  async getEmployeeById(id) {
    const row = await dbGet('SELECT * FROM employees WHERE id = ?', [id]);
    return toCamelCase(row);
  },

  async createEmployee(data) {
    const id = data.id || `emp-${Date.now()}`;
    await dbRun(`
      INSERT INTO employees (id, name, role, phone, daily_wage, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.name,
      data.role || 'Kru Outlet',
      data.phone || '',
      Number(data.dailyWage || data.daily_wage || 0),
      data.status || 'active',
      data.createdAt || new Date().toISOString()
    ]);
    return this.getEmployeeById(id);
  },

  async updateEmployee(id, data) {
    const current = await this.getEmployeeById(id);
    if (!current) return null;

    await dbRun(`
      UPDATE employees SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        phone = COALESCE(?, phone),
        daily_wage = COALESCE(?, daily_wage),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.name !== undefined ? data.name : current.name,
      data.role !== undefined ? data.role : current.role,
      data.phone !== undefined ? data.phone : current.phone,
      data.dailyWage !== undefined ? Number(data.dailyWage) : (data.daily_wage !== undefined ? Number(data.daily_wage) : current.dailyWage),
      data.status !== undefined ? data.status : current.status,
      id
    ]);
    return this.getEmployeeById(id);
  },

  async deleteEmployee(id) {
    return await dbRun('DELETE FROM employees WHERE id = ?', [id]);
  },

  // --- INCOME (PEMASUKAN) ---
  async getIncome() {
    const rows = await dbAll('SELECT * FROM income ORDER BY date DESC, created_at DESC');
    return toCamelCase(rows);
  },

  async getIncomeById(id) {
    const row = await dbGet('SELECT * FROM income WHERE id = ?', [id]);
    return toCamelCase(row);
  },

  async createIncome(data) {
    const id = data.id || `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await dbRun(`
      INSERT INTO income (id, date, time, amount, portions, menu, payment_method, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.date,
      data.time || '',
      Number(data.amount || 0),
      Number(data.portions || 1),
      data.menu || 'Kebab Standar',
      data.paymentMethod || data.payment_method || 'Tunai',
      data.notes || '',
      data.createdAt || new Date().toISOString()
    ]);
    return this.getIncomeById(id);
  },

  async updateIncome(id, data) {
    const current = await this.getIncomeById(id);
    if (!current) return null;

    await dbRun(`
      UPDATE income SET
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        amount = COALESCE(?, amount),
        portions = COALESCE(?, portions),
        menu = COALESCE(?, menu),
        payment_method = COALESCE(?, payment_method),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.date !== undefined ? data.date : current.date,
      data.time !== undefined ? data.time : current.time,
      data.amount !== undefined ? Number(data.amount) : current.amount,
      data.portions !== undefined ? Number(data.portions) : current.portions,
      data.menu !== undefined ? data.menu : current.menu,
      (data.paymentMethod || data.payment_method) !== undefined ? (data.paymentMethod || data.payment_method) : current.paymentMethod,
      data.notes !== undefined ? data.notes : current.notes,
      id
    ]);
    return this.getIncomeById(id);
  },

  async deleteIncome(id) {
    return await dbRun('DELETE FROM income WHERE id = ?', [id]);
  },

  // --- EXPENSES (PENGELUARAN) ---
  async getExpenses() {
    const rows = await dbAll('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');
    return toCamelCase(rows);
  },

  async getExpenseById(id) {
    const row = await dbGet('SELECT * FROM expenses WHERE id = ?', [id]);
    return toCamelCase(row);
  },

  async createExpense(data) {
    const id = data.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await dbRun(`
      INSERT INTO expenses (id, date, amount, category, description, payment_method, receipt_no, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.date,
      Number(data.amount || 0),
      data.category || 'Bahan Baku',
      data.description || '',
      data.paymentMethod || data.payment_method || 'Tunai',
      data.receiptNo || data.receipt_no || '',
      data.notes || '',
      data.createdAt || new Date().toISOString()
    ]);
    return this.getExpenseById(id);
  },

  async updateExpense(id, data) {
    const current = await this.getExpenseById(id);
    if (!current) return null;

    await dbRun(`
      UPDATE expenses SET
        date = COALESCE(?, date),
        amount = COALESCE(?, amount),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        payment_method = COALESCE(?, payment_method),
        receipt_no = COALESCE(?, receipt_no),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      data.date !== undefined ? data.date : current.date,
      data.amount !== undefined ? Number(data.amount) : current.amount,
      data.category !== undefined ? data.category : current.category,
      data.description !== undefined ? data.description : current.description,
      (data.paymentMethod || data.payment_method) !== undefined ? (data.paymentMethod || data.payment_method) : current.paymentMethod,
      (data.receiptNo || data.receipt_no) !== undefined ? (data.receiptNo || data.receipt_no) : current.receiptNo,
      data.notes !== undefined ? data.notes : current.notes,
      id
    ]);
    return this.getExpenseById(id);
  },

  async deleteExpense(id) {
    return await dbRun('DELETE FROM expenses WHERE id = ?', [id]);
  },

  // --- ATTENDANCE (KEHADIRAN) ---
  async getAttendance() {
    const rows = await dbAll('SELECT * FROM attendance ORDER BY date DESC, created_at DESC');
    return rows.map(r => ({
      ...toCamelCase(r),
      isOvertime: Boolean(r.is_overtime)
    }));
  },

  async createAttendance(data) {
    const id = data.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isOvertime = (data.isOvertime === true || data.isOvertime === 'true' || data.is_overtime === 1) ? 1 : 0;
    
    // Hapus presensi lama karyawan pada hari yang sama jika ada (replace)
    await dbRun('DELETE FROM attendance WHERE employee_id = ? AND date = ?', [data.employeeId || data.employee_id, data.date]);

    await dbRun(`
      INSERT INTO attendance (id, employee_id, date, status, is_overtime, check_in, check_out, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.employeeId || data.employee_id,
      data.date,
      data.status || 'hadir',
      isOvertime,
      data.checkIn || data.check_in || '',
      data.checkOut || data.check_out || '',
      data.notes || '',
      data.createdAt || new Date().toISOString()
    ]);

    const row = await dbGet('SELECT * FROM attendance WHERE id = ?', [id]);
    return { ...toCamelCase(row), isOvertime: Boolean(row.is_overtime) };
  },

  async deleteAttendance(id) {
    return await dbRun('DELETE FROM attendance WHERE id = ?', [id]);
  },

  async deleteAttendanceByDate(date) {
    return await dbRun('DELETE FROM attendance WHERE date = ?', [date]);
  },

  async deleteAttendanceByMonth(periodMonth) {
    return await dbRun('DELETE FROM attendance WHERE date LIKE ?', [`${periodMonth}%`]);
  },

  async deleteEmployeeAttendance(employeeId, periodMonth = null) {
    if (periodMonth) {
      return await dbRun('DELETE FROM attendance WHERE employee_id = ? AND date LIKE ?', [employeeId, `${periodMonth}%`]);
    }
    return await dbRun('DELETE FROM attendance WHERE employee_id = ?', [employeeId]);
  },

  // --- ADVANCES (KASBON / POTONGAN) ---
  async getAdvances() {
    const rows = await dbAll('SELECT * FROM advances ORDER BY date DESC, created_at DESC');
    return toCamelCase(rows);
  },

  async createAdvance(data) {
    const id = data.id || `adv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await dbRun(`
      INSERT INTO advances (id, employee_id, date, amount, type, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.employeeId || data.employee_id,
      data.date,
      Number(data.amount || 0),
      data.type || 'kasbon',
      data.description || '',
      data.status || 'pending',
      data.createdAt || new Date().toISOString()
    ]);

    const row = await dbGet('SELECT * FROM advances WHERE id = ?', [id]);
    return toCamelCase(row);
  },

  async deleteAdvance(id) {
    return await dbRun('DELETE FROM advances WHERE id = ?', [id]);
  },

  // --- DATABASE ADMIN & QUERY TOOLS ---
  async getSystemStatus() {
    let fileSize = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        const stat = fs.statSync(DB_PATH);
        fileSize = stat.size;
      }
    } catch (e) {
      console.error(e);
    }

    const tables = ['settings', 'employees', 'income', 'expenses', 'attendance', 'advances'];
    const counts = {};
    for (const t of tables) {
      try {
        const res = await dbGet(`SELECT count(*) as total FROM ${t}`);
        counts[t] = res.total;
      } catch (e) {
        counts[t] = 0;
      }
    }

    const sqliteVer = await dbGet('SELECT sqlite_version() as version');

    return {
      status: 'online',
      engine: 'SQLite 3 (WAL Mode)',
      version: sqliteVer ? sqliteVer.version : '3.x',
      dbPath: DB_PATH,
      fileSizeBytes: fileSize,
      fileSizeFormatted: (fileSize / 1024).toFixed(2) + ' KB',
      tableCounts: counts,
      totalRecords: Object.values(counts).reduce((a, b) => a + b, 0)
    };
  },

  async getTables() {
    const rows = await dbAll(`
      SELECT name, type 
      FROM sqlite_master 
      WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    const result = [];
    for (const row of rows) {
      const countRes = await dbGet(`SELECT count(*) as total FROM ${row.name}`);
      const columns = await dbAll(`PRAGMA table_info(${row.name})`);
      result.push({
        name: row.name,
        type: row.type,
        totalRows: countRes ? countRes.total : 0,
        columns: columns.map(c => ({
          cid: c.cid,
          name: c.name,
          type: c.type,
          notnull: c.notnull === 1,
          defaultValue: c.dflt_value,
          pk: c.pk === 1
        }))
      });
    }
    return result;
  },

  async getTableData(tableName, page = 1, limit = 50, search = '') {
    // Validasi nama tabel mencegah SQL injection
    const allowed = ['settings', 'employees', 'income', 'expenses', 'attendance', 'advances'];
    if (!allowed.includes(tableName)) {
      throw new Error(`Tabel "${tableName}" tidak diizinkan atau tidak ditemukan.`);
    }

    const offset = (Math.max(1, page) - 1) * limit;
    const countRes = await dbGet(`SELECT count(*) as total FROM ${tableName}`);
    const rows = await dbAll(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [limit, offset]);
    const columns = await dbAll(`PRAGMA table_info(${tableName})`);

    return {
      tableName,
      page: Number(page),
      limit: Number(limit),
      totalRows: countRes.total,
      totalPages: Math.ceil(countRes.total / limit),
      columns: columns.map(c => c.name),
      rows
    };
  },

  async executeQuery(query) {
    const startTime = Date.now();
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) throw new Error('Query SQL tidak boleh kosong.');

    const isSelect = /^SELECT\b/i.test(cleanQuery) || /^PRAGMA\b/i.test(cleanQuery) || /^EXPLAIN\b/i.test(cleanQuery);

    if (isSelect) {
      const rows = await dbAll(cleanQuery);
      const executionTimeMs = Date.now() - startTime;
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      return {
        type: 'SELECT',
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs
      };
    } else {
      const res = await dbRun(cleanQuery);
      const executionTimeMs = Date.now() - startTime;
      return {
        type: 'MUTATION',
        changes: res.changes,
        lastID: res.lastID,
        executionTimeMs,
        message: `Query berhasil dieksekusi. ${res.changes} baris terpengaruh.`
      };
    }
  },

  async exportFullBackup() {
    const settings = await this.getSettings();
    const employees = await this.getEmployees();
    const income = await this.getIncome();
    const expenses = await this.getExpenses();
    const attendance = await this.getAttendance();
    const advances = await this.getAdvances();

    return {
      version: '2.0.0',
      database: 'SQLite 3',
      appName: 'KebabRizkiFinance',
      backupDate: new Date().toISOString(),
      data: {
        settings,
        employees,
        income,
        expenses,
        attendance,
        advances
      }
    };
  },

  async importFullBackup(fullData) {
    if (!fullData || !fullData.data) {
      throw new Error('Format data backup tidak valid.');
    }

    const { settings, employees, income, expenses, attendance, advances } = fullData.data;

    await dbExec('BEGIN TRANSACTION');
    try {
      // Clear data lama
      await dbRun('DELETE FROM attendance');
      await dbRun('DELETE FROM advances');
      await dbRun('DELETE FROM income');
      await dbRun('DELETE FROM expenses');
      await dbRun('DELETE FROM employees');

      // 1. Settings
      if (settings) {
        await this.updateSettings(settings);
      }

      // 2. Employees
      if (Array.isArray(employees)) {
        for (const emp of employees) {
          await this.createEmployee(emp);
        }
      }

      // 3. Income
      if (Array.isArray(income)) {
        for (const inc of income) {
          await this.createIncome(inc);
        }
      }

      // 4. Expenses
      if (Array.isArray(expenses)) {
        for (const exp of expenses) {
          await this.createExpense(exp);
        }
      }

      // 5. Attendance
      if (Array.isArray(attendance)) {
        for (const att of attendance) {
          await this.createAttendance(att);
        }
      }

      // 6. Advances
      if (Array.isArray(advances)) {
        for (const adv of advances) {
          await this.createAdvance(adv);
        }
      }

      await dbExec('COMMIT');
      return { success: true, message: 'Restore database SQLite sukses!' };
    } catch (e) {
      await dbExec('ROLLBACK');
      throw e;
    }
  },

  async resetDatabase() {
    await dbExec(`
      DELETE FROM attendance;
      DELETE FROM advances;
      DELETE FROM income;
      DELETE FROM expenses;
      DELETE FROM employees;
      VACUUM;
    `);
    return { success: true, message: 'Database SQLite berhasil di-reset bersih!' };
  },

  async vacuumDatabase() {
    await dbExec('VACUUM');
    return { success: true, message: 'Database SQLite berhasil di-optimasi (VACUUM)!' };
  }
};

module.exports = {
  getDB,
  initDatabase,
  DBRepository,
  DB_PATH
};
