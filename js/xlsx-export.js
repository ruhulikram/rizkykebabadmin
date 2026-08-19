/**
 * xlsx-export.js - Generator Laporan Keuangan Excel (.xlsx) menggunakan SheetJS
 * Menghasilkan workbook multi-sheet lengkap untuk pembukuan Kebab Rizki
 */

const XLSXExport = {
  /**
   * Export Laporan Keuangan ke Excel
   * @param {Object} options - Filter periode (startDate, endDate, periodMonth)
   */
  exportFinancialReport(options = {}) {
    if (!window.XLSX) {
      alert('Library SheetJS (xlsx) belum termuat. Periksa koneksi internet Anda.');
      return;
    }

    const settings = DB.get(DB_KEYS.SETTINGS);
    const allIncome = DB.get(DB_KEYS.INCOME);
    const allExpenses = DB.get(DB_KEYS.EXPENSES);
    const allEmployees = DB.get(DB_KEYS.EMPLOYEES);

    // Filter berdasarkan rentang tanggal jika diberikan
    let filteredIncome = allIncome;
    let filteredExpenses = allExpenses;

    if (options.startDate && options.endDate) {
      filteredIncome = allIncome.filter(i => i.date >= options.startDate && i.date <= options.endDate);
      filteredExpenses = allExpenses.filter(e => e.date >= options.startDate && e.date <= options.endDate);
    } else if (options.periodMonth) {
      filteredIncome = allIncome.filter(i => i.date.startsWith(options.periodMonth));
      filteredExpenses = allExpenses.filter(e => e.date.startsWith(options.periodMonth));
    }

    // Kalkulasi Total
    const totalIncome = filteredIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalPorsi = filteredIncome.reduce((sum, item) => sum + Number(item.porsi || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    // Breakdown Pengeluaran per Kategori
    const categoryTotals = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'Lain-lain';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
    });

    // Inisialisasi Workbook
    const wb = XLSX.utils.book_new();

    // ==========================================
    // SHEET 1: RINGKASAN LABA RUGI
    // ==========================================
    const summaryData = [
      ['LAPORAN KEUANGAN & LABA RUGI - ' + (settings.outletName || 'KEBAB RIZKI').toUpperCase()],
      ['Periode:', options.periodLabel || 'Semua Data'],
      ['Tanggal Dibuat:', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Pemilik / Penanggung Jawab:', settings.ownerName || 'Rizki Pratama'],
      [],
      ['RINGKASAN UTAMA', 'JUMLAH (IDR)', 'KETERANGAN'],
      ['Total Pemasukan (Omzet)', totalIncome, `${totalPorsi} Porsi Kebab Terjual`],
      ['Total Pengeluaran Operasional', totalExpenses, `${filteredExpenses.length} Transaksi Belanja`],
      ['ESTIMASI LABA BERSIH (NET PROFIT)', netProfit, netProfit >= 0 ? 'Surplus / Profit' : 'Defisit'],
      [],
      ['RINCIAN PENGELUARAN PER KATEGORI', 'JUMLAH (IDR)', 'PERSENTASE (%)'],
    ];

    Object.keys(categoryTotals).forEach(cat => {
      const amount = categoryTotals[cat];
      const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) + '%' : '0%';
      summaryData.push([cat, amount, pct]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    // Setting lebar kolom
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Laba Rugi');

    // ==========================================
    // SHEET 2: DATA PEMASUKAN
    // ==========================================
    const incomeData = [
      ['NO', 'TANGGAL', 'PORSI TERJUAL', 'TOTAL OMZET (IDR)', 'CATATAN / KETERANGAN']
    ];

    filteredIncome.forEach((item, index) => {
      incomeData.push([
        index + 1,
        item.date,
        Number(item.porsi || 0),
        Number(item.amount || 0),
        item.note || '-'
      ]);
    });

    incomeData.push([]);
    incomeData.push(['', 'TOTAL KESELURUHAN', totalPorsi, totalIncome, '']);

    const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
    wsIncome['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Data Pemasukan');

    // ==========================================
    // SHEET 3: DATA PENGELUARAN
    // ==========================================
    const expenseData = [
      ['NO', 'TANGGAL', 'KATEGORI', 'NOMINAL (IDR)', 'KETERANGAN / RINCIAN BARANG']
    ];

    filteredExpenses.forEach((item, index) => {
      expenseData.push([
        index + 1,
        item.date,
        item.category || 'Operasional',
        Number(item.amount || 0),
        item.note || '-'
      ]);
    });

    expenseData.push([]);
    expenseData.push(['', 'TOTAL PENGELUARAN', '', totalExpenses, '']);

    const wsExpenses = XLSX.utils.aoa_to_sheet(expenseData);
    wsExpenses['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Data Pengeluaran');

    // ==========================================
    // SHEET 4: DATA KARYAWAN
    // ==========================================
    const empData = [
      ['NO', 'NAMA KARYAWAN', 'JABATAN / ROLE', 'NO. HANDPHONE', 'GAJI / HARI (IDR)', 'STATUS']
    ];

    allEmployees.forEach((emp, index) => {
      const dailySalary = Number(emp.dailySalary || Math.round((emp.baseSalary || 2000000) / 25));
      empData.push([
        index + 1,
        emp.name,
        emp.role,
        emp.phone || '-',
        dailySalary,
        emp.status === 'active' ? 'Aktif' : 'Non-Aktif'
      ]);
    });

    const wsEmployees = XLSX.utils.aoa_to_sheet(empData);
    wsEmployees['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 35 }, { wch: 18 }, { wch: 20 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsEmployees, 'Master Karyawan');

    // Nama file export
    const dateStr = options.periodKey || new Date().toISOString().slice(0, 10);
    const filename = `laporan-keuangan-kebab-${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
    return filename;
  }
};

window.XLSXExport = XLSXExport;
