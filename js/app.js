/**
 * app.js - Controller Utama Kebab Rizki (kebab-finance)
 * Clean & Minimalist SaaS Light Aesthetic Controller
 */

const App = {
  activeTab: 'dashboard',
  charts: {
    trend: null,
    category: null
  },

  /**
   * Inisialisasi Aplikasi saat DOM Siap
   */
  init() {
    // Inisialisasi DB LocalStorage
    DB.init();

    // Setup Navigasi Tab
    this.setupNavigation();

    // Setup Event Listeners
    this.setupEventListeners();

    // Setup Auto Thousand Separator Dots pada Input Nominal
    this.setupCurrencyInputs();

    // Render Data Awal
    this.renderAll();

    // Set Default Dates ke Form
    this.setDefaultFormDates();

    // Inisialisasi Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  /**
   * Helper Parse String Format Rupiah/Dots ke Integer Number
   * Contoh: "1.500.000" -> 1500000
   */
  parseCleanNumber(val) {
    if (val === undefined || val === null || val === '') return 0;
    const clean = String(val).replace(/\D/g, '');
    return Number(clean || 0);
  },

  /**
   * Helper Format Number ke String Berpemisah Titik Ribuan
   * Contoh: 1500000 -> "1.500.000"
   */
  formatNumberInput(val) {
    if (val === undefined || val === null || val === '') return '';
    const clean = String(val).replace(/\D/g, '');
    if (!clean) return '0';
    return Number(clean).toLocaleString('id-ID');
  },

  /**
   * Pasang Auto Thousand Separator Dots pada Semua Input Bertipe Currency
   */
  setupCurrencyInputs() {
    document.querySelectorAll('.currency-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const clean = e.target.value.replace(/\D/g, '');
        if (clean) {
          e.target.value = Number(clean).toLocaleString('id-ID');
        } else {
          e.target.value = '';
        }
      });
    });
  },

  /**
   * Helper Format Rupiah (Tampilan Label)
   */
  formatRupiah(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  },

  /**
   * Helper Format Tanggal Indonesia
   */
  formatDateIndo(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  },

  /**
   * Helper Format Bulan Indonesia (YYYY-MM -> Nama Bulan Tahun)
   */
  formatMonthIndo(monthStr) {
    if (!monthStr) return '-';
    const parts = monthStr.split('-');
    if (parts.length !== 2) return monthStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${month} ${year}`;
  },

  /**
   * Setup Tanggal Default pada Input
   */
  setDefaultFormDates() {
    const today = '2026-08-19'; // Default sinkron dengan periode data demo
    const currentMonth = '2026-08';

    const incomeDate = document.getElementById('incomeDate');
    if (incomeDate) incomeDate.value = today;

    const expenseDate = document.getElementById('expenseDate');
    if (expenseDate) expenseDate.value = today;

    const advanceDate = document.getElementById('advanceDate');
    if (advanceDate) advanceDate.value = today;

    const attDatePicker = document.getElementById('attendanceDatePicker');
    if (attDatePicker) attDatePicker.value = today;

    const dateDisplay = document.getElementById('currentDateDisplay');
    if (dateDisplay) dateDisplay.textContent = `01 - 19 Agustus 2026`;
  },

  /**
   * Setup Navigasi Tab SPA & Breadcrumbs
   */
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const sidebar = document.getElementById('sidebar');

    const tabDescriptions = {
      'dashboard': { title: 'Dashboard Ringkasan', breadcrumb: 'Dashboard' },
      'pemasukan': { title: 'Pemasukan & Penjualan Kasir', breadcrumb: 'Pemasukan' },
      'pengeluaran': { title: 'Pengeluaran & Belanja Bahan', breadcrumb: 'Pengeluaran' },
      'karyawan': { title: 'Manajemen Karyawan Outlet', breadcrumb: 'Data Karyawan' },
      'kehadiran': { title: 'Absensi & Kehadiran Harian', breadcrumb: 'Kehadiran' },
      'slip-gaji': { title: 'Slip Gaji (Export PDF)', breadcrumb: 'Slip Gaji' },
      'laporan': { title: 'Laporan Keuangan & Rekap', breadcrumb: 'Laporan Excel' },
      'settings': { title: 'Backup & Profil Outlet', breadcrumb: 'Pengaturan' }
    };

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        if (!targetTab) return;

        this.switchTab(targetTab);
      });
    });

    // Mobile Hamburger Toggle
    const mobileBtn = document.getElementById('mobileToggleBtn');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    const closeBtn = document.getElementById('sidebarCloseBtn');
    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
      });
    }
  },

  /**
   * Programmatic Switch Tab Helper
   */
  switchTab(targetTab) {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const sidebar = document.getElementById('sidebar');

    const tabDescriptions = {
      'dashboard': { title: 'Dashboard Ringkasan', breadcrumb: 'Dashboard' },
      'pemasukan': { title: 'Pemasukan & Penjualan Kasir', breadcrumb: 'Pemasukan' },
      'pengeluaran': { title: 'Pengeluaran & Belanja Bahan', breadcrumb: 'Pengeluaran' },
      'karyawan': { title: 'Manajemen Karyawan Outlet', breadcrumb: 'Data Karyawan' },
      'kehadiran': { title: 'Absensi & Kehadiran Harian', breadcrumb: 'Kehadiran' },
      'slip-gaji': { title: 'Slip Gaji (Export PDF)', breadcrumb: 'Slip Gaji' },
      'laporan': { title: 'Laporan Keuangan & Rekap', breadcrumb: 'Laporan Excel' },
      'settings': { title: 'Backup & Profil Outlet', breadcrumb: 'Pengaturan' }
    };

    this.activeTab = targetTab;

    // Update nav active class
    navItems.forEach(n => {
      if (n.getAttribute('data-tab') === targetTab) {
        n.classList.add('active');
      } else {
        n.classList.remove('active');
      }
    });

    // Update tab panes
    tabPanes.forEach(pane => {
      if (pane.id === `tab-${targetTab}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Update breadcrumbs and titles
    if (tabDescriptions[targetTab]) {
      if (pageTitle) pageTitle.textContent = tabDescriptions[targetTab].title;
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = tabDescriptions[targetTab].breadcrumb;
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }

    // Refresh view data
    this.renderActiveTab(targetTab);
  },

  /**
   * Setup Seluruh Event Listener Form & Aksi
   */
  setupEventListeners() {
    // Form Pemasukan Submit
    const formIncome = document.getElementById('formIncome');
    if (formIncome) {
      formIncome.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveIncome();
      });
    }

    // Form Pengeluaran Submit
    const formExpense = document.getElementById('formExpense');
    if (formExpense) {
      formExpense.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveExpense();
      });
    }

    // Form Karyawan Submit
    const formEmployee = document.getElementById('formEmployee');
    if (formEmployee) {
      formEmployee.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveEmployee();
      });
    }

    // Form Kasbon Submit
    const formAdvance = document.getElementById('formAdvance');
    if (formAdvance) {
      formAdvance.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveAdvance();
      });
    }

    // Form Settings Submit
    const formSettings = document.getElementById('settingsForm');
    if (formSettings) {
      formSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveSettings();
      });
    }

    // Search & Filter Pemasukan
    const incSearch = document.getElementById('incomeSearchInput');
    const incMonth = document.getElementById('incomeMonthFilter');
    if (incSearch) incSearch.addEventListener('input', () => this.renderIncomeTable());
    if (incMonth) incMonth.addEventListener('change', () => this.renderIncomeTable());

    // Search & Filter Pengeluaran
    const expSearch = document.getElementById('expenseSearchInput');
    const expCategory = document.getElementById('expenseCategoryFilter');
    const expMonth = document.getElementById('expenseMonthFilter');
    if (expSearch) expSearch.addEventListener('input', () => this.renderExpenseTable());
    if (expCategory) expCategory.addEventListener('change', () => this.renderExpenseTable());
    if (expMonth) expMonth.addEventListener('change', () => this.renderExpenseTable());

    // Filter Absensi
    const attDatePicker = document.getElementById('attendanceDatePicker');
    if (attDatePicker) attDatePicker.addEventListener('change', () => this.renderAttendanceInput());

    const attMonthPicker = document.getElementById('attendanceMonthSummaryPicker');
    if (attMonthPicker) attMonthPicker.addEventListener('change', () => this.renderAttendanceSummary());

    const btnSaveAtt = document.getElementById('btnSaveAttendance');
    if (btnSaveAtt) btnSaveAtt.addEventListener('click', () => this.handleSaveAttendance());

    // Kalkulator Slip Gaji
    const slipEmpSelect = document.getElementById('slipEmployeeSelect');
    const slipPeriod = document.getElementById('slipPeriodMonth');
    const slipPrintDate = document.getElementById('slipPrintDate');
    const slipPeriodTitle = document.getElementById('slipPeriodTitle');
    const slipOvertimeDays = document.getElementById('slipOvertimeDays');
    const slipOvertimeAmount = document.getElementById('slipOvertimeAmount');
    const slipKerajinan = document.getElementById('slipKerajinan');
    const slipBonus = document.getElementById('slipBonus');
    const slipMotor = document.getElementById('slipMotor');
    const slipPulsa = document.getElementById('slipPulsa');
    const slipKasbon = document.getElementById('slipKasbon');
    const slipBonusBadge = document.getElementById('slipBonusAutoBadge');

    if (slipEmpSelect) {
      slipEmpSelect.addEventListener('change', () => {
        this.updatePayrollCalculation(true);
      });
    }
    if (slipPeriod) {
      slipPeriod.addEventListener('change', () => {
        // Auto update slip period title
        const monthVal = slipPeriod.value;
        const [y, m] = monthVal.split('-');
        const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
        const mName = monthNames[parseInt(m, 10) - 1] || 'AGUSTUS';
        const elTitle = document.getElementById('slipPeriodTitle');
        if (elTitle) elTitle.value = `15 ${mName} ${y}`;
        this.updatePayrollCalculation(true);
      });
    }
    if (slipPrintDate) slipPrintDate.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipPeriodTitle) slipPeriodTitle.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipOvertimeDays) slipOvertimeDays.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipOvertimeAmount) slipOvertimeAmount.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipKerajinan) slipKerajinan.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipBonus) slipBonus.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipMotor) slipMotor.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipPulsa) slipPulsa.addEventListener('input', () => this.updatePayrollCalculation(false));
    if (slipKasbon) slipKasbon.addEventListener('input', () => this.updatePayrollCalculation(false));

    if (slipBonusBadge) {
      slipBonusBadge.addEventListener('click', () => {
        this.openBonusBreakdownModal();
      });
    }

    // Export PDF Slip Gaji
    const btnSlipPDF = document.getElementById('btnDownloadSlipPDF');
    if (btnSlipPDF) {
      btnSlipPDF.addEventListener('click', () => this.handleExportSlipPDF());
    }

    // Filter & Export Laporan Excel
    const reportMonth = document.getElementById('reportMonthPicker');
    if (reportMonth) reportMonth.addEventListener('change', () => this.renderReportTab());

    const btnExcel = document.getElementById('btnExportExcel');
    if (btnExcel) {
      btnExcel.addEventListener('click', () => this.handleExportReportExcel());
    }

    // Backup & Restore
    const btnBackup = document.getElementById('btnBackupData');
    if (btnBackup) {
      btnBackup.addEventListener('click', () => {
        const file = DB.backup();
        this.toast(`Backup berhasil diunduh: ${file}`, 'success');
      });
    }

    const restoreInput = document.getElementById('restoreFileInput');
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => this.handleRestoreFile(e));
    }

    const btnResetDemo = document.getElementById('btnResetDemo');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data transaksi, pengeluaran, absensi, dan kasbon?')) {
          DB.clearAllData();
          this.toast('Seluruh data transaksi telah dikosongkan. Siap untuk pencatatan baru!', 'info');
          this.renderAll();
        }
      });
    }
  },

  /**
   * Render Seluruh Data & Komponen
   */
  renderAll() {
    this.renderSettings();
    this.renderDashboard();
    this.renderIncomeTable();
    this.renderExpenseTable();
    this.renderEmployeeTable();
    this.renderAttendanceInput();
    this.renderAttendanceSummary();
    this.populateEmployeeDropdowns();
    this.updatePayrollCalculation();
    this.renderReportTab();

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  /**
   * Render Tab Spesifik
   */
  renderActiveTab(tab) {
    if (tab === 'dashboard') this.renderDashboard();
    else if (tab === 'pemasukan') this.renderIncomeTable();
    else if (tab === 'pengeluaran') this.renderExpenseTable();
    else if (tab === 'karyawan') this.renderEmployeeTable();
    else if (tab === 'kehadiran') {
      this.renderAttendanceInput();
      this.renderAttendanceSummary();
    }
    else if (tab === 'slip-gaji') {
      this.populateEmployeeDropdowns();
      this.updatePayrollCalculation();
    }
    else if (tab === 'laporan') this.renderReportTab();
    else if (tab === 'settings') this.renderSettings();

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  /**
   * Render Pengaturan & Branding Outlet
   */
  renderSettings() {
    const settings = DB.get(DB_KEYS.SETTINGS);

    // Update Header Brand
    const brandName = document.getElementById('sidebarOutletName');
    if (brandName) brandName.textContent = settings.outletName || 'Kebab Rizki';

    const breadcrumbOutlet = document.getElementById('breadcrumbOutlet');
    if (breadcrumbOutlet) breadcrumbOutlet.textContent = settings.outletName || 'Kebab Rizki';

    const brandEmoji = document.getElementById('brandEmoji');
    if (brandEmoji) brandEmoji.textContent = settings.logoEmoji || '🌯';

    const sidebarOwner = document.getElementById('sidebarOwnerName');
    if (sidebarOwner) sidebarOwner.textContent = settings.ownerName || 'Rizki Pratama';

    const accountAvatar = document.getElementById('accountAvatar');
    if (accountAvatar) {
      const initials = (settings.ownerName || 'RP').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      accountAvatar.textContent = initials;
    }

    // Populate Settings Form
    const setOutletName = document.getElementById('setOutletName');
    const setTagline = document.getElementById('setTagline');
    const setAddress = document.getElementById('setAddress');
    const setPhone = document.getElementById('setPhone');
    const setOwnerName = document.getElementById('setOwnerName');
    const setDailyTarget = document.getElementById('setDailyTarget');
    const setIncentivePercent = document.getElementById('setIncentivePercent');
    const setOvertimeRate = document.getElementById('setOvertimeRate');

    if (setOutletName) setOutletName.value = settings.outletName || '';
    if (setTagline) setTagline.value = settings.tagline || '';
    if (setAddress) setAddress.value = settings.address || '';
    if (setPhone) setPhone.value = settings.phone || '';
    if (setOwnerName) setOwnerName.value = settings.ownerName || '';
    if (setDailyTarget) setDailyTarget.value = this.formatNumberInput(settings.dailyTarget || 300000);
    if (setIncentivePercent) setIncentivePercent.value = settings.incentivePercent || 10;
    if (setOvertimeRate) setOvertimeRate.value = this.formatNumberInput(settings.overtimeRate || 70000);
  },

  /**
   * Simpan Pengaturan Outlet
   */
  handleSaveSettings() {
    const updated = {
      outletName: document.getElementById('setOutletName').value.trim(),
      tagline: document.getElementById('setTagline').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      phone: document.getElementById('setPhone').value.trim(),
      ownerName: document.getElementById('setOwnerName').value.trim(),
      dailyTarget: this.parseCleanNumber(document.getElementById('setDailyTarget')?.value) || 300000,
      incentivePercent: Number(document.getElementById('setIncentivePercent')?.value || 10),
      overtimeRate: this.parseCleanNumber(document.getElementById('setOvertimeRate')?.value) || 70000
    };

    const current = DB.get(DB_KEYS.SETTINGS);
    DB.set(DB_KEYS.SETTINGS, { ...current, ...updated });

    this.toast('Pengaturan outlet & tarif lembur berhasil disimpan!', 'success');
    this.renderSettings();
    this.updatePayrollCalculation(true);
  },

  /**
   * Render Dashboard (KPI + Charts + Transaksi Terakhir)
   */
  renderDashboard() {
    const incomeList = DB.get(DB_KEYS.INCOME);
    const expenseList = DB.get(DB_KEYS.EXPENSES);
    const currentMonth = '2026-08';
    const today = '2026-08-19';

    // Filter bulan ini
    const monthIncome = incomeList.filter(i => i.date.startsWith(currentMonth));
    const monthExpense = expenseList.filter(e => e.date.startsWith(currentMonth));

    // Hitung KPI
    const totalIncome = monthIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = monthExpense.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const totalPorsi = monthIncome.reduce((sum, item) => sum + Number(item.porsi || 0), 0);

    const todayIncome = incomeList.filter(i => i.date === today).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // Update KPI Text
    const elIncome = document.getElementById('kpiIncomeMonth');
    if (elIncome) elIncome.textContent = this.formatRupiah(totalIncome);

    const elToday = document.getElementById('kpiIncomeToday');
    if (elToday) elToday.textContent = `Hari Ini: ${this.formatRupiah(todayIncome)}`;

    const elExpense = document.getElementById('kpiExpenseMonth');
    if (elExpense) elExpense.textContent = this.formatRupiah(totalExpense);

    const elExpenseCount = document.getElementById('kpiExpenseCount');
    if (elExpenseCount) elExpenseCount.textContent = `${monthExpense.length} Transaksi Belanja`;

    const elProfit = document.getElementById('kpiNetProfit');
    if (elProfit) elProfit.textContent = this.formatRupiah(netProfit);

    const marginPct = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;
    const elMargin = document.getElementById('kpiProfitMargin');
    if (elMargin) elMargin.textContent = `Margin: ${marginPct}%`;

    const elPorsi = document.getElementById('kpiTotalPorsi');
    if (elPorsi) elPorsi.textContent = `${totalPorsi.toLocaleString('id-ID')} Porsi`;

    const avgPorsi = monthIncome.length > 0 ? Math.round(totalPorsi / monthIncome.length) : 0;
    const elAvgPorsi = document.getElementById('kpiAvgDailyPorsi');
    if (elAvgPorsi) elAvgPorsi.textContent = `Rata-rata: ${avgPorsi} porsi/hari`;

    // Render Clean Charts
    this.renderDashboardCharts(incomeList, monthExpense);

    // Render Recent Transactions
    this.renderDashboardRecent(incomeList, expenseList);
  },

  /**
   * Render Chart.js Tren Penjualan & Kategori Pengeluaran (Clean Light Style)
   */
  renderDashboardCharts(incomeList, monthExpenses) {
    if (!window.Chart) return;

    // 1. Trend Chart (7 Hari Terakhir: 13 Agu - 19 Agu 2026)
    const recent7Days = ['2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19'];
    const trendLabels = recent7Days.map(d => d.slice(8) + ' Agu');
    const trendData = recent7Days.map(d => {
      const match = incomeList.find(i => i.date === d);
      return match ? Number(match.amount || 0) : 0;
    });

    const ctxTrend = document.getElementById('trendChart');
    if (ctxTrend) {
      if (this.charts.trend) this.charts.trend.destroy();

      this.charts.trend = new Chart(ctxTrend, {
        type: 'bar',
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Omzet (IDR)',
            data: trendData,
            backgroundColor: '#18181b',
            hoverBackgroundColor: '#3f3f46',
            borderRadius: 6,
            barThickness: 28
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#18181b',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ' ' + this.formatRupiah(ctx.raw)
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { size: 11, weight: '600' } }
            },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#64748b',
                font: { size: 11 },
                callback: (val) => 'Rp ' + (val / 1000000).toFixed(1) + ' jt'
              }
            }
          }
        }
      });
    }

    // 2. Category Doughnut Chart (Pastel Clean Palette)
    const categories = ['Bahan Baku', 'Kemasan', 'Operasional', 'Sewa', 'Lain-lain'];
    const catAmounts = categories.map(cat => {
      return monthExpenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    });

    const ctxCat = document.getElementById('categoryChart');
    if (ctxCat) {
      if (this.charts.category) this.charts.category.destroy();

      this.charts.category = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: catAmounts,
            backgroundColor: [
              '#ea580c', // Bahan Baku (Warm Orange)
              '#38bdf8', // Kemasan (Sky)
              '#f59e0b', // Operasional (Amber)
              '#a855f7', // Sewa (Purple)
              '#94a3b8'  // Lain-lain (Slate)
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#475569', font: { size: 11, weight: '600' }, padding: 12, usePointStyle: true }
            },
            tooltip: {
              backgroundColor: '#18181b',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ' ' + ctx.label + ': ' + this.formatRupiah(ctx.raw)
              }
            }
          },
          cutout: '70%'
        }
      });
    }
  },

  /**
   * Render Tabel Transaksi Terakhir di Dashboard
   */
  renderDashboardRecent(incomeList, expenseList) {
    const body = document.getElementById('dashboardRecentBody');
    if (!body) return;

    const combined = [
      ...incomeList.map(i => ({ ...i, type: 'income' })),
      ...expenseList.map(e => ({ ...e, type: 'expense' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    if (combined.length === 0) {
      body.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 18px;">Belum ada riwayat transaksi.</td></tr>`;
      return;
    }

    body.innerHTML = combined.map(item => {
      const isIncome = item.type === 'income';
      const desc = isIncome ? (item.note || `Penjualan ${item.porsi || 0} Porsi Kebab`) : (item.note || 'Belanja Operasional');
      const badgeText = isIncome ? `${item.porsi || 0} Porsi` : (item.category || 'Operasional');

      return `
        <tr>
          <td>
            <span class="badge ${isIncome ? 'badge-tunai' : 'badge-alpha'}">
              ${isIncome ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          </td>
          <td>${this.formatDateIndo(item.date)}</td>
          <td><b>${desc}</b></td>
          <td style="font-weight: 700; color: ${isIncome ? 'var(--pastel-green-text)' : 'var(--pastel-rose-text)'};">
            ${isIncome ? '+' : '-'} ${this.formatRupiah(item.amount)}
          </td>
          <td>
            <span class="badge" style="background: #f1f5f9; color: #475569;">
              ${badgeText}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Render Tabel Pemasukan
   */
  renderIncomeTable() {
    const body = document.getElementById('incomeTableBody');
    if (!body) return;

    const all = DB.get(DB_KEYS.INCOME);
    const search = (document.getElementById('incomeSearchInput')?.value || '').toLowerCase();
    const month = document.getElementById('incomeMonthFilter')?.value || '';

    const filtered = all.filter(item => {
      const matchSearch = (item.note || '').toLowerCase().includes(search) || (item.porsi ? String(item.porsi).includes(search) : false);
      const matchMonth = !month || item.date.startsWith(month);
      return matchSearch && matchMonth;
    });

    if (filtered.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 24px;">Tidak ada data pemasukan yang cocok.</td></tr>`;
      return;
    }

    body.innerHTML = filtered.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${this.formatDateIndo(item.date)}</td>
        <td><span class="badge badge-qris">${item.porsi || 0} Porsi</span></td>
        <td style="font-weight: 700; color: var(--pastel-green-text);">${this.formatRupiah(item.amount)}</td>
        <td style="color: var(--text-muted); font-size: 0.84rem;">${item.note || '-'}</td>
        <td style="text-align: right;">
          <button class="btn btn-icon btn-sm" onclick="App.editIncome('${item.id}')" title="Edit Transaksi">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn btn-icon btn-sm" style="color: var(--pastel-rose-text);" onclick="App.deleteIncome('${item.id}')" title="Hapus Transaksi">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  /**
   * Simpan / Update Pemasukan
   */
  handleSaveIncome() {
    const id = document.getElementById('incomeId').value;
    const data = {
      date: document.getElementById('incomeDate').value,
      porsi: Number(document.getElementById('incomePorsi').value || 0),
      amount: this.parseCleanNumber(document.getElementById('incomeAmount').value),
      note: document.getElementById('incomeNote').value.trim()
    };

    if (id) {
      DB.update(DB_KEYS.INCOME, id, data);
      this.toast('Pemasukan berhasil diperbarui!', 'success');
    } else {
      DB.add(DB_KEYS.INCOME, data);
      this.toast('Pemasukan baru berhasil dicatat!', 'success');
    }

    this.closeModal('modalIncome');
    this.renderDashboard();
    this.renderIncomeTable();
    this.renderReportTab();
    this.updatePayrollCalculation(true);
  },

  editIncome(id) {
    const item = DB.getById(DB_KEYS.INCOME, id);
    if (!item) return;

    document.getElementById('incomeId').value = item.id;
    document.getElementById('incomeDate').value = item.date;
    document.getElementById('incomePorsi').value = item.porsi;
    document.getElementById('incomeAmount').value = this.formatNumberInput(item.amount);
    document.getElementById('incomeNote').value = item.note || '';

    document.getElementById('modalIncomeTitle').textContent = 'Edit Transaksi Pemasukan';
    this.openModal('modalIncome');
  },

  deleteIncome(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data transaksi pemasukan ini?')) {
      DB.remove(DB_KEYS.INCOME, id);
      this.toast('Data pemasukan telah dihapus.', 'info');
      this.renderDashboard();
      this.renderIncomeTable();
      this.renderReportTab();
      this.updatePayrollCalculation(true);
    }
  },

  /**
   * Render Tabel Pengeluaran
   */
  renderExpenseTable() {
    const body = document.getElementById('expenseTableBody');
    if (!body) return;

    const all = DB.get(DB_KEYS.EXPENSES);
    const search = (document.getElementById('expenseSearchInput')?.value || '').toLowerCase();
    const category = document.getElementById('expenseCategoryFilter')?.value || '';
    const month = document.getElementById('expenseMonthFilter')?.value || '';

    const filtered = all.filter(item => {
      const matchSearch = (item.note || '').toLowerCase().includes(search) || (item.category || '').toLowerCase().includes(search);
      const matchCat = !category || item.category === category;
      const matchMonth = !month || item.date.startsWith(month);
      return matchSearch && matchCat && matchMonth;
    });

    if (filtered.length === 0) {
      body.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 24px;">Tidak ada data pengeluaran yang cocok.</td></tr>`;
      return;
    }

    body.innerHTML = filtered.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${this.formatDateIndo(item.date)}</td>
        <td>
          <span class="badge" style="background: var(--pastel-amber-bg); color: var(--pastel-amber-text);">
            ${item.category || 'Operasional'}
          </span>
        </td>
        <td style="font-weight: 700; color: var(--pastel-rose-text);">${this.formatRupiah(item.amount)}</td>
        <td style="color: var(--text-main); font-size: 0.86rem;">${item.note || '-'}</td>
        <td style="text-align: right;">
          <button class="btn btn-icon btn-sm" onclick="App.editExpense('${item.id}')" title="Edit Belanja">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn btn-icon btn-sm" style="color: var(--pastel-rose-text);" onclick="App.deleteExpense('${item.id}')" title="Hapus Belanja">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  /**
   * Simpan / Update Pengeluaran
   */
  handleSaveExpense() {
    const id = document.getElementById('expenseId').value;
    const data = {
      date: document.getElementById('expenseDate').value,
      category: document.getElementById('expenseCategory').value,
      amount: this.parseCleanNumber(document.getElementById('expenseAmount').value),
      note: document.getElementById('expenseNote').value.trim()
    };

    if (id) {
      DB.update(DB_KEYS.EXPENSES, id, data);
      this.toast('Data pengeluaran berhasil diperbarui!', 'success');
    } else {
      DB.add(DB_KEYS.EXPENSES, data);
      this.toast('Pengeluaran baru berhasil dicatat!', 'success');
    }

    this.closeModal('modalExpense');
    this.renderDashboard();
    this.renderExpenseTable();
    this.renderReportTab();
  },

  editExpense(id) {
    const item = DB.getById(DB_KEYS.EXPENSES, id);
    if (!item) return;

    document.getElementById('expenseId').value = item.id;
    document.getElementById('expenseDate').value = item.date;
    document.getElementById('expenseCategory').value = item.category;
    document.getElementById('expenseAmount').value = this.formatNumberInput(item.amount);
    document.getElementById('expenseNote').value = item.note;

    document.getElementById('modalExpenseTitle').textContent = 'Edit Pengeluaran Operasional';
    this.openModal('modalExpense');
  },

  deleteExpense(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data pengeluaran ini?')) {
      DB.remove(DB_KEYS.EXPENSES, id);
      this.toast('Data pengeluaran telah dihapus.', 'info');
      this.renderDashboard();
      this.renderExpenseTable();
      this.renderReportTab();
    }
  },

  /**
   * Render Tabel Karyawan
   */
  renderEmployeeTable() {
    const body = document.getElementById('employeeTableBody');
    if (!body) return;

    const employees = DB.get(DB_KEYS.EMPLOYEES);
    const advances = DB.get(DB_KEYS.ADVANCES);
    const currentMonth = '2026-08';

    if (employees.length === 0) {
      body.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 24px;">Belum ada data karyawan.</td></tr>`;
      return;
    }

    body.innerHTML = employees.map((emp, idx) => {
      const empAdvances = advances.filter(a => a.employeeId === emp.id && a.date.startsWith(currentMonth));
      const totalKasbon = empAdvances.reduce((sum, a) => sum + Number(a.amount || 0), 0);
      const dailySalary = Number(emp.dailySalary || Math.round((emp.baseSalary || 2000000) / 25));

      return `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${emp.name}</b></td>
          <td>${emp.role}</td>
          <td>${emp.phone || '-'}</td>
          <td style="font-weight: 700; color: var(--text-main);">${this.formatRupiah(dailySalary)} / hari</td>
          <td style="color: ${totalKasbon > 0 ? 'var(--pastel-rose-text)' : 'var(--text-dim)'}; font-weight: 700;">
            ${totalKasbon > 0 ? this.formatRupiah(totalKasbon) : 'Rp 0'}
          </td>
          <td>
            <span class="badge ${emp.status === 'active' ? 'badge-hadir' : 'badge-alpha'}">
              ${emp.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-icon btn-sm" onclick="App.editEmployee('${emp.id}')" title="Edit Karyawan">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn btn-icon btn-sm" style="color: var(--pastel-rose-text);" onclick="App.deleteEmployee('${emp.id}')" title="Hapus Karyawan">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  /**
   * Simpan / Update Karyawan
   */
  handleSaveEmployee() {
    const id = document.getElementById('employeeId').value;
    const data = {
      name: document.getElementById('empName').value.trim(),
      role: document.getElementById('empRole').value.trim(),
      phone: document.getElementById('empPhone').value.trim(),
      dailySalary: this.parseCleanNumber(document.getElementById('empDailySalary').value),
      status: document.getElementById('empStatus').value
    };

    if (id) {
      DB.update(DB_KEYS.EMPLOYEES, id, data);
      this.toast('Data karyawan berhasil diperbarui!', 'success');
    } else {
      DB.add(DB_KEYS.EMPLOYEES, data);
      this.toast('Karyawan baru berhasil ditambahkan!', 'success');
    }

    this.closeModal('modalEmployee');
    this.renderEmployeeTable();
    this.renderAttendanceInput();
    this.populateEmployeeDropdowns();
    this.updatePayrollCalculation();
  },

  editEmployee(id) {
    const emp = DB.getById(DB_KEYS.EMPLOYEES, id);
    if (!emp) return;

    document.getElementById('employeeId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empRole').value = emp.role;
    document.getElementById('empPhone').value = emp.phone || '';
    const dailySalary = Number(emp.dailySalary || Math.round((emp.baseSalary || 2000000) / 25));
    document.getElementById('empDailySalary').value = this.formatNumberInput(dailySalary);
    document.getElementById('empStatus').value = emp.status;

    document.getElementById('modalEmployeeTitle').textContent = 'Edit Data Karyawan';
    this.openModal('modalEmployee');
  },

  deleteEmployee(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data karyawan ini?')) {
      DB.remove(DB_KEYS.EMPLOYEES, id);
      this.toast('Karyawan telah dihapus.', 'info');
      this.renderEmployeeTable();
      this.renderAttendanceInput();
      this.populateEmployeeDropdowns();
    }
  },

  /**
   * Simpan Kasbon Karyawan
   */
  handleSaveAdvance() {
    const data = {
      employeeId: document.getElementById('advanceEmployeeSelect').value,
      date: document.getElementById('advanceDate').value,
      amount: this.parseCleanNumber(document.getElementById('advanceAmount').value),
      note: document.getElementById('advanceNote').value.trim(),
      status: 'unpaid'
    };

    DB.add(DB_KEYS.ADVANCES, data);
    this.toast('Kasbon karyawan berhasil dicatat!', 'success');

    this.closeModal('modalAdvance');
    this.renderEmployeeTable();
    this.updatePayrollCalculation();
  },

  /**
   * Populate Dropdown Karyawan di Berbagai Modal & Slip Gaji
   */
  populateEmployeeDropdowns() {
    const employees = DB.get(DB_KEYS.EMPLOYEES);

    const advanceSelect = document.getElementById('advanceEmployeeSelect');
    const slipSelect = document.getElementById('slipEmployeeSelect');

    if (!employees || employees.length === 0) {
      const emptyOpt = '<option value="">-- Belum ada data karyawan --</option>';
      if (advanceSelect) advanceSelect.innerHTML = emptyOpt;
      if (slipSelect) slipSelect.innerHTML = emptyOpt;
      return;
    }

    const options = employees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');

    if (advanceSelect) advanceSelect.innerHTML = options;
    if (slipSelect) {
      const currentVal = slipSelect.value;
      slipSelect.innerHTML = options;
      if (currentVal && employees.some(e => e.id === currentVal)) {
        slipSelect.value = currentVal;
      }
    }
  },

  /**
   * Render Input Absensi Harian
   */
  /**
   * Render Input Absensi Harian
   */
  renderAttendanceInput() {
    const body = document.getElementById('attendanceInputTableBody');
    if (!body) return;

    const date = document.getElementById('attendanceDatePicker')?.value || '2026-08-19';
    const employees = DB.get(DB_KEYS.EMPLOYEES).filter(e => e.status === 'active');
    const allAtt = DB.get(DB_KEYS.ATTENDANCE);
    const settings = DB.get(DB_KEYS.SETTINGS);
    const overtimeRate = Number(settings.overtimeRate || 70000);

    if (employees.length === 0) {
      body.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 18px;">Belum ada karyawan aktif. Tambahkan karyawan di menu Data Karyawan.</td></tr>`;
      return;
    }

    body.innerHTML = employees.map(emp => {
      const existing = allAtt.find(a => a.employeeId === emp.id && a.date === date);
      const currentStatus = existing ? existing.status : 'hadir';
      const isOvertime = existing ? (existing.isOvertime === true || existing.isOvertime === 'true' || existing.status === 'lembur') : false;
      const note = existing ? existing.note : '';

      return `
        <tr data-emp-id="${emp.id}">
          <td><b>${emp.name}</b></td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${emp.role}</td>
          <td>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.82rem;">
                <input type="radio" name="att_${emp.id}" value="hadir" ${currentStatus === 'hadir' ? 'checked' : ''}>
                <span class="badge badge-hadir">Hadir</span>
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.82rem;">
                <input type="radio" name="att_${emp.id}" value="izin" ${currentStatus === 'izin' ? 'checked' : ''}>
                <span class="badge badge-izin">Izin</span>
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.82rem;">
                <input type="radio" name="att_${emp.id}" value="sakit" ${currentStatus === 'sakit' ? 'checked' : ''}>
                <span class="badge badge-sakit">Sakit</span>
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.82rem;">
                <input type="radio" name="att_${emp.id}" value="alpha" ${currentStatus === 'alpha' ? 'checked' : ''}>
                <span class="badge badge-alpha">Alpha</span>
              </label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.82rem;">
                <input type="radio" name="att_${emp.id}" value="libur" ${currentStatus === 'libur' ? 'checked' : ''}>
                <span class="badge badge-libur">Libur</span>
              </label>
            </div>
          </td>
          <td style="text-align: center;">
            <label style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid ${isOvertime ? '#fed7aa' : 'var(--border-color)'}; border-radius: var(--radius-md); background: ${isOvertime ? 'var(--pastel-amber-bg)' : 'transparent'};">
              <input type="checkbox" class="att-overtime-checkbox" ${isOvertime ? 'checked' : ''} style="cursor: pointer;">
              <span style="font-size: 0.8rem; font-weight: 700; color: ${isOvertime ? 'var(--pastel-amber-text)' : 'var(--text-main)'};">
                ⚡ Lembur (+${this.formatRupiah(overtimeRate)})
              </span>
            </label>
          </td>
          <td>
            <input type="text" class="form-control att-note-input" value="${note}" placeholder="Keterangan..." style="padding: 5px 10px; font-size: 0.82rem;">
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Simpan Absensi Harian
   */
  handleSaveAttendance() {
    const date = document.getElementById('attendanceDatePicker')?.value || '2026-08-19';
    const rows = document.querySelectorAll('#attendanceInputTableBody tr[data-emp-id]');
    const allAtt = DB.get(DB_KEYS.ATTENDANCE);

    const filtered = allAtt.filter(a => a.date !== date);

    rows.forEach(row => {
      const empId = row.getAttribute('data-emp-id');
      const selectedStatus = row.querySelector(`input[name="att_${empId}"]:checked`)?.value || 'hadir';
      const isOvertime = row.querySelector('.att-overtime-checkbox')?.checked || false;
      const note = row.querySelector('.att-note-input')?.value.trim() || '';

      filtered.push({
        id: `att-${empId}-${date}`,
        employeeId: empId,
        date: date,
        status: selectedStatus,
        isOvertime: isOvertime,
        note: note
      });
    });

    DB.set(DB_KEYS.ATTENDANCE, filtered);
    this.toast(`Absensi tanggal ${this.formatDateIndo(date)} berhasil disimpan!`, 'success');

    this.renderAttendanceSummary();
    this.updatePayrollCalculation(true);
  },

  /**
   * Render Rekap Kehadiran Bulanan
   */
  renderAttendanceSummary() {
    const body = document.getElementById('attendanceSummaryTableBody');
    if (!body) return;

    const month = document.getElementById('attendanceMonthSummaryPicker')?.value || '2026-08';
    const employees = DB.get(DB_KEYS.EMPLOYEES);
    const settings = DB.get(DB_KEYS.SETTINGS);
    const overtimeRate = Number(settings.overtimeRate || 70000);

    if (employees.length === 0) {
      body.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 18px;">Belum ada data karyawan.</td></tr>`;
      return;
    }

    body.innerHTML = employees.map(emp => {
      const sum = DB.getEmployeeAttendanceSummary(emp.id, month);
      const totalLemburPay = sum.lembur * overtimeRate;

      return `
        <tr>
          <td><b>${emp.name}</b></td>
          <td><span class="badge badge-hadir">${sum.hadir} Hari</span></td>
          <td>
            <span class="badge" style="background: var(--pastel-amber-bg); color: var(--pastel-amber-text); font-weight: 700;">
              ⚡ ${sum.lembur} Hari (+${this.formatRupiah(totalLemburPay)})
            </span>
          </td>
          <td><span class="badge badge-izin">${sum.izin} Hari</span></td>
          <td><span class="badge badge-sakit">${sum.sakit} Hari</span></td>
          <td><span class="badge badge-alpha">${sum.alpha} Hari</span></td>
          <td><span class="badge badge-libur">${sum.libur} Hari</span></td>
          <td style="font-weight: 700; color: var(--pastel-green-text);">${sum.hadir} Hari Kerja</td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Update Kalkulasi & Live Preview Slip Gaji (Format Struk Karyawan)
   */
  updatePayrollCalculation(autoRecalculateBonus = true) {
    const empId = document.getElementById('slipEmployeeSelect')?.value;
    const period = document.getElementById('slipPeriodMonth')?.value || '2026-08';
    const printDate = document.getElementById('slipPrintDate')?.value || '2026-08-19';
    const periodTitle = document.getElementById('slipPeriodTitle')?.value || '15 AGUSTUS 2026';

    const emp = DB.getById(DB_KEYS.EMPLOYEES, empId);
    if (!emp) {
      const prevEmpName = document.getElementById('prevEmpName');
      if (prevEmpName) prevEmpName.textContent = '-';
      const prevMasukAmount = document.getElementById('prevMasukAmount');
      if (prevMasukAmount) prevMasukAmount.textContent = 'Rp. 0';
      const prevDaysOvertime = document.getElementById('prevDaysOvertime');
      if (prevDaysOvertime) prevDaysOvertime.textContent = '0';
      const prevLemburAmount = document.getElementById('prevLemburAmount');
      if (prevLemburAmount) prevLemburAmount.textContent = 'Rp. 0';
      const prevKerajinanAmount = document.getElementById('prevKerajinanAmount');
      if (prevKerajinanAmount) prevKerajinanAmount.textContent = 'Rp. 0';
      const prevBonusAmount = document.getElementById('prevBonusAmount');
      if (prevBonusAmount) prevBonusAmount.textContent = 'Rp. 0';
      const prevMotorAmount = document.getElementById('prevMotorAmount');
      if (prevMotorAmount) prevMotorAmount.textContent = 'Rp. 0';
      const prevPulsaAmount = document.getElementById('prevPulsaAmount');
      if (prevPulsaAmount) prevPulsaAmount.textContent = 'Rp. 0';
      const prevTotalGrossAmount = document.getElementById('prevTotalGrossAmount');
      if (prevTotalGrossAmount) prevTotalGrossAmount.textContent = 'Rp. 0';
      const prevTunggakanAmount = document.getElementById('prevTunggakanAmount');
      if (prevTunggakanAmount) prevTunggakanAmount.textContent = 'Rp. 0';
      const prevTerimaAmount = document.getElementById('prevTerimaAmount');
      if (prevTerimaAmount) prevTerimaAmount.textContent = 'Rp. 0';
      const prevSignName = document.getElementById('prevSignName');
      if (prevSignName) prevSignName.textContent = '-';
      const elBaseSummaryText = document.getElementById('slipBaseSalarySummaryText');
      if (elBaseSummaryText) elBaseSummaryText.value = 'Belum ada data karyawan';
      const elBase = document.getElementById('slipBaseSalary');
      if (elBase) elBase.value = 'Rp 0';
      this.currentPayrollData = null;
      return;
    }

    const settings = DB.get(DB_KEYS.SETTINGS);
    const attSum = DB.getEmployeeAttendanceSummary(emp.id, period);

    const dbAdvances = DB.getEmployeeAdvances(emp.id, period);
    const totalDbAdvance = dbAdvances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

    // 1. MASUK: Hari Hadir x Gaji Harian
    const dailySalaryRate = Number(emp.dailySalary || 100000);
    const daysPresent = attSum.hadir;
    const masukAmount = daysPresent * dailySalaryRate;

    // 2. LEMBUR (Otomatis dari Absensi Lembur x Tarif Lembur Rp 70.000)
    const overtimeRate = Number(settings.overtimeRate || 70000);
    const autoOvertimeDays = attSum.lembur || 0;
    const autoOvertimeAmount = autoOvertimeDays * overtimeRate;

    const elOvertimeDays = document.getElementById('slipOvertimeDays');
    const elOvertimeAmount = document.getElementById('slipOvertimeAmount');

    if (autoRecalculateBonus && elOvertimeDays && elOvertimeAmount) {
      elOvertimeDays.value = autoOvertimeDays;
      elOvertimeAmount.value = this.formatNumberInput(autoOvertimeAmount);
    }

    const overtimeDays = Number(document.getElementById('slipOvertimeDays')?.value || 0);
    const overtimeAmount = this.parseCleanNumber(document.getElementById('slipOvertimeAmount')?.value);

    // 3. LIBUR: Jumlah Hari Tidak Hadir (Libur + Izin + Sakit + Alpha)
    const daysOff = (attSum.libur || 0) + (attSum.izin || 0) + (attSum.sakit || 0) + (attSum.alpha || 0);

    // 4. KERAJINAN
    const kerajinan = this.parseCleanNumber(document.getElementById('slipKerajinan')?.value);

    // 5. BONUS BULANAN (10% surplus omzet > Rp 300rb dari fitur Pemasukan)
    const autoIncentive = DB.calculateEmployeeIncentive(emp.id, period);
    const elBonusInput = document.getElementById('slipBonus');
    if (autoRecalculateBonus && elBonusInput) {
      elBonusInput.value = this.formatNumberInput(autoIncentive.totalBonus);
    }
    const bonusBulanan = this.parseCleanNumber(document.getElementById('slipBonus')?.value);

    // 6. PERAWATAN MOTOR
    const perawatanMotor = this.parseCleanNumber(document.getElementById('slipMotor')?.value);

    // 7. TUNJANGAN PULSA
    const tunjanganPulsa = this.parseCleanNumber(document.getElementById('slipPulsa')?.value);

    // TOTAL PENGHASILAN KOTOR
    const totalGross = masukAmount + overtimeAmount + kerajinan + bonusBulanan + perawatanMotor + tunjanganPulsa;

    // TUNGGAKAN / KASBON
    const elKasbonInput = document.getElementById('slipKasbon');
    if (autoRecalculateBonus && elKasbonInput && totalDbAdvance > 0) {
      elKasbonInput.value = this.formatNumberInput(totalDbAdvance);
    }
    const tunggakan = this.parseCleanNumber(document.getElementById('slipKasbon')?.value);

    // TERIMA BERSIH (TAKE HOME PAY)
    const terima = Math.max(0, totalGross - tunggakan);

    // === Update Form Input Teks ===
    const elBaseSummaryText = document.getElementById('slipBaseSalarySummaryText');
    if (elBaseSummaryText) elBaseSummaryText.value = `${daysPresent} hari hadir x ${this.formatRupiah(dailySalaryRate)}`;

    const elBase = document.getElementById('slipBaseSalary');
    if (elBase) elBase.value = this.formatRupiah(masukAmount);

    const elDaysOffText = document.getElementById('slipDaysOffText');
    if (elDaysOffText) elDaysOffText.value = `${daysOff} Hari Libur/Off (Izin: ${attSum.izin}, Sakit: ${attSum.sakit}, Alpha: ${attSum.alpha}, Libur: ${attSum.libur})`;

    const elKasbonHint = document.getElementById('slipKasbonHint');
    if (elKasbonHint) {
      elKasbonHint.textContent = totalDbAdvance > 0 
        ? `Tercatat kasbon aktif periode ini: ${this.formatRupiah(totalDbAdvance)}`
        : 'Tidak ada kasbon tercatat di periode ini.';
    }

    const elHint = document.getElementById('slipBonusFormulaHint');
    if (elHint) {
      elHint.innerHTML = `💡 Dihitung otomatis: <b>${autoIncentive.incentivePercent}%</b> dari omzet Pemasukan > <b>${this.formatRupiah(autoIncentive.dailyTarget)}</b>. (${autoIncentive.qualifiedDays} hari tembus target, total: <b>${this.formatRupiah(autoIncentive.totalBonus)}</b>) <a href="javascript:void(0)" onclick="App.openBonusBreakdownModal()" style="color: var(--pastel-green-text); font-weight: 700; text-decoration: underline;">[Lihat Rincian Harian]</a>`;
    }

    // === Update Visual Struk Live Preview ===
    const prevEmpName = document.getElementById('prevEmpName');
    if (prevEmpName) prevEmpName.textContent = emp.name.toUpperCase();

    const prevPrintDate = document.getElementById('prevPrintDate');
    if (prevPrintDate) {
      const pDateParts = printDate.split('-');
      prevPrintDate.textContent = pDateParts.length === 3 ? `${pDateParts[2]}-${pDateParts[1]}-${pDateParts[0]}` : printDate;
    }

    const prevPeriodTitle = document.getElementById('prevPeriodTitle');
    if (prevPeriodTitle) prevPeriodTitle.textContent = periodTitle.toUpperCase();

    const prevDaysPresent = document.getElementById('prevDaysPresent');
    if (prevDaysPresent) prevDaysPresent.textContent = daysPresent;

    const prevMasukAmount = document.getElementById('prevMasukAmount');
    if (prevMasukAmount) prevMasukAmount.textContent = this.formatRupiah(masukAmount);

    const prevDaysOvertime = document.getElementById('prevDaysOvertime');
    if (prevDaysOvertime) prevDaysOvertime.textContent = overtimeDays;

    const prevLemburAmount = document.getElementById('prevLemburAmount');
    if (prevLemburAmount) prevLemburAmount.textContent = this.formatRupiah(overtimeAmount);

    const prevDaysOff = document.getElementById('prevDaysOff');
    if (prevDaysOff) prevDaysOff.textContent = daysOff;

    const prevKerajinanAmount = document.getElementById('prevKerajinanAmount');
    if (prevKerajinanAmount) prevKerajinanAmount.textContent = this.formatRupiah(kerajinan);

    const prevBonusAmount = document.getElementById('prevBonusAmount');
    if (prevBonusAmount) prevBonusAmount.textContent = this.formatRupiah(bonusBulanan);

    const prevMotorAmount = document.getElementById('prevMotorAmount');
    if (prevMotorAmount) prevMotorAmount.textContent = this.formatRupiah(perawatanMotor);

    const prevPulsaAmount = document.getElementById('prevPulsaAmount');
    if (prevPulsaAmount) prevPulsaAmount.textContent = this.formatRupiah(tunjanganPulsa);

    const prevTotalGrossAmount = document.getElementById('prevTotalGrossAmount');
    if (prevTotalGrossAmount) prevTotalGrossAmount.textContent = this.formatRupiah(totalGross);

    const prevTunggakanAmount = document.getElementById('prevTunggakanAmount');
    if (prevTunggakanAmount) prevTunggakanAmount.textContent = this.formatRupiah(tunggakan);

    const prevTerimaAmount = document.getElementById('prevTerimaAmount');
    if (prevTerimaAmount) prevTerimaAmount.textContent = this.formatRupiah(terima);

    const prevSignName = document.getElementById('prevSignName');
    if (prevSignName) {
      const firstName = emp.name.trim().split(' ')[0].toUpperCase();
      prevSignName.textContent = firstName || emp.name.toUpperCase();
    }

    // Store state payload untuk tombol export PDF
    this.currentPayrollData = {
      employee: emp,
      settings: settings,
      periodMonth: period,
      periodTitle: periodTitle,
      printDate: printDate,
      daysPresent: daysPresent,
      dailySalary: dailySalaryRate,
      masukAmount: masukAmount,
      overtimeDays: overtimeDays,
      overtimeAmount: overtimeAmount,
      daysOff: daysOff,
      attendanceSummary: attSum,
      kerajinan: kerajinan,
      bonusBulanan: bonusBulanan,
      perawatanMotor: perawatanMotor,
      tunjanganPulsa: tunjanganPulsa,
      totalGross: totalGross,
      tunggakan: tunggakan,
      terima: terima
    };
  },

  /**
   * Modal Rincian Kalkulasi Bonus Harian dari Pemasukan
   */
  openBonusBreakdownModal() {
    const empId = document.getElementById('slipEmployeeSelect')?.value;
    const period = document.getElementById('slipPeriodMonth')?.value || '2026-08';
    const emp = DB.getById(DB_KEYS.EMPLOYEES, empId);
    if (!emp) {
      this.toast('Pilih karyawan terlebih dahulu.', 'error');
      return;
    }

    const incentiveData = DB.calculateEmployeeIncentive(emp.id, period);
    const body = document.getElementById('modalBonusBreakdownBody');
    if (!body) return;

    const rows = (incentiveData.dayDetails || []).map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><b>${this.formatDateIndo(d.date)}</b></td>
        <td style="color: var(--pastel-green-text); font-weight: 700;">${this.formatRupiah(d.dayOmzet)}</td>
        <td style="color: var(--text-muted); font-size: 0.82rem;">${this.formatRupiah(d.surplus)}</td>
        <td style="font-weight: 600;">${this.formatRupiah(d.pool)}</td>
        <td><span class="badge badge-hadir">${d.attendeesCount} Kru Hadir</span></td>
        <td style="font-weight: 800; color: #166534; text-align: right;">+ ${this.formatRupiah(d.share)}</td>
      </tr>
    `).join('');

    body.innerHTML = `
      <div style="background: var(--bg-card-subtle); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 14px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
          <span>Karyawan: <b>${emp.name}</b></span>
          <span>Periode: <b>${this.formatMonthIndo(period)}</b></span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">
          Target Harian: <b>${this.formatRupiah(incentiveData.dailyTarget)}</b> | Persentase Bonus: <b>${incentiveData.incentivePercent}% dari kelebihan target</b>
        </div>
      </div>

      <div class="table-responsive" style="max-height: 280px; overflow-y: auto;">
        <table class="custom-table" style="font-size: 0.8rem;">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Omzet Kasir</th>
              <th>Lebih Target (> 300rb)</th>
              <th>Pool 10%</th>
              <th>Kru</th>
              <th style="text-align: right;">Bonus Karyawan</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" style="text-align:center; padding: 16px; color: var(--text-muted);">Tidak ada transaksi tembus target omzet di atas Rp 300.000 pada hari masuk kerja bulan ini.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 12px 16px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.82rem; font-weight: 800; color: #166534;">TOTAL BONUS TERKUMPUL BULAN INI</div>
          <div style="font-size: 0.74rem; color: #15803d;">Dihitung dari ${incentiveData.qualifiedDays} hari tembus target omzet penjualan</div>
        </div>
        <div style="font-size: 1.25rem; font-weight: 900; color: #166534;">${this.formatRupiah(incentiveData.totalBonus)}</div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this.openModal('modalBonusBreakdown');
  },

  /**
   * Ekspor Slip Gaji ke PDF
   */
  handleExportSlipPDF() {
    if (!this.currentPayrollData) {
      this.toast('Pilih data karyawan terlebih dahulu.', 'error');
      return;
    }

    try {
      const filename = PDFExport.exportSlipGaji(this.currentPayrollData);
      this.toast(`Slip gaji PDF berhasil diunduh: ${filename}`, 'success');
    } catch (e) {
      console.error(e);
      this.toast('Gagal membuat file PDF. Periksa konsol browser.', 'error');
    }
  },

  /**
   * Render Tab Laporan Keuangan
   */
  renderReportTab() {
    const month = document.getElementById('reportMonthPicker')?.value || '2026-08';
    const allIncome = DB.get(DB_KEYS.INCOME);
    const allExpenses = DB.get(DB_KEYS.EXPENSES);

    const filteredIncome = allIncome.filter(i => i.date.startsWith(month));
    const filteredExpenses = allExpenses.filter(e => e.date.startsWith(month));

    const totalIncome = filteredIncome.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const totalPorsi = filteredIncome.reduce((sum, i) => sum + Number(i.porsi || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;
    const marginPct = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    // Update Report Summary Cards
    const elInc = document.getElementById('reportTotalIncome');
    if (elInc) elInc.textContent = this.formatRupiah(totalIncome);

    const elPorsi = document.getElementById('reportPorsiCount');
    if (elPorsi) elPorsi.textContent = `${totalPorsi.toLocaleString('id-ID')} Porsi Kebab Terjual`;

    const elExp = document.getElementById('reportTotalExpense');
    if (elExp) elExp.textContent = this.formatRupiah(totalExpenses);

    const elExpTx = document.getElementById('reportExpenseTxCount');
    if (elExpTx) elExpTx.textContent = `${filteredExpenses.length} Nota Belanja`;

    const elNet = document.getElementById('reportNetProfit');
    if (elNet) elNet.textContent = this.formatRupiah(netProfit);

    const elMargin = document.getElementById('reportNetMargin');
    if (elMargin) elMargin.textContent = `Margin Laba: ${marginPct}%`;

    // Breakdown Pengeluaran per Kategori
    const categoryTotals = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'Lain-lain';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
    });

    const body = document.getElementById('reportCategoryTableBody');
    if (!body) return;

    const categories = Object.keys(categoryTotals);
    if (categories.length === 0) {
      body.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-dim); padding: 18px;">Tidak ada pengeluaran pada periode ini.</td></tr>`;
      return;
    }

    body.innerHTML = categories.map(cat => {
      const amount = categoryTotals[cat];
      const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td><b>${cat}</b></td>
          <td style="font-weight: 700; color: var(--pastel-rose-text);">${this.formatRupiah(amount)}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="flex: 1; height: 7px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: #ea580c; border-radius: 4px;"></div>
              </div>
              <span style="font-size: 0.78rem; font-weight: 700; width: 45px;">${pct}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Ekspor Laporan Keuangan ke Excel (.xlsx)
   */
  handleExportReportExcel() {
    const month = document.getElementById('reportMonthPicker')?.value || '2026-08';
    try {
      const filename = XLSXExport.exportFinancialReport({
        periodMonth: month,
        periodKey: month,
        periodLabel: this.formatMonthIndo(month)
      });
      this.toast(`Laporan Excel berhasil diunduh: ${filename}`, 'success');
    } catch (e) {
      console.error(e);
      this.toast('Gagal mengekspor Excel. Periksa konsol browser.', 'error');
    }
  },

  /**
   * Restore Database dari File JSON
   */
  handleRestoreFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const result = DB.restore(content);
      if (result.success) {
        this.toast(result.message, 'success');
        this.renderAll();
      } else {
        this.toast(result.message, 'error');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  },

  /**
   * Modal Management
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      if (window.lucide) lucide.createIcons();
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
        const hiddenId = form.querySelector('input[type="hidden"]');
        if (hiddenId) hiddenId.value = '';
      }
      this.setDefaultFormDates();
    }
  },

  /**
   * Toast Notification
   */
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3200);
  }
};

// Global Exposure
window.App = App;

// Run App when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
