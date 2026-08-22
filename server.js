/**
 * server.js - Express Web Server & SQLite REST API untuk Kebab Rizki
 * Port: 3000 (Default)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase, DBRepository, DB_PATH } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Sajikan file statis (Frontend SPA & Panel Database)
app.use(express.static(path.join(__dirname)));

// Log Request Sederhana
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// =============================================================================
// REST API ROUTES
// =============================================================================

// 1. Status Koneksi & Database
app.get('/api/status', async (req, res) => {
  try {
    const status = await DBRepository.getSystemStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Settings (Pengaturan Outlet)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await DBRepository.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const updated = await DBRepository.updateSettings(req.body);
    res.json({ success: true, data: updated, message: 'Pengaturan berhasil diperbarui di SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Employees (Master Karyawan)
app.get('/api/employees', async (req, res) => {
  try {
    const data = await DBRepository.getEmployees();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const emp = await DBRepository.getEmployeeById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const created = await DBRepository.createEmployee(req.body);
    res.json({ success: true, data: created, message: 'Karyawan berhasil ditambahkan ke SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const updated = await DBRepository.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Data karyawan diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await DBRepository.deleteEmployee(req.params.id);
    res.json({ success: true, message: 'Karyawan berhasil dihapus dari SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Income (Pemasukan / Omzet Kasir)
app.get('/api/income', async (req, res) => {
  try {
    const data = await DBRepository.getIncome();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const created = await DBRepository.createIncome(req.body);
    res.json({ success: true, data: created, message: 'Pemasukan tersimpan ke SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/income/:id', async (req, res) => {
  try {
    const updated = await DBRepository.updateIncome(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Pemasukan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/income/:id', async (req, res) => {
  try {
    await DBRepository.deleteIncome(req.params.id);
    res.json({ success: true, message: 'Pemasukan dihapus dari SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Expenses (Pengeluaran / Belanja)
app.get('/api/expenses', async (req, res) => {
  try {
    const data = await DBRepository.getExpenses();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const created = await DBRepository.createExpense(req.body);
    res.json({ success: true, data: created, message: 'Pengeluaran tersimpan ke SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await DBRepository.updateExpense(req.params.id, req.body);
    res.json({ success: true, data: updated, message: 'Pengeluaran diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await DBRepository.deleteExpense(req.params.id);
    res.json({ success: true, message: 'Pengeluaran dihapus dari SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Attendance (Presensi Kehadiran)
app.get('/api/attendance', async (req, res) => {
  try {
    const data = await DBRepository.getAttendance();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const created = await DBRepository.createAttendance(req.body);
    res.json({ success: true, data: created, message: 'Presensi tersimpan ke SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    await DBRepository.deleteAttendance(req.params.id);
    res.json({ success: true, message: 'Presensi dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/attendance/by-date/:date', async (req, res) => {
  try {
    await DBRepository.deleteAttendanceByDate(req.params.date);
    res.json({ success: true, message: `Presensi tanggal ${req.params.date} dihapus` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/attendance/by-month/:month', async (req, res) => {
  try {
    await DBRepository.deleteAttendanceByMonth(req.params.month);
    res.json({ success: true, message: `Presensi bulan ${req.params.month} dihapus` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/attendance/by-employee/:employeeId', async (req, res) => {
  try {
    const month = req.query.month || null;
    await DBRepository.deleteEmployeeAttendance(req.params.employeeId, month);
    res.json({ success: true, message: 'Presensi karyawan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Advances (Kasbon & Potongan)
app.get('/api/advances', async (req, res) => {
  try {
    const data = await DBRepository.getAdvances();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/advances', async (req, res) => {
  try {
    const created = await DBRepository.createAdvance(req.body);
    res.json({ success: true, data: created, message: 'Kasbon/Potongan tersimpan ke SQLite' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/advances/:id', async (req, res) => {
  try {
    await DBRepository.deleteAdvance(req.params.id);
    res.json({ success: true, message: 'Kasbon berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// DATABASE MANAGEMENT API (PANEL AKSES DATABASE)
// =============================================================================

// List tabel & skema
app.get('/api/db/tables', async (req, res) => {
  try {
    const tables = await DBRepository.getTables();
    res.json({ success: true, tables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lihat data baris per tabel
app.get('/api/db/table/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    const data = await DBRepository.getTableData(name, page, limit, search);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Eksekusi Raw SQL Query (SQL Console di Panel Akses)
app.post('/api/db/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, error: 'Query SQL tidak boleh kosong' });

    const result = await DBRepository.executeQuery(query);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Download Langsung File Database .db
app.get('/api/db/export-db', (req, res) => {
  if (fs.existsSync(DB_PATH)) {
    res.download(DB_PATH, 'kebab_rizki.db', (err) => {
      if (err) {
        console.error('Error saat download db:', err);
      }
    });
  } else {
    res.status(404).json({ success: false, error: 'File database belum dibuat.' });
  }
});

// Backup Full Format JSON
app.get('/api/db/backup-json', async (req, res) => {
  try {
    const backup = await DBRepository.exportFullBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=kebab-sqlite-backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Import Full Format JSON ke SQLite
app.post('/api/db/import-json', async (req, res) => {
  try {
    const result = await DBRepository.importFullBackup(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Database Bersih
app.post('/api/db/reset', async (req, res) => {
  try {
    const result = await DBRepository.resetDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Optimasi Database (VACUUM)
app.post('/api/db/vacuum', async (req, res) => {
  try {
    const result = await DBRepository.vacuumDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all: Route ke index.html untuk Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inisialisasi Database & Start Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
============================================================
🌯 KEBAB RIZKI - SISTEM KASIR & OPERASIONAL OUTLET
============================================================
🚀 Server Berjalan di:       http://localhost:${PORT}
🗄️  Panel Akses Database:    http://localhost:${PORT}/panel-database.html
📁 File Database SQLite:     ${DB_PATH}
============================================================
    `);
  });
}).catch(err => {
  console.error('❌ Gagal menjalankan server:', err);
});
