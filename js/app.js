/**
 * STP e-Receipt - Main Application Logic & Controller
 * UPTD Kawasan Sains dan Teknologi
 */

// Application State
const AppState = {
  currentView: 'dashboard',
  currentRole: 'admin', // 'admin' | 'pimpinan'
  charts: {
    monthlyTrend: null,
    serviceDistribution: null
  },
  activeFilters: {
    search: '',
    serviceId: '',
    methodId: '',
    status: '',
    startDate: '',
    endDate: '',
    month: '',
    year: '2026'
  },
  reportFilters: {
    periodType: 'monthly',
    dailyDate: '',
    month: '',
    year: '2026',
    triwulan: '1',
    semester: '1',
    startDate: '',
    endDate: '',
    search: ''
  },
  rekeningFilters: {
    periodType: 'monthly',
    dailyDate: '',
    month: '',
    year: '2026',
    triwulan: '1',
    semester: '1',
    startDate: '',
    endDate: '',
    search: ''
  },
  bkuFilters: {
    periodType: 'monthly',
    dailyDate: '',
    month: '',
    year: '2026',
    triwulan: '1',
    semester: '1',
    startDate: '',
    endDate: '',
    search: ''
  },
  rekapKasFilters: {
    periodType: 'monthly',
    dailyDate: '',
    month: '',
    year: '2026',
    triwulan: '1',
    semester: '1',
    startDate: '',
    endDate: '',
    search: '',
    activeTab: 'tab-rekap-matrix'
  },
  reportsTab: 'report-tab-services',
  selectedTransactionForReceipt: null,
  rekeningKoranFilters: {
    year: '2026',
    month: 'all',
    bank: 'all',
    search: ''
  },
  selectedRekeningKoran: null,
  stagedRekeningKoranFile: null,
  setoranTunaiFilters: {
    periodType: 'monthly',
    dailyDate: '',
    month: String(new Date().getMonth() + 1),
    year: '2026',
    triwulan: '1',
    semester: '1',
    startDate: '',
    endDate: '',
    status: 'all',
    search: '',
    activeTab: 'tab-setoran-trx'
  },
  dashboardSetoranPeriod: 'monthly',
  selectedSetoranTrxIds: new Set(),
  stagedSetoranSlipFile: null
};

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  initApplication();
});

function initApplication() {
  // Setup theme
  initTheme();

  // Setup Authentication & Login System
  setupAuthSystem();

  // Setup Navigation
  setupNavigation();

  // Setup Account Dropdown Menu
  setupAccountDropdown();

  // Setup Role Switcher
  setupRoleSwitcher();

  // Populate Dropdowns & Forms
  populateSelectOptions();

  // Pre-render parameters
  renderParametersView();

  // Initialize View
  switchView('dashboard');

  // Bind Form Events
  setupFormHandlers();

  // Bind Search & Filters
  setupTableFilters();

  // Setup Rekap Per Layanan Handlers
  setupReportsHandlers();

  // Setup Rekening Pendapatan Handlers
  setupRekeningHandlers();

  // Setup BKU Cash Filters
  setupBkuFilters();

  // Setup Rekap Kas Handlers
  setupRekapKasHandlers();

  // Setup Unified Reports Hub Tabs
  setupReportsHubTabs();

  // Setup Rekening Koran Handlers
  setupRekeningKoranHandlers();

  // Setup Setoran Tunai Handlers
  setupSetoranTunaiHandlers();

  // Setup Responsive Sidebar Toggle
  setupMobileSidebar();

  // Setup Date Displays
  updateCurrentDateDisplay();
}

/**
 * Theme initialization
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtns = [document.getElementById('themeToggleBtn'), document.getElementById('loginThemeToggleBtn')];
  themeBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
        updateThemeIcon(nextTheme);

        // Refresh charts colors if rendered
        if (AppState.currentView === 'dashboard') {
          renderDashboardCharts();
        }
      });
    }
  });
}

function updateThemeIcon(theme) {
  const btns = [document.getElementById('themeToggleBtn'), document.getElementById('loginThemeToggleBtn')];
  btns.forEach(btn => {
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      btn.title = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
    }
  });
}

/**
 * Setup Authentication System (Login, Logout, Session check)
 */
function setupAuthSystem() {
  const loginScreen = document.getElementById('loginScreen');
  const appContainer = document.getElementById('appContainer');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const alertEl = document.getElementById('loginAlert');
  const alertMsg = document.getElementById('loginAlertMsg');
  const tabAdmin = document.getElementById('tabLoginAdmin');
  const tabPimpinan = document.getElementById('tabLoginPimpinan');
  const hintText = document.getElementById('loginHintText');
  const topbarLogoutBtn = document.getElementById('topbarLogoutBtn');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

  // Check initial authentication state
  if (window.db.isAuthenticated()) {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appContainer) appContainer.style.display = 'flex';
    const user = window.db.getCurrentUser();
    setAppRole(user.role || 'admin', false);
  } else {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appContainer) appContainer.style.display = 'none';
  }

  // Toggle Password Visibility
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      togglePassBtn.title = isPassword ? 'Sembunyikan Password' : 'Tampilkan Password';
    });
  }

  // Role Tab Switching in Login Screen
  const switchLoginRoleTab = (role) => {
    if (tabAdmin && tabPimpinan) {
      if (role === 'admin') {
        tabAdmin.classList.add('active');
        tabPimpinan.classList.remove('active');
        if (usernameInput) usernameInput.value = 'admin';
        if (passwordInput) passwordInput.value = 'admin123';
      } else {
        tabPimpinan.classList.add('active');
        tabAdmin.classList.remove('active');
        if (usernameInput) usernameInput.value = 'pimpinan';
        if (passwordInput) passwordInput.value = 'pimpinan123';
      }
    }
    if (alertEl) alertEl.style.display = 'none';
  };

  if (tabAdmin) {
    tabAdmin.addEventListener('click', () => switchLoginRoleTab('admin'));
  }
  if (tabPimpinan) {
    tabPimpinan.addEventListener('click', () => switchLoginRoleTab('pimpinan'));
  }

  if (hintText) {
    hintText.addEventListener('click', () => {
      const activeTab = document.querySelector('.login-role-tab.active');
      const role = activeTab ? activeTab.getAttribute('data-login-role') : 'admin';
      switchLoginRoleTab(role);
      showToast('Kredensial demo terisi otomatis', 'info');
    });
  }

  // Login Form Submission
  const performLogin = (username, password) => {
    if (alertEl) alertEl.style.display = 'none';

    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      const textEl = submitBtn.querySelector('.btn-text');
      const spinnerEl = submitBtn.querySelector('.btn-spinner');
      if (textEl) textEl.style.display = 'none';
      if (spinnerEl) spinnerEl.style.display = 'inline-flex';
    }

    setTimeout(() => {
      const result = window.db.authenticate(username, password);

      if (submitBtn) {
        submitBtn.disabled = false;
        const textEl = submitBtn.querySelector('.btn-text');
        const spinnerEl = submitBtn.querySelector('.btn-spinner');
        if (textEl) textEl.style.display = 'inline-flex';
        if (spinnerEl) spinnerEl.style.display = 'none';
      }

      if (!result.success) {
        if (alertEl && alertMsg) {
          alertMsg.textContent = result.message;
          alertEl.style.display = 'flex';
        }
        return;
      }

      // Success Login
      const user = window.db.login(result.user);
      setAppRole(user.role, false);

      if (loginScreen) {
        loginScreen.classList.add('hidden');
      }
      if (appContainer) {
        appContainer.style.display = 'flex';
      }

      // Reset to dashboard and update views
      switchView('dashboard');
      showToast(`Selamat datang, ${user.name}! (${user.roleTitle})`, 'success');
    }, 300);
  };

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = usernameInput ? usernameInput.value : '';
      const p = passwordInput ? passwordInput.value : '';
      performLogin(u, p);
    });
  }

  // Logout Buttons trigger Modal
  const profileLogoutBtn = document.getElementById('profileMenuLogoutBtn');
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', () => {
      openLogoutModal();
      closeAccountMenu();
    });
  }
  if (topbarLogoutBtn) {
    topbarLogoutBtn.addEventListener('click', () => {
      openLogoutModal();
    });
  }
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.addEventListener('click', () => {
      openLogoutModal();
    });
  }
}

/**
 * Logout Modal Controls
 */
window.openLogoutModal = function () {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.add('active');
  }
};

window.closeLogoutModal = function () {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.executeLogout = function () {
  closeLogoutModal();
  closeAccountMenu();
  window.db.logout();

  const loginScreen = document.getElementById('loginScreen');
  const appContainer = document.getElementById('appContainer');

  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appContainer) appContainer.style.display = 'none';

  // Reset form alert
  const alertEl = document.getElementById('loginAlert');
  if (alertEl) alertEl.style.display = 'none';

  showToast('Anda telah berhasil keluar dari sistem SIDIGIMON.', 'info');
};

/**
 * Setup Navigation Links
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewTarget = link.getAttribute('data-view');
      switchView(viewTarget);

      // Close mobile sidebar if open
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });
}

/**
 * Setup Topbar User Account Dropdown Controller
 */
function setupAccountDropdown() {
  const profileBtn = document.getElementById('topbarAccountProfile');
  const dropdownWrapper = document.getElementById('topbarAccountDropdownWrapper');

  if (!profileBtn || !dropdownWrapper) return;

  profileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownWrapper.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!dropdownWrapper.contains(e.target)) {
      dropdownWrapper.classList.remove('active');
    }
  });

  // Close with Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownWrapper.classList.remove('active');
    }
  });
}

window.closeAccountMenu = function () {
  const dropdownWrapper = document.getElementById('topbarAccountDropdownWrapper');
  if (dropdownWrapper) {
    dropdownWrapper.classList.remove('active');
  }
};

/**
 * View Switcher
 */
function switchView(viewName) {
  AppState.currentView = viewName;

  // Update Nav Active State
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Hide all views, show targeted view
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSection = document.getElementById(`view-${viewName}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update Topbar Title
  const titles = {
    dashboard: { title: 'Dashboard Monitoring Penerimaan', desc: 'Ringkasan eksekutif dan statistik penerimaan pembayaran' },
    'input-payment': { title: 'Input Pembayaran Baru', desc: 'Pencatatan transaksi dan penerbitan kuitansi digital otomatis' },
    transactions: { title: 'Riwayat & Pencarian Transaksi', desc: 'Daftar seluruh rekam pembayaran dengan pencarian multi-parameter' },
    'master-data': { title: 'Manajemen Master Data', desc: 'Pengelolaan katalog 12 layanan resmi dan metode pembayaran' },
    reports: { title: 'Rekapitulasi & Laporan Penerimaan', desc: 'Penyusunan rekapitulasi layanan, Buku Kas Umum (Tunai), dan rekap kas cash & transfer' },
    parameters: { title: 'Parameter Pejabat Penandatangan', desc: 'Pengaturan nama pejabat dan NIP penandatangan seluruh berkas laporan cetak resmi' },
    'audit-trail': { title: 'Audit Trail & Log Aktivitas', desc: 'Jejak rekam aktivitas pengguna untuk akuntabilitas data' },
    'rekening-koran': { title: 'Rekening Koran Bank & Dokumen Mutasi', desc: 'Pengunggahan, pengarsipan, dan verifikasi dokumen rekening koran resmi per bulan dan tahun' },
    'setoran-tunai': { title: 'Setoran Tunai Bank Jateng & Rekonsiliasi Kas', desc: 'Pencatatan, pemantauan, dan rekonsiliasi setoran kas tunai ke Rekening Bank Jateng (1-002-007181) per periode' }
  };

  const pageInfo = titles[viewName] || { title: 'STP e-Receipt', desc: 'Sistem Penerimaan Digital' };
  document.getElementById('pageTitle').textContent = pageInfo.title;
  document.getElementById('pageSubtitle').textContent = pageInfo.desc;

  // Render view-specific data
  switch (viewName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'input-payment':
      resetPaymentForm();
      break;
    case 'transactions':
      renderTransactionsTable();
      break;
    case 'master-data':
      renderMasterDataTables();
      break;
    case 'parameters':
      renderParametersView();
      break;
    case 'reports':
      if (AppState.currentRole === 'pimpinan' && AppState.reportsTab !== 'report-tab-services') {
        switchReportTab('report-tab-services');
      } else {
        switchReportTab(AppState.reportsTab || 'report-tab-services');
      }
      break;
    case 'bku-cash':
      switchView('reports');
      switchReportTab('report-tab-bku');
      break;
    case 'rekap-kas':
      switchView('reports');
      switchReportTab('report-tab-rekap-kas');
      break;
    case 'audit-trail':
      renderAuditLogs();
      break;
    case 'rekening-koran':
      renderRekeningKoranView();
      break;
    case 'setoran-tunai':
      renderSetoranTunaiView();
      break;
  }
}

/**
 * Setup Role Switcher (Admin Petugas vs Pimpinan)
 */
function setupRoleSwitcher() {
  const roleButtons = document.querySelectorAll('.role-btn[data-role]');
  roleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const role = btn.getAttribute('data-role');
      setAppRole(role);
      setTimeout(() => {
        closeAccountMenu();
      }, 250);
    });
  });

  // Initial role setup
  const user = window.db.getCurrentUser();
  setAppRole(user.role || 'admin', false);
}

function setAppRole(role, notify = true) {
  AppState.currentRole = role;
  const user = window.db.setCurrentRole(role);

  // Update UI Switcher buttons
  document.querySelectorAll('.role-btn[data-role]').forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Top-Right Header User Account Profile (Foto, Nama Pejabat, NIP)
  updateTopBarUserDisplay();

  // Show/Hide Role Specific elements (e.g. Master Data & Input only for Admin or marked)
  const adminOnlyElements = document.querySelectorAll('.admin-only');
  adminOnlyElements.forEach(el => {
    el.style.display = role === 'admin' ? '' : 'none';
  });

  // If pimpinan is active and current view is admin-only, redirect to dashboard
  if (role === 'pimpinan') {
    if (AppState.currentView === 'input-payment' || AppState.currentView === 'master-data') {
      switchView('dashboard');
    }
    if (AppState.currentView === 'reports' && (AppState.reportsTab === 'report-tab-bku' || AppState.reportsTab === 'report-tab-rekap-kas')) {
      switchReportTab('report-tab-services');
    }
  }

  if (notify) {
    showToast(`Beralih ke mode ${role === 'admin' ? 'Petugas Admin' : 'Pimpinan / Kepala UPTD'}`, 'info');
  }

  if (typeof closeEditNotesModal === 'function') {
    closeEditNotesModal();
  }

  // Refresh current view
  switchView(AppState.currentView);
}

/**
 * Update Top-Right Header User Account Display (Foto, Nama Pejabat, NIP, Jabatan)
 */
function updateTopBarUserDisplay() {
  const role = AppState.currentRole || 'admin';
  const user = window.db.getCurrentUser();

  // Ambil data pejabat yang sesuai dari master parameter
  let official = null;
  if (typeof window.db !== 'undefined' && typeof window.db.getOfficialByRole === 'function') {
    if (role === 'admin') {
      official = window.db.getOfficialByRole('bendahara_penerimaan');
    } else {
      official = window.db.getOfficialByRole('kepala_uptd');
    }
  }

  const name = (official && official.name) ? official.name : user.name;
  const nip = (official && official.nip) ? `NIP. ${official.nip}` : (user.nip ? `NIP. ${user.nip}` : 'NIP. -');
  const roleTitle = (official && official.position) ? official.position : user.roleTitle;
  const avatarIcon = role === 'admin' ? '<i class="fa-solid fa-user-pen"></i>' : '<i class="fa-solid fa-user-tie"></i>';

  const userNameEl = document.getElementById('topbarUserName');
  const userNipEl = document.getElementById('topbarUserNip');
  const userRoleEl = document.getElementById('topbarUserRole');
  const userAvatarEl = document.getElementById('topbarUserAvatar');

  if (userNameEl) userNameEl.textContent = name;
  if (userNipEl) userNipEl.textContent = nip;
  if (userRoleEl) userRoleEl.textContent = roleTitle;
  if (userAvatarEl) userAvatarEl.innerHTML = avatarIcon;
}

/**
 * Dynamic Select Options Population
 */
function populateSelectOptions() {
  const services = window.db.getServices().filter(s => s.status === 'active');
  const methods = window.db.getPaymentMethods().filter(m => m.isActive);

  // Input Form Selects
  const serviceSelect = document.getElementById('inputService');
  if (serviceSelect) {
    serviceSelect.innerHTML = '<option value="">-- Pilih Jenis Layanan --</option>' +
      services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  const methodSelect = document.getElementById('inputPaymentMethod');
  if (methodSelect) {
    methodSelect.innerHTML = '<option value="">-- Pilih Metode Bayar --</option>' +
      methods.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }

  // Filter Selects in Transactions View
  const filterService = document.getElementById('filterService');
  if (filterService) {
    filterService.innerHTML = '<option value="">Semua Layanan</option>' +
      services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  const filterMethod = document.getElementById('filterPaymentMethod');
  if (filterMethod) {
    filterMethod.innerHTML = '<option value="">Semua Metode</option>' +
      methods.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  }
}

/**
 * Dashboard Rendering Logic
 */
function renderDashboard() {
  const transactions = window.db.getTransactions();
  const services = window.db.getServices();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const todayStr = now.toISOString().split('T')[0];

  // Calculations
  let todayTotal = 0;
  let todayCount = 0;
  let monthTotal = 0;
  let monthCount = 0;
  let yearTotal = 0;

  transactions.forEach(t => {
    const tDate = new Date(t.paymentDate);
    const amount = Number(t.amount) || 0;
    const tYear = isNaN(tDate.getTime()) ? 2026 : tDate.getFullYear();
    const tMonth = isNaN(tDate.getTime()) ? 7 : tDate.getMonth();

    // Today
    if (t.paymentDate === todayStr) {
      todayTotal += amount;
      todayCount += 1;
    }

    // Month
    if ((tYear === currentYear && tMonth === currentMonth) || (tYear === 2026 && tMonth === 7)) {
      monthTotal += amount;
      monthCount += 1;
    }

    // Year
    if (tYear === currentYear || tYear === 2026) {
      yearTotal += amount;
    }
  });

  // Fallback for today if current local day has no direct manual entries yet
  if (todayCount === 0 && transactions.length > 0) {
    const latestDate = transactions[0]?.paymentDate;
    const latestTrxs = transactions.filter(t => t.paymentDate === latestDate);
    todayTotal = latestTrxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    todayCount = latestTrxs.length;
  }

  const avgTransaction = transactions.length > 0 ? (yearTotal / transactions.length) : 0;

  // DOM Updates
  document.getElementById('statTodayTotal').textContent = formatCurrency(todayTotal);
  document.getElementById('statTodayCount').textContent = `${todayCount} Transaksi Hari Ini`;

  document.getElementById('statMonthTotal').textContent = formatCurrency(monthTotal);
  document.getElementById('statMonthCount').textContent = `${monthCount} Transaksi Bulan Ini`;

  document.getElementById('statYearTotal').textContent = formatCurrency(yearTotal);
  document.getElementById('statTotalCount').textContent = `${transactions.length} Total Transaksi`;

  document.getElementById('statAvgTransaction').textContent = formatCurrency(avgTransaction);

  // Render Charts
  renderDashboardCharts();

  // Render Recent Transactions on Dashboard
  renderDashboardRecentTransactions();
}

/**
 * Render Dashboard Charts (Monthly Trends & Service Distribution)
 */
function renderDashboardCharts() {
  const transactions = window.db.getTransactions();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  // 1. Monthly Revenue Aggregation (Jan - Dec 2026)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyData = new Array(12).fill(0);

  transactions.forEach(t => {
    const d = new Date(t.paymentDate);
    const m = isNaN(d.getTime()) ? 0 : d.getMonth();
    const y = isNaN(d.getTime()) ? 2026 : d.getFullYear();
    if (y === 2026 || y === currentYear) {
      monthlyData[m] += Number(t.amount) || 0;
    }
  });

  const trendCtx = document.getElementById('chartMonthlyTrend');
  if (trendCtx) {
    if (AppState.charts.monthlyTrend) {
      AppState.charts.monthlyTrend.destroy();
    }

    AppState.charts.monthlyTrend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'Penerimaan (Rp)',
          data: monthlyData,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          hoverBackgroundColor: '#4f46e5',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Penerimaan: ${formatCurrency(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (val) => `${val / 1000000} Jt`
            }
          }
        }
      }
    });
  }

  // 2. Service Category Distribution
  const services = window.db.getServices();
  const serviceCategories = {};

  transactions.forEach(t => {
    const s = services.find(item => item.id === t.serviceId);
    const cat = s ? (s.category || s.name) : 'Lainnya';
    serviceCategories[cat] = (serviceCategories[cat] || 0) + (Number(t.amount) || 0);
  });

  const catLabels = Object.keys(serviceCategories);
  const catValues = Object.values(serviceCategories);
  const chartColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const distCtx = document.getElementById('chartServiceDist');
  if (distCtx) {
    if (AppState.charts.serviceDistribution) {
      AppState.charts.serviceDistribution.destroy();
    }

    AppState.charts.serviceDistribution = new Chart(distCtx, {
      type: 'doughnut',
      data: {
        labels: catLabels,
        datasets: [{
          data: catValues,
          backgroundColor: chartColors.slice(0, catLabels.length),
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#131b2e' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 12,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
            }
          }
        },
        cutout: '68%'
      }
    });
  }
}

/**
 * Render Recent Transactions on Dashboard table
 */
function renderDashboardRecentTransactions() {
  const tbody = document.getElementById('dashboardRecentTableBody');
  if (!tbody) return;

  const transactions = window.db.getTransactions().slice(0, 5);
  const services = window.db.getServices();

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Belum ada transaksi tercatat.</td></tr>`;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    const displayName = t.tenantName || 'Pembayar / Mitra';
    const displayOrigin = t.payerOrigin ? `<div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-location-dot" style="color:var(--primary-500); font-size:10px;"></i> ${t.payerOrigin}</div>` : '';
    const service = services.find(item => item.id === t.serviceId);

    return `
      <tr>
        <td>
          <span style="font-weight:700; color:var(--primary-600);">${t.receiptNo}</span>
          <div style="font-size:11px; color:var(--text-muted);">${t.transactionNo}</div>
        </td>
        <td>
          <div style="font-weight:600;">${displayName}</div>
          ${displayOrigin}
        </td>
        <td>${service ? service.name : '-'}</td>
        <td style="font-weight:700; color:var(--accent-emerald);">${formatCurrency(t.amount)}</td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="viewReceiptModal(${t.id})" title="Lihat Kuitansi">
            <i class="fa-solid fa-receipt"></i> Kuitansi
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Form Handlers Setup
 */
function setupFormHandlers() {
  // Dynamic Rate Calculation when Service is chosen
  const serviceSelect = document.getElementById('inputService');
  const amountInput = document.getElementById('inputAmount');
  const terbilangHelper = document.getElementById('inputTerbilangHelper');

  if (serviceSelect && amountInput) {
    serviceSelect.addEventListener('change', () => {
      const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
      const rate = selectedOption.getAttribute('data-rate');
      if (rate && !amountInput.value) {
        amountInput.value = rate;
        updateTerbilangPreview(rate);
      }
    });

    amountInput.addEventListener('input', () => {
      const val = Number(amountInput.value);
      updateTerbilangPreview(val);
      updateFieldStatus(amountInput, document.getElementById('badgeAmount'), val > 0, '✓ Valid', '✗ Nominal Wajib Diisi');
    });
  }

  function updateTerbilangPreview(num) {
    if (terbilangHelper) {
      terbilangHelper.textContent = num > 0 ? `Terbilang: ${terbilangRupiah(num)}` : '';
    }
  }

  // Realtime Live Validation Listeners for Input Payment Form
  const tenantInput = document.getElementById('inputTenant');
  const serviceInput = document.getElementById('inputService');
  const dateInput = document.getElementById('inputDate');
  const methodInput = document.getElementById('inputPaymentMethod');

  if (tenantInput) {
    tenantInput.addEventListener('input', () => {
      const v = tenantInput.value.trim();
      updateFieldStatus(tenantInput, document.getElementById('badgeTenant'), v.length > 0, '✓ Terisi', '✗ Wajib Diisi');
    });
  }

  if (serviceInput) {
    serviceInput.addEventListener('change', () => {
      const v = Number(serviceInput.value);
      updateFieldStatus(serviceInput, document.getElementById('badgeService'), v > 0, '✓ Terpilih', '✗ Wajib Pilih Layanan');
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const v = dateInput.value.trim();
      updateFieldStatus(dateInput, document.getElementById('badgeDate'), v.length > 0, '✓ Valid', '✗ Wajib Isi Tanggal');
    });
  }

  if (methodInput) {
    methodInput.addEventListener('change', () => {
      const v = Number(methodInput.value);
      updateFieldStatus(methodInput, document.getElementById('badgePaymentMethod'), v > 0, '✓ Terpilih', '✗ Wajib Pilih Metode');
      updateRefNoFieldByPaymentMethod();
    });
  }

  const inputRefNoEl = document.getElementById('inputRefNo');
  if (inputRefNoEl) {
    inputRefNoEl.addEventListener('input', () => {
      const selectedMethodId = Number(document.getElementById('inputPaymentMethod')?.value);
      const methods = window.db.getPaymentMethods();
      const selectedMethod = methods.find(m => m.id === selectedMethodId);
      const isTransferKM = selectedMethod && (selectedMethod.name === 'Transfer Tanpa Bukti (KM)' || selectedMethod.code === 'TRANSFER_KM');
      if (isTransferKM) {
        const v = inputRefNoEl.value.trim();
        updateFieldStatus(inputRefNoEl, document.getElementById('badgeRefNo'), v.length > 0, '✓ Terisi', '✗ Wajib Isi No Referensi');
      }
    });
  }

  // Handle Kekurangan Pembayaran (Remaining Amount) Helper & Status Switcher
  const inputRemainingAmount = document.getElementById('inputRemainingAmount');
  const remainingTerbilangHelper = document.getElementById('inputRemainingTerbilangHelper');
  const inputStatus = document.getElementById('inputStatus');
  const groupRemainingAmount = document.getElementById('groupRemainingAmount');

  if (inputRemainingAmount) {
    inputRemainingAmount.addEventListener('input', () => {
      const val = Number(inputRemainingAmount.value) || 0;
      if (remainingTerbilangHelper) {
        remainingTerbilangHelper.textContent = val > 0 ? `Kekurangan: ${terbilangRupiah(val)}` : '';
      }
      if (inputStatus && inputStatus.value === 'BELUM LUNAS') {
        updateFieldStatus(inputRemainingAmount, document.getElementById('badgeRemaining'), val > 0, '✓ Valid', '✗ Wajib Isi Nominal Kekurangan');
      }
    });
  }

  if (inputStatus && inputRemainingAmount) {
    const updateStatusRemainingVisibility = () => {
      const isBelum = inputStatus.value === 'BELUM LUNAS';
      if (groupRemainingAmount) {
        groupRemainingAmount.style.display = isBelum ? 'block' : 'none';
      }
      if (isBelum) {
        inputRemainingAmount.style.borderColor = 'var(--accent-amber)';
        const curVal = Number(inputRemainingAmount.value) || 0;
        if (curVal === 0) {
          inputRemainingAmount.value = '';
          inputRemainingAmount.focus();
        }
        updateFieldStatus(inputRemainingAmount, document.getElementById('badgeRemaining'), Number(inputRemainingAmount.value) > 0, '✓ Valid', '✗ Wajib Isi Nominal Kekurangan');
      } else {
        inputRemainingAmount.style.borderColor = '';
        inputRemainingAmount.value = 0;
        if (remainingTerbilangHelper) remainingTerbilangHelper.textContent = '';
        updateFieldStatus(inputRemainingAmount, document.getElementById('badgeRemaining'), null);
      }
    };

    inputStatus.addEventListener('change', updateStatusRemainingVisibility);
    updateStatusRemainingVisibility();
  }

  // Auto-Generate Button & Date Listener for Reference / Slip Number
  const btnAutoGenerateRefNo = document.getElementById('btnAutoGenerateRefNo');
  const inputRefNo = document.getElementById('inputRefNo');
  const inputDate = document.getElementById('inputDate');

  if (btnAutoGenerateRefNo && inputRefNo) {
    btnAutoGenerateRefNo.addEventListener('click', () => {
      const selectedDate = inputDate && inputDate.value ? inputDate.value : new Date().toISOString().split('T')[0];
      const autoNo = window.db.generateNextReceiptNo(selectedDate);
      inputRefNo.value = autoNo;
      showToast(`Nomor bukti diisi otomatis: ${autoNo}`, 'info');
    });
  }

  // Update auto-number on date change if input is empty or matches KM- auto format
  if (inputDate && inputRefNo) {
    inputDate.addEventListener('change', () => {
      const methodSelect = document.getElementById('inputPaymentMethod');
      const selectedMethodId = Number(methodSelect?.value);
      const methods = window.db.getPaymentMethods();
      const selectedMethod = methods.find(m => m.id === selectedMethodId);
      const isTransferKM = selectedMethod && (selectedMethod.name === 'Transfer Tanpa Bukti (KM)' || selectedMethod.code === 'TRANSFER_KM');
      if (isTransferKM) return; // Do not overwrite manual reference

      const currentVal = inputRefNo.value.trim();
      if (!currentVal || /^KM-(?:\d{4}|\d{2})-\d{2}-\d+$/i.test(currentVal)) {
        inputRefNo.value = window.db.generateNextReceiptNo(inputDate.value);
      }
    });
  }

  // Submit Payment Form
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const tenantInput = document.getElementById('inputTenant');
      const tenantName = tenantInput ? tenantInput.value.trim() : '';
      const payerOriginInput = document.getElementById('inputPayerOrigin');
      const payerOrigin = payerOriginInput ? payerOriginInput.value.trim() : '';

      const serviceId = Number(document.getElementById('inputService').value);
      const amount = Number(document.getElementById('inputAmount').value);
      const paymentDate = document.getElementById('inputDate').value;
      const paymentMethodId = Number(document.getElementById('inputPaymentMethod').value);
      const referenceNo = document.getElementById('inputRefNo').value.trim();
      const statusInput = document.getElementById('inputStatus');
      const status = statusInput ? statusInput.value : 'LUNAS';
      const isStatusBelumLunas = status === 'BELUM LUNAS';
      let remainingAmount = 0;
      const notes = document.getElementById('inputNotes').value.trim();

      // Field Validation Checks
      let isFormValid = true;

      // 1. Nama Pembayar
      const validTenant = tenantName.length > 0;
      updateFieldStatus(tenantInput, document.getElementById('badgeTenant'), validTenant, '✓ Terisi', '✗ Wajib Diisi');
      if (!validTenant) isFormValid = false;

      // 2. Jenis Layanan
      const validService = !isNaN(serviceId) && serviceId > 0;
      updateFieldStatus(document.getElementById('inputService'), document.getElementById('badgeService'), validService, '✓ Terpilih', '✗ Wajib Pilih Layanan');
      if (!validService) isFormValid = false;

      // 3. Nominal
      const validAmount = !isNaN(amount) && amount > 0;
      updateFieldStatus(document.getElementById('inputAmount'), document.getElementById('badgeAmount'), validAmount, '✓ Valid', '✗ Nominal Wajib Diisi');
      if (!validAmount) isFormValid = false;

      // 4. Tanggal
      const validDate = paymentDate && paymentDate.trim().length > 0;
      updateFieldStatus(document.getElementById('inputDate'), document.getElementById('badgeDate'), validDate, '✓ Valid', '✗ Wajib Isi Tanggal');
      if (!validDate) isFormValid = false;

      // 5. Metode Bayar
      const validMethod = !isNaN(paymentMethodId) && paymentMethodId > 0;
      updateFieldStatus(document.getElementById('inputPaymentMethod'), document.getElementById('badgePaymentMethod'), validMethod, '✓ Terpilih', '✗ Wajib Pilih Metode');
      if (!validMethod) isFormValid = false;

      // 5b. Validasi Nomor Referensi khusus Transfer Tanpa Bukti (KM)
      const selectedMethodObj = window.db.getPaymentMethods().find(m => m.id === paymentMethodId);
      const isTransferKM = selectedMethodObj && (selectedMethodObj.name === 'Transfer Tanpa Bukti (KM)' || selectedMethodObj.code === 'TRANSFER_KM');
      if (isTransferKM) {
        const validRef = referenceNo.length > 0;
        updateFieldStatus(document.getElementById('inputRefNo'), document.getElementById('badgeRefNo'), validRef, '✓ Terisi', '✗ Wajib Isi No Referensi');
        if (!validRef) isFormValid = false;
      }

      // 6. Kekurangan Pembayaran (Wajib diisi bila Belum Lunas)
      if (isStatusBelumLunas) {
        remainingAmount = Number(document.getElementById('inputRemainingAmount')?.value) || 0;
        const validRemaining = remainingAmount > 0;
        updateFieldStatus(document.getElementById('inputRemainingAmount'), document.getElementById('badgeRemaining'), validRemaining, '✓ Valid', '✗ Wajib Isi Nominal Kekurangan');
        if (!validRemaining) isFormValid = false;
      } else {
        remainingAmount = 0;
      }

      const feedbackEl = document.getElementById('paymentFormFeedback');

      if (!isFormValid) {
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.innerHTML = `
            <div class="form-feedback-banner error">
              <div class="feedback-icon"><i class="fa-solid fa-circle-xmark"></i></div>
              <div class="feedback-text">
                <h4>Input Pembayaran Gagal! (✗)</h4>
                <p>Terdapat kolom yang belum lengkap atau tidak valid (bertanda silang merah). Mohon lengkapi seluruh kolom wajib sebelum menyimpan.</p>
              </div>
            </div>
          `;
          feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showToast('✗ Input Pembayaran Gagal! Lengkapi kolom bertanda silang merah.', 'error');
        return;
      }

      // Check if matches any existing master tenant
      const matchedTenant = window.db.getTenants().find(t => t.name.toLowerCase() === tenantName.toLowerCase());

      // Save to DataStore
      const newTransaction = window.db.addTransaction({
        tenantId: matchedTenant ? matchedTenant.id : null,
        tenantName: tenantName,
        payerOrigin: payerOrigin,
        serviceId,
        paymentMethodId,
        amount,
        remainingAmount,
        paymentDate,
        referenceNo: referenceNo,
        notes,
        status: status,
        createdBy: window.db.getCurrentUser().name
      });

      // Show Success Banner (Centang ✓)
      if (feedbackEl) {
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = `
          <div class="form-feedback-banner success">
            <div class="feedback-icon"><i class="fa-solid fa-circle-check"></i></div>
            <div class="feedback-text">
              <h4>Input Pembayaran Berhasil! (✓)</h4>
              <p>Transaksi <strong>#${newTransaction.receiptNo}</strong> (${status}) atas nama <strong>${tenantName}</strong> sebesar <strong>${formatCurrency(amount)}</strong> berhasil dicatat.</p>
            </div>
          </div>
        `;
      }

      showToast(`✓ Transaksi ${newTransaction.receiptNo} (${status}) berhasil disimpan!`, 'success');

      // Update transactions table
      renderTransactionsTable();

      // Reset form fields
      resetPaymentForm(false); // don't clear success banner immediately

      // Automatically Open Receipt Modal
      viewReceiptModal(newTransaction.id);
    });
  }
}

/**
 * Helper to update individual field validation indicator (Centang ✓ / Silang ✗)
 */
function updateFieldStatus(inputEl, badgeEl, isValid, validText = '✓ Sesuai', invalidText = '✗ Wajib diisi') {
  if (!inputEl) return;
  if (isValid === null || isValid === undefined) {
    inputEl.classList.remove('is-valid', 'is-invalid');
    if (badgeEl) badgeEl.innerHTML = '';
    return;
  }
  if (isValid) {
    inputEl.classList.add('is-valid');
    inputEl.classList.remove('is-invalid');
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="field-status-badge valid"><i class="fa-solid fa-check"></i> ${validText}</span>`;
    }
  } else {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
    if (badgeEl) {
      badgeEl.innerHTML = `<span class="field-status-badge invalid"><i class="fa-solid fa-xmark"></i> ${invalidText}</span>`;
    }
  }
}

function resetPaymentForm(clearFeedback = true) {
  const form = document.getElementById('paymentForm');
  if (form) form.reset();

  if (clearFeedback) {
    const feedbackEl = document.getElementById('paymentFormFeedback');
    if (feedbackEl) feedbackEl.style.display = 'none';
  }

  // Clear validation classes and badges
  const fieldIds = ['inputTenant', 'inputPayerOrigin', 'inputService', 'inputAmount', 'inputDate', 'inputPaymentMethod', 'inputRefNo', 'inputStatus', 'inputRemainingAmount'];
  const badgeIds = ['badgeTenant', 'badgePayerOrigin', 'badgeService', 'badgeAmount', 'badgeDate', 'badgePaymentMethod', 'badgeRefNo', 'badgeStatus', 'badgeRemaining'];

  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-valid', 'is-invalid');
  });

  badgeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayInput = document.getElementById('inputDate');
  if (todayInput) {
    todayInput.value = todayStr;
  }

  // Reset Kekurangan Pembayaran
  const inputRemaining = document.getElementById('inputRemainingAmount');
  if (inputRemaining) inputRemaining.value = '0';
  const remainingHelper = document.getElementById('inputRemainingTerbilangHelper');
  if (remainingHelper) remainingHelper.textContent = '';
  const groupRemaining = document.getElementById('groupRemainingAmount');
  if (groupRemaining) groupRemaining.style.display = 'none';

  // Pre-fill Nomor Bukti / Slip with auto sequence (editable)
  const inputRefNo = document.getElementById('inputRefNo');
  if (inputRefNo && window.db) {
    inputRefNo.value = window.db.generateNextReceiptNo(todayStr);
  }

  // Reset Status to LUNAS
  const statusInput = document.getElementById('inputStatus');
  if (statusInput) {
    statusInput.value = 'LUNAS';
  }

  const terbilangHelper = document.getElementById('inputTerbilangHelper');
  if (terbilangHelper) terbilangHelper.textContent = '';

  // Update dynamic Ref No label & visibility
  updateRefNoFieldByPaymentMethod();
}

/**
 * Update Nomor Referensi / Bukti Field based on Payment Method
 * (Transfer Tanpa Bukti KM enables manual reference number input)
 */
function updateRefNoFieldByPaymentMethod() {
  const methodSelect = document.getElementById('inputPaymentMethod');
  const labelRefNo = document.getElementById('labelRefNo');
  const inputRefNo = document.getElementById('inputRefNo');
  const btnAutoGenerate = document.getElementById('btnAutoGenerateRefNo');
  const helperRefNo = document.getElementById('helperRefNo');
  const inputDate = document.getElementById('inputDate');

  if (!methodSelect || !inputRefNo) return;

  const selectedMethodId = Number(methodSelect.value);
  const methods = window.db.getPaymentMethods();
  const selectedMethod = methods.find(m => m.id === selectedMethodId);
  const isTransferKM = selectedMethod && (selectedMethod.name === 'Transfer Tanpa Bukti (KM)' || selectedMethod.code === 'TRANSFER_KM');

  if (isTransferKM) {
    if (labelRefNo) {
      labelRefNo.innerHTML = '<i class="fa-solid fa-file-invoice" style="color:var(--primary-600);"></i> Nomor Referensi / Mutasi Bank (KM) <span class="required">*</span> <span id="badgeRefNo"></span>';
    }
    if (btnAutoGenerate) {
      btnAutoGenerate.style.display = 'none';
    }
    if (helperRefNo) {
      helperRefNo.innerHTML = 'Masukkan <strong>Nomor Referensi / ID Mutasi</strong> dari rekening koran untuk pencatatan transaksi tanpa bukti fisik.';
    }
    inputRefNo.placeholder = 'Contoh: TRF-20260814-0988 / NO. REF 1380022007707';
    // If currently holding an auto-generated KM- sequence, clear it for user manual input
    if (/^KM-(?:\d{4}|\d{2})-\d{2}-\d+$/i.test(inputRefNo.value.trim())) {
      inputRefNo.value = '';
    }
  } else {
    if (labelRefNo) {
      labelRefNo.innerHTML = 'Nomor Kuitansi / Bukti <span id="badgeRefNo"></span>';
    }
    if (btnAutoGenerate) {
      btnAutoGenerate.style.display = 'inline-flex';
    }
    if (helperRefNo) {
      helperRefNo.innerHTML = 'Dibuat otomatis dengan format urutan <strong>KM-Tahun(2 angka)-Bulan-Nomer Urut</strong> contoh: <code>KM-26-08-008</code> (tetap dapat diedit secara manual bila diperlukan).';
    }
    inputRefNo.placeholder = 'Contoh: KM-26-08-008';
    // Auto-generate if empty
    if (!inputRefNo.value.trim()) {
      const selectedDate = inputDate && inputDate.value ? inputDate.value : new Date().toISOString().split('T')[0];
      inputRefNo.value = window.db.generateNextReceiptNo(selectedDate);
    }
  }
}

/**
 * Filter and Search Logic for Transactions View
 */
/**
 * Filter and Search Logic for Transactions View
 */
function setupTableFilters() {
  const searchInput = document.getElementById('trxSearchInput');
  const serviceFilter = document.getElementById('filterService');
  const methodFilter = document.getElementById('filterPaymentMethod');
  const statusFilter = document.getElementById('filterStatus');
  const startDateFilter = document.getElementById('filterStartDate');
  const endDateFilter = document.getElementById('filterEndDate');
  const monthFilter = document.getElementById('filterMonth');
  const yearFilter = document.getElementById('filterYear');
  const resetBtn = document.getElementById('btnResetFilter');

  const btnExportTrx = document.getElementById('btnExportTrxExcel');
  const btnPrintTrx = document.getElementById('btnPrintTrxReport');

  const triggerFilter = () => {
    AppState.activeFilters.search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    AppState.activeFilters.serviceId = serviceFilter ? serviceFilter.value : '';
    AppState.activeFilters.methodId = methodFilter ? methodFilter.value : '';
    AppState.activeFilters.status = statusFilter ? statusFilter.value : '';
    AppState.activeFilters.startDate = startDateFilter ? startDateFilter.value : '';
    AppState.activeFilters.endDate = endDateFilter ? endDateFilter.value : '';
    AppState.activeFilters.month = monthFilter ? monthFilter.value : '';
    AppState.activeFilters.year = yearFilter ? yearFilter.value : '';
    renderTransactionsTable();
  };

  if (searchInput) searchInput.addEventListener('input', triggerFilter);
  if (serviceFilter) serviceFilter.addEventListener('change', triggerFilter);
  if (methodFilter) methodFilter.addEventListener('change', triggerFilter);
  if (statusFilter) statusFilter.addEventListener('change', triggerFilter);
  if (startDateFilter) startDateFilter.addEventListener('change', triggerFilter);
  if (endDateFilter) endDateFilter.addEventListener('change', triggerFilter);
  if (monthFilter) monthFilter.addEventListener('change', triggerFilter);
  if (yearFilter) yearFilter.addEventListener('change', triggerFilter);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (serviceFilter) serviceFilter.value = '';
      if (methodFilter) methodFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      if (startDateFilter) startDateFilter.value = '';
      if (endDateFilter) endDateFilter.value = '';
      if (monthFilter) monthFilter.value = '';
      if (yearFilter) yearFilter.value = '';
      triggerFilter();
      showToast('Filter pencarian transaksi direset.', 'info');
    });
  }

  // Bind Export & Print for Transactions View
  if (btnExportTrx) {
    btnExportTrx.onclick = () => exportFilteredTransactionsExcel();
  }
  if (btnPrintTrx) {
    btnPrintTrx.onclick = () => printTransactionsReport();
  }
}

/**
 * Get Filtered Transactions List
 */
function getFilteredTransactionsList() {
  let list = window.db.getTransactions();
  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.activeFilters;

  if (f.search) {
    list = list.filter(t => {
      const tenantName = t.tenantName || '';
      const origin = t.payerOrigin || '';
      const service = services.find(item => item.id === t.serviceId);
      const method = methods.find(item => item.id === t.paymentMethodId);
      const searchStr = `${t.transactionNo} ${t.receiptNo} ${t.referenceNo} ${t.notes} ${t.status} ${tenantName} ${origin} ${service ? service.name : ''} ${method ? method.name : ''}`.toLowerCase();
      return searchStr.includes(f.search.toLowerCase());
    });
  }

  if (f.serviceId) {
    list = list.filter(t => t.serviceId === Number(f.serviceId));
  }
  if (f.methodId) {
    list = list.filter(t => t.paymentMethodId === Number(f.methodId));
  }
  if (f.status) {
    list = list.filter(t => (t.status || 'LUNAS').toUpperCase() === f.status.toUpperCase());
  }
  if (f.startDate) {
    list = list.filter(t => t.paymentDate >= f.startDate);
  }
  if (f.endDate) {
    list = list.filter(t => t.paymentDate <= f.endDate);
  }

  // Filter Periode Bulan (Januari s/d Desember)
  if (f.month) {
    list = list.filter(t => {
      if (!t.paymentDate) return false;
      const m = new Date(t.paymentDate).getMonth() + 1;
      return m === Number(f.month);
    });
  }

  // Filter Tahun
  if (f.year) {
    list = list.filter(t => {
      if (!t.paymentDate) return false;
      const y = new Date(t.paymentDate).getFullYear();
      return y === Number(f.year);
    });
  }

  return list;
}

/**
 * Render Transactions Full Table & Rekap Input Pembayaran Metrics
 */
function renderTransactionsTable() {
  const tbody = document.getElementById('transactionsTableBody');
  if (!tbody) return;

  const list = getFilteredTransactionsList();
  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.activeFilters;

  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // Hitung Metrik Rekap Input Pembayaran
  const totalTrx = list.length;
  const totalAmount = list.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const cashTrx = list.filter(t => t.paymentMethodId === 1);
  const cashSum = cashTrx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const transferTrx = list.filter(t => t.paymentMethodId !== 1);
  const transferSum = transferTrx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const lunasTrx = list.filter(t => (t.status || 'LUNAS').toUpperCase() === 'LUNAS');
  const belumLunasTrx = list.filter(t => (t.status || '').toUpperCase() === 'BELUM LUNAS');
  const remainingSum = belumLunasTrx.reduce((sum, t) => sum + (Number(t.remainingAmount) || 0), 0);

  // Update Period Badge & Subtitles
  const badgeEl = document.getElementById('rekapPeriodBadge');
  if (badgeEl) {
    if (f.month && f.year) {
      badgeEl.textContent = `(Periode: ${monthNames[Number(f.month)]} ${f.year})`;
    } else if (f.month) {
      badgeEl.textContent = `(Periode: ${monthNames[Number(f.month)]})`;
    } else if (f.year) {
      badgeEl.textContent = `(Periode Tahun: ${f.year})`;
    } else {
      badgeEl.textContent = `(Semua Periode Bulan)`;
    }
  }

  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElText('rekapTrxCount', totalTrx);
  setElText('rekapTrxCountSub', `${totalTrx} transaksi pada periode ini`);
  setElText('rekapTotalAmount', formatCurrency(totalAmount));
  setElText('rekapTotalAmountSub', `Akumulasi uang masuk (${f.month ? monthNames[Number(f.month)] : 'Semua Bulan'})`);
  setElText('rekapCashAmount', formatCurrency(cashSum));
  setElText('rekapCashCount', `${cashTrx.length} transaksi (${totalAmount > 0 ? ((cashSum / totalAmount) * 100).toFixed(1) : 0}%)`);
  setElText('rekapTransferAmount', formatCurrency(transferSum));
  setElText('rekapTransferCount', `${transferTrx.length} transaksi (${totalAmount > 0 ? ((transferSum / totalAmount) * 100).toFixed(1) : 0}%)`);

  const lunasStatusEl = document.getElementById('rekapLunasStatus');
  if (lunasStatusEl) {
    lunasStatusEl.innerHTML = `<span style="color:#047857;">Lunas: ${lunasTrx.length}</span> &nbsp;|&nbsp; <span style="color:#b45309;">Belum: ${belumLunasTrx.length}</span>`;
  }
  setElText('rekapRemainingTotal', `Sisa Kekurangan: ${formatCurrency(remainingSum)}`);

  // Update counter
  const countEl = document.getElementById('trxResultCount');
  if (countEl) {
    const monthText = f.month ? ` bulan ${monthNames[Number(f.month)]}` : '';
    const yearText = f.year ? ` tahun ${f.year}` : '';
    countEl.textContent = `Menampilkan ${list.length} transaksi${monthText}${yearText}`;
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada transaksi yang cocok dengan pilihan periode bulan / filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((t, idx) => {
    const displayName = t.tenantName || 'Pembayar / Mitra';
    const displayOrigin = t.payerOrigin ? `<div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-location-dot" style="color:var(--primary-500); font-size:10px;"></i> ${t.payerOrigin}</div>` : '';
    const service = services.find(item => item.id === t.serviceId);
    const method = methods.find(item => item.id === t.paymentMethodId);
    const isAdmin = AppState.currentRole === 'admin';

    const notesDisplay = t.notes && t.notes.trim()
      ? (isAdmin
          ? `<div style="font-size:12px; color:var(--text-main); line-height:1.4; max-width:240px; cursor:pointer;" onclick="openEditNotesModal(${t.id})" title="Klik untuk melihat / mengedit rincian keterangan & status">
               <i class="fa-regular fa-note-sticky" style="color:var(--primary-500); font-size:11.5px; margin-right:4px;"></i>
               <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">${t.notes.trim()}</span>
             </div>`
          : `<div style="font-size:12px; color:var(--text-main); line-height:1.4; max-width:240px;">
               <i class="fa-regular fa-note-sticky" style="color:var(--primary-500); font-size:11.5px; margin-right:4px;"></i>
               <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">${t.notes.trim()}</span>
             </div>`
        )
      : (isAdmin
          ? `<span style="font-size:11.5px; color:var(--text-subtle); font-style:italic; cursor:pointer;" onclick="openEditNotesModal(${t.id})" title="Klik untuk menambahkan rincian keterangan">+ Tambah catatan</span>`
          : `<span style="font-size:11.5px; color:var(--text-subtle); font-style:italic;">-</span>`
        );

    const isLunas = (t.status || 'LUNAS').toUpperCase() === 'LUNAS';
    const statusBadge = isLunas
      ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> LUNAS</span>`
      : `<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> BELUM LUNAS</span>`;

    const remainingDisplay = (t.remainingAmount && Number(t.remainingAmount) > 0)
      ? `<div style="font-size:11px; color:#d97706; font-weight:700; margin-top:3px;"><i class="fa-solid fa-triangle-exclamation"></i> Sisa: ${formatCurrency(t.remainingAmount)}</div>`
      : '';

    return `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--primary-600);">${t.receiptNo}</div>
          <div style="font-size:11px; color:var(--text-muted);">${t.transactionNo}</div>
        </td>
        <td>
          <div style="font-weight:600;">${displayName}</div>
          ${displayOrigin}
        </td>
        <td>
          <div style="font-weight:500;">${service ? service.name : '-'}</div>
          <div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-credit-card"></i> ${method ? method.name : '-'}</div>
        </td>
        <td>
          ${notesDisplay}
        </td>
        <td style="font-weight:700; color:var(--accent-emerald);">${formatCurrency(t.amount)}</td>
        <td>
          <div>${formatDateIndo(t.paymentDate)}</div>
        </td>
        <td>
          ${statusBadge}
          ${remainingDisplay}
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            ${isAdmin ? `
              <button class="btn btn-outline btn-sm btn-icon-only" onclick="openEditNotesModal(${t.id})" title="Edit Data Transaksi & Keterangan">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            ` : ''}
            <button class="btn btn-outline btn-sm" onclick="viewReceiptModal(${t.id})" title="Cetak Kuitansi">
              <i class="fa-solid fa-print"></i> Kuitansi
            </button>
            ${isAdmin ? `
              <button class="btn btn-danger btn-sm btn-icon-only" onclick="deleteTransactionPrompt(${t.id})" title="Hapus Transaksi">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Export Filtered Transactions to Excel
 */
function exportFilteredTransactionsExcel() {
  const list = getFilteredTransactionsList();
  if (list.length === 0) {
    showToast('Tidak ada data transaksi untuk diekspor.', 'warning');
    return;
  }

  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.activeFilters;
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const exportData = list.map((t, idx) => {
    const service = services.find(item => item.id === t.serviceId);
    const method = methods.find(item => item.id === t.paymentMethodId);
    return {
      'No.': idx + 1,
      'No. Kuitansi / Slip': t.receiptNo,
      'No. Transaksi': t.transactionNo,
      'Tanggal Pembayaran': t.paymentDate,
      'Nama Pembayar / Instansi': t.tenantName || '-',
      'Asal Pembayar / Kota': t.payerOrigin || '-',
      'Jenis Layanan': service ? service.name : '-',
      'Keterangan / Rincian': t.notes || '-',
      'Metode Pembayaran': method ? method.name : '-',
      'Nominal (Rp)': t.amount,
      'Kekurangan (Rp)': Number(t.remainingAmount) || 0,
      'Status': t.status || 'LUNAS',
      'Petugas Input': t.createdBy || '-'
    };
  });

  const periodTag = f.month ? `${monthNames[Number(f.month)]}_${f.year || ''}` : 'Semua';
  exportToExcel(exportData, `Riwayat_Penerimaan_STP_${periodTag}.xlsx`);
}

/**
 * Print Transactions Report (Official PDF Printable Document)
 */
function printTransactionsReport() {
  const list = getFilteredTransactionsList();
  if (list.length === 0) {
    showToast('Tidak ada data transaksi untuk dicetak.', 'warning');
    return;
  }

  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const totalAmount = list.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const f = AppState.activeFilters;
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  let periodText = 'Seluruh Periode Data Transaksi';
  if (f.month && f.year) {
    periodText = `Periode: Bulan ${monthNames[Number(f.month)]} ${f.year}`;
  } else if (f.month) {
    periodText = `Periode: Bulan ${monthNames[Number(f.month)]}`;
  } else if (f.year) {
    periodText = `Periode Tahun: ${f.year}`;
  } else if (f.startDate && f.endDate) {
    periodText = `Periode: ${formatDateIndo(f.startDate)} s/d ${formatDateIndo(f.endDate)}`;
  } else if (f.startDate) {
    periodText = `Periode: Mulai ${formatDateIndo(f.startDate)}`;
  } else if (f.endDate) {
    periodText = `Periode: Sampai ${formatDateIndo(f.endDate)}`;
  }

  const rowsHtml = list.map((t, idx) => {
    const service = services.find(item => item.id === t.serviceId);
    const method = methods.find(item => item.id === t.paymentMethodId);
    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td><strong>${t.receiptNo}</strong></td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td><strong>${t.tenantName || '-'}</strong><br><span style="font-size:8.5pt; color:#64748b;">${t.payerOrigin ? 'Asal: ' + t.payerOrigin : ''}</span></td>
        <td>${service ? service.name : '-'}</td>
        <td style="font-size:9pt; max-width:180px;">${t.notes || '-'}</td>
        <td>${method ? method.name : '-'}</td>
        <td class="text-right"><strong>${formatCurrency(t.amount)}</strong></td>
        <td class="text-center">${t.status || 'LUNAS'}</td>
      </tr>
    `;
  }).join('');

  const contentHtml = `
    <div style="margin-bottom: 12px; font-size: 10pt; color: #334155;">
      <strong>Keterangan Filter:</strong> ${periodText} | <strong>Total:</strong> ${list.length} Transaksi
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 35px;" class="text-center">No</th>
          <th>No. Kuitansi / Slip</th>
          <th style="width: 95px;">Tanggal</th>
          <th>Nama Pembayar & Asal</th>
          <th>Jenis Layanan</th>
          <th>Keterangan / Rincian</th>
          <th style="width: 70px;">Metode</th>
          <th style="width: 110px;" class="text-right">Nominal</th>
          <th style="width: 65px;" class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td colspan="7" class="text-right">TOTAL PENERIMAAN:</td>
          <td class="text-right" style="color:#059669; font-size:11pt;">${formatCurrency(totalAmount)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 8px; font-size: 9.5pt; font-style: italic; color: #475569;">
      Terbilang: ${terbilangRupiah(totalAmount)}
    </div>
  `;

  const trxSignatureHtml = generateStandardTwoSignersHtml();
  openPrintDocument('Laporan Riwayat Penerimaan Pembayaran', contentHtml, trxSignatureHtml);
}

/**
 * Delete Transaction Prompt (Manual Deletion)
 */
window.deleteTransactionPrompt = function (id) {
  const trx = window.db.getTransactionById(id);
  if (!trx) return;

  const receiptNo = trx.receiptNo || trx.referenceNo || `#${trx.id}`;
  const amountStr = formatCurrency(trx.amount);
  const tenantName = trx.tenantName || 'Pembayar';

  const confirmMsg = `Apakah Anda yakin ingin menghapus transaksi ini?\n\n• No. Kuitansi : ${receiptNo}\n• Pembayar     : ${tenantName}\n• Nominal      : ${amountStr}\n\nTransaksi akan dihapus secara permanen dari sistem dan dicatat di Audit Trail.`;

  if (confirm(confirmMsg)) {
    window.db.deleteTransaction(id);
    showToast(`✓ Transaksi ${receiptNo} (${amountStr}) berhasil dihapus.`, 'info');
    
    // Refresh all views & tables immediately
    renderTransactionsTable();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderReportsView === 'function') renderReportsView();
    if (typeof renderRekeningTable === 'function') renderRekeningTable();
    if (typeof renderBkuTable === 'function') renderBkuTable();
    if (typeof renderRekapKasTable === 'function') renderRekapKasTable();
    if (typeof renderAuditLogs === 'function') renderAuditLogs();

    closeReceiptModal();
    closeEditNotesModal();
  }
};

/**
 * Delete Transaction from Receipt Preview Modal
 */
window.deleteCurrentReceiptTransaction = function () {
  if (!AppState.selectedTransactionForReceipt || !AppState.selectedTransactionForReceipt.id) return;
  const id = AppState.selectedTransactionForReceipt.id;
  deleteTransactionPrompt(id);
};

/**
 * Delete Transaction from Edit Notes Modal
 */
window.deleteFromEditModal = function () {
  const idEl = document.getElementById('editNotesTransactionId');
  if (!idEl || !idEl.value) return;
  deleteTransactionPrompt(Number(idEl.value));
};

/**
 * Master Data Views Rendering
 */
function renderMasterDataTables() {
  // Render Services Table
  const serviceBody = document.getElementById('masterServicesTableBody');
  if (serviceBody) {
    const services = window.db.getServices();
    serviceBody.innerHTML = services.map((s, idx) => `
      <tr>
        <td style="font-weight:700; text-align:center; width:70px;">${idx + 1}</td>
        <td style="font-weight:600;">${s.name}</td>
        <td style="text-align:center;"><span class="badge badge-success">Aktif</span></td>
      </tr>
    `).join('');
  }

  // Render Payment Methods Table
  const methodBody = document.getElementById('masterMethodsTableBody');
  if (methodBody) {
    const methods = window.db.getPaymentMethods();
    methodBody.innerHTML = methods.map((m, idx) => `
      <tr>
        <td style="font-weight:700; text-align:center; width:60px;">${idx + 1}</td>
        <td style="font-weight:700; color:var(--primary-600);">${m.name}</td>
        <td>${m.bankAccount}</td>
        <td style="text-align:center;"><span class="badge badge-success">Aktif</span></td>
      </tr>
    `).join('');
  }
}

/**
 * ============================================================================
 * REKAPITULASI PER LAYANAN CONTROLLER
 * ============================================================================
 */

/**
 * Setup Rekapitulasi Per Layanan Filters & Handlers
 */
function setupReportsHandlers() {
  const periodTypeSelect = document.getElementById('reportPeriodType');
  const dailyInput = document.getElementById('reportDailyDate');
  const monthInput = document.getElementById('reportMonth');
  const triwulanInput = document.getElementById('reportTriwulan');
  const semesterInput = document.getElementById('reportSemester');
  const yearInput = document.getElementById('reportYear');
  const startDateInput = document.getElementById('reportStartDate');
  const endDateInput = document.getElementById('reportEndDate');
  const resetBtn = document.getElementById('btnResetReportFilter');

  const btnPreview = document.getElementById('btnPreviewServiceReport');
  const btnExport = document.getElementById('btnExportExcel');
  const btnPrint = document.getElementById('btnPrintReport');

  const updateReportPeriodVisibility = () => {
    const pType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    const dailyWrapper = document.getElementById('reportDailyWrapper');
    const monthlyWrapper = document.getElementById('reportMonthlyWrapper');
    const triwulanWrapper = document.getElementById('reportTriwulanWrapper');
    const semesterWrapper = document.getElementById('reportSemesterWrapper');
    const yearWrapper = document.getElementById('reportYearWrapper');
    const customRangeWrapper = document.getElementById('reportCustomRangeWrapper');

    if (dailyWrapper) dailyWrapper.style.display = pType === 'daily' ? 'flex' : 'none';
    if (monthlyWrapper) monthlyWrapper.style.display = pType === 'monthly' ? 'flex' : 'none';
    if (triwulanWrapper) triwulanWrapper.style.display = pType === 'triwulan' ? 'flex' : 'none';
    if (semesterWrapper) semesterWrapper.style.display = pType === 'semester' ? 'flex' : 'none';
    if (yearWrapper) yearWrapper.style.display = (pType === 'monthly' || pType === 'triwulan' || pType === 'semester' || pType === 'yearly') ? 'flex' : 'none';
    if (customRangeWrapper) customRangeWrapper.style.display = pType === 'custom' ? 'flex' : 'none';
  };

  const triggerReport = () => {
    AppState.reportFilters.periodType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    AppState.reportFilters.dailyDate = dailyInput ? dailyInput.value : '';
    AppState.reportFilters.month = monthInput ? monthInput.value : '';
    AppState.reportFilters.triwulan = triwulanInput ? triwulanInput.value : '1';
    AppState.reportFilters.semester = semesterInput ? semesterInput.value : '1';
    AppState.reportFilters.year = yearInput ? yearInput.value : '2026';
    AppState.reportFilters.startDate = startDateInput ? startDateInput.value : '';
    AppState.reportFilters.endDate = endDateInput ? endDateInput.value : '';
    renderReportsView();
  };

  if (periodTypeSelect) {
    periodTypeSelect.addEventListener('change', () => {
      updateReportPeriodVisibility();
      triggerReport();
    });
  }

  if (dailyInput) dailyInput.addEventListener('change', triggerReport);
  if (monthInput) monthInput.addEventListener('change', triggerReport);
  if (triwulanInput) triwulanInput.addEventListener('change', triggerReport);
  if (semesterInput) semesterInput.addEventListener('change', triggerReport);
  if (yearInput) yearInput.addEventListener('change', triggerReport);
  if (startDateInput) startDateInput.addEventListener('change', triggerReport);
  if (endDateInput) endDateInput.addEventListener('change', triggerReport);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (periodTypeSelect) periodTypeSelect.value = 'all';
      if (dailyInput) dailyInput.value = '';
      if (monthInput) monthInput.value = '';
      if (triwulanInput) triwulanInput.value = '1';
      if (semesterInput) semesterInput.value = '1';
      if (yearInput) yearInput.value = '2026';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      updateReportPeriodVisibility();
      triggerReport();
      showToast('Filter periode Rekap Layanan direset.', 'info');
    });
  }

  if (btnPreview) {
    btnPreview.onclick = () => openServicePreviewModal();
  }
  if (btnExport) {
    btnExport.onclick = () => exportServiceExcel();
  }
  if (btnPrint) {
    btnPrint.onclick = () => printServiceReport();
  }

  updateReportPeriodVisibility();
}

/**
 * Get Filtered Transactions for Service Recap
 */
function getFilteredServiceTransactions() {
  let list = window.db.getTransactions();
  const f = AppState.reportFilters;
  const periodRange = calculatePeriodRange(f);

  if (periodRange.startDate) {
    list = list.filter(t => t.paymentDate && t.paymentDate.split('T')[0] >= periodRange.startDate);
  }
  if (periodRange.endDate) {
    list = list.filter(t => t.paymentDate && t.paymentDate.split('T')[0] <= periodRange.endDate);
  }

  return list;
}

/**
 * Render Rekapitulasi Per Layanan View
 */
function renderReportsView() {
  const transactions = getFilteredServiceTransactions();
  const services = window.db.getServices();
  const f = AppState.reportFilters;
  const periodRange = calculatePeriodRange(f);
  const reportSubtitle = document.getElementById('reportSubtitle');

  if (reportSubtitle) {
    reportSubtitle.textContent = `Rekapitulasi Periode: ${periodRange.label} (${transactions.length} transaksi tercatat)`;
  }

  const serviceSummary = {};
  services.forEach(s => {
    serviceSummary[s.name] = { id: s.id, count: 0, total: 0 };
  });

  let grandTotal = 0;
  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    grandTotal += amount;

    const s = services.find(item => item.id === t.serviceId);
    if (s && serviceSummary[s.name]) {
      serviceSummary[s.name].count += 1;
      serviceSummary[s.name].total += amount;
    }
  });

  const reportServiceTbody = document.getElementById('reportServiceTableBody');
  if (reportServiceTbody) {
    reportServiceTbody.innerHTML = Object.entries(serviceSummary).map(([serviceName, data], idx) => `
      <tr>
        <td style="text-align:center; font-weight:700;">${idx + 1}</td>
        <td style="font-weight:600;">${serviceName}</td>
        <td style="text-align:center;">${data.count}</td>
        <td style="font-weight:700; text-align:right;">${formatCurrency(data.total)}</td>
        <td style="text-align:right;">${grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(1) + '%' : '0%'}</td>
      </tr>
    `).join('') + `
      <tr style="background:var(--bg-subtle); font-weight:800;">
        <td colspan="2" style="text-align:center;">TOTAL SELURUH PENERIMAAN</td>
        <td style="text-align:center;">${transactions.length}</td>
        <td style="text-align:right; color:var(--accent-emerald); font-size:14px;">${formatCurrency(grandTotal)}</td>
        <td style="text-align:right;">100%</td>
      </tr>
    `;
  }
}

/**
 * Open Service Recap Interactive Preview Modal
 */
window.openServicePreviewModal = function () {
  const transactions = getFilteredServiceTransactions();
  const services = window.db.getServices();
  const periodRange = calculatePeriodRange(AppState.reportFilters);

  const periodTextEl = document.getElementById('servicePreviewPeriodText');
  if (periodTextEl) periodTextEl.textContent = periodRange.label;

  const summaryMetaEl = document.getElementById('servicePreviewSummaryMeta');
  if (summaryMetaEl) summaryMetaEl.textContent = `${periodRange.label} | Total: ${transactions.length} Transaksi`;

  const previewSubtitle = document.getElementById('servicePreviewSubtitle');
  if (previewSubtitle) previewSubtitle.textContent = `Dokumen resmi rekapitulasi kontribusi penerimaan per kategori unit layanan ${periodRange.label}`;

  const serviceSummary = {};
  services.forEach(s => {
    serviceSummary[s.name] = { id: s.id, count: 0, total: 0 };
  });

  let grandTotal = 0;
  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    grandTotal += amount;
    const s = services.find(item => item.id === t.serviceId);
    if (s && serviceSummary[s.name]) {
      serviceSummary[s.name].count += 1;
      serviceSummary[s.name].total += amount;
    }
  });

  const tbody = document.getElementById('servicePreviewTableBody');
  if (tbody) {
    tbody.innerHTML = Object.entries(serviceSummary).map(([serviceName, data], idx) => `
      <tr>
        <td style="text-align:center; font-weight:600;">${idx + 1}</td>
        <td><strong>${serviceName}</strong></td>
        <td style="text-align:center;">${data.count}</td>
        <td style="text-align:right; font-weight:700;">${formatCurrency(data.total)}</td>
        <td style="text-align:right;">${grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(1) + '%' : '0%'}</td>
      </tr>
    `).join('') + `
      <tr class="total-row" style="background:#f8fafc; font-weight:800;">
        <td colspan="2" style="text-align:center;">TOTAL SELURUH PENERIMAAN:</td>
        <td style="text-align:center;">${transactions.length}</td>
        <td style="text-align:right; color:#059669; font-size:10.5pt;">${formatCurrency(grandTotal)}</td>
        <td style="text-align:right;">100%</td>
      </tr>
    `;
  }

  const terbilangEl = document.getElementById('servicePreviewTerbilang');
  if (terbilangEl) terbilangEl.innerHTML = `<strong>Terbilang:</strong> ${terbilangRupiah(grandTotal)}`;

  const sigContainer = document.getElementById('servicePreviewSignaturesContainer');
  if (sigContainer) sigContainer.innerHTML = generateStandardTwoSignersHtml();

  const modal = document.getElementById('servicePreviewModal');
  if (modal) modal.classList.add('active');
};

window.closeServicePreviewModal = function () {
  const modal = document.getElementById('servicePreviewModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Download Service Recap PDF
 */
window.downloadServicePDF = function () {
  const sheetElement = document.getElementById('servicePrintableSheet');
  if (!sheetElement) {
    showToast('Elemen pratinjau Rekap Layanan tidak ditemukan.', 'error');
    return;
  }

  const periodRange = calculatePeriodRange(AppState.reportFilters);
  const fileName = `Rekap_Penerimaan_Layanan_${periodRange.periodTag}.pdf`;

  if (window.html2pdf) {
    showToast('Sedang memproses unduhan PDF Rekap Layanan...', 'info');
    const clone = sheetElement.cloneNode(true);
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    clone.style.maxWidth = '920px';
    clone.style.width = '920px';
    clone.style.background = '#ffffff';

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '960px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '16px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const opt = {
      margin: [6, 8, 6, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [279, 241], orientation: 'landscape' }
    };

    html2pdf().set(opt).from(clone).save()
      .then(() => {
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('PDF Rekap Layanan berhasil diunduh!', 'success');
      })
      .catch(err => {
        console.error('Error download Service PDF:', err);
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('Gagal mengunduh PDF Rekap Layanan.', 'error');
      });
  } else {
    window.print();
  }
};

/**
 * Export Service Recap to Excel (.xlsx)
 */
function exportServiceExcel() {
  const transactions = getFilteredServiceTransactions();
  const services = window.db.getServices();
  const f = AppState.reportFilters;
  const periodRange = calculatePeriodRange(f);

  const serviceSummary = {};
  services.forEach(s => {
    serviceSummary[s.name] = { id: s.id, count: 0, total: 0 };
  });

  let grandTotal = 0;
  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    grandTotal += amount;
    const s = services.find(item => item.id === t.serviceId);
    if (s && serviceSummary[s.name]) {
      serviceSummary[s.name].count += 1;
      serviceSummary[s.name].total += amount;
    }
  });

  const exportData = Object.entries(serviceSummary).map(([serviceName, data], idx) => ({
    'No.': idx + 1,
    'Jenis Layanan': serviceName,
    'Jumlah Transaksi': data.count,
    'Total Penerimaan (Rp)': data.total,
    'Persentase Kontribusi': grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(1) + '%' : '0%'
  }));

  exportData.push({
    'No.': '',
    'Jenis Layanan': 'TOTAL KESELURUHAN',
    'Jumlah Transaksi': transactions.length,
    'Total Penerimaan (Rp)': grandTotal,
    'Persentase Kontribusi': '100%'
  });

  exportToExcel(exportData, `Rekap_Penerimaan_Layanan_${periodRange.periodTag}.xlsx`);
}

/**
 * Print Official Service Recap Report
 */
function printServiceReport() {
  const transactions = getFilteredServiceTransactions();
  const services = window.db.getServices();
  const f = AppState.reportFilters;
  const periodRange = calculatePeriodRange(f);

  const serviceSummary = {};
  services.forEach(s => {
    serviceSummary[s.name] = { id: s.id, count: 0, total: 0 };
  });

  let grandTotal = 0;
  transactions.forEach(t => {
    const amount = Number(t.amount) || 0;
    grandTotal += amount;
    const s = services.find(item => item.id === t.serviceId);
    if (s && serviceSummary[s.name]) {
      serviceSummary[s.name].count += 1;
      serviceSummary[s.name].total += amount;
    }
  });

  const rowsHtml = Object.entries(serviceSummary).map(([serviceName, data], idx) => `
    <tr>
      <td class="text-center">${idx + 1}</td>
      <td><strong>${serviceName}</strong></td>
      <td class="text-center">${data.count}</td>
      <td class="text-right"><strong>${formatCurrency(data.total)}</strong></td>
      <td class="text-right">${grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(1) + '%' : '0%'}</td>
    </tr>
  `).join('');

  const contentHtml = `
    <div style="margin-bottom: 12px; font-size: 10pt; color: #334155;">
      <strong>Keterangan Filter:</strong> ${periodRange.label} | <strong>Total Transaksi:</strong> ${transactions.length}
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 40px;" class="text-center">No</th>
          <th>Nama Jenis Layanan STP</th>
          <th style="width: 120px;" class="text-center">Jumlah Transaksi</th>
          <th style="width: 180px;" class="text-right">Total Penerimaan (Rp)</th>
          <th style="width: 100px;" class="text-right">Kontribusi (%)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td colspan="2" class="text-center">TOTAL SELURUH PENERIMAAN:</td>
          <td class="text-center">${transactions.length}</td>
          <td class="text-right" style="color:#059669; font-size:11pt;">${formatCurrency(grandTotal)}</td>
          <td class="text-right">100%</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 8px; font-size: 9.5pt; font-style: italic; color: #475569;">
      Terbilang: ${terbilangRupiah(grandTotal)}
    </div>
  `;

  const recapSignatureHtml = generateStandardTwoSignersHtml();
  openPrintDocument('Rekapitulasi Penerimaan Berdasarkan Layanan', contentHtml, recapSignatureHtml);
}
window.printServiceReportFromPreview = printServiceReport;

/**
 * ============================================================================
 * REKAP REKENING PENDAPATAN BLUD CONTROLLER
 * ============================================================================
 */

/**
 * Setup Rekap Rekening Pendapatan BLUD Handlers
 */
function setupRekeningHandlers() {
  const periodTypeSelect = document.getElementById('rekeningPeriodType');
  const dailyInput = document.getElementById('rekeningDailyDate');
  const monthInput = document.getElementById('rekeningMonth');
  const triwulanInput = document.getElementById('rekeningTriwulan');
  const semesterInput = document.getElementById('rekeningSemester');
  const yearInput = document.getElementById('rekeningYear');
  const startDateInput = document.getElementById('rekeningStartDate');
  const endDateInput = document.getElementById('rekeningEndDate');
  const resetBtn = document.getElementById('btnResetRekeningFilter');

  const btnPreview = document.getElementById('btnPreviewRekeningReport');
  const btnExport = document.getElementById('btnExportRekeningExcel');
  const btnPrint = document.getElementById('btnPrintRekeningReport');

  const updateRekeningPeriodVisibility = () => {
    const pType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    const dailyWrapper = document.getElementById('rekeningDailyWrapper');
    const monthlyWrapper = document.getElementById('rekeningMonthlyWrapper');
    const triwulanWrapper = document.getElementById('rekeningTriwulanWrapper');
    const semesterWrapper = document.getElementById('rekeningSemesterWrapper');
    const yearWrapper = document.getElementById('rekeningYearWrapper');
    const customRangeWrapper = document.getElementById('rekeningCustomRangeWrapper');

    if (dailyWrapper) dailyWrapper.style.display = pType === 'daily' ? 'flex' : 'none';
    if (monthlyWrapper) monthlyWrapper.style.display = pType === 'monthly' ? 'flex' : 'none';
    if (triwulanWrapper) triwulanWrapper.style.display = pType === 'triwulan' ? 'flex' : 'none';
    if (semesterWrapper) semesterWrapper.style.display = pType === 'semester' ? 'flex' : 'none';
    if (yearWrapper) yearWrapper.style.display = (pType === 'monthly' || pType === 'triwulan' || pType === 'semester' || pType === 'yearly') ? 'flex' : 'none';
    if (customRangeWrapper) customRangeWrapper.style.display = pType === 'custom' ? 'flex' : 'none';
  };

  const triggerRekening = () => {
    AppState.rekeningFilters.periodType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    AppState.rekeningFilters.dailyDate = dailyInput ? dailyInput.value : '';
    AppState.rekeningFilters.month = monthInput ? monthInput.value : '';
    AppState.rekeningFilters.triwulan = triwulanInput ? triwulanInput.value : '1';
    AppState.rekeningFilters.semester = semesterInput ? semesterInput.value : '1';
    AppState.rekeningFilters.year = yearInput ? yearInput.value : '2026';
    AppState.rekeningFilters.startDate = startDateInput ? startDateInput.value : '';
    AppState.rekeningFilters.endDate = endDateInput ? endDateInput.value : '';
    renderRekeningView();
  };

  if (periodTypeSelect) {
    periodTypeSelect.addEventListener('change', () => {
      updateRekeningPeriodVisibility();
      triggerRekening();
    });
  }

  if (dailyInput) dailyInput.addEventListener('change', triggerRekening);
  if (monthInput) monthInput.addEventListener('change', triggerRekening);
  if (triwulanInput) triwulanInput.addEventListener('change', triggerRekening);
  if (semesterInput) semesterInput.addEventListener('change', triggerRekening);
  if (yearInput) yearInput.addEventListener('change', triggerRekening);
  if (startDateInput) startDateInput.addEventListener('change', triggerRekening);
  if (endDateInput) endDateInput.addEventListener('change', triggerRekening);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (periodTypeSelect) periodTypeSelect.value = 'all';
      if (dailyInput) dailyInput.value = '';
      if (monthInput) monthInput.value = '';
      if (triwulanInput) triwulanInput.value = '1';
      if (semesterInput) semesterInput.value = '1';
      if (yearInput) yearInput.value = '2026';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      updateRekeningPeriodVisibility();
      triggerRekening();
      showToast('Filter periode Rekap Rekening direset.', 'info');
    });
  }

  if (btnPreview) {
    btnPreview.onclick = () => openRekeningPreviewModal();
  }
  if (btnExport) {
    btnExport.onclick = () => exportRekeningExcel();
  }
  if (btnPrint) {
    btnPrint.onclick = () => printRekeningReport();
  }

  updateRekeningPeriodVisibility();
}

/**
 * Helper to compute Rekap Rekening Pendapatan BLUD Data
 */
function getRekeningRecapData() {
  let transactions = window.db.getTransactions();
  const services = window.db.getServices();
  const accounts = window.db.getBludRevenueAccounts();
  const f = AppState.rekeningFilters;
  const periodRange = calculatePeriodRange(f);

  if (periodRange.startDate) {
    transactions = transactions.filter(t => t.paymentDate && t.paymentDate.split('T')[0] >= periodRange.startDate);
  }
  if (periodRange.endDate) {
    transactions = transactions.filter(t => t.paymentDate && t.paymentDate.split('T')[0] <= periodRange.endDate);
  }

  let grandTotal = 0;
  let totalTrxCount = transactions.length;

  const recapAccounts = accounts.map(acc => {
    let accountTotal = 0;
    let accountTrxCount = 0;

    const breakdown = acc.serviceNames.map(srvName => {
      const srvObj = services.find(s => s.name.toLowerCase() === srvName.toLowerCase());
      const srvId = srvObj ? srvObj.id : null;

      const matchedTrx = transactions.filter(t => {
        if (srvId && t.serviceId === srvId) return true;
        const itemService = services.find(s => s.id === t.serviceId);
        return itemService && itemService.name.toLowerCase() === srvName.toLowerCase();
      });

      const srvSum = matchedTrx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const srvCount = matchedTrx.length;

      accountTotal += srvSum;
      accountTrxCount += srvCount;

      return {
        serviceName: srvName,
        count: srvCount,
        total: srvSum
      };
    });

    grandTotal += accountTotal;

    return {
      ...acc,
      count: accountTrxCount,
      total: accountTotal,
      breakdown
    };
  });

  return {
    accounts: recapAccounts,
    grandTotal,
    totalTrxCount,
    transactions,
    filters: f,
    periodRange
  };
}

/**
 * Render Rekap Rekening Pendapatan BLUD View
 */
function renderRekeningView() {
  const data = getRekeningRecapData();
  const tbody = document.getElementById('reportRekeningTableBody');
  const subtitleEl = document.getElementById('rekeningSubtitle');
  const totalTrxCountEl = document.getElementById('rekeningTotalTrxCount');
  const grandTotalEl = document.getElementById('rekeningGrandTotalText');
  const footerTerbilangEl = document.getElementById('rekeningFooterTerbilang');

  if (subtitleEl) {
    subtitleEl.textContent = `Rekapitulasi Periode: ${data.periodRange.label} (${data.totalTrxCount} transaksi tercatat)`;
  }

  if (totalTrxCountEl) totalTrxCountEl.textContent = `${data.totalTrxCount} Transaksi`;
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(data.grandTotal);
  if (footerTerbilangEl) footerTerbilangEl.textContent = `Terbilang: ${terbilangRupiah(data.grandTotal)}`;

  if (!tbody) return;

  tbody.innerHTML = data.accounts.map((acc, idx) => {
    const contribPct = data.grandTotal > 0 ? ((acc.total / data.grandTotal) * 100).toFixed(1) + '%' : '0%';

    const subRowsHtml = acc.breakdown.map(b => {
      const srvContribPct = acc.total > 0 ? ((b.total / acc.total) * 100).toFixed(1) + '%' : '-';
      return `
        <tr style="font-size:12.5px; background:var(--bg-surface); border-bottom:1px dashed var(--border-light);">
          <td></td>
          <td style="text-align:center; color:var(--text-subtle); font-size:11px;">↳</td>
          <td style="padding-left:18px; color:var(--text-main);">
            <i class="fa-solid fa-angle-right" style="color:var(--primary-500); font-size:10px; margin-right:6px;"></i>
            ${b.serviceName}
          </td>
          <td style="text-align:center; color:var(--text-muted);">${b.count}</td>
          <td style="text-align:right; color:var(--text-muted);">${formatCurrency(b.total)}</td>
          <td style="text-align:right; color:var(--text-subtle); font-size:11.5px;">${srvContribPct}</td>
        </tr>
      `;
    }).join('');

    return `
      <tr style="background:var(--bg-subtle); border-top:2px solid var(--border-light); font-weight:700;">
        <td style="text-align:center; font-weight:800; color:var(--primary-600);">${idx + 1}</td>
        <td><code style="font-weight:700; color:var(--primary-700); font-size:12px;">${acc.code}</code></td>
        <td>
          <div style="font-size:13.5px; font-weight:800; color:var(--text-main);">${acc.name}</div>
          <div style="font-size:11px; color:var(--text-muted); font-weight:normal; margin-top:2px;">
            ${acc.description}
          </div>
        </td>
        <td style="text-align:center; font-weight:700;">${acc.count}</td>
        <td style="text-align:right; font-weight:800; color:var(--text-main); font-size:13.5px;">${formatCurrency(acc.total)}</td>
        <td style="text-align:right; font-weight:700; color:var(--primary-600);">${contribPct}</td>
      </tr>
      ${subRowsHtml}
    `;
  }).join('');
}

/**
 * Open Rekening Recap Interactive Preview Modal
 */
window.openRekeningPreviewModal = function () {
  const data = getRekeningRecapData();
  const periodRange = data.periodRange;

  const periodTextEl = document.getElementById('rekeningPreviewPeriodText');
  if (periodTextEl) periodTextEl.textContent = periodRange.label;

  const summaryMetaEl = document.getElementById('rekeningPreviewSummaryMeta');
  if (summaryMetaEl) summaryMetaEl.textContent = `${periodRange.label} | Total: ${data.totalTrxCount} Transaksi`;

  const previewSubtitle = document.getElementById('rekeningPreviewSubtitle');
  if (previewSubtitle) previewSubtitle.textContent = `Dokumen resmi klasifikasi 5 kelompok akun rekening pendapatan BLUD ${periodRange.label}`;

  const tbody = document.getElementById('rekeningPreviewTableBody');
  if (tbody) {
    const rowsHtml = data.accounts.map((acc, idx) => {
      const contribPct = data.grandTotal > 0 ? ((acc.total / data.grandTotal) * 100).toFixed(1) + '%' : '0%';

      const subRows = acc.breakdown.map(b => `
        <tr style="font-size: 8.5pt; color: #475569;">
          <td></td>
          <td class="text-center" style="color: #94a3b8;">↳</td>
          <td style="padding-left: 20px;">- ${b.serviceName}</td>
          <td class="text-center">${b.count}</td>
          <td class="text-right">${formatCurrency(b.total)}</td>
          <td class="text-right">-</td>
        </tr>
      `).join('');

      return `
        <tr style="background-color: #f1f5f9; font-weight: 700;">
          <td class="text-center">${idx + 1}</td>
          <td><strong>${acc.code}</strong></td>
          <td><strong>${acc.name}</strong><br><span style="font-size:8pt; font-weight:normal; color:#64748b;">${acc.description}</span></td>
          <td class="text-center"><strong>${acc.count}</strong></td>
          <td class="text-right"><strong>${formatCurrency(acc.total)}</strong></td>
          <td class="text-right"><strong>${contribPct}</strong></td>
        </tr>
        ${subRows}
      `;
    }).join('');

    tbody.innerHTML = rowsHtml + `
      <tr class="total-row" style="background-color: #e2e8f0; font-size: 10pt;">
        <td colspan="3" class="text-center"><strong>TOTAL SELURUH PENDAPATAN BLUD:</strong></td>
        <td class="text-center"><strong>${data.totalTrxCount}</strong></td>
        <td class="text-right" style="color:#059669; font-size:10.5pt;"><strong>${formatCurrency(data.grandTotal)}</strong></td>
        <td class="text-right"><strong>100%</strong></td>
      </tr>
    `;
  }

  const terbilangEl = document.getElementById('rekeningPreviewTerbilang');
  if (terbilangEl) terbilangEl.innerHTML = `<strong>Terbilang:</strong> ${terbilangRupiah(data.grandTotal)}`;

  const sigContainer = document.getElementById('rekeningPreviewSignaturesContainer');
  if (sigContainer) sigContainer.innerHTML = generateStandardTwoSignersHtml();

  const modal = document.getElementById('rekeningPreviewModal');
  if (modal) modal.classList.add('active');
};

window.closeRekeningPreviewModal = function () {
  const modal = document.getElementById('rekeningPreviewModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Download Rekening Recap PDF
 */
window.downloadRekeningPDF = function () {
  const sheetElement = document.getElementById('rekeningPrintableSheet');
  if (!sheetElement) {
    showToast('Elemen pratinjau Rekap Rekening tidak ditemukan.', 'error');
    return;
  }

  const periodRange = calculatePeriodRange(AppState.rekeningFilters);
  const fileName = `Rekap_Rekening_Pendapatan_BLUD_${periodRange.periodTag}.pdf`;

  if (window.html2pdf) {
    showToast('Sedang memproses unduhan PDF Rekap Rekening BLUD...', 'info');
    const clone = sheetElement.cloneNode(true);
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    clone.style.maxWidth = '920px';
    clone.style.width = '920px';
    clone.style.background = '#ffffff';

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '960px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '16px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const opt = {
      margin: [6, 8, 6, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [279, 241], orientation: 'landscape' }
    };

    html2pdf().set(opt).from(clone).save()
      .then(() => {
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('PDF Rekap Rekening BLUD berhasil diunduh!', 'success');
      })
      .catch(err => {
        console.error('Error download Rekening PDF:', err);
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('Gagal mengunduh PDF Rekap Rekening BLUD.', 'error');
      });
  } else {
    window.print();
  }
};

/**
 * Export Rekap Rekening Pendapatan BLUD to Excel (.xlsx)
 */
function exportRekeningExcel() {
  const data = getRekeningRecapData();
  if (data.totalTrxCount === 0 && data.grandTotal === 0) {
    showToast('Tidak ada data penerimaan rekening untuk diekspor.', 'warning');
    return;
  }

  const exportData = [];

  data.accounts.forEach((acc, idx) => {
    const contribPct = data.grandTotal > 0 ? ((acc.total / data.grandTotal) * 100).toFixed(1) + '%' : '0%';

    // Parent Account Row
    exportData.push({
      'No.': idx + 1,
      'Kode Rekening': acc.code,
      'Nama Rekening / Jenis Layanan': acc.name.toUpperCase(),
      'Jumlah Transaksi': acc.count,
      'Total Penerimaan (Rp)': acc.total,
      'Kontribusi (%)': contribPct
    });

    // Sub-service Breakdown Rows
    acc.breakdown.forEach(b => {
      exportData.push({
        'No.': '',
        'Kode Rekening': '',
        'Nama Rekening / Jenis Layanan': `  - ${b.serviceName}`,
        'Jumlah Transaksi': b.count,
        'Total Penerimaan (Rp)': b.total,
        'Kontribusi (%)': ''
      });
    });
  });

  // Grand Total Row
  exportData.push({
    'No.': '',
    'Kode Rekening': '',
    'Nama Rekening / Jenis Layanan': 'TOTAL SELURUH PENDAPATAN BLUD',
    'Jumlah Transaksi': data.totalTrxCount,
    'Total Penerimaan (Rp)': data.grandTotal,
    'Kontribusi (%)': '100%'
  });

  exportToExcel(exportData, `Rekap_Rekening_Pendapatan_BLUD_${data.periodRange.periodTag}.xlsx`);
}

/**
 * Print Official Rekap Rekening Pendapatan BLUD Report
 */
function printRekeningReport() {
  const data = getRekeningRecapData();
  const periodRange = data.periodRange;

  const rowsHtml = data.accounts.map((acc, idx) => {
    const contribPct = data.grandTotal > 0 ? ((acc.total / data.grandTotal) * 100).toFixed(1) + '%' : '0%';

    const subRows = acc.breakdown.map(b => `
      <tr style="font-size: 8.5pt; color: #475569;">
        <td></td>
        <td class="text-center" style="color: #94a3b8;">↳</td>
        <td style="padding-left: 20px;">- ${b.serviceName}</td>
        <td class="text-center">${b.count}</td>
        <td class="text-right">${formatCurrency(b.total)}</td>
        <td class="text-right">-</td>
      </tr>
    `).join('');

    return `
      <tr style="background-color: #f1f5f9; font-weight: 700;">
        <td class="text-center">${idx + 1}</td>
        <td><strong>${acc.code}</strong></td>
        <td><strong>${acc.name}</strong><br><span style="font-size:8pt; font-weight:normal; color:#64748b;">${acc.description}</span></td>
        <td class="text-center"><strong>${acc.count}</strong></td>
        <td class="text-right"><strong>${formatCurrency(acc.total)}</strong></td>
        <td class="text-right"><strong>${contribPct}</strong></td>
      </tr>
      ${subRows}
    `;
  }).join('');

  const contentHtml = `
    <div style="margin-bottom: 12px; font-size: 10pt; color: #334155; display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:6px;">
      <div><strong>Laporan:</strong> Rekapitulasi Rekening Pendapatan BLUD Solo Technopark</div>
      <div><strong>${periodRange.label}</strong> | Total: ${data.totalTrxCount} Transaksi</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 35px;" class="text-center">No</th>
          <th style="width: 100px;">Kode Rekening</th>
          <th>Nama Rekening Pendapatan BLUD & Komponen Layanan</th>
          <th style="width: 110px;" class="text-center">Jumlah Transaksi</th>
          <th style="width: 170px;" class="text-right">Total Penerimaan (Rp)</th>
          <th style="width: 90px;" class="text-right">Kontribusi</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row" style="background-color: #e2e8f0; font-size: 10.5pt;">
          <td colspan="3" class="text-center"><strong>TOTAL SELURUH PENDAPATAN BLUD:</strong></td>
          <td class="text-center"><strong>${data.totalTrxCount}</strong></td>
          <td class="text-right" style="color:#059669; font-size:11pt;"><strong>${formatCurrency(data.grandTotal)}</strong></td>
          <td class="text-right"><strong>100%</strong></td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 10px; font-size: 9.5pt; font-style: italic; color: #475569;">
      Terbilang: ${terbilangRupiah(data.grandTotal)}
    </div>
  `;

  const rekeningSignatureHtml = generateStandardTwoSignersHtml();
  openPrintDocument('Rekapitulasi Rekening Pendapatan BLUD', contentHtml, rekeningSignatureHtml);
}

/**
 * ============================================================================
 * HELPER: CALCULATE PERIOD DATE RANGE FOR REPORT FILTERS
 * ============================================================================
 * Supports: Harian, Bulanan, Triwulan, Semester, Tahunan, Custom, and All
 */
function calculatePeriodRange(f) {
  const type = f.periodType || 'all';
  const year = f.year || (new Date().getFullYear().toString());
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  if (type === 'daily') {
    const d = f.dailyDate || new Date().toISOString().split('T')[0];
    return {
      startDate: d,
      endDate: d,
      label: `Harian: ${formatDateIndo(d)}`,
      periodTag: `Harian_${d}`
    };
  } else if (type === 'monthly') {
    if (f.month) {
      const m = Number(f.month);
      const mStr = String(m).padStart(2, '0');
      const lastDay = new Date(Number(year), m, 0).getDate();
      return {
        startDate: `${year}-${mStr}-01`,
        endDate: `${year}-${mStr}-${String(lastDay).padStart(2, '0')}`,
        label: `Bulan ${monthNames[m]} ${year}`,
        periodTag: `Bulan_${monthNames[m]}_${year}`
      };
    } else {
      return {
        startDate: year ? `${year}-01-01` : '',
        endDate: year ? `${year}-12-31` : '',
        label: year ? `Seluruh Bulan Tahun ${year}` : 'Semua Bulan',
        periodTag: year ? `Tahun_${year}` : 'Semua'
      };
    }
  } else if (type === 'triwulan') {
    const tw = f.triwulan || '1';
    if (tw === '1') {
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-03-31`,
        label: `Triwulan I Tahun ${year} (1 Januari - 31 Maret ${year})`,
        periodTag: `Triwulan_I_${year}`
      };
    } else if (tw === '2') {
      return {
        startDate: `${year}-04-01`,
        endDate: `${year}-06-30`,
        label: `Triwulan II Tahun ${year} (1 April - 30 Juni ${year})`,
        periodTag: `Triwulan_II_${year}`
      };
    } else if (tw === '3') {
      return {
        startDate: `${year}-07-01`,
        endDate: `${year}-09-30`,
        label: `Triwulan III Tahun ${year} (1 Juli - 30 September ${year})`,
        periodTag: `Triwulan_III_${year}`
      };
    } else {
      return {
        startDate: `${year}-10-01`,
        endDate: `${year}-12-31`,
        label: `Triwulan IV Tahun ${year} (1 Oktober - 31 Desember ${year})`,
        periodTag: `Triwulan_IV_${year}`
      };
    }
  } else if (type === 'semester') {
    const sem = f.semester || '1';
    if (sem === '1') {
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-06-30`,
        label: `Semester I Tahun ${year} (1 Januari - 30 Juni ${year})`,
        periodTag: `Semester_I_${year}`
      };
    } else {
      return {
        startDate: `${year}-07-01`,
        endDate: `${year}-12-31`,
        label: `Semester II Tahun ${year} (1 Juli - 31 Desember ${year})`,
        periodTag: `Semester_II_${year}`
      };
    }
  } else if (type === 'yearly') {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      label: `Tahun Anggaran ${year} (1 Januari - 31 Desember ${year})`,
      periodTag: `Tahun_${year}`
    };
  } else if (type === 'custom') {
    const s = f.startDate;
    const e = f.endDate;
    let label = 'Rentang Tanggal Khusus';
    if (s && e) label = `${formatDateIndo(s)} s/d ${formatDateIndo(e)}`;
    else if (s) label = `Mulai ${formatDateIndo(s)}`;
    else if (e) label = `Sampai ${formatDateIndo(e)}`;
    return {
      startDate: s || '',
      endDate: e || '',
      label: label,
      periodTag: `Custom_${s || ''}_${e || ''}`
    };
  } else {
    return {
      startDate: '',
      endDate: '',
      label: 'Seluruh Periode Pembukuan',
      periodTag: 'Semua_Periode'
    };
  }
}

/**
 * Setup BKU (Buku Kas Umum Tunai) Filters & Event Handlers
 */
function setupBkuFilters() {
  const searchInput = document.getElementById('bkuSearchInput');
  const periodTypeSelect = document.getElementById('bkuPeriodType');
  const dailyInput = document.getElementById('bkuDailyDate');
  const monthInput = document.getElementById('bkuMonth');
  const triwulanInput = document.getElementById('bkuTriwulan');
  const semesterInput = document.getElementById('bkuSemester');
  const yearInput = document.getElementById('bkuYear');
  const startDateInput = document.getElementById('bkuStartDate');
  const endDateInput = document.getElementById('bkuEndDate');
  const resetBtn = document.getElementById('btnResetBkuFilter');

  const btnPreview = document.getElementById('btnPreviewBkuReport');
  const btnExport = document.getElementById('btnExportBkuExcel');
  const btnPrint = document.getElementById('btnPrintBkuReport');

  const updateBkuPeriodVisibility = () => {
    const pType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    const dailyWrapper = document.getElementById('bkuDailyWrapper');
    const monthlyWrapper = document.getElementById('bkuMonthlyWrapper');
    const triwulanWrapper = document.getElementById('bkuTriwulanWrapper');
    const semesterWrapper = document.getElementById('bkuSemesterWrapper');
    const yearWrapper = document.getElementById('bkuYearWrapper');
    const customRangeWrapper = document.getElementById('bkuCustomRangeWrapper');

    if (dailyWrapper) dailyWrapper.style.display = pType === 'daily' ? 'flex' : 'none';
    if (monthlyWrapper) monthlyWrapper.style.display = pType === 'monthly' ? 'flex' : 'none';
    if (triwulanWrapper) triwulanWrapper.style.display = pType === 'triwulan' ? 'flex' : 'none';
    if (semesterWrapper) semesterWrapper.style.display = pType === 'semester' ? 'flex' : 'none';
    if (yearWrapper) yearWrapper.style.display = (pType === 'monthly' || pType === 'triwulan' || pType === 'semester' || pType === 'yearly') ? 'flex' : 'none';
    if (customRangeWrapper) customRangeWrapper.style.display = pType === 'custom' ? 'flex' : 'none';
  };

  const triggerBku = () => {
    AppState.bkuFilters.search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    AppState.bkuFilters.periodType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    AppState.bkuFilters.dailyDate = dailyInput ? dailyInput.value : '';
    AppState.bkuFilters.month = monthInput ? monthInput.value : '';
    AppState.bkuFilters.triwulan = triwulanInput ? triwulanInput.value : '1';
    AppState.bkuFilters.semester = semesterInput ? semesterInput.value : '1';
    AppState.bkuFilters.year = yearInput ? yearInput.value : '2026';
    AppState.bkuFilters.startDate = startDateInput ? startDateInput.value : '';
    AppState.bkuFilters.endDate = endDateInput ? endDateInput.value : '';
    renderBkuCashView();
  };

  if (periodTypeSelect) {
    periodTypeSelect.addEventListener('change', () => {
      updateBkuPeriodVisibility();
      triggerBku();
    });
  }

  if (searchInput) searchInput.addEventListener('input', triggerBku);
  if (dailyInput) dailyInput.addEventListener('change', triggerBku);
  if (monthInput) monthInput.addEventListener('change', triggerBku);
  if (triwulanInput) triwulanInput.addEventListener('change', triggerBku);
  if (semesterInput) semesterInput.addEventListener('change', triggerBku);
  if (yearInput) yearInput.addEventListener('change', triggerBku);
  if (startDateInput) startDateInput.addEventListener('change', triggerBku);
  if (endDateInput) endDateInput.addEventListener('change', triggerBku);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (periodTypeSelect) periodTypeSelect.value = 'all';
      if (dailyInput) dailyInput.value = '';
      if (monthInput) monthInput.value = '';
      if (triwulanInput) triwulanInput.value = '1';
      if (semesterInput) semesterInput.value = '1';
      if (yearInput) yearInput.value = '2026';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      updateBkuPeriodVisibility();
      triggerBku();
      showToast('Filter periode BKU direset.', 'info');
    });
  }

  if (btnPreview) {
    btnPreview.onclick = () => openBkuPreviewModal();
  }
  if (btnExport) {
    btnExport.onclick = () => exportBkuCashExcel();
  }
  if (btnPrint) {
    btnPrint.onclick = () => printBkuCashReport();
  }

  updateBkuPeriodVisibility();
}

/**
 * Get Filtered Cash Transactions for BKU
 */
function getFilteredBkuCashList() {
  const allTrx = window.db.getTransactions();
  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.bkuFilters;
  const periodRange = calculatePeriodRange(f);

  // Filter only CASH payments (id === 1, code === 'CASH' or method name contains cash/tunai)
  let cashList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 1) return true;
    if (method && (method.code === 'CASH' || method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('tunai'))) return true;
    return false;
  });

  // Filter Search
  if (f.search) {
    cashList = cashList.filter(t => {
      const tenantName = t.tenantName || '';
      const origin = t.payerOrigin || '';
      const service = services.find(item => item.id === t.serviceId);
      const searchStr = `${t.transactionNo} ${t.receiptNo} ${t.referenceNo} ${t.notes} ${tenantName} ${origin} ${service ? service.name : ''}`.toLowerCase();
      return searchStr.includes(f.search.toLowerCase());
    });
  }

  // Filter Dates based on computed period
  if (periodRange.startDate) {
    cashList = cashList.filter(t => t.paymentDate && t.paymentDate.split('T')[0] >= periodRange.startDate);
  }
  if (periodRange.endDate) {
    cashList = cashList.filter(t => t.paymentDate && t.paymentDate.split('T')[0] <= periodRange.endDate);
  }

  // Sort ascending by payment date & ID for BKU running balance calculation
  cashList.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate) || a.id - b.id);

  return cashList;
}

/**
 * Render BKU (Buku Kas Umum Tunai) View
 */
function renderBkuCashView() {
  const tbody = document.getElementById('bkuCashTableBody');
  if (!tbody) return;

  const list = getFilteredBkuCashList();
  const services = window.db.getServices();
  const f = AppState.bkuFilters;
  const periodRange = calculatePeriodRange(f);

  let totalDebet = 0;
  let runningBalance = 0;

  // Calculate Metrics & Running Balance
  const enrichedList = list.map(t => {
    const amount = Number(t.amount) || 0;
    totalDebet += amount;
    runningBalance += amount;
    return {
      ...t,
      debet: amount,
      kredit: 0,
      runningBalance: runningBalance
    };
  });

  const count = enrichedList.length;
  const avg = count > 0 ? Math.round(totalDebet / count) : 0;

  // Update Metric Cards
  const totalAmountEl = document.getElementById('bkuMetricTotalAmount');
  if (totalAmountEl) totalAmountEl.textContent = formatCurrency(totalDebet);

  const countEl = document.getElementById('bkuMetricCount');
  if (countEl) countEl.textContent = count;

  const avgEl = document.getElementById('bkuMetricAvg');
  if (avgEl) avgEl.textContent = formatCurrency(avg);

  // Update Subtitle
  const subtitleEl = document.getElementById('bkuSubtitle');
  if (subtitleEl) {
    subtitleEl.textContent = `Catatan pembukuan penerimaan kas tunai periode ${periodRange.label} (${count} transaksi)`;
  }

  // Update Footer Totals
  const totalDebetEl = document.getElementById('bkuTotalDebet');
  if (totalDebetEl) totalDebetEl.textContent = formatCurrency(totalDebet);

  const totalKreditEl = document.getElementById('bkuTotalKredit');
  if (totalKreditEl) totalKreditEl.textContent = 'Rp 0';

  const finalBalanceEl = document.getElementById('bkuFinalBalance');
  if (finalBalanceEl) finalBalanceEl.textContent = formatCurrency(totalDebet);

  const terbilangEl = document.getElementById('bkuTerbilangText');
  if (terbilangEl) terbilangEl.textContent = `Terbilang: ${terbilangRupiah(totalDebet)}`;

  if (enrichedList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada transaksi kas tunai (Cash) yang ditemukan pada periode ${periodRange.label}.</td></tr>`;
    return;
  }

  tbody.innerHTML = enrichedList.map((t, idx) => {
    const service = services.find(s => s.id === t.serviceId);
    const displayName = t.tenantName || 'Pembayar / Mitra';
    const displayOrigin = t.payerOrigin ? `<div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-location-dot" style="color:var(--primary-500); font-size:10px;"></i> ${t.payerOrigin}</div>` : '';
    const isAdmin = AppState.currentRole === 'admin';

    const notesDisplay = t.notes && t.notes.trim()
      ? (isAdmin
          ? `<div style="font-size:12px; color:var(--text-main); line-height:1.4; max-width:220px; cursor:pointer;" onclick="openEditNotesModal(${t.id})" title="Klik untuk melihat / mengedit rincian keterangan">
               <i class="fa-regular fa-note-sticky" style="color:var(--primary-500); font-size:11.5px; margin-right:4px;"></i>
               <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">${t.notes.trim()}</span>
             </div>`
          : `<div style="font-size:12px; color:var(--text-main); line-height:1.4; max-width:220px;">
               <i class="fa-regular fa-note-sticky" style="color:var(--primary-500); font-size:11.5px; margin-right:4px;"></i>
               <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">${t.notes.trim()}</span>
             </div>`
        )
      : (isAdmin
          ? `<span style="font-size:11.5px; color:var(--text-subtle); font-style:italic; cursor:pointer;" onclick="openEditNotesModal(${t.id})" title="Klik untuk menambahkan rincian keterangan">+ Tambah catatan</span>`
          : `<span style="font-size:11.5px; color:var(--text-subtle); font-style:italic;">-</span>`
        );

    return `
      <tr>
        <td style="text-align:center; font-weight:600;">${idx + 1}</td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td>
          <span style="font-weight:700; color:var(--primary-600);">${t.receiptNo}</span>
          <div style="font-size:10.5px; color:var(--text-muted);">${t.transactionNo}</div>
        </td>
        <td>
          <div style="font-weight:600;">${displayName}</div>
          ${displayOrigin}
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-main);">${service ? service.name : '-'}</div>
        </td>
        <td>
          ${notesDisplay}
        </td>
        <td style="text-align:right; font-weight:700; color:var(--accent-emerald);">${formatCurrency(t.debet)}</td>
        <td style="text-align:right; color:var(--text-subtle);">-</td>
        <td style="text-align:right; font-weight:700; color:var(--primary-600);">${formatCurrency(t.runningBalance)}</td>
        <td style="text-align:center;">
          <div style="display:flex; gap:5px; justify-content:center;">
            ${isAdmin ? `
              <button class="btn btn-outline btn-sm btn-icon-only" onclick="openEditNotesModal(${t.id})" title="Lihat / Edit Keterangan & Rincian">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
            ` : ''}
            <button class="btn btn-outline btn-sm btn-icon-only" onclick="viewReceiptModal(${t.id})" title="Lihat Kuitansi">
              <i class="fa-solid fa-receipt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Open BKU Interactive Preview Modal
 */
window.openBkuPreviewModal = function () {
  const list = getFilteredBkuCashList();
  const periodRange = calculatePeriodRange(AppState.bkuFilters);
  const services = window.db.getServices();

  const periodTextEl = document.getElementById('bkuPreviewPeriodText');
  if (periodTextEl) periodTextEl.textContent = periodRange.label;

  const summaryMetaEl = document.getElementById('bkuPreviewSummaryMeta');
  if (summaryMetaEl) summaryMetaEl.textContent = `${periodRange.label} | Total: ${list.length} Transaksi`;

  const previewSubtitle = document.getElementById('bkuPreviewSubtitle');
  if (previewSubtitle) previewSubtitle.textContent = `Lembar pembukuan kas tunai ${periodRange.label} (${list.length} transaksi)`;

  let totalDebet = 0;
  let runningBalance = 0;

  const tbody = document.getElementById('bkuPreviewTableBody');
  if (tbody) {
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#94a3b8; font-style:italic;">Tidak ada data transaksi kas tunai pada periode ${periodRange.label}.</td></tr>`;
    } else {
      tbody.innerHTML = list.map((t, idx) => {
        const service = services.find(s => s.id === t.serviceId);
        const amount = Number(t.amount) || 0;
        totalDebet += amount;
        runningBalance += amount;

        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${formatDateIndo(t.paymentDate)}</td>
            <td><strong>${t.receiptNo}</strong></td>
            <td><strong>${t.tenantName || '-'}</strong><br><span style="font-size:8.5pt; color:#64748b;">${t.payerOrigin ? 'Asal: ' + t.payerOrigin : ''}</span></td>
            <td>${service ? service.name : '-'}</td>
            <td>${t.notes ? t.notes : '<span style="color:#94a3b8; font-style:italic;">-</span>'}</td>
            <td style="text-align:right;"><strong>${formatCurrency(amount)}</strong></td>
            <td style="text-align:right;">-</td>
            <td style="text-align:right;"><strong>${formatCurrency(runningBalance)}</strong></td>
          </tr>
        `;
      }).join('') + `
        <tr class="total-row">
          <td colspan="6" style="text-align:right; font-weight:700;">TOTAL PENERIMAAN KAS TUNAI:</td>
          <td style="text-align:right; color:#059669; font-weight:800; font-size:10pt;">${formatCurrency(totalDebet)}</td>
          <td style="text-align:right;">Rp 0</td>
          <td style="text-align:right; color:#2563eb; font-weight:800; font-size:10pt;">${formatCurrency(totalDebet)}</td>
        </tr>
      `;
    }
  }

  const terbilangEl = document.getElementById('bkuPreviewTerbilang');
  if (terbilangEl) terbilangEl.innerHTML = `<strong>Terbilang:</strong> ${terbilangRupiah(totalDebet)}`;

  const sigContainer = document.getElementById('bkuPreviewSignaturesContainer');
  if (sigContainer) sigContainer.innerHTML = generateStandardTwoSignersHtml();

  const modal = document.getElementById('bkuPreviewModal');
  if (modal) modal.classList.add('active');
};

window.closeBkuPreviewModal = function () {
  const modal = document.getElementById('bkuPreviewModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Download BKU PDF using html2pdf
 */
window.downloadBkuPDF = function () {
  const sheetElement = document.getElementById('bkuPrintableSheet');
  if (!sheetElement) {
    showToast('Elemen pratinjau BKU tidak ditemukan.', 'error');
    return;
  }

  const periodRange = calculatePeriodRange(AppState.bkuFilters);
  const fileName = `Buku_Kas_Umum_Tunai_${periodRange.periodTag}.pdf`;

  if (window.html2pdf) {
    showToast('Sedang memproses unduhan PDF Buku Kas Umum...', 'info');
    const clone = sheetElement.cloneNode(true);
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    clone.style.maxWidth = '920px';
    clone.style.width = '920px';
    clone.style.background = '#ffffff';

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '960px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '16px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const opt = {
      margin: [6, 8, 6, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [279, 241], orientation: 'landscape' }
    };

    html2pdf().set(opt).from(clone).save()
      .then(() => {
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('PDF Buku Kas Umum berhasil diunduh!', 'success');
      })
      .catch(err => {
        console.error('Error download BKU PDF:', err);
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('Gagal mengunduh PDF BKU.', 'error');
      });
  } else {
    window.print();
  }
};

/**
 * Export BKU Tunai to Excel (.xlsx)
 */
function exportBkuCashExcel() {
  const list = getFilteredBkuCashList();
  if (list.length === 0) {
    showToast('Tidak ada data BKU Kas Tunai untuk diekspor.', 'warning');
    return;
  }

  const services = window.db.getServices();
  const f = AppState.bkuFilters;
  const periodRange = calculatePeriodRange(f);
  let runningBalance = 0;
  let totalDebet = 0;

  const exportData = list.map((t, idx) => {
    const service = services.find(s => s.id === t.serviceId);
    const amount = Number(t.amount) || 0;
    totalDebet += amount;
    runningBalance += amount;

    return {
      'No.': idx + 1,
      'Tanggal': t.paymentDate,
      'No. Bukti / Slip': t.receiptNo,
      'No. Transaksi': t.transactionNo,
      'Nama Pembayar / Instansi': t.tenantName || '-',
      'Asal Pembayar': t.payerOrigin || '-',
      'Jenis Layanan': service ? service.name : '-',
      'Keterangan / Rincian Tambahan': t.notes || '-',
      'Penerimaan (Debet) (Rp)': amount,
      'Pengeluaran (Kredit) (Rp)': 0,
      'Saldo Kas Tunai (Rp)': runningBalance,
      'Status': t.status || 'LUNAS',
      'Petugas Kasir': t.createdBy || '-'
    };
  });

  // Append Total Row
  exportData.push({
    'No.': '',
    'Tanggal': '',
    'No. Bukti / Slip': '',
    'No. Transaksi': '',
    'Nama Pembayar / Instansi': 'TOTAL PENERIMAAN KAS TUNAI',
    'Asal Pembayar': '',
    'Jenis Layanan': '',
    'Keterangan / Rincian Tambahan': '',
    'Penerimaan (Debet) (Rp)': totalDebet,
    'Pengeluaran (Kredit) (Rp)': 0,
    'Saldo Kas Tunai (Rp)': totalDebet,
    'Status': '',
    'Petugas Kasir': ''
  });

  exportToExcel(exportData, `Buku_Kas_Umum_Tunai_STP_${periodRange.periodTag}.xlsx`);
}

/**
 * Print Official BKU Tunai Report
 */
function printBkuCashReport() {
  const list = getFilteredBkuCashList();
  if (list.length === 0) {
    showToast('Tidak ada data transaksi kas tunai untuk dicetak.', 'warning');
    return;
  }

  const services = window.db.getServices();
  const f = AppState.bkuFilters;
  const periodRange = calculatePeriodRange(f);

  let runningBalance = 0;
  let totalDebet = 0;

  const rowsHtml = list.map((t, idx) => {
    const service = services.find(s => s.id === t.serviceId);
    const amount = Number(t.amount) || 0;
    totalDebet += amount;
    runningBalance += amount;

    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td><strong>${t.receiptNo}</strong></td>
        <td><strong>${t.tenantName || '-'}</strong><br><span style="font-size:8.5pt; color:#64748b;">${t.payerOrigin ? 'Asal: ' + t.payerOrigin : ''}</span></td>
        <td>${service ? service.name : '-'}</td>
        <td>${t.notes ? t.notes : '<span style="color:#94a3b8; font-style:italic;">-</span>'}</td>
        <td class="text-right"><strong>${formatCurrency(amount)}</strong></td>
        <td class="text-right">-</td>
        <td class="text-right"><strong>${formatCurrency(runningBalance)}</strong></td>
      </tr>
    `;
  }).join('');

  const contentHtml = `
    <div style="margin-bottom: 12px; font-size: 10pt; color: #334155; display:flex; justify-content:space-between;">
      <div><strong>Jenis Pembukuan:</strong> Buku Kas Umum (Penerimaan Tunai / Cash)</div>
      <div><strong>${periodRange.label}</strong> | Total: ${list.length} Transaksi</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 35px;" class="text-center">No</th>
          <th style="width: 90px;">Tanggal</th>
          <th style="width: 105px;">No. Bukti / Slip</th>
          <th>Pembayar & Asal</th>
          <th>Jenis Layanan</th>
          <th>Keterangan / Rincian</th>
          <th style="width: 115px;" class="text-right">Penerimaan (Debet)</th>
          <th style="width: 95px;" class="text-right">Pengeluaran (Kredit)</th>
          <th style="width: 125px;" class="text-right">Saldo Kas Tunai</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr class="total-row">
          <td colspan="6" class="text-right">TOTAL PENERIMAAN KAS TUNAI:</td>
          <td class="text-right" style="color:#059669; font-size:10.5pt;">${formatCurrency(totalDebet)}</td>
          <td class="text-right">Rp 0</td>
          <td class="text-right" style="color:#2563eb; font-size:10.5pt;">${formatCurrency(totalDebet)}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top: 10px; font-size: 9.5pt; font-style: italic; color: #475569;">
      Terbilang: ${terbilangRupiah(totalDebet)}
    </div>
  `;

  const bkuSignatureHtml = generateStandardTwoSignersHtml();
  openPrintDocument('Buku Kas Umum (Penerimaan Tunai / Cash)', contentHtml, bkuSignatureHtml);
}

/**
 * ============================================================================
 * REKAP PENERIMAAN KAS (Transfer dan Cash) CONTROLLER
 * ============================================================================
 */

/**
 * Setup Unified Reports Hub Tabs
 */
function setupReportsHubTabs() {
  const tabButtons = document.querySelectorAll('.reports-main-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-report-tab');
      switchReportTab(targetTabId);
    });
  });
}

function switchReportTab(targetTabId) {
  AppState.reportsTab = targetTabId;
  const tabButtons = document.querySelectorAll('.reports-main-tab-btn');
  tabButtons.forEach(b => {
    if (b.getAttribute('data-report-tab') === targetTabId) {
      b.classList.add('active', 'btn-primary');
      b.classList.remove('btn-outline');
    } else {
      b.classList.remove('active', 'btn-primary');
      b.classList.add('btn-outline');
    }
  });

  document.querySelectorAll('.reports-tab-pane').forEach(pane => {
    if (pane.id === targetTabId) {
      pane.style.display = 'block';
      pane.classList.add('active');
    } else {
      pane.style.display = 'none';
      pane.classList.remove('active');
    }
  });

  if (targetTabId === 'report-tab-services') {
    renderReportsView();
  } else if (targetTabId === 'report-tab-rekening') {
    renderRekeningView();
  } else if (targetTabId === 'report-tab-bku') {
    renderBkuCashView();
  } else if (targetTabId === 'report-tab-rekap-kas') {
    renderRekapKasView();
  }
}

/**
 * Setup Rekap Kas Handlers
 */
function setupRekapKasHandlers() {
  const searchInput = document.getElementById('rekapKasSearchInput');
  const periodTypeSelect = document.getElementById('rekapKasPeriodType');
  const dailyInput = document.getElementById('rekapKasDailyDate');
  const monthInput = document.getElementById('rekapKasMonth');
  const triwulanInput = document.getElementById('rekapKasTriwulan');
  const semesterInput = document.getElementById('rekapKasSemester');
  const yearInput = document.getElementById('rekapKasYear');
  const startDateInput = document.getElementById('rekapKasStartDate');
  const endDateInput = document.getElementById('rekapKasEndDate');
  const resetBtn = document.getElementById('btnResetRekapKasFilter');

  const btnPreview = document.getElementById('btnPreviewRekapKasReport');
  const btnExport = document.getElementById('btnExportRekapKasExcel');
  const btnPrint = document.getElementById('btnPrintRekapKasReport');

  const updateRekapKasPeriodVisibility = () => {
    const pType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    const dailyWrapper = document.getElementById('rekapKasDailyWrapper');
    const monthlyWrapper = document.getElementById('rekapKasMonthlyWrapper');
    const triwulanWrapper = document.getElementById('rekapKasTriwulanWrapper');
    const semesterWrapper = document.getElementById('rekapKasSemesterWrapper');
    const yearWrapper = document.getElementById('rekapKasYearWrapper');
    const customRangeWrapper = document.getElementById('rekapKasCustomRangeWrapper');

    if (dailyWrapper) dailyWrapper.style.display = pType === 'daily' ? 'flex' : 'none';
    if (monthlyWrapper) monthlyWrapper.style.display = pType === 'monthly' ? 'flex' : 'none';
    if (triwulanWrapper) triwulanWrapper.style.display = pType === 'triwulan' ? 'flex' : 'none';
    if (semesterWrapper) semesterWrapper.style.display = pType === 'semester' ? 'flex' : 'none';
    if (yearWrapper) yearWrapper.style.display = (pType === 'monthly' || pType === 'triwulan' || pType === 'semester' || pType === 'yearly') ? 'flex' : 'none';
    if (customRangeWrapper) customRangeWrapper.style.display = pType === 'custom' ? 'flex' : 'none';
  };

  const triggerRekap = () => {
    AppState.rekapKasFilters.search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    AppState.rekapKasFilters.periodType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    AppState.rekapKasFilters.dailyDate = dailyInput ? dailyInput.value : '';
    AppState.rekapKasFilters.month = monthInput ? monthInput.value : '';
    AppState.rekapKasFilters.triwulan = triwulanInput ? triwulanInput.value : '1';
    AppState.rekapKasFilters.semester = semesterInput ? semesterInput.value : '1';
    AppState.rekapKasFilters.year = yearInput ? yearInput.value : '2026';
    AppState.rekapKasFilters.startDate = startDateInput ? startDateInput.value : '';
    AppState.rekapKasFilters.endDate = endDateInput ? endDateInput.value : '';
    renderRekapKasView();
  };

  if (periodTypeSelect) {
    periodTypeSelect.addEventListener('change', () => {
      updateRekapKasPeriodVisibility();
      triggerRekap();
    });
  }

  if (searchInput) searchInput.addEventListener('input', triggerRekap);
  if (dailyInput) dailyInput.addEventListener('change', triggerRekap);
  if (monthInput) monthInput.addEventListener('change', triggerRekap);
  if (triwulanInput) triwulanInput.addEventListener('change', triggerRekap);
  if (semesterInput) semesterInput.addEventListener('change', triggerRekap);
  if (yearInput) yearInput.addEventListener('change', triggerRekap);
  if (startDateInput) startDateInput.addEventListener('change', triggerRekap);
  if (endDateInput) endDateInput.addEventListener('change', triggerRekap);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (periodTypeSelect) periodTypeSelect.value = 'all';
      if (dailyInput) dailyInput.value = '';
      if (monthInput) monthInput.value = '';
      if (triwulanInput) triwulanInput.value = '1';
      if (semesterInput) semesterInput.value = '1';
      if (yearInput) yearInput.value = '2026';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      updateRekapKasPeriodVisibility();
      triggerRekap();
      showToast('Filter periode Rekap Kas direset.', 'info');
    });
  }

  // Bind Tab Buttons
  const tabButtons = document.querySelectorAll('.rekap-kas-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      AppState.rekapKasFilters.activeTab = targetTabId;

      // Update button styles
      tabButtons.forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-outline');
      });
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');

      // Update tab pane visibility
      document.querySelectorAll('.rekap-kas-tab-pane').forEach(pane => {
        if (pane.id === targetTabId) {
          pane.style.display = 'block';
          pane.classList.add('active');
        } else {
          pane.style.display = 'none';
          pane.classList.remove('active');
        }
      });
    });
  });

  if (btnPreview) {
    btnPreview.onclick = () => openRekapKasPreviewModal();
  }
  if (btnExport) {
    btnExport.onclick = () => exportRekapKasExcel();
  }
  if (btnPrint) {
    btnPrint.onclick = () => printRekapKasReport();
  }

  updateRekapKasPeriodVisibility();
}

/**
 * Get Filtered Transactions for Rekap Kas
 */
function getFilteredRekapKasTransactions() {
  let list = window.db.getTransactions();
  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.rekapKasFilters;
  const periodRange = calculatePeriodRange(f);

  if (f.search) {
    list = list.filter(t => {
      const tenantName = t.tenantName || '';
      const origin = t.payerOrigin || '';
      const service = services.find(item => item.id === t.serviceId);
      const method = methods.find(item => item.id === t.paymentMethodId);
      const searchStr = `${t.transactionNo} ${t.receiptNo} ${t.referenceNo} ${t.notes} ${tenantName} ${origin} ${service ? service.name : ''} ${method ? method.name : ''}`.toLowerCase();
      return searchStr.includes(f.search.toLowerCase());
    });
  }

  if (periodRange.startDate) {
    list = list.filter(t => t.paymentDate && t.paymentDate.split('T')[0] >= periodRange.startDate);
  }
  if (periodRange.endDate) {
    list = list.filter(t => t.paymentDate && t.paymentDate.split('T')[0] <= periodRange.endDate);
  }

  return list;
}

/**
 * Render Rekap Kas View
 */
function renderRekapKasView() {
  const allTrx = getFilteredRekapKasTransactions();
  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.rekapKasFilters;
  const periodRange = calculatePeriodRange(f);

  // Split into Cash vs Transfer
  const cashList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 1) return true;
    if (method && (method.code === 'CASH' || method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('tunai'))) return true;
    return false;
  });

  const transferList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 2) return true;
    if (method && (method.code === 'TRANSFER' || method.name.toLowerCase().includes('transfer') || method.name.toLowerCase().includes('bank'))) return true;
    return !cashList.includes(t);
  });

  // Calculate totals
  const cashTotal = cashList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const transferTotal = transferList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const grandTotal = cashTotal + transferTotal;
  const totalCount = allTrx.length;

  const cashPct = grandTotal > 0 ? ((cashTotal / grandTotal) * 100).toFixed(1) : '0';
  const transferPct = grandTotal > 0 ? ((transferTotal / grandTotal) * 100).toFixed(1) : '0';

  // Update Subtitle
  const subtitleEl = document.getElementById('rekapKasSubtitle');
  if (subtitleEl) {
    subtitleEl.textContent = `Rekapitulasi komparatif kas tunai & transfer bank periode ${periodRange.label} (${totalCount} transaksi)`;
  }

  // 1. Update Metric Cards
  const cashAmountEl = document.getElementById('rekapMetricCashAmount');
  if (cashAmountEl) cashAmountEl.textContent = formatCurrency(cashTotal);

  const cashCountEl = document.getElementById('rekapMetricCashCount');
  if (cashCountEl) cashCountEl.textContent = cashList.length;

  const cashPctEl = document.getElementById('rekapMetricCashPct');
  if (cashPctEl) cashPctEl.textContent = `(${cashPct}%)`;

  const transferAmountEl = document.getElementById('rekapMetricTransferAmount');
  if (transferAmountEl) transferAmountEl.textContent = formatCurrency(transferTotal);

  const transferCountEl = document.getElementById('rekapMetricTransferCount');
  if (transferCountEl) transferCountEl.textContent = transferList.length;

  const transferPctEl = document.getElementById('rekapMetricTransferPct');
  if (transferPctEl) transferPctEl.textContent = `(${transferPct}%)`;

  const totalAmountEl = document.getElementById('rekapMetricTotalAmount');
  if (totalAmountEl) totalAmountEl.textContent = formatCurrency(grandTotal);

  const totalCountEl = document.getElementById('rekapMetricTotalCount');
  if (totalCountEl) totalCountEl.textContent = totalCount;

  const ratioEl = document.getElementById('rekapMetricRatio');
  if (ratioEl) ratioEl.textContent = `${cashPct}% : ${transferPct}%`;

  // 2. Populate TAB 1: Matriks Rekapitulasi Per Layanan
  const matrixTbody = document.getElementById('rekapMatrixTableBody');
  if (matrixTbody) {
    if (services.length === 0) {
      matrixTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">Belum ada data master layanan.</td></tr>`;
    } else {
      matrixTbody.innerHTML = services.map((s, idx) => {
        const svcCashes = cashList.filter(t => t.serviceId === s.id);
        const svcTransfers = transferList.filter(t => t.serviceId === s.id);

        const svcCashSum = svcCashes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const svcTransferSum = svcTransfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const svcGrandSum = svcCashSum + svcTransferSum;
        const svcPct = grandTotal > 0 ? ((svcGrandSum / grandTotal) * 100).toFixed(1) : '0';

        return `
          <tr>
            <td style="text-align:center; font-weight:600;">${idx + 1}</td>
            <td><strong>${s.name}</strong></td>
            <td style="text-align:center; background: rgba(16,185,129,0.02);">${svcCashes.length}</td>
            <td style="text-align:right; font-weight:600; color:var(--accent-emerald); background: rgba(16,185,129,0.02);">${formatCurrency(svcCashSum)}</td>
            <td style="text-align:center; background: rgba(37,99,235,0.02);">${svcTransfers.length}</td>
            <td style="text-align:right; font-weight:600; color:var(--primary-600); background: rgba(37,99,235,0.02);">${formatCurrency(svcTransferSum)}</td>
            <td style="text-align:right; font-weight:700; color:var(--primary-700);">${formatCurrency(svcGrandSum)}</td>
            <td style="text-align:right;">${svcPct}%</td>
          </tr>
        `;
      }).join('');
    }

    // Matrix Table Totals
    const mCashCount = document.getElementById('rekapMatrixTotalCashCount');
    if (mCashCount) mCashCount.textContent = cashList.length;

    const mCashAmt = document.getElementById('rekapMatrixTotalCashAmount');
    if (mCashAmt) mCashAmt.textContent = formatCurrency(cashTotal);

    const mTrfCount = document.getElementById('rekapMatrixTotalTransferCount');
    if (mTrfCount) mTrfCount.textContent = transferList.length;

    const mTrfAmt = document.getElementById('rekapMatrixTotalTransferAmount');
    if (mTrfAmt) mTrfAmt.textContent = formatCurrency(transferTotal);

    const mGrand = document.getElementById('rekapMatrixGrandTotal');
    if (mGrand) mGrand.textContent = formatCurrency(grandTotal);
  }

  // 3. Helper to render transaction rows for Tab 2, 3, 4
  const renderTrxRow = (t, idx, showAction = true) => {
    const service = services.find(s => s.id === t.serviceId);
    const displayName = t.tenantName || 'Pembayar / Mitra';
    const displayOrigin = t.payerOrigin ? `<div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-location-dot" style="color:var(--primary-500); font-size:10px;"></i> ${t.payerOrigin}</div>` : '';
    const isAdmin = AppState.currentRole === 'admin';

    const notesDisplay = t.notes && t.notes.trim()
      ? (isAdmin
          ? `<div style="font-size:12px; color:var(--text-main); line-height:1.4; max-width:220px; cursor:pointer;" onclick="openEditNotesModal(${t.id})" title="Klik untuk melihat / mengedit rincian keterangan">
               <i class="fa-regular fa-note-sticky" style="color:var(--primary-500); font-size:11.5px; margin-right:4px;"></i>
               <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">${t.notes.trim()}</span>
             </div>`
          : `<div style="font-size:12px; color:var(--text-main); line-height:1.4; max-width:220px;">
               <i class="fa-regular fa-note-sticky" style="color:var(--primary-500); font-size:11.5px; margin-right:4px;"></i>
               <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">${t.notes.trim()}</span>
             </div>`
        )
      : (isAdmin
          ? `<span style="font-size:11.5px; color:var(--text-subtle); font-style:italic; cursor:pointer;" onclick="openEditNotesModal(${t.id})" title="Klik untuk menambahkan rincian keterangan">+ Tambah catatan</span>`
          : `<span style="font-size:11.5px; color:var(--text-subtle); font-style:italic;">-</span>`
        );

    const isCash = (t.paymentMethodId === 1);
    const amountColor = isCash ? 'var(--accent-emerald)' : 'var(--primary-600)';

    return `
      <tr>
        <td style="text-align:center; font-weight:600;">${idx + 1}</td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td>
          <span style="font-weight:700; color:var(--primary-600);">${t.receiptNo}</span>
          <div style="font-size:10.5px; color:var(--text-muted);">${t.transactionNo}</div>
        </td>
        <td>
          <div style="font-weight:600;">${displayName}</div>
          ${displayOrigin}
        </td>
        <td><div style="font-weight:600;">${service ? service.name : '-'}</div></td>
        <td>${notesDisplay}</td>
        <td style="text-align:right; font-weight:700; color:${amountColor};">${formatCurrency(t.amount)}</td>
        ${showAction ? `
          <td style="text-align:center;">
            <div style="display:flex; gap:5px; justify-content:center;">
              ${isAdmin ? `
                <button class="btn btn-outline btn-sm btn-icon-only" onclick="openEditNotesModal(${t.id})" title="Lihat / Edit Keterangan & Rincian">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              ` : ''}
              <button class="btn btn-outline btn-sm btn-icon-only" onclick="viewReceiptModal(${t.id})" title="Lihat Kuitansi">
                <i class="fa-solid fa-receipt"></i>
              </button>
            </div>
          </td>
        ` : ''}
      </tr>
    `;
  };

  // 4. Populate TAB 2: Rincian Kas Tunai (Cash)
  const cashTbody = document.getElementById('rekapCashTableBody');
  if (cashTbody) {
    if (cashList.length === 0) {
      cashTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">Tidak ada transaksi pembayaran tunai (Cash) pada periode ini.</td></tr>`;
    } else {
      cashTbody.innerHTML = cashList.map((t, idx) => renderTrxRow(t, idx, true)).join('');
    }
  }
  const cashBadge = document.getElementById('rekapCashSubtotalBadge');
  if (cashBadge) cashBadge.textContent = `${cashList.length} Transaksi - ${formatCurrency(cashTotal)}`;
  const cashTotalEl = document.getElementById('rekapCashTableTotal');
  if (cashTotalEl) cashTotalEl.textContent = formatCurrency(cashTotal);

  // 5. Populate TAB 3: Rincian Transfer Bank
  const transferTbody = document.getElementById('rekapTransferTableBody');
  if (transferTbody) {
    if (transferList.length === 0) {
      transferTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">Tidak ada transaksi pembayaran transfer bank pada periode ini.</td></tr>`;
    } else {
      transferTbody.innerHTML = transferList.map((t, idx) => renderTrxRow(t, idx, true)).join('');
    }
  }
  const transferBadge = document.getElementById('rekapTransferSubtotalBadge');
  if (transferBadge) transferBadge.textContent = `${transferList.length} Transaksi - ${formatCurrency(transferTotal)}`;
  const transferTotalEl = document.getElementById('rekapTransferTableTotal');
  if (transferTotalEl) transferTotalEl.textContent = formatCurrency(transferTotal);

  // 6. Populate TAB 4: Stacked Tables
  const stackedCashTbody = document.getElementById('rekapStackedCashTableBody');
  if (stackedCashTbody) {
    if (cashList.length === 0) {
      stackedCashTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Tidak ada transaksi tunai.</td></tr>`;
    } else {
      stackedCashTbody.innerHTML = cashList.map((t, idx) => renderTrxRow(t, idx, false)).join('');
    }
  }
  const stackedCashTotal = document.getElementById('rekapStackedCashTotal');
  if (stackedCashTotal) stackedCashTotal.textContent = formatCurrency(cashTotal);

  const stackedTrfTbody = document.getElementById('rekapStackedTransferTableBody');
  if (stackedTrfTbody) {
    if (transferList.length === 0) {
      stackedTrfTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Tidak ada transaksi transfer bank.</td></tr>`;
    } else {
      stackedTrfTbody.innerHTML = transferList.map((t, idx) => renderTrxRow(t, idx, false)).join('');
    }
  }
  const stackedTrfTotal = document.getElementById('rekapStackedTransferTotal');
  if (stackedTrfTotal) stackedTrfTotal.textContent = formatCurrency(transferTotal);

  // 7. Footer Terbilang
  const footerTerbilang = document.getElementById('rekapKasFooterTerbilang');
  if (footerTerbilang) footerTerbilang.textContent = `Terbilang: ${terbilangRupiah(grandTotal)}`;
}

/**
 * Open Rekap Kas Interactive Preview Modal
 */
window.openRekapKasPreviewModal = function () {
  const allTrx = getFilteredRekapKasTransactions();
  const periodRange = calculatePeriodRange(AppState.rekapKasFilters);
  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();

  const periodTextEl = document.getElementById('rekapKasPreviewPeriodText');
  if (periodTextEl) periodTextEl.textContent = periodRange.label;

  const summaryMetaEl = document.getElementById('rekapKasPreviewSummaryMeta');
  if (summaryMetaEl) summaryMetaEl.textContent = `${periodRange.label} | Total: ${allTrx.length} Transaksi`;

  const previewSubtitle = document.getElementById('rekapKasPreviewSubtitle');
  if (previewSubtitle) previewSubtitle.textContent = `Dokumen komparatif penerimaan kas periode ${periodRange.label} (${allTrx.length} transaksi)`;

  // Separate Cash & Transfer
  const cashList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 1) return true;
    if (method && (method.code === 'CASH' || method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('tunai'))) return true;
    return false;
  });

  const transferList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 2) return true;
    if (method && (method.code === 'TRANSFER' || method.name.toLowerCase().includes('transfer') || method.name.toLowerCase().includes('bank'))) return true;
    return !cashList.includes(t);
  });

  const cashTotal = cashList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const transferTotal = transferList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const grandTotal = cashTotal + transferTotal;

  // Update Section counts
  const cashCountEl = document.getElementById('rekapKasPreviewCashCount');
  if (cashCountEl) cashCountEl.textContent = `${cashList.length} Transaksi (Subtotal: ${formatCurrency(cashTotal)})`;

  const transferCountEl = document.getElementById('rekapKasPreviewTransferCount');
  if (transferCountEl) transferCountEl.textContent = `${transferList.length} Transaksi (Subtotal: ${formatCurrency(transferTotal)})`;

  // Render Cash Rows
  const cashTbody = document.getElementById('rekapKasPreviewCashTableBody');
  if (cashTbody) {
    if (cashList.length === 0) {
      cashTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:#94a3b8; font-style:italic;">Tidak ada transaksi pembayaran tunai (Cash) pada periode ini.</td></tr>`;
    } else {
      cashTbody.innerHTML = cashList.map((t, idx) => {
        const service = services.find(s => s.id === t.serviceId);
        const originText = t.payerOrigin ? `<div style="font-size:8.5pt; color:#64748b; margin-top:2px;">Asal: ${t.payerOrigin}</div>` : '';
        const descText = t.notes ? `<div style="font-size:8.5pt; color:#475569; margin-top:2px;">${t.notes}</div>` : '';
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${formatDateIndo(t.paymentDate)}</td>
            <td><strong>${t.receiptNo || t.referenceNo || '-'}</strong></td>
            <td><strong>${t.tenantName || '-'}</strong>${originText}</td>
            <td><strong>${service ? service.name : '-'}</strong>${descText}</td>
            <td style="text-align:right;"><strong>${formatCurrency(t.amount)}</strong></td>
          </tr>
        `;
      }).join('') + `
        <tr class="total-row" style="background:#f0fdf4;">
          <td colspan="5" style="text-align:right; font-weight:700;">SUBTOTAL PENERIMAAN CASH (TUNAI):</td>
          <td style="text-align:right; color:#059669; font-weight:800; font-size:10pt;">${formatCurrency(cashTotal)}</td>
        </tr>
      `;
    }
  }

  // Render Transfer Rows
  const transferTbody = document.getElementById('rekapKasPreviewTransferTableBody');
  if (transferTbody) {
    if (transferList.length === 0) {
      transferTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:#94a3b8; font-style:italic;">Tidak ada transaksi pembayaran transfer bank pada periode ini.</td></tr>`;
    } else {
      transferTbody.innerHTML = transferList.map((t, idx) => {
        const service = services.find(s => s.id === t.serviceId);
        const originText = t.payerOrigin ? `<div style="font-size:8.5pt; color:#64748b; margin-top:2px;">Asal: ${t.payerOrigin}</div>` : '';
        const descText = t.notes ? `<div style="font-size:8.5pt; color:#475569; margin-top:2px;">${t.notes}</div>` : '';
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${formatDateIndo(t.paymentDate)}</td>
            <td><strong>${t.receiptNo || t.referenceNo || '-'}</strong></td>
            <td><strong>${t.tenantName || '-'}</strong>${originText}</td>
            <td><strong>${service ? service.name : '-'}</strong>${descText}</td>
            <td style="text-align:right;"><strong>${formatCurrency(t.amount)}</strong></td>
          </tr>
        `;
      }).join('') + `
        <tr class="total-row" style="background:#eff6ff;">
          <td colspan="5" style="text-align:right; font-weight:700;">SUBTOTAL PENERIMAAN TRANSFER BANK:</td>
          <td style="text-align:right; color:#2563eb; font-weight:800; font-size:10pt;">${formatCurrency(transferTotal)}</td>
        </tr>
      `;
    }
  }

  const grandTotalEl = document.getElementById('rekapKasPreviewGrandTotal');
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  const terbilangEl = document.getElementById('rekapKasPreviewTerbilang');
  if (terbilangEl) terbilangEl.innerHTML = `<strong>Terbilang:</strong> ${terbilangRupiah(grandTotal)}`;

  const sigContainer = document.getElementById('rekapKasPreviewSignaturesContainer');
  if (sigContainer) sigContainer.innerHTML = generateThreeSignersHtml();

  const modal = document.getElementById('rekapKasPreviewModal');
  if (modal) modal.classList.add('active');
};

window.closeRekapKasPreviewModal = function () {
  const modal = document.getElementById('rekapKasPreviewModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Download Rekap Kas PDF using html2pdf
 */
window.downloadRekapKasPDF = function () {
  const sheetElement = document.getElementById('rekapKasPrintableSheet');
  if (!sheetElement) {
    showToast('Elemen pratinjau Rekap Kas tidak ditemukan.', 'error');
    return;
  }

  const periodRange = calculatePeriodRange(AppState.rekapKasFilters);
  const fileName = `Rekap_Penerimaan_Kas_${periodRange.periodTag}.pdf`;

  if (window.html2pdf) {
    showToast('Sedang memproses unduhan PDF Rekap Penerimaan Kas...', 'info');
    const clone = sheetElement.cloneNode(true);
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    clone.style.maxWidth = '920px';
    clone.style.width = '920px';
    clone.style.background = '#ffffff';

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '960px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '16px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const opt = {
      margin: [6, 8, 6, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [279, 241], orientation: 'landscape' }
    };

    html2pdf().set(opt).from(clone).save()
      .then(() => {
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('PDF Rekap Penerimaan Kas berhasil diunduh!', 'success');
      })
      .catch(err => {
        console.error('Error download Rekap Kas PDF:', err);
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        showToast('Gagal mengunduh PDF Rekap Kas.', 'error');
      });
  } else {
    window.print();
  }
};

/**
 * Export Rekap Penerimaan Kas to Excel (.xlsx)
 */
function exportRekapKasExcel() {
  const allTrx = getFilteredRekapKasTransactions();
  if (allTrx.length === 0) {
    showToast('Tidak ada data transaksi Rekap Kas untuk diekspor.', 'warning');
    return;
  }

  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.rekapKasFilters;
  const periodRange = calculatePeriodRange(f);

  const exportData = allTrx.map((t, idx) => {
    const service = services.find(s => s.id === t.serviceId);
    const method = methods.find(m => m.id === t.paymentMethodId);
    const isCash = (t.paymentMethodId === 1);

    return {
      'No.': idx + 1,
      'Tanggal': t.paymentDate,
      'No. Bukti / Slip': t.receiptNo,
      'No. Transaksi': t.transactionNo,
      'Nama Pembayar / Mitra': t.tenantName || '-',
      'Asal Pembayar': t.payerOrigin || '-',
      'Jenis Layanan': service ? service.name : '-',
      'Metode Pembayaran': method ? method.name : (isCash ? 'Cash' : 'Transfer'),
      'Kategori Metode': isCash ? 'TUNAI (CASH)' : 'NON-TUNAI (TRANSFER)',
      'Keterangan / Rincian': t.notes || '-',
      'Nominal (Rp)': Number(t.amount) || 0,
      'Status': t.status || 'LUNAS',
      'Petugas': t.createdBy || '-'
    };
  });

  const cashTotal = allTrx.filter(t => t.paymentMethodId === 1).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const transferTotal = allTrx.filter(t => t.paymentMethodId !== 1).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const grandTotal = cashTotal + transferTotal;

  // Append Total Row
  exportData.push({
    'No.': '',
    'Tanggal': '',
    'No. Bukti / Slip': '',
    'No. Transaksi': '',
    'Nama Pembayar / Mitra': 'TOTAL TUNAI (CASH)',
    'Asal Pembayar': '',
    'Jenis Layanan': '',
    'Metode Pembayaran': '',
    'Kategori Metode': 'CASH',
    'Keterangan / Rincian': '',
    'Nominal (Rp)': cashTotal,
    'Status': '',
    'Petugas': ''
  });

  exportData.push({
    'No.': '',
    'Tanggal': '',
    'No. Bukti / Slip': '',
    'No. Transaksi': '',
    'Nama Pembayar / Mitra': 'TOTAL TRANSFER BANK',
    'Asal Pembayar': '',
    'Jenis Layanan': '',
    'Metode Pembayaran': '',
    'Kategori Metode': 'TRANSFER',
    'Keterangan / Rincian': '',
    'Nominal (Rp)': transferTotal,
    'Status': '',
    'Petugas': ''
  });

  exportData.push({
    'No.': '',
    'Tanggal': '',
    'No. Bukti / Slip': '',
    'No. Transaksi': '',
    'Nama Pembayar / Mitra': 'TOTAL KESELURUHAN (BRUTO)',
    'Asal Pembayar': '',
    'Jenis Layanan': '',
    'Metode Pembayaran': '',
    'Kategori Metode': 'TOTAL',
    'Keterangan / Rincian': '',
    'Nominal (Rp)': grandTotal,
    'Status': '',
    'Petugas': ''
  });

  exportToExcel(exportData, `Rekap_Penerimaan_Kas_Cash_Transfer_${periodRange.periodTag}.xlsx`);
}

/**
 * Print Official Rekap Penerimaan Kas Report
 */
function printRekapKasReport() {
  const allTrx = getFilteredRekapKasTransactions();
  if (allTrx.length === 0) {
    showToast('Tidak ada data transaksi Rekap Kas untuk dicetak.', 'warning');
    return;
  }

  const services = window.db.getServices();
  const methods = window.db.getPaymentMethods();
  const f = AppState.rekapKasFilters;
  const periodRange = calculatePeriodRange(f);

  // Separate Cash (Tunai) & Transfer (Non-Tunai)
  const cashList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 1) return true;
    if (method && (method.code === 'CASH' || method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('tunai'))) return true;
    return false;
  });

  const transferList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 2) return true;
    if (method && (method.code === 'TRANSFER' || method.name.toLowerCase().includes('transfer') || method.name.toLowerCase().includes('bank'))) return true;
    return !cashList.includes(t);
  });

  const cashTotal = cashList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const transferTotal = transferList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const grandTotal = cashTotal + transferTotal;

  // Generate Cash rows
  const cashRowsHtml = cashList.length > 0 ? cashList.map((t, idx) => {
    const service = services.find(s => s.id === t.serviceId);
    const originText = t.payerOrigin ? `<div style="font-size:8.5pt; color:#64748b; margin-top:2px;">Asal: ${t.payerOrigin}</div>` : '';
    const descText = t.notes ? `<div style="font-size:8.5pt; color:#475569; margin-top:2px;">${t.notes}</div>` : '';
    const serviceAndNotes = `<strong>${service ? service.name : '-'}</strong>${descText}`;

    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td><strong>${t.receiptNo || t.referenceNo || '-'}</strong></td>
        <td><strong>${t.tenantName || '-'}</strong>${originText}</td>
        <td>${serviceAndNotes}</td>
        <td class="text-right"><strong>${formatCurrency(t.amount)}</strong></td>
      </tr>
    `;
  }).join('') : `<tr><td colspan="6" class="text-center" style="color:#94a3b8; font-style:italic; padding:12px;">Tidak ada transaksi pembayaran tunai (Cash) pada periode ini.</td></tr>`;

  // Generate Transfer rows
  const transferRowsHtml = transferList.length > 0 ? transferList.map((t, idx) => {
    const service = services.find(s => s.id === t.serviceId);
    const originText = t.payerOrigin ? `<div style="font-size:8.5pt; color:#64748b; margin-top:2px;">Asal: ${t.payerOrigin}</div>` : '';
    const descText = t.notes ? `<div style="font-size:8.5pt; color:#475569; margin-top:2px;">${t.notes}</div>` : '';
    const serviceAndNotes = `<strong>${service ? service.name : '-'}</strong>${descText}`;

    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${formatDateIndo(t.paymentDate)}</td>
        <td><strong>${t.receiptNo || t.referenceNo || '-'}</strong></td>
        <td><strong>${t.tenantName || '-'}</strong>${originText}</td>
        <td>${serviceAndNotes}</td>
        <td class="text-right"><strong>${formatCurrency(t.amount)}</strong></td>
      </tr>
    `;
  }).join('') : `<tr><td colspan="6" class="text-center" style="color:#94a3b8; font-style:italic; padding:12px;">Tidak ada transaksi pembayaran transfer bank pada periode ini.</td></tr>`;

  const contentHtml = `
    <div style="margin-bottom: 14px; font-size: 10pt; color: #334155; display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:6px;">
      <div><strong>Laporan:</strong> Rekapitulasi Penerimaan Kas (Metode Cash & Transfer)</div>
      <div><strong>${periodRange.label}</strong> | Total: ${allTrx.length} Transaksi</div>
    </div>

    <!-- 1. TABEL PEMBAYARAN METODE CASH (BAGIAN ATAS) -->
    <div style="margin-bottom: 22px;">
      <div style="font-size: 10.5pt; font-weight: 800; color: #065f46; margin-bottom: 6px; display:flex; justify-content:space-between; align-items:center;">
        <span>I. PEMBAYARAN DENGAN METODE CASH (TUNAI)</span>
        <span style="font-size: 9pt; font-weight: normal; color: #64748b;">Jumlah: ${cashList.length} Transaksi</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px;" class="text-center">No</th>
            <th style="width: 95px;">Tanggal</th>
            <th style="width: 120px;">No. Bukti / Slip</th>
            <th style="width: 210px;">Nama & Asal Pembayar</th>
            <th>Keterangan / Rincian</th>
            <th style="width: 145px;" class="text-right">Jumlah Nominal (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${cashRowsHtml}
          <tr class="total-row" style="background:#f0fdf4;">
            <td colspan="5" class="text-right" style="font-weight:700;">SUBTOTAL PENERIMAAN CASH (TUNAI):</td>
            <td class="text-right" style="color:#059669; font-weight:800; font-size:10pt;">${formatCurrency(cashTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2. TABEL PEMBAYARAN METODE TRANSFER (BAGIAN BAWAH) -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 10.5pt; font-weight: 800; color: #1e40af; margin-bottom: 6px; display:flex; justify-content:space-between; align-items:center;">
        <span>II. PEMBAYARAN DENGAN METODE TRANSFER (NON-TUNAI)</span>
        <span style="font-size: 9pt; font-weight: normal; color: #64748b;">Jumlah: ${transferList.length} Transaksi</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 35px;" class="text-center">No</th>
            <th style="width: 95px;">Tanggal</th>
            <th style="width: 120px;">No. Bukti / Slip</th>
            <th style="width: 210px;">Nama & Asal Pembayar</th>
            <th>Keterangan / Rincian</th>
            <th style="width: 145px;" class="text-right">Jumlah Nominal (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${transferRowsHtml}
          <tr class="total-row" style="background:#eff6ff;">
            <td colspan="5" class="text-right" style="font-weight:700;">SUBTOTAL PENERIMAAN TRANSFER:</td>
            <td class="text-right" style="color:#2563eb; font-weight:800; font-size:10pt;">${formatCurrency(transferTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. RINGKASAN REKAPITULASI TOTAL PENERIMAAN -->
    <table style="width: 100%; margin-top: 14px; border: 2px solid #0f172a; border-collapse: collapse;">
      <tr style="background: #f8fafc; font-weight: 800; font-size: 10.5pt;">
        <td style="padding: 10px 14px; border: none; width: 70%;">TOTAL KESELURUHAN PENERIMAAN (CASH + TRANSFER):</td>
        <td class="text-right" style="padding: 10px 14px; border: none; color: #0f172a; font-size: 11.5pt;">${formatCurrency(grandTotal)}</td>
      </tr>
    </table>

    <div style="margin-top: 8px; font-size: 9.5pt; font-style: italic; color: #475569;">
      <strong>Terbilang:</strong> ${terbilangRupiah(grandTotal)}
    </div>
  `;

  const rekapKasSignatureHtml = generateThreeSignersHtml();
  openPrintDocument('Rekapitulasi Penerimaan Kas (Metode Cash & Transfer)', contentHtml, rekapKasSignatureHtml);
}

/**
 * ============================================================================
 * PARAMETER PEJABAT PENANDATANGAN DOKUMEN & SIGNATURE HELPERS
 * ============================================================================
 */

function getOfficialData(roleId) {
  if (typeof window.db !== 'undefined' && typeof window.db.getOfficialByRole === 'function') {
    return window.db.getOfficialByRole(roleId);
  }
  return { name: 'Pejabat Berwenang', nip: '-', position: 'Pejabat UPTD' };
}

/**
 * Generate 2-Signer Standard Official Block (Rekap Layanan, Riwayat Pembayaran, Rekening BLUD, BKU)
 */
function generateStandardTwoSignersHtml(leftRoleId = 'bendahara_penerimaan', rightRoleId = 'kepala_uptd') {
  const leftOfficer = getOfficialData(leftRoleId);
  const rightOfficer = getOfficialData(rightRoleId);
  const printDateStr = formatDateIndo(new Date());

  const leftPosition = leftOfficer.position || 'Bendahara Penerimaan BLUD';
  const rightPosition = rightOfficer.position || 'Kepala UPTD Kawasan Sains dan Teknologi Solo Technopark';

  return `
    <div class="signature-section" style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid; gap: 20px;">
      <!-- Sebelah Kiri: Bendahara Penerimaan BLUD -->
      <div class="signature-box" style="text-align: center; width: 290px; font-size: 9.5pt;">
        <p>Surakarta, ${printDateStr}</p>
        <p style="font-weight: 600; margin-top: 2px;">${leftPosition}</p>
        <div class="signature-space" style="height: 60px;"></div>
        <p class="signature-name" style="font-weight: 700; text-decoration: underline;">${leftOfficer.name}</p>
        <p class="signature-nip" style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">NIP. ${leftOfficer.nip || '-'}</p>
      </div>

      <!-- Sebelah Kanan: Kepala UPTD Solo Technopark (Mengetahui) -->
      <div class="signature-box" style="text-align: center; width: 290px; font-size: 9.5pt;">
        <p>Mengetahui,</p>
        <p style="font-weight: 600; margin-top: 2px;">${rightPosition}</p>
        <div class="signature-space" style="height: 60px;"></div>
        <p class="signature-name" style="font-weight: 700; text-decoration: underline;">${rightOfficer.name}</p>
        <p class="signature-nip" style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">NIP. ${rightOfficer.nip || '-'}</p>
      </div>
    </div>
  `;
}

/**
 * Generate 3-Signer Official Block (Rekapitulasi Penerimaan Kas Solo Technopark)
 */
function generateThreeSignersHtml(leftRoleId = 'bendahara_penerimaan', midRoleId = 'bendahara_blud', rightRoleId = 'kepala_uptd') {
  const leftOfficer = getOfficialData(leftRoleId);
  const midOfficer = getOfficialData(midRoleId);
  const rightOfficer = getOfficialData(rightRoleId);
  const printDateStr = formatDateIndo(new Date());

  return `
    <div class="signature-section" style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid; gap: 15px;">
      <!-- Sebelah Kiri: Bendahara Penerimaan BLUD -->
      <div class="signature-box" style="text-align: center; flex: 1; max-width: 270px; font-size: 9.5pt;">
        <p>Surakarta, ${printDateStr}</p>
        <p style="font-weight: 600; margin-top: 2px;">${leftOfficer.position}</p>
        <div class="signature-space" style="height: 60px;"></div>
        <p class="signature-name" style="font-weight: 700; text-decoration: underline;">${leftOfficer.name}</p>
        <p class="signature-nip" style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">NIP. ${leftOfficer.nip || '-'}</p>
      </div>

      <!-- Sebelah Tengah: Yang Menerima Setoran Bendahara BLUD -->
      <div class="signature-box" style="text-align: center; flex: 1; max-width: 290px; font-size: 9.5pt;">
        <p>Menerima Setoran,</p>
        <p style="font-weight: 600; margin-top: 2px;">${midOfficer.position}</p>
        <div class="signature-space" style="height: 60px;"></div>
        <p class="signature-name" style="font-weight: 700; text-decoration: underline;">${midOfficer.name}</p>
        <p class="signature-nip" style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">NIP. ${midOfficer.nip || '-'}</p>
      </div>

      <!-- Sebelah Kanan: Kepala UPTD Solo Technopark -->
      <div class="signature-box" style="text-align: center; flex: 1; max-width: 270px; font-size: 9.5pt;">
        <p>Mengetahui,</p>
        <p style="font-weight: 600; margin-top: 2px;">${rightOfficer.position}</p>
        <div class="signature-space" style="height: 60px;"></div>
        <p class="signature-name" style="font-weight: 700; text-decoration: underline;">${rightOfficer.name}</p>
        <p class="signature-nip" style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">NIP. ${rightOfficer.nip || '-'}</p>
      </div>
    </div>
  `;
}

/**
 * Render Parameter Pejabat View
 */
function renderParametersView() {
  const container = document.getElementById('parametersCardsContainer');
  if (!container) return;

  const officials = window.db.getOfficials();

  container.innerHTML = officials.map((o, idx) => {
    const reportTags = (o.reports || []).map(r => `<span class="parameter-report-tag"><i class="fa-solid fa-file-circle-check"></i> ${r}</span>`).join('');

    return `
      <div class="parameter-official-card" id="card_param_${o.id}">
        <div class="parameter-card-header">
          <div class="parameter-title-group">
            <div class="parameter-icon-box">
              <i class="fa-solid ${o.icon || 'fa-user-tie'}"></i>
            </div>
            <div>
              <div class="parameter-pos-title">${o.position}</div>
              <div class="parameter-pos-desc">${o.description || 'Pejabat Penandatangan Laporan Resmi'}</div>
            </div>
          </div>
          <span class="badge badge-info" style="font-size:11px; font-weight:700;">Pejabat #${idx + 1}</span>
        </div>

        <div class="parameter-card-body">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="param_name_${o.id}">
              <i class="fa-solid fa-user-pen" style="color:var(--primary-600);"></i> Nama Pejabat & Gelar <span class="required">*</span>
            </label>
            <input type="text" class="form-control" id="param_name_${o.id}" name="name_${o.id}" value="${o.name || ''}" placeholder="Masukkan nama lengkap beserta gelar..." required autocomplete="off">
            <div class="form-helper">Nama lengkap beserta gelar yang akan tercetak otomatis pada kolom tanda tangan laporan.</div>
          </div>

          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="param_nip_${o.id}">
              <i class="fa-solid fa-id-card" style="color:var(--primary-600);"></i> Nomor Induk Pegawai (NIP) <span class="required">*</span>
            </label>
            <input type="text" class="form-control" id="param_nip_${o.id}" name="nip_${o.id}" value="${o.nip || ''}" placeholder="Contoh: 198412112009121002 atau '-'" required autocomplete="off">
            <div class="form-helper">Format NIP resmi aparatur sipil / penanggung jawab (contoh: 198412112009121002 atau '-')</div>
          </div>
        </div>

        <div class="parameter-card-footer">
          <div style="font-size:12px; color:var(--text-muted); font-weight:600;">
            <i class="fa-solid fa-link" style="color:var(--primary-600); margin-right:4px;"></i> Dokumen Terhubung:
          </div>
          <div class="parameter-reports-taglist">
            ${reportTags || '<span class="parameter-report-tag">Laporan Resmi</span>'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.saveParametersForm = function (event) {
  if (event) event.preventDefault();

  const officials = window.db.getOfficials();
  const updatedOfficials = officials.map(o => {
    const nameInput = document.getElementById(`param_name_${o.id}`);
    const nipInput = document.getElementById(`param_nip_${o.id}`);

    const newName = nameInput ? nameInput.value.trim() : o.name;
    const newNip = nipInput ? nipInput.value.trim() : o.nip;

    return {
      ...o,
      name: newName || o.name,
      nip: newNip || o.nip,
      updatedAt: new Date().toISOString()
    };
  });

  window.db.updateAllOfficials(updatedOfficials);
  showToast('✓ Parameter nama pejabat & NIP penandatangan berhasil disimpan!', 'success');
  renderParametersView();
  updateTopBarUserDisplay();
};

window.resetParametersToDefault = function () {
  if (confirm('Apakah Anda yakin ingin mereset seluruh nama pejabat & NIP ke data standar Solo Technopark?')) {
    window.db.resetOfficialsToDefault();
    showToast('✓ Parameter pejabat penandatangan dikembalikan ke konfigurasi standar.', 'info');
    renderParametersView();
    updateTopBarUserDisplay();
  }
};

window.openSignaturePreviewModal = function () {
  const container2 = document.getElementById('previewTwoSignersContainer');
  const container3 = document.getElementById('previewThreeSignersContainer');

  if (container2) {
    container2.innerHTML = generateStandardTwoSignersHtml();
  }
  if (container3) {
    container3.innerHTML = generateThreeSignersHtml();
  }

  const modal = document.getElementById('previewSignaturesModal');
  if (modal) modal.classList.add('active');
};

window.closeSignaturePreviewModal = function () {
  const modal = document.getElementById('previewSignaturesModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Universal Official Document Print Helper (241mm x 279mm landscape friendly)
 */
function openPrintDocument(title, contentHtml, customSignatureHtml = null) {
  const printWin = window.open('', '_blank', 'width=1000,height=750');
  if (!printWin) {
    showToast('Izinkan pop-up browser untuk mencetak laporan.', 'warning');
    window.print();
    return;
  }

  const printDate = formatDateIndo(new Date(), true);
  const signaturesHtml = customSignatureHtml || generateStandardTwoSignersHtml();

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { padding: 25px 35px; color: #1e293b; background: #fff; line-height: 1.4; }
        .kop-surat { display: flex; align-items: center; justify-content: flex-start; gap: 18px; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 16px; position: relative; }
        .kop-logo { width: 110px; height: 65px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .kop-logo img { height: 60px; width: auto; max-width: 110px; object-fit: contain; }
        .kop-text { flex: 1; text-align: center; padding-right: 110px; }
        .kop-text h2 { font-size: 14pt; font-weight: 800; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; line-height: 1.3; margin-bottom: 4px; }
        .kop-text p { font-size: 9.5pt; color: #334155; line-height: 1.4; }
        .report-header { text-align: center; margin-bottom: 16px; }
        .report-title { font-size: 13pt; font-weight: 800; text-decoration: underline; text-transform: uppercase; }
        .report-period { font-size: 9.5pt; color: #475569; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5pt; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: 700; color: #1e293b; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { font-weight: 800; background-color: #f8fafc; }
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-start; page-break-inside: avoid; gap: 15px; }
        .signature-box { text-align: center; width: 260px; font-size: 9.5pt; }
        .signature-space { height: 60px; }
        .signature-name { font-weight: 700; text-decoration: underline; }
        .signature-nip { font-size: 8.5pt; color: #64748b; margin-top: 2px; }
        @media print {
          @page { size: 279mm 241mm landscape; margin: 8mm 12mm; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="kop-surat">
        <div class="kop-logo">
          <img src="assets/logo-solo-technopark.png" alt="Logo Solo Technopark" onerror="this.src='assets/logo-solo-technopark.png';">
        </div>
        <div class="kop-text">
          <h2>UPTD KAWASAN SAINS DAN TEKNOLOGI SOLO TECHNOPARK</h2>
          <p>Jl. Ki Hajar Dewantara, Jebres, Kec. Jebres, Kota Surakarta, Jawa Tengah 57126 Telepon 0271-666628</p>
        </div>
      </div>

      <div class="report-header">
        <div class="report-title">${title}</div>
        <div class="report-period">Waktu Cetak: ${printDate}</div>
      </div>

      ${contentHtml}

      ${signaturesHtml}

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWin.document.close();
}

/**
 * Audit Log View Rendering
 */
function renderAuditLogs() {
  const container = document.getElementById('auditTimelineContainer');
  if (!container) return;

  const logs = window.db.getAuditLogs();
  if (logs.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">Belum ada catatan aktivitas.</div>`;
    return;
  }

  container.innerHTML = logs.map(log => {
    let dotClass = 'indigo';
    if (log.action === 'CREATE') dotClass = 'emerald';
    if (log.action === 'UPDATE') dotClass = 'amber';
    if (log.action === 'DELETE') dotClass = 'rose';

    return `
      <div class="audit-item">
        <div class="audit-dot ${dotClass}"></div>
        <div class="audit-content">
          <div class="audit-time">
            <i class="fa-regular fa-clock"></i> ${formatDateIndo(log.timestamp, true)}
          </div>
          <div class="audit-desc">
            <span class="audit-user">${log.user}</span>: ${log.description}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Helper to derive Account Code (NO. AKUN) for Receipt
 */
function getReceiptAccountCode(trx, service) {
  if (!service) return '4103010-00';
  const sName = service.name.toLowerCase();
  if (sName.includes('tenant') || sName.includes('foodpark') || sName.includes('kerjasama')) return '4103010-00';
  if (sName.includes('praktek') || sName.includes('pelatihan') || sName.includes('produksi')) return '4101010-00';
  if (sName.includes('hibah')) return '4102010-00';
  if (sName.includes('giro')) return '4104010-00';
  return '4103010-00';
}

/**
 * Digital Receipt Modal Controller ("TANDA TERIMA" Official Format)
 */
window.viewReceiptModal = function (transactionId) {
  const trx = window.db.getTransactionById(transactionId);
  if (!trx) {
    showToast('Data transaksi tidak ditemukan.', 'error');
    return;
  }

  AppState.selectedTransactionForReceipt = trx;
  const service = window.db.getServiceById(trx.serviceId);
  const method = window.db.getPaymentMethods().find(m => m.id === trx.paymentMethodId);

  const displayTenant = trx.tenantName || 'Pembayar / Mitra';
  const displayOrigin = trx.payerOrigin || 'Surakarta';

  // Nomor Tanda Terima
  const receiptSlipNo = trx.receiptNo || trx.referenceNo || window.db.generateNextReceiptNo(trx.paymentDate);

  const isTransfer = (method && (method.name.toLowerCase().includes('transfer') || method.code === 'TRANSFER')) || trx.paymentMethodId === 2;
  const isLunas = (trx.status || 'LUNAS').toUpperCase() === 'LUNAS';
  const notesText = (trx.notes && trx.notes.trim()) ? trx.notes.trim() : (service ? service.name : '-');
  const remVal = Number(trx.remainingAmount) || 0;
  const showRemaining = !isLunas && remVal > 0;
  const bendaharaPenerimaan = window.db.getOfficialByRole('bendahara_penerimaan');
  const officerName = (bendaharaPenerimaan && bendaharaPenerimaan.name) ? bendaharaPenerimaan.name : (user ? user.name : 'Alvin Prayogo Anindito, A.Md.Ak');

  // Helper untuk mengisi data
  const setAllText = (selectorName, val) => {
    const elements = document.querySelectorAll(`.${selectorName}, #${selectorName}`);
    elements.forEach(el => {
      el.textContent = val;
    });
  };

  // Tanggal
  setAllText('receiptModalDate', formatDateIndo(trx.paymentDate));

  // No Tanda Terima
  setAllText('receiptModalNo', receiptSlipNo);

  // Akun (Jenis Layanan)
  setAllText('receiptModalAkun', service ? service.name : '-');

  // Asal Pembayar
  setAllText('receiptModalPayerOrigin', displayOrigin);

  // Telah Terima Dari
  setAllText('receiptModalTenant', displayTenant);

  // Metode Pembayaran
  setAllText('receiptModalMethod', method ? method.name : (isTransfer ? 'Transfer' : 'Cash'));

  // Status Pembayaran
  setAllText('receiptModalStatus', isLunas ? 'Lunas' : 'Belum Lunas');

  // Untuk Keperluan
  setAllText('receiptModalServiceNotes', notesText);

  // Uang Sejumlah (Nominal Rp)
  const formattedAmount = Number(trx.amount || 0).toLocaleString('id-ID', {
    minimumFractionDigits: (Number(trx.amount || 0) % 1 !== 0) ? 2 : 0,
    maximumFractionDigits: 2
  });
  setAllText('receiptModalAmount', formattedAmount);

  // Kekurangan Pembayaran: HANYA MUNCUL JIKA STATUS BELUM LUNAS DAN ADA NOMINAL KEKURANGAN
  const remainingContainers = document.querySelectorAll('#receiptModalRemainingContainer, .receiptModalRemainingContainer');
  remainingContainers.forEach(container => {
    container.style.display = showRemaining ? 'inline-flex' : 'none';
  });
  if (showRemaining) {
    const formattedRemaining = remVal.toLocaleString('id-ID', {
      minimumFractionDigits: (remVal % 1 !== 0) ? 2 : 0,
      maximumFractionDigits: 2
    });
    setAllText('receiptModalRemainingAmount', formattedRemaining);
  }

  // Terbilang (Menyebutkan nominal angka sampai dua angka di belakang koma)
  setAllText('receiptModalTerbilang', terbilangRupiah(trx.amount));

  // Tanda Tangan Penyetor & Petugas
  setAllText('receiptPayerSignerName', displayTenant);
  setAllText('receiptSignerName', officerName);

  // Open Modal
  const modal = document.getElementById('receiptModal');
  if (modal) {
    modal.classList.add('active');
  }

  // Log Print/View
  window.db.logAudit('PRINT', `Melihat/Mencetak Kuitansi #${receiptSlipNo} (${displayTenant})`);
};

window.closeReceiptModal = function () {
  const modal = document.getElementById('receiptModal');
  if (modal) {
    modal.classList.remove('active');
  }
  if (AppState.currentView === 'input-payment') {
    switchView('dashboard');
  }
};

/**
 * Edit Transaction Modal Controller
 * - Akun Petugas (Admin): Dapat mengubah No. Slip, Tanggal, Pembayar, Layanan, Nominal, Status, Kekurangan & Catatan secara manual
 * - Akun Pemimpin (Pimpinan): Tampilan semula (Brief Info Box statis & hanya melihat/memperbarui keterangan & status)
 */
window.openEditNotesModal = function (transactionId) {
  if (AppState.currentRole !== 'admin') {
    showToast('Akses ditolak. Akun Pemimpin hanya memiliki hak akses monitoring (lihat data).', 'warning');
    return;
  }

  const trx = window.db.getTransactionById(transactionId);
  if (!trx) {
    showToast('Data transaksi tidak ditemukan.', 'error');
    return;
  }

  const isAdmin = true;
  const service = window.db.getServiceById(trx.serviceId);

  // 1. Transaction ID (Hidden)
  const idInput = document.getElementById('editNotesTransactionId');
  if (idInput) idInput.value = trx.id;

  // Title, Subtitle, Button, and Box Elements
  const titleEl = document.getElementById('editModalTitle');
  const subtitleEl = document.getElementById('editModalSubtitle');
  const adminFields = document.getElementById('editModalAdminFields');
  const pimpinanInfoBox = document.getElementById('editModalPimpinanInfoBox');
  const deleteBtn = document.getElementById('editModalDeleteBtn');
  const saveBtnText = document.getElementById('editModalSaveBtnText');

  if (isAdmin) {
    // Mode Petugas: Form Edit Manual Penuh
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-file-pen" style="color:var(--primary-600);"></i> Edit Data Pembayaran &amp; Keterangan`;
    if (subtitleEl) subtitleEl.textContent = `Ubah No. Bukti / Slip, Pembayar, Layanan, Nominal, Tanggal, dan Catatan Transaksi`;
    if (adminFields) adminFields.style.display = 'block';
    if (pimpinanInfoBox) pimpinanInfoBox.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    if (saveBtnText) saveBtnText.textContent = 'Simpan Perubahan';

    // Isi Nilai Input Editable Petugas
    const receiptNoInput = document.getElementById('editModalReceiptNo');
    if (receiptNoInput) receiptNoInput.value = trx.receiptNo || trx.referenceNo || '';

    const dateInput = document.getElementById('editModalPaymentDate');
    if (dateInput) {
      const rawDate = trx.paymentDate ? trx.paymentDate.split('T')[0] : '';
      dateInput.value = rawDate;
    }

    const tenantInput = document.getElementById('editModalTenantName');
    if (tenantInput) tenantInput.value = trx.tenantName || '';

    const originInput = document.getElementById('editModalPayerOrigin');
    if (originInput) originInput.value = trx.payerOrigin || '';

    const serviceSelect = document.getElementById('editModalServiceId');
    if (serviceSelect) {
      const services = window.db.getServices();
      serviceSelect.innerHTML = services.map(s => `
        <option value="${s.id}" ${Number(s.id) === Number(trx.serviceId) ? 'selected' : ''}>${s.name}</option>
      `).join('');
      serviceSelect.value = trx.serviceId;
    }

    const methodSelect = document.getElementById('editModalPaymentMethodId');
    if (methodSelect) {
      const methods = window.db.getPaymentMethods();
      methodSelect.innerHTML = methods.map(m => `
        <option value="${m.id}" ${Number(m.id) === Number(trx.paymentMethodId) ? 'selected' : ''}>${m.name} (${m.bankAccount || '-'})</option>
      `).join('');
      methodSelect.value = trx.paymentMethodId;
    }

    const amountInput = document.getElementById('editModalAmount');
    const amountHelper = document.getElementById('editAmountTerbilangHelper');
    if (amountInput) {
      const curAmount = Number(trx.amount) || 0;
      amountInput.value = curAmount;
      if (amountHelper) {
        amountHelper.textContent = curAmount > 0 ? `${formatCurrency(curAmount)} (${terbilangRupiah(curAmount)})` : '';
      }
      if (!amountInput.dataset.bound) {
        amountInput.dataset.bound = 'true';
        amountInput.addEventListener('input', () => {
          const v = Number(amountInput.value) || 0;
          if (amountHelper) {
            amountHelper.textContent = v > 0 ? `${formatCurrency(v)} (${terbilangRupiah(v)})` : '';
          }
        });
      }
    }
  } else {
    // Mode Pimpinan / Pemimpin: Tampilan Semula (Brief Info Box Statis)
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-file-pen" style="color:var(--primary-600);"></i> Keterangan / Rincian Transaksi`;
    if (subtitleEl) subtitleEl.textContent = `Lihat atau perbarui rincian catatan transaksi pembayaran`;
    if (adminFields) adminFields.style.display = 'none';
    if (pimpinanInfoBox) pimpinanInfoBox.style.display = 'block';
    if (deleteBtn) deleteBtn.style.display = 'none';
    if (saveBtnText) saveBtnText.textContent = 'Simpan Keterangan';

    const noEl = document.getElementById('editNotesReceiptNo');
    if (noEl) noEl.textContent = trx.receiptNo || trx.referenceNo || '-';

    const tenantEl = document.getElementById('editNotesTenantName');
    if (tenantEl) tenantEl.textContent = trx.tenantName || '-';

    const serviceEl = document.getElementById('editNotesServiceName');
    if (serviceEl) serviceEl.textContent = service ? service.name : '-';

    const amountEl = document.getElementById('editNotesAmount');
    if (amountEl) amountEl.textContent = formatCurrency(trx.amount);
  }

  // 3. Status & Kekurangan Pembayaran (Tersedia di kedua mode)
  const statusSelect = document.getElementById('editModalStatus');
  const remInput = document.getElementById('editModalRemainingAmount');
  const remHelper = document.getElementById('editRemainingTerbilangHelper');
  const remGroup = document.getElementById('editModalRemainingGroup');

  if (statusSelect) {
    statusSelect.value = (trx.status || 'LUNAS').toUpperCase();
    
    const updateStatusUI = () => {
      const isLunas = statusSelect.value === 'LUNAS';
      if (isLunas) {
        if (remInput) remInput.value = 0;
        if (remHelper) remHelper.textContent = '';
        if (remGroup) remGroup.style.opacity = '0.6';
      } else {
        if (remGroup) remGroup.style.opacity = '1';
        if (remInput && Number(remInput.value) === 0) {
          remInput.focus();
        }
      }
    };

    updateStatusUI();

    if (!statusSelect.dataset.bound) {
      statusSelect.dataset.bound = 'true';
      statusSelect.addEventListener('change', updateStatusUI);
    }
  }

  if (remInput) {
    const curRem = Number(trx.remainingAmount) || 0;
    remInput.value = curRem;
    if (remHelper) {
      remHelper.textContent = curRem > 0 ? `Kekurangan: ${formatCurrency(curRem)} (${terbilangRupiah(curRem)})` : '';
    }
    if (!remInput.dataset.bound) {
      remInput.dataset.bound = 'true';
      remInput.addEventListener('input', () => {
        const v = Number(remInput.value) || 0;
        if (remHelper) {
          remHelper.textContent = v > 0 ? `Kekurangan: ${formatCurrency(v)} (${terbilangRupiah(v)})` : '';
        }
      });
    }
  }

  // 4. Keterangan / Catatan
  const textarea = document.getElementById('editNotesTextarea');
  if (textarea) textarea.value = trx.notes || '';

  const modal = document.getElementById('editNotesModal');
  if (modal) {
    modal.classList.add('active');
  }
};

window.closeEditNotesModal = function () {
  const modal = document.getElementById('editNotesModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.saveTransactionNotes = function () {
  if (AppState.currentRole !== 'admin') {
    showToast('Akses ditolak. Akun Pemimpin tidak memiliki hak akses mengubah transaksi.', 'warning');
    return;
  }

  const idInput = document.getElementById('editNotesTransactionId');
  if (!idInput || !idInput.value) return;

  const trxId = Number(idInput.value);
  const trx = window.db.getTransactionById(trxId);
  if (!trx) {
    showToast('Data transaksi tidak ditemukan.', 'error');
    return;
  }

  const isAdmin = true;

  if (isAdmin) {
    // Jalur Simpan Khusus Petugas Admin (Semua field tersimpan)
    const receiptNo = (document.getElementById('editModalReceiptNo')?.value || '').trim();
    const paymentDate = document.getElementById('editModalPaymentDate')?.value || '';
    const tenantName = (document.getElementById('editModalTenantName')?.value || '').trim();
    const payerOrigin = (document.getElementById('editModalPayerOrigin')?.value || '').trim();
    const serviceId = Number(document.getElementById('editModalServiceId')?.value);
    const paymentMethodId = Number(document.getElementById('editModalPaymentMethodId')?.value);
    const amount = Number(document.getElementById('editModalAmount')?.value) || 0;
    const status = (document.getElementById('editModalStatus')?.value || 'LUNAS').toUpperCase();
    let remainingAmount = Number(document.getElementById('editModalRemainingAmount')?.value) || 0;
    if (status === 'LUNAS') remainingAmount = 0;
    const notes = (document.getElementById('editNotesTextarea')?.value || '').trim();

    // Validasi Kolom Wajib
    if (!receiptNo) {
      showToast('Nomor Bukti / Slip wajib diisi.', 'warning');
      document.getElementById('editModalReceiptNo')?.focus();
      return;
    }

    if (!paymentDate) {
      showToast('Tanggal pembayaran wajib diisi.', 'warning');
      document.getElementById('editModalPaymentDate')?.focus();
      return;
    }

    if (!tenantName) {
      showToast('Nama Pembayar / Mitra wajib diisi.', 'warning');
      document.getElementById('editModalTenantName')?.focus();
      return;
    }

    if (!serviceId) {
      showToast('Jenis Layanan wajib dipilih.', 'warning');
      document.getElementById('editModalServiceId')?.focus();
      return;
    }

    if (amount <= 0) {
      showToast('Nominal pembayaran harus lebih besar dari Rp 0.', 'warning');
      document.getElementById('editModalAmount')?.focus();
      return;
    }

    if (status === 'BELUM LUNAS' && remainingAmount <= 0) {
      showToast('Untuk status Belum Lunas, mohon isi nominal kekurangan pembayaran.', 'warning');
      document.getElementById('editModalRemainingAmount')?.focus();
      return;
    }

    // Cari tenant yang cocok bila ada
    const matchedTenant = window.db.getTenants().find(t => t.name.toLowerCase() === tenantName.toLowerCase());

    const updated = window.db.updateTransaction(trxId, {
      receiptNo: receiptNo,
      referenceNo: receiptNo,
      paymentDate: paymentDate,
      tenantId: matchedTenant ? matchedTenant.id : null,
      tenantName: tenantName,
      payerOrigin: payerOrigin,
      serviceId: serviceId,
      paymentMethodId: paymentMethodId,
      amount: amount,
      status: status,
      remainingAmount: remainingAmount,
      notes: notes
    });

    if (updated) {
      const service = window.db.getServiceById(serviceId);
      const serviceName = service ? service.name : '-';
      window.db.logAudit('UPDATE', `Memperbarui transaksi #${updated.receiptNo}: Pembayar "${tenantName}", Layanan "${serviceName}", Nominal "${formatCurrency(amount)}", Status "${status}"`);
      showToast(`✓ Perubahan transaksi #${updated.receiptNo} berhasil disimpan!`, 'success');
      closeEditNotesModal();

      // Refresh seluruh tampilan & tabel
      renderTransactionsTable();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderBkuCashView === 'function') renderBkuCashView();
      if (typeof renderRekapKasView === 'function') renderRekapKasView();
      if (typeof renderReportsView === 'function') renderReportsView();
      if (typeof renderRekeningTable === 'function') renderRekeningTable();
      if (typeof renderRekapKasTable === 'function') renderRekapKasTable();
      if (typeof renderAuditLogs === 'function') renderAuditLogs();
    } else {
      showToast('Gagal menyimpan perubahan data transaksi.', 'error');
    }
  } else {
    // Jalur Simpan Khusus Pimpinan / Pemimpin (Format Semula: Status, Kekurangan & Catatan saja)
    const statusSelect = document.getElementById('editModalStatus');
    const remInput = document.getElementById('editModalRemainingAmount');
    const textarea = document.getElementById('editNotesTextarea');

    const newStatus = statusSelect ? statusSelect.value : 'LUNAS';
    const newRemainingAmount = newStatus === 'LUNAS' ? 0 : (remInput ? (Number(remInput.value) || 0) : 0);
    const newNotes = textarea ? textarea.value.trim() : '';

    const updated = window.db.updateTransaction(trxId, {
      status: newStatus,
      remainingAmount: newRemainingAmount,
      notes: newNotes
    });

    if (updated) {
      window.db.logAudit('UPDATE', `Memperbarui transaksi #${updated.receiptNo}: Status "${newStatus}", Kekurangan: "${formatCurrency(newRemainingAmount)}", Keterangan: "${newNotes || '(kosong)'}"`);
      showToast('Data keterangan, status & kekurangan transaksi berhasil diperbarui!', 'success');
      closeEditNotesModal();

      renderTransactionsTable();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderBkuCashView === 'function') renderBkuCashView();
      if (typeof renderRekapKasView === 'function') renderRekapKasView();
      if (typeof renderReportsView === 'function') renderReportsView();
      if (typeof renderRekeningTable === 'function') renderRekeningTable();
      if (typeof renderRekapKasTable === 'function') renderRekapKasTable();
      if (typeof renderAuditLogs === 'function') renderAuditLogs();
    } else {
      showToast('Gagal menyimpan perubahan transaksi.', 'error');
    }
  }
};

/**
 * Trigger Direct Print
 */
/**
 * Trigger Direct Print Kuitansi (Solo Technopark Official)
 */
window.printCurrentReceipt = function () {
  const receiptElement = document.getElementById('printableReceiptArea');
  if (!receiptElement) return;

  const trx = AppState.selectedTransactionForReceipt;
  const receiptTitle = `Kuitansi - ${trx ? (trx.receiptNo || trx.referenceNo) : 'Solo Technopark'}`;
  const isFromInputPayment = AppState.currentView === 'input-payment';

  try {
    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (printWin) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>${receiptTitle}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            @page {
              size: 241mm 279mm;
              margin: 6mm 8mm;
            }
            body {
              background: #ffffff;
              padding: 12px;
              color: #1e3a8a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .tt-receipt-wrapper {
              background: #ffffff;
              color: #1e3a8a;
              padding: 24px 32px;
              border: 2px solid #1e3a8a;
              border-radius: 4px;
              margin: 0 auto;
              max-width: 860px;
              width: 100%;
            }
            .tt-header {
              display: flex;
              align-items: center;
              justify-content: flex-start;
              gap: 16px;
              padding-bottom: 6px;
            }
            .tt-logo {
              width: 88px;
              height: 50px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .tt-logo img {
              height: 46px;
              width: auto;
              max-width: 88px;
              object-fit: contain;
            }
            .tt-header-text {
              flex: 1;
              text-align: center;
              padding-right: 88px;
            }
            .tt-gov-name {
              font-size: 12pt;
              font-weight: 800;
              color: #1e3a8a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              line-height: 1.25;
            }
            .tt-gov-addr, .tt-gov-telp {
              font-size: 9pt;
              color: #1e3a8a;
              margin-top: 1px;
            }
            .tt-title-box {
              border: 1.5px solid #1e3a8a;
              text-align: center;
              font-size: 15pt;
              font-weight: 800;
              font-style: italic;
              letter-spacing: 4px;
              padding: 3px 0;
              margin: 6px 0 8px 0;
              color: #1e3a8a;
              text-transform: uppercase;
              background: #ffffff;
            }
            .tt-date-row {
              text-align: right;
              font-size: 9.5pt;
              color: #1e3a8a;
              font-weight: 600;
              margin-bottom: 8px;
              padding-right: 4px;
            }
            .tt-details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
            }
            .tt-details-table td {
              padding: 4px 2px;
              font-size: 10pt;
              color: #1e3a8a;
              vertical-align: top;
              line-height: 1.35;
            }
            .tt-details-table td.tt-label {
              width: 140px;
              white-space: nowrap;
            }
            .tt-details-table td.tt-colon {
              width: 14px;
              text-align: center;
            }
            .tt-details-table td.tt-value {
              color: #1e3a8a;
              font-weight: 500;
            }
            .tt-details-table td.tt-label-mid, .tt-details-table td.tt-label-right {
              font-weight: 700;
              white-space: nowrap;
              text-align: right;
              padding-right: 4px;
            }
            .tt-details-table td.tt-value-mid {
              font-weight: 600;
              padding-right: 14px;
              white-space: nowrap;
            }
            .tt-details-table td.tt-value-right {
              font-weight: 600;
              white-space: nowrap;
              text-align: left;
            }
            .tt-amount-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin: 12px 0 6px 0;
              font-size: 10.5pt;
              color: #1e3a8a;
            }
            .tt-amount-label {
              width: 140px;
            }
            .tt-amount-colon {
              width: 14px;
              text-align: center;
            }
            .tt-amount-val {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-size: 11pt;
              font-weight: 800;
            }
            .tt-amount-val .tt-rp {
              font-weight: 700;
            }
            .tt-terbilang-row {
              display: flex;
              align-items: flex-start;
              margin: 6px 0 14px 0;
              font-size: 10pt;
              color: #1e3a8a;
            }
            .tt-terbilang-text {
              flex: 1;
              font-style: italic;
              font-weight: 600;
              color: #1e3a8a;
              line-height: 1.4;
            }
            .tt-signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 14px;
              margin-bottom: 10px;
            }
            .tt-sig-box {
              text-align: center;
              width: 220px;
              font-size: 9.5pt;
              color: #1e3a8a;
            }
            .tt-sig-title {
              font-size: 9.5pt;
              margin-bottom: 4px;
            }
            .tt-sig-space {
              height: 48px;
            }
            .tt-sig-name {
              font-weight: 700;
              text-decoration: underline;
              font-size: 10pt;
            }
            .tt-footer-nb {
              border-top: 1px solid #1e3a8a;
              padding-top: 6px;
              margin-top: 10px;
              font-size: 8.5pt;
              color: #1e3a8a;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          ${receiptElement.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
        </html>
      `;
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
    } else {
      // Fallback if popup blocker is active
      window.print();
    }
  } catch (e) {
    console.warn('Popup print fallback:', e);
    window.print();
  }

  if (isFromInputPayment) {
    setTimeout(() => {
      closeReceiptModal();
      switchView('dashboard');
    }, 400);
  }
};

// Global listener for afterprint event
window.addEventListener('afterprint', () => {
  if (AppState.currentView === 'input-payment') {
    const modal = document.getElementById('receiptModal');
    if (modal && modal.classList.contains('active')) {
      closeReceiptModal();
      switchView('dashboard');
    }
  }
});

/**
 * Trigger PDF Download of Receipt using html2pdf with fallback
 */
window.downloadCurrentReceiptPDF = function () {
  const receiptElement = document.querySelector('.tt-receipt-wrapper');
  if (!receiptElement) {
    showToast('Elemen kuitansi tidak ditemukan.', 'error');
    return;
  }

  const trx = AppState.selectedTransactionForReceipt;
  const fileName = `Kuitansi_${trx ? (trx.receiptNo || trx.referenceNo).replace(/[\/\\]/g, '_') : 'STP'}.pdf`;
  const isFromInputPayment = AppState.currentView === 'input-payment';

  if (window.html2pdf) {
    showToast('Sedang memproses unduhan PDF Kuitansi...', 'info');

    // Create a pristine off-screen clone with exact dimensions
    const clone = receiptElement.cloneNode(true);
    clone.style.margin = '0 auto';
    clone.style.boxShadow = 'none';
    clone.style.maxWidth = '800px';
    clone.style.width = '800px';
    clone.style.background = '#ffffff';

    const isLunas = (trx.status || 'LUNAS').toUpperCase() === 'LUNAS';
    const remVal = Number(trx.remainingAmount) || 0;
    const showRemaining = !isLunas && remVal > 0;
    const remContainer = clone.querySelector('#receiptModalRemainingContainer');
    if (remContainer) {
      remContainer.style.display = showRemaining ? 'inline-flex' : 'none';
    }

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '840px';
    tempContainer.style.background = '#ffffff';
    tempContainer.style.padding = '12px';
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    const opt = {
      margin: [6, 8, 6, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [241, 279], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save()
      .then(() => {
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
        showToast('Kuitansi PDF berhasil diunduh!', 'success');
        if (isFromInputPayment) {
          closeReceiptModal();
          switchView('dashboard');
        }
      })
      .catch((err) => {
        console.error('Error generating PDF:', err);
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
        showToast('Gagal memproses file PDF, mengalihkan ke Cetak / Simpan PDF...', 'warning');
        window.printCurrentReceipt();
      });
  } else {
    showToast('Membuka dialog cetak / Simpan PDF...', 'info');
    window.printCurrentReceipt();
  }
};

/**
 * Setup Mobile Sidebar Toggle
 */
function setupMobileSidebar() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

/**
 * Helper to update date display in header
 */
function updateCurrentDateDisplay() {
  const el = document.getElementById('topbarCurrentDate');
  if (el) {
    el.textContent = formatDateIndo(new Date());
  }
}

// Global modal close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('modal-backdrop')) {
    closeReceiptModal();
    closeEditNotesModal();
    closeLogoutModal();
    closeRekeningKoranModal();
  }
});

/**
 * ==========================================================================
 * REKENING KORAN & DOKUMEN MUTASI BANK CONTROLLER
 * ==========================================================================
 */

const MONTH_NAMES_INDONESIA = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember'
};

const BANK_DEFAULT_ACCOUNTS = {
  'Bank Jateng': '1-002-007181',
  'Bank Mandiri': '1380022007707'
};

function setupRekeningKoranHandlers() {
  const form = document.getElementById('formUploadRekeningKoran');
  const dropZone = document.getElementById('rkDropZone');
  const fileInput = document.getElementById('rkFileInput');
  const browseBtn = document.getElementById('rkBrowseBtn');
  const removeFileBtn = document.getElementById('rkRemoveFileBtn');
  const bankSelect = document.getElementById('rkInputBank');
  const accountNoInput = document.getElementById('rkInputAccountNo');
  const resetFormBtn = document.getElementById('rkResetFormBtn');

  // Filter Elements
  const filterYear = document.getElementById('rkFilterYear');
  const filterMonth = document.getElementById('rkFilterMonth');
  const filterBank = document.getElementById('rkFilterBank');
  const searchInput = document.getElementById('rkSearchInput');
  const resetFilterBtn = document.getElementById('rkResetFilterBtn');

  // Auto populate account number on bank change
  if (bankSelect && accountNoInput) {
    bankSelect.addEventListener('change', () => {
      const selected = bankSelect.value;
      if (BANK_DEFAULT_ACCOUNTS[selected] !== undefined) {
        accountNoInput.value = BANK_DEFAULT_ACCOUNTS[selected];
      }
    });
  }

  // Browse File Button
  if (browseBtn && fileInput) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // DropZone Click & Drag-Drop
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', (e) => {
      if (e.target.closest('#rkRemoveFileBtn')) return;
      fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  // File Input Change
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  // Remove File Button
  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearStagedFile();
    });
  }

  // Form Reset Button
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      resetRekeningKoranForm();
      showToast('Form unggah rekening koran direset.', 'info');
    });
  }

  // Form Submit Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRekeningKoranSubmit();
    });
  }

  // Filter Listeners
  if (filterYear) {
    filterYear.addEventListener('change', () => {
      AppState.rekeningKoranFilters.year = filterYear.value;
      renderRekeningKoranView();
    });
  }

  if (filterMonth) {
    filterMonth.addEventListener('change', () => {
      AppState.rekeningKoranFilters.month = filterMonth.value;
      renderRekeningKoranView();
    });
  }

  if (filterBank) {
    filterBank.addEventListener('change', () => {
      AppState.rekeningKoranFilters.bank = filterBank.value;
      renderRekeningKoranView();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      AppState.rekeningKoranFilters.search = searchInput.value.trim().toLowerCase();
      renderRekeningKoranTable();
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      AppState.rekeningKoranFilters = {
        year: 'all',
        month: 'all',
        bank: 'all',
        search: ''
      };
      if (filterYear) filterYear.value = 'all';
      if (filterMonth) filterMonth.value = 'all';
      if (filterBank) filterBank.value = 'all';
      if (searchInput) searchInput.value = '';
      renderRekeningKoranView();
      showToast('Filter arsip rekening koran berhasil direset.', 'info');
    });
  }
}

function handleFileSelection(file) {
  if (!file) return;

  if (file.size > 15 * 1024 * 1024) {
    showToast('Ukuran berkas melebihi batas maksimal 15MB.', 'error');
    return;
  }

  const promptEl = document.getElementById('rkDropZonePrompt');
  const cardEl = document.getElementById('rkFileSelectedCard');
  const nameEl = document.getElementById('rkFileSelectedName');
  const sizeEl = document.getElementById('rkFileSelectedSize');
  const iconEl = document.getElementById('rkFileSelectedIcon');

  const reader = new FileReader();
  reader.onload = function(e) {
    AppState.stagedRekeningKoranFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl: e.target.result
    };

    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB • Berkas Terpilih`;

    if (iconEl) {
      if (file.type.includes('pdf')) {
        iconEl.innerHTML = '<i class="fa-solid fa-file-pdf"></i>';
        iconEl.className = 'rk-file-icon';
      } else if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        iconEl.innerHTML = '<i class="fa-solid fa-file-excel"></i>';
        iconEl.className = 'rk-file-icon excel';
      } else if (file.type.includes('image')) {
        iconEl.innerHTML = '<i class="fa-solid fa-file-image"></i>';
        iconEl.className = 'rk-file-icon image';
      } else {
        iconEl.innerHTML = '<i class="fa-solid fa-file-lines"></i>';
        iconEl.className = 'rk-file-icon';
      }
    }

    if (promptEl) promptEl.style.display = 'none';
    if (cardEl) cardEl.style.display = 'flex';
  };

  reader.readAsDataURL(file);
}

function clearStagedFile() {
  AppState.stagedRekeningKoranFile = null;
  const fileInput = document.getElementById('rkFileInput');
  if (fileInput) fileInput.value = '';

  const promptEl = document.getElementById('rkDropZonePrompt');
  const cardEl = document.getElementById('rkFileSelectedCard');
  if (promptEl) promptEl.style.display = 'block';
  if (cardEl) cardEl.style.display = 'none';
}

function resetRekeningKoranForm() {
  const form = document.getElementById('formUploadRekeningKoran');
  if (form) form.reset();
  clearStagedFile();

  const monthSelect = document.getElementById('rkInputMonth');
  const yearSelect = document.getElementById('rkInputYear');
  const bankSelect = document.getElementById('rkInputBank');
  const accountNoInput = document.getElementById('rkInputAccountNo');

  if (monthSelect) monthSelect.value = '8';
  if (yearSelect) yearSelect.value = '2026';
  if (bankSelect) bankSelect.value = 'Bank Jateng';
  if (accountNoInput) accountNoInput.value = '1-002-007181';
}

function handleRekeningKoranSubmit() {
  const monthVal = Number(document.getElementById('rkInputMonth')?.value || 8);
  const yearVal = Number(document.getElementById('rkInputYear')?.value || 2026);
  const bankName = (document.getElementById('rkInputBank')?.value || 'Bank Jateng').trim();
  const accountNo = (document.getElementById('rkInputAccountNo')?.value || '').trim();
  const openingBalance = Number(document.getElementById('rkInputOpeningBalance')?.value) || 0;
  const closingBalance = Number(document.getElementById('rkInputClosingBalance')?.value) || 0;
  const notes = (document.getElementById('rkInputNotes')?.value || '').trim();

  if (!accountNo) {
    showToast('Nomor Rekening Bank wajib diisi.', 'warning');
    return;
  }

  const monthName = MONTH_NAMES_INDONESIA[monthVal] || 'Agustus';

  let fileName = `Rekening_Koran_${bankName.replace(/\s+/g, '_')}_${monthName}_${yearVal}.pdf`;
  let fileType = 'application/pdf';
  let fileSize = 2097152;
  let fileSizeFormatted = '2.0 MB';
  let fileData = '';

  if (AppState.stagedRekeningKoranFile) {
    fileName = AppState.stagedRekeningKoranFile.name;
    fileType = AppState.stagedRekeningKoranFile.type || 'application/pdf';
    fileSize = AppState.stagedRekeningKoranFile.size;
    fileSizeFormatted = `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
    fileData = AppState.stagedRekeningKoranFile.dataUrl || '';
  }

  const currentUser = window.db.getCurrentUser();
  window.db.addRekeningKoran({
    bankName,
    accountNo,
    accountName: `Rekening Penerimaan BLUD (${bankName})`,
    month: monthVal,
    monthName,
    year: yearVal,
    openingBalance,
    closingBalance,
    fileName,
    fileType,
    fileSize,
    fileSizeFormatted,
    fileData,
    uploadDate: new Date().toISOString(),
    uploadedBy: currentUser ? currentUser.name : 'Petugas Admin',
    notes: notes || `Rekening Koran ${bankName} Periode ${monthName} ${yearVal} telah diarsipkan.`
  });

  showToast(`✓ Berkas Rekening Koran ${monthName} ${yearVal} (${bankName}) berhasil diunggah!`, 'success');
  resetRekeningKoranForm();
  renderRekeningKoranView();
}

/**
 * Render Rekening Koran View & Table
 */
function renderRekeningKoranView() {
  const list = window.db.getRekeningKoran() || [];

  // Update Metrics
  const totalCount = list.length;
  const currentYear = Number(AppState.rekeningKoranFilters.year === 'all' ? 2026 : AppState.rekeningKoranFilters.year);
  const yearDocs = list.filter(r => r.year === currentYear).length;
  
  // Unique Banks
  const uniqueBanks = new Set(list.map(r => r.bankName));

  const totalEl = document.getElementById('rkStatTotalDocs');
  const yearEl = document.getElementById('rkStatYearDocs');
  const yearSubEl = document.getElementById('rkStatYearSubtitle');
  const bankEl = document.getElementById('rkStatBankCount');

  if (totalEl) totalEl.textContent = `${totalCount} Berkas`;
  if (yearEl) yearEl.textContent = `${yearDocs} Berkas`;
  if (yearSubEl) yearSubEl.textContent = `Tahun ${currentYear}`;
  if (bankEl) bankEl.textContent = `${uniqueBanks.size} Bank`;

  renderRekeningKoranTable();
}

function renderRekeningKoranTable() {
  const tbody = document.getElementById('rkTableBody');
  const badgeEl = document.getElementById('rkTableCountBadge');
  if (!tbody) return;

  const allRecords = window.db.getRekeningKoran() || [];
  const filters = AppState.rekeningKoranFilters;

  // Filter records
  const filtered = allRecords.filter(item => {
    // Year filter (up to 2030)
    if (filters.year !== 'all' && Number(item.year) !== Number(filters.year)) {
      return false;
    }
    // Month filter (1-12 / Januari-Desember)
    if (filters.month !== 'all' && Number(item.month) !== Number(filters.month)) {
      return false;
    }
    // Bank filter
    if (filters.bank !== 'all' && item.bankName !== filters.bank) {
      return false;
    }
    // Search keyword
    if (filters.search) {
      const q = filters.search;
      const match = (
        (item.bankName || '').toLowerCase().includes(q) ||
        (item.accountNo || '').toLowerCase().includes(q) ||
        (item.monthName || '').toLowerCase().includes(q) ||
        String(item.year).includes(q) ||
        (item.fileName || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q) ||
        (item.uploadedBy || '').toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    return true;
  });

  if (badgeEl) {
    badgeEl.textContent = `${filtered.length} Dokumen`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 36px 20px; color:var(--text-muted);">
          <div style="font-size:36px; color:var(--text-subtle); margin-bottom:10px;"><i class="fa-solid fa-folder-open"></i></div>
          <div style="font-size:14px; font-weight:700; color:var(--text-main);">Tidak Ada Dokumen Rekening Koran</div>
          <p style="font-size:12.5px; margin-top:4px;">Tidak ditemukan berkas rekening koran untuk kriteria filter yang dipilih.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, index) => {
    let docIcon = '<i class="fa-solid fa-file-pdf rk-doc-icon"></i>';
    if (r.fileType?.includes('sheet') || r.fileType?.includes('excel') || r.fileName?.endsWith('.xlsx') || r.fileName?.endsWith('.xls') || r.fileName?.endsWith('.csv')) {
      docIcon = '<i class="fa-solid fa-file-excel rk-doc-icon excel"></i>';
    } else if (r.fileType?.includes('image')) {
      docIcon = '<i class="fa-solid fa-file-image rk-doc-icon image"></i>';
    }

    const formattedClosing = r.closingBalance > 0 ? formatCurrency(r.closingBalance) : '-';
    const uploadDateStr = formatDateIndo(r.uploadDate, true);

    return `
      <tr>
        <td style="text-align:center; font-weight:600; color:var(--text-muted);">${index + 1}</td>
        <td>
          <span class="rk-period-pill" onclick="previewRekeningKoran(${r.id})" style="cursor:pointer;" title="Klik untuk melihat rekening koran">
            <i class="fa-regular fa-calendar-check" style="color:var(--primary-600);"></i>
            ${r.monthName} ${r.year}
          </span>
        </td>
        <td>
          <div class="rk-bank-badge">
            <i class="fa-solid fa-building-columns"></i> ${r.bankName}
          </div>
          <div style="font-size:11.5px; color:var(--text-muted); font-family:monospace; margin-top:2px;">
            ${r.accountNo || '-'}
          </div>
        </td>
        <td>
          <div class="rk-doc-card" onclick="previewRekeningKoran(${r.id})" style="cursor:pointer;" title="Klik untuk melihat dokumen rekening koran">
            ${docIcon}
            <div class="rk-doc-info">
              <div class="rk-doc-name" title="${r.fileName}">${r.fileName}</div>
              <div class="rk-doc-size">${r.fileSizeFormatted || '1.0 MB'} • ${r.status === 'VERIFIED' ? 'Terverifikasi' : 'Arsip'}</div>
            </div>
          </div>
        </td>
        <td style="text-align:right; font-weight:700; color:var(--accent-emerald);">
          ${formattedClosing}
        </td>
        <td>
          <div style="font-size:12.5px; font-weight:600; color:var(--text-main);">${uploadDateStr}</div>
          <div style="font-size:11px; color:var(--text-muted);"><i class="fa-solid fa-user-check"></i> ${r.uploadedBy}</div>
        </td>
        <td style="font-size:12px; color:var(--text-muted); max-width:180px;">
          ${r.notes || '-'}
        </td>
        <td style="text-align:center; white-space:nowrap;">
          <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="previewRekeningKoran(${r.id})" title="Lihat Unggahan Rekening Koran" style="font-weight:600; color:var(--primary-600); padding:5px 10px;">
              <i class="fa-solid fa-eye"></i> Lihat
            </button>
            <button class="btn btn-outline btn-sm btn-icon-only" onclick="downloadRekeningKoran(${r.id})" title="Unduh Berkas Asli">
              <i class="fa-solid fa-download" style="color:var(--accent-emerald);"></i>
            </button>
            <button class="btn btn-danger btn-sm btn-icon-only admin-only" onclick="deleteRekeningKoran(${r.id})" title="Hapus Dokumen">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Preview Rekening Koran Modal
 */
window.previewRekeningKoran = function(id) {
  const item = window.db.getRekeningKoranById(id);
  if (!item) {
    showToast('Dokumen Rekening Koran tidak ditemukan.', 'error');
    return;
  }

  AppState.selectedRekeningKoran = item;

  setElText('rkModalSubtitle', `Rekening Koran ${item.bankName} Periode ${item.monthName} ${item.year}`);
  setElText('rkModalPeriodText', `${item.monthName} ${item.year}`);
  setElText('rkModalBankName', item.bankName);
  setElText('rkModalAccountNo', item.accountNo || '-');
  setElText('rkModalOpeningBalance', item.openingBalance > 0 ? formatCurrency(item.openingBalance) : 'Rp 0');
  setElText('rkModalClosingBalance', item.closingBalance > 0 ? formatCurrency(item.closingBalance) : 'Rp 0');
  setElText('rkModalFileName', item.fileName);
  setElText('rkModalFileSize', `${item.fileSizeFormatted || '1.0 MB'} • Dokumen Terarsip Resmi`);
  setElText('rkModalUploadedBy', item.uploadedBy || 'Petugas Admin');
  setElText('rkModalUploadDate', formatDateIndo(item.uploadDate, true));
  setElText('rkModalNotes', item.notes || 'Tidak ada catatan tambahan.');

  const iconEl = document.getElementById('rkModalFileIcon');
  if (iconEl) {
    if (item.fileType?.includes('sheet') || item.fileType?.includes('excel') || item.fileName?.endsWith('.xlsx') || item.fileName?.endsWith('.xls') || item.fileName?.endsWith('.csv')) {
      iconEl.innerHTML = '<i class="fa-solid fa-file-excel" style="color:#059669;"></i>';
    } else if (item.fileType?.includes('image')) {
      iconEl.innerHTML = '<i class="fa-solid fa-file-image" style="color:#8b5cf6;"></i>';
    } else {
      iconEl.innerHTML = '<i class="fa-solid fa-file-pdf" style="color:#e11d48;"></i>';
    }
  }

  // Render Document Viewer (PDF embed / Image / Digital Bank Statement Sheet)
  renderRekeningKoranViewer(item);

  const modal = document.getElementById('rekeningKoranPreviewModal');
  if (modal) {
    modal.classList.add('active');
  }

  window.db.logAudit('VIEW', `Melihat Pratinjau Rekening Koran #${item.id} - ${item.bankName} (${item.monthName} ${item.year})`);
};

/**
 * Render Live Document Viewer or Digital Statement Sheet
 */
function renderRekeningKoranViewer(item) {
  const container = document.getElementById('rkViewerContent');
  const typeLabel = document.getElementById('rkModalViewerTypeLabel');
  if (!container) return;

  // Case 1: Uploaded Binary Data (Data URL)
  if (item.fileData && item.fileData.startsWith('data:')) {
    if (item.fileType?.includes('pdf') || item.fileName?.toLowerCase().endsWith('.pdf')) {
      if (typeLabel) typeLabel.textContent = 'Pratinjau Berkas PDF Asli';
      container.innerHTML = `
        <div style="width:100%; height:550px; background:#475569; position:relative;">
          <iframe src="${item.fileData}#toolbar=1&navpanes=0" style="width:100%; height:100%; border:none;" title="Pratinjau PDF Rekening Koran"></iframe>
        </div>
      `;
      return;
    } else if (item.fileType?.includes('image') || /\.(jpe?g|png|webp|gif)$/i.test(item.fileName)) {
      if (typeLabel) typeLabel.textContent = 'Pratinjau Berkas Gambar / Foto Rekening Koran';
      container.innerHTML = `
        <div style="padding:24px; text-align:center; background:var(--bg-subtle);">
          <img src="${item.fileData}" alt="${item.fileName}" style="max-width:100%; max-height:550px; border-radius:8px; box-shadow:var(--shadow-md); object-fit:contain;">
        </div>
      `;
      return;
    }
  }

  // Case 2: Digital Bank Statement Sheet (Lembar Rekening Koran Resmi)
  if (typeLabel) typeLabel.textContent = 'Lembar Mutasi Rekening Koran Digital Resmi';

  const branchName = item.bankName === 'Bank Jateng' ? 'Cabang Koordinator Surakarta' : 'Cabang Surakarta Solo Technopark';
  const openingBalance = item.openingBalance || 154200000;
  const closingBalance = item.closingBalance || 289450000;
  const monthNum = String(item.month).padStart(2, '0');
  const yearNum = item.year;

  // Realistic sample mutation lines
  const mutations = [
    {
      date: `02/${monthNum}/${yearNum}`,
      desc: 'Setoran Penerimaan Kas Tunai Kasir STP (Buku Kas Umum)',
      ref: `KAS-IN-${yearNum}0801`,
      debet: 0,
      kredit: 35000000
    },
    {
      date: `05/${monthNum}/${yearNum}`,
      desc: 'Transfer Penerimaan Jasa Layanan Sewa Ruang Gedung RnD',
      ref: `TRF-RN-${yearNum}0805`,
      debet: 0,
      kredit: 48500000
    },
    {
      date: `08/${monthNum}/${yearNum}`,
      desc: 'Transfer QRIS Bank / Retribusi Tenant Foodpark STP',
      ref: `QRIS-FD-${yearNum}0808`,
      debet: 0,
      kredit: 24750000
    },
    {
      date: `12/${monthNum}/${yearNum}`,
      desc: 'Penerimaan Pelatihan Underwater Wet Welding & Basic OJT',
      ref: `TRF-TNG-${yearNum}0812`,
      debet: 0,
      kredit: 62000000
    },
    {
      date: `28/${monthNum}/${yearNum}`,
      desc: 'Penyetoran Kas Daerah / Rekonsiliasi Kasda BLUD',
      ref: `KASDA-OUT-${yearNum}0828`,
      debet: 35000000,
      kredit: 0
    }
  ];

  let calculatedBalance = openingBalance;
  let totalDebet = 0;
  let totalKredit = 0;

  const rowsHtml = mutations.map(m => {
    totalDebet += m.debet;
    totalKredit += m.kredit;
    calculatedBalance = calculatedBalance - m.debet + m.kredit;
    return `
      <tr>
        <td style="text-align:center; font-weight:600; white-space:nowrap;">${m.date}</td>
        <td>
          <div style="font-weight:600;">${m.desc}</div>
          <div style="font-size:11px; color:var(--text-muted); font-family:monospace;">Ref: ${m.ref}</div>
        </td>
        <td style="text-align:center; font-family:monospace; font-size:11px; color:var(--text-muted);">002-SKT</td>
        <td style="text-align:right;" class="${m.debet > 0 ? 'rk-badge-debet' : ''}">${m.debet > 0 ? formatCurrency(m.debet) : '-'}</td>
        <td style="text-align:right;" class="${m.kredit > 0 ? 'rk-badge-kredit' : ''}">${m.kredit > 0 ? formatCurrency(m.kredit) : '-'}</td>
        <td style="text-align:right; font-weight:700; color:var(--text-main);">${formatCurrency(calculatedBalance)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="rk-statement-sheet" id="rkPrintableStatementSheet">
      <!-- Sheet Header -->
      <div class="rk-sheet-header">
        <div>
          <div class="rk-bank-title">
            <i class="fa-solid fa-building-columns" style="color:var(--primary-600);"></i>
            <span>${item.bankName.toUpperCase()}</span>
          </div>
          <div class="rk-bank-branch">${branchName} • Rekening Resmi Penerimaan BLUD</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; font-size:13.5px; color:var(--primary-700); text-transform:uppercase;">LEMBAR REKENING KORAN RESMI</div>
          <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Periode: 01/${monthNum}/${yearNum} s/d 31/${monthNum}/${yearNum}</div>
        </div>
      </div>

      <!-- Customer Info Metadata Box -->
      <div class="rk-sheet-meta-grid">
        <div class="rk-meta-item">
          <div class="rk-meta-label">Nama Pemilik Rekening</div>
          <div class="rk-meta-val">UPTD KAWASAN SAINS DAN TEKNOLOGI SOLO TECHNOPARK</div>
        </div>
        <div class="rk-meta-item">
          <div class="rk-meta-label">Nomor Rekening Bank</div>
          <div class="rk-meta-val" style="color:var(--primary-600); font-family:monospace;">${item.accountNo}</div>
        </div>
        <div class="rk-meta-item">
          <div class="rk-meta-label">Mata Uang & Status</div>
          <div class="rk-meta-val">IDR (Rupiah) • Kasda BLUD Terverifikasi</div>
        </div>
        <div class="rk-meta-item">
          <div class="rk-meta-label">Saldo Awal Periode</div>
          <div class="rk-meta-val">${formatCurrency(openingBalance)}</div>
        </div>
      </div>

      <!-- Mutasi Table -->
      <div style="overflow-x:auto;">
        <table class="rk-mutation-table">
          <thead>
            <tr>
              <th style="width:90px; text-align:center;">Tanggal</th>
              <th>Keterangan / Uraian Transaksi</th>
              <th style="width:75px; text-align:center;">Cabang</th>
              <th style="width:130px; text-align:right;">Debet (Rp)</th>
              <th style="width:130px; text-align:right;">Kredit (Rp)</th>
              <th style="width:145px; text-align:right;">Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align:center; font-weight:600; color:var(--text-muted);">01/${monthNum}/${yearNum}</td>
              <td colspan="4" style="font-weight:700; color:var(--text-muted); font-style:italic;">SALDO AWAL (SALDO AWAL MUTASI BULAN INI)</td>
              <td style="text-align:right; font-weight:700; color:var(--text-main);">${formatCurrency(openingBalance)}</td>
            </tr>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background:var(--bg-subtle); font-weight:700;">
              <td colspan="3" style="text-align:right; padding:10px 12px; color:var(--text-main);">TOTAL MUTASI PERIODE INI:</td>
              <td style="text-align:right; color:#dc2626;">${formatCurrency(totalDebet)}</td>
              <td style="text-align:right; color:#16a34a;">${formatCurrency(totalKredit)}</td>
              <td style="text-align:right; color:var(--accent-emerald); font-size:13px;">${formatCurrency(calculatedBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Footer Stamp & Signatures -->
      <div class="rk-statement-footer">
        <div class="rk-digital-stamp">
          <i class="fa-solid fa-stamp" style="font-size:20px; color:var(--accent-emerald);"></i>
          <div>
            <div>TERVERIFIKASI & TERCATAT RESMI SISTEM SIDIGIMON</div>
            <div style="font-size:10px; font-weight:500; opacity:0.85;">UPTD Kawasan Sains dan Teknologi Kota Surakarta</div>
          </div>
        </div>
        <div style="text-align:right; font-size:11px; color:var(--text-muted);">
          <div>Petugas Verifikasi: <strong>${item.uploadedBy || 'Alvin Prayogo Anindito, A.Md.Ak'}</strong></div>
          <div>Tanggal Cetak/Arsip: ${formatDateIndo(new Date(), true)}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Print Rekening Koran Statement Sheet
 */
window.printCurrentRekeningKoran = function() {
  const sheet = document.getElementById('rkPrintableStatementSheet');
  if (!sheet) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'width=950,height=750');
  if (!printWindow) {
    showToast('Izinkan pop-up browser untuk mencetak rekening koran.', 'warning');
    return;
  }

  const bankName = AppState.selectedRekeningKoran?.bankName || 'Bank';
  const period = AppState.selectedRekeningKoran ? `${AppState.selectedRekeningKoran.monthName}_${AppState.selectedRekeningKoran.year}` : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rekening_Koran_${bankName}_${period}</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
        body { background: #ffffff; color: #1e293b; padding: 20px; font-size: 12px; }
        .rk-statement-sheet { border: none; padding: 0; }
        .rk-sheet-header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
        .rk-bank-title { font-size: 18px; font-weight: 800; color: #1e40af; }
        .rk-bank-branch { font-size: 11px; color: #64748b; margin-top: 2px; }
        .rk-sheet-meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 16px; }
        .rk-meta-label { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .rk-meta-val { font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 2px; }
        .rk-mutation-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .rk-mutation-table th { background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; padding: 8px 10px; border: 1px solid #cbd5e1; text-transform: uppercase; }
        .rk-mutation-table td { padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 11.5px; }
        .rk-badge-debet { color: #dc2626; font-weight: 700; }
        .rk-badge-kredit { color: #16a34a; font-weight: 700; }
        .rk-statement-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 12px; margin-top: 10px; }
        .rk-digital-stamp { border: 1px dashed #059669; padding: 6px 12px; border-radius: 4px; color: #065f46; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 8px; }
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${sheet.outerHTML}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

window.closeRekeningKoranModal = function() {
  const modal = document.getElementById('rekeningKoranPreviewModal');
  if (modal) {
    modal.classList.remove('active');
  }
};

/**
 * Download Rekening Koran
 */
window.downloadRekeningKoran = function(id) {
  const item = typeof id === 'object' ? AppState.selectedRekeningKoran : window.db.getRekeningKoranById(id);
  if (!item) {
    showToast('Dokumen tidak ditemukan.', 'error');
    return;
  }

  if (item.fileData && item.fileData.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = item.fileData;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`✓ Mengunduh berkas ${item.fileName}...`, 'success');
  } else {
    const textContent = `=======================================================
REKENING KORAN BANK - UPTD SOLO TECHNOPARK
=======================================================
Nama Bank       : ${item.bankName}
Nomor Rekening  : ${item.accountNo}
Nama Rekening   : ${item.accountName}
Periode         : ${item.monthName} ${item.year}
Saldo Awal      : ${formatCurrency(item.openingBalance)}
Saldo Akhir     : ${formatCurrency(item.closingBalance)}
Tanggal Unggah  : ${formatDateIndo(item.uploadDate, true)}
Petugas Verifikasi: ${item.uploadedBy}
Catatan         : ${item.notes}
Status          : DIVERIFIKASI & TERARSIP RESMI
=======================================================
Dokumen ini merupakan salinan arsip digital sistem SiDIGIMON
UPTD Kawasan Sains dan Teknologi Kota Surakarta
=======================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName.endsWith('.pdf') ? item.fileName.replace('.pdf', '_Arsip.txt') : item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ Mengunduh arsip ${item.fileName}...`, 'success');
  }

  window.db.logAudit('EXPORT', `Mengunduh Rekening Koran #${item.id} - ${item.bankName} (${item.monthName} ${item.year})`);
};

window.downloadCurrentRekeningKoran = function() {
  if (AppState.selectedRekeningKoran) {
    window.downloadRekeningKoran(AppState.selectedRekeningKoran.id);
  }
};

/**
 * Delete Rekening Koran
 */
window.deleteRekeningKoran = function(id) {
  const item = window.db.getRekeningKoranById(id);
  if (!item) return;

  const confirmMsg = `Apakah Anda yakin ingin menghapus arsip Rekening Koran ini?\n\n• Bank: ${item.bankName}\n• Periode: ${item.monthName} ${item.year}\n• Berkas: ${item.fileName}\n\nDokumen akan dihapus dari arsip sistem.`;
  if (!confirm(confirmMsg)) return;

  const success = window.db.deleteRekeningKoran(id);
  if (success) {
    showToast(`✓ Berkas Rekening Koran ${item.monthName} ${item.year} berhasil dihapus.`, 'info');
    if (AppState.selectedRekeningKoran && AppState.selectedRekeningKoran.id === id) {
      closeRekeningKoranModal();
    }
    renderRekeningKoranView();
  }
};

window.deleteCurrentRekeningKoran = function() {
  if (AppState.selectedRekeningKoran) {
    window.deleteRekeningKoran(AppState.selectedRekeningKoran.id);
  }
};

/**
 * ==========================================================================
 * SETORAN TUNAI BANK JATENG CONTROLLER (REKENING 1-002-007181)
 * ==========================================================================
 */

/**
 * Setup Setoran Tunai View Handlers & Event Listeners
 */
function setupSetoranTunaiHandlers() {
  const periodTypeSelect = document.getElementById('setoranPeriodType');
  const dailyInput = document.getElementById('setoranDailyDate');
  const monthInput = document.getElementById('setoranMonth');
  const triwulanInput = document.getElementById('setoranTriwulan');
  const semesterInput = document.getElementById('setoranSemester');
  const yearInput = document.getElementById('setoranYear');
  const startDateInput = document.getElementById('setoranStartDate');
  const endDateInput = document.getElementById('setoranEndDate');
  const statusFilterSelect = document.getElementById('setoranFilterStatus');
  const searchInput = document.getElementById('setoranSearchInput');
  const resetBtn = document.getElementById('btnResetSetoranFilter');

  // Action Buttons
  const btnAddSetoran = document.getElementById('btnOpenAddSetoranModal');
  const btnPreviewReport = document.getElementById('btnPreviewSetoranReport');
  const btnExportExcel = document.getElementById('btnExportSetoranExcel');
  const btnPrintReport = document.getElementById('btnPrintSetoranReport');

  // Tab Buttons
  const tabTrxBtn = document.getElementById('btnTabSetoranTrx');
  const tabHistoryBtn = document.getElementById('btnTabSetoranHistory');

  // Form elements
  const form = document.getElementById('formSetoranTunai');
  const btnAutoSts = document.getElementById('btnAutoGenerateStsNo');
  const inputAmount = document.getElementById('inputStsAmount');
  const fileInput = document.getElementById('inputStsFile');
  const checkAllModal = document.getElementById('checkAllModalTrx');

  // Batch action elements
  const checkAllTable = document.getElementById('checkAllSetoranTrx');
  const btnBatchDeposit = document.getElementById('btnBatchDepositSelected');
  const btnCancelBatch = document.getElementById('btnCancelBatchSelect');

  const updateVisibility = () => {
    const pType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    const dailyWrapper = document.getElementById('setoranDailyWrapper');
    const monthlyWrapper = document.getElementById('setoranMonthlyWrapper');
    const triwulanWrapper = document.getElementById('setoranTriwulanWrapper');
    const semesterWrapper = document.getElementById('setoranSemesterWrapper');
    const yearWrapper = document.getElementById('setoranYearWrapper');
    const customRangeWrapper = document.getElementById('setoranCustomRangeWrapper');

    if (dailyWrapper) dailyWrapper.style.display = pType === 'daily' ? 'flex' : 'none';
    if (monthlyWrapper) monthlyWrapper.style.display = pType === 'monthly' ? 'flex' : 'none';
    if (triwulanWrapper) triwulanWrapper.style.display = pType === 'triwulan' ? 'flex' : 'none';
    if (semesterWrapper) semesterWrapper.style.display = pType === 'semester' ? 'flex' : 'none';
    if (yearWrapper) yearWrapper.style.display = (pType === 'monthly' || pType === 'triwulan' || pType === 'semester' || pType === 'yearly') ? 'flex' : 'none';
    if (customRangeWrapper) customRangeWrapper.style.display = pType === 'custom' ? 'flex' : 'none';
  };

  const triggerFilter = () => {
    AppState.setoranTunaiFilters.periodType = periodTypeSelect ? periodTypeSelect.value : 'monthly';
    AppState.setoranTunaiFilters.dailyDate = dailyInput ? dailyInput.value : '';
    AppState.setoranTunaiFilters.month = monthInput ? monthInput.value : '';
    AppState.setoranTunaiFilters.triwulan = triwulanInput ? triwulanInput.value : '1';
    AppState.setoranTunaiFilters.semester = semesterInput ? semesterInput.value : '1';
    AppState.setoranTunaiFilters.year = yearInput ? yearInput.value : '2026';
    AppState.setoranTunaiFilters.startDate = startDateInput ? startDateInput.value : '';
    AppState.setoranTunaiFilters.endDate = endDateInput ? endDateInput.value : '';
    AppState.setoranTunaiFilters.status = statusFilterSelect ? statusFilterSelect.value : 'all';
    AppState.setoranTunaiFilters.search = searchInput ? searchInput.value.toLowerCase().trim() : '';

    renderSetoranTunaiView();
  };

  if (periodTypeSelect) {
    periodTypeSelect.addEventListener('change', () => {
      updateVisibility();
      triggerFilter();
    });
  }

  [dailyInput, monthInput, triwulanInput, semesterInput, yearInput, startDateInput, endDateInput, statusFilterSelect].forEach(input => {
    if (input) input.addEventListener('change', triggerFilter);
  });

  if (searchInput) searchInput.addEventListener('input', triggerFilter);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (periodTypeSelect) periodTypeSelect.value = 'all';
      if (dailyInput) dailyInput.value = '';
      if (monthInput) monthInput.value = '';
      if (triwulanInput) triwulanInput.value = '1';
      if (semesterInput) semesterInput.value = '1';
      if (yearInput) yearInput.value = '2026';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
      if (statusFilterSelect) statusFilterSelect.value = 'all';
      if (searchInput) searchInput.value = '';
      updateVisibility();
      triggerFilter();
      showToast('Filter periode Setoran Tunai berhasil direset.', 'info');
    });
  }

  // Sub-Tab Switchers
  const switchSetoranTab = (tabId) => {
    AppState.setoranTunaiFilters.activeTab = tabId;
    document.querySelectorAll('.setoran-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-setoran-tab') === tabId) {
        btn.classList.add('btn-primary', 'active');
        btn.classList.remove('btn-outline');
      } else {
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-outline');
      }
    });

    document.querySelectorAll('.setoran-tab-pane').forEach(pane => {
      pane.style.display = pane.id === tabId ? 'block' : 'none';
      if (pane.id === tabId) pane.classList.add('active');
      else pane.classList.remove('active');
    });
  };

  if (tabTrxBtn) tabTrxBtn.addEventListener('click', () => switchSetoranTab('tab-setoran-trx'));
  if (tabHistoryBtn) tabHistoryBtn.addEventListener('click', () => switchSetoranTab('tab-setoran-history'));

  // Open Add Setoran Modal
  if (btnAddSetoran) {
    btnAddSetoran.addEventListener('click', () => {
      openAddSetoranModal();
    });
  }

  // Auto Generate STS No
  if (btnAutoSts) {
    btnAutoSts.addEventListener('click', () => {
      const dateVal = document.getElementById('inputStsDate')?.value || new Date();
      const stsNo = window.db.generateNextStsNo(dateVal);
      const stsInput = document.getElementById('inputStsNo');
      if (stsInput) stsInput.value = stsNo;
      showToast(`Nomor STS di-generate: ${stsNo}`, 'info');
    });
  }

  // Real-time terbilang helper for STS amount
  if (inputAmount) {
    inputAmount.addEventListener('input', () => {
      const helper = document.getElementById('inputStsTerbilangHelper');
      if (helper) {
        const val = parseFloat(inputAmount.value) || 0;
        helper.textContent = val > 0 ? terbilangRupiah(val) : 'Nol Rupiah';
      }
    });
  }

  // File Upload Staging
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          AppState.stagedSetoranSlipFile = {
            fileName: file.name,
            fileType: file.type,
            fileData: event.target.result
          };
        };
        reader.readAsDataURL(file);
      } else {
        AppState.stagedSetoranSlipFile = null;
      }
    });
  }

  // Check All in Modal
  if (checkAllModal) {
    checkAllModal.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.modal-trx-check');
      checkboxes.forEach(cb => {
        cb.checked = checkAllModal.checked;
        const row = cb.closest('tr');
        if (row) {
          if (cb.checked) row.classList.add('selected');
          else row.classList.remove('selected');
        }
      });
      recalculateModalStsAmount();
    });
  }

  // Table Check All
  if (checkAllTable) {
    checkAllTable.addEventListener('change', () => {
      const checkboxes = document.querySelectorAll('.setoran-row-check');
      AppState.selectedSetoranTrxIds.clear();
      checkboxes.forEach(cb => {
        cb.checked = checkAllTable.checked;
        const id = Number(cb.getAttribute('data-id'));
        if (cb.checked && id) {
          AppState.selectedSetoranTrxIds.add(id);
        }
      });
      updateBatchBarState();
    });
  }

  // Batch deposit action
  if (btnBatchDeposit) {
    btnBatchDeposit.addEventListener('click', () => {
      if (AppState.selectedSetoranTrxIds.size === 0) {
        showToast('Pilih minimal satu transaksi tunai terlebih dahulu.', 'warning');
        return;
      }
      openAddSetoranModal(Array.from(AppState.selectedSetoranTrxIds));
    });
  }

  // Cancel batch select
  if (btnCancelBatch) {
    btnCancelBatch.addEventListener('click', () => {
      AppState.selectedSetoranTrxIds.clear();
      if (checkAllTable) checkAllTable.checked = false;
      document.querySelectorAll('.setoran-row-check').forEach(cb => cb.checked = false);
      updateBatchBarState();
    });
  }

  // Top action buttons
  if (btnPreviewReport) {
    btnPreviewReport.addEventListener('click', () => previewSetoranDoc());
  }

  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => exportSetoranTunaiExcel());
  }

  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => printSetoranTunaiReport());
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSetoranTunaiSubmit();
    });
  }

  updateVisibility();
}

/**
 * Filtered Cash Transactions for Setoran Tunai View
 */
function getFilteredSetoranTrxList() {
  const allTrx = window.db.getTransactions();
  const methods = window.db.getPaymentMethods();
  const services = window.db.getServices();
  const f = AppState.setoranTunaiFilters;
  const periodRange = calculatePeriodRange(f);

  // Filter CASH only
  let cashList = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    if (t.paymentMethodId === 1) return true;
    if (method && (method.code === 'CASH' || method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('tunai'))) return true;
    return false;
  });

  // Filter Date
  if (periodRange.startDate) {
    cashList = cashList.filter(t => t.paymentDate && t.paymentDate.split('T')[0] >= periodRange.startDate);
  }
  if (periodRange.endDate) {
    cashList = cashList.filter(t => t.paymentDate && t.paymentDate.split('T')[0] <= periodRange.endDate);
  }

  // Filter Status
  if (f.status === 'pending') {
    cashList = cashList.filter(t => t.depositStatus !== 'DEPOSITED');
  } else if (f.status === 'deposited') {
    cashList = cashList.filter(t => t.depositStatus === 'DEPOSITED');
  }

  // Filter Search
  if (f.search) {
    cashList = cashList.filter(t => {
      const s = services.find(item => item.id === t.serviceId);
      const searchStr = `${t.transactionNo} ${t.receiptNo} ${t.referenceNo} ${t.depositStsNo || ''} ${t.tenantName || ''} ${t.payerOrigin || ''} ${s ? s.name : ''} ${t.notes || ''}`.toLowerCase();
      return searchStr.includes(f.search);
    });
  }

  cashList.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate) || b.id - a.id);
  return cashList;
}

/**
 * Filtered STS History List
 */
function getFilteredSetoranHistoryList() {
  const allSts = window.db.getSetoranTunai();
  const f = AppState.setoranTunaiFilters;
  const periodRange = calculatePeriodRange(f);

  let list = [...allSts];

  if (periodRange.startDate) {
    list = list.filter(s => s.depositDate && s.depositDate >= periodRange.startDate);
  }
  if (periodRange.endDate) {
    list = list.filter(s => s.depositDate && s.depositDate <= periodRange.endDate);
  }

  if (f.search) {
    list = list.filter(s => {
      const searchStr = `${s.stsNo} ${s.bankName} ${s.tellerName || ''} ${s.depositorName || ''} ${s.notes || ''} ${s.tellerValidationCode || ''}`.toLowerCase();
      return searchStr.includes(f.search);
    });
  }

  list.sort((a, b) => new Date(b.depositDate) - new Date(a.depositDate) || b.id - a.id);
  return list;
}

/**
 * Render Setoran Tunai View
 */
function renderSetoranTunaiView() {
  const f = AppState.setoranTunaiFilters;
  const periodRange = calculatePeriodRange(f);
  const trxList = getFilteredSetoranTrxList();
  const historyList = getFilteredSetoranHistoryList();
  const services = window.db.getServices();

  // Calculate Metrics
  let totalCash = 0;
  let depositedCash = 0;
  let pendingCash = 0;
  let depositedCount = 0;
  let pendingCount = 0;

  // We calculate from total cash in period
  trxList.forEach(t => {
    const amt = Number(t.amount) || 0;
    totalCash += amt;
    if (t.depositStatus === 'DEPOSITED') {
      depositedCash += amt;
      depositedCount++;
    } else {
      pendingCash += amt;
      pendingCount++;
    }
  });

  const setEl = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setEl('setoranStatTotalCash', formatCurrency(totalCash));
  setEl('setoranStatCashCount', `${trxList.length} Transaksi Tunai`);
  setEl('setoranStatDeposited', formatCurrency(depositedCash));
  setEl('setoranStatDepositedCount', `${depositedCount} Transaksi Disetor`);
  setEl('setoranStatPending', formatCurrency(pendingCash));
  setEl('setoranStatPendingCount', `${pendingCount} Transaksi Siap Setor`);
  setEl('setoranStatStsCount', `${historyList.length} Berkas STS`);

  const subtitle = document.getElementById('setoranSubtitle');
  if (subtitle) {
    subtitle.textContent = `Pemantauan & penyusunan Surat Tanda Setoran (STS) kas tunai ke Rekening Bank Jateng (1-002-007181) • ${periodRange.label}`;
  }

  // Render TAB 1: Transactions Table
  const tbodyTrx = document.getElementById('setoranTrxTableBody');
  if (tbodyTrx) {
    if (trxList.length === 0) {
      tbodyTrx.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);">
            <i class="fa-solid fa-inbox" style="font-size:28px; opacity:0.4; margin-bottom:8px; display:block;"></i>
            Tidak ada transaksi penerimaan kas tunai untuk kriteria filter periode ini.
          </td>
        </tr>
      `;
    } else {
      tbodyTrx.innerHTML = trxList.map(t => {
        const s = services.find(item => item.id === t.serviceId);
        const sName = s ? s.name : 'Layanan STP';
        const isDep = t.depositStatus === 'DEPOSITED';
        const isChecked = AppState.selectedSetoranTrxIds.has(t.id);

        const statusBadge = isDep
          ? `<span class="badge-status-deposited" title="No. STS: ${t.depositStsNo || '-'}"><i class="fa-solid fa-circle-check"></i> Disetor (Bank Jateng)</span><div style="font-size:11px; font-family:monospace; color:var(--primary-600); margin-top:2px;">${t.depositStsNo || ''}</div>`
          : `<span class="badge-status-pending"><i class="fa-solid fa-clock"></i> Belum Disetor</span>`;

        let actionBtns = '';
        if (isDep) {
          actionBtns = `
            <div style="display:flex; gap:4px; justify-content:center;">
              <button class="btn btn-outline btn-sm" onclick="previewSetoranDoc(${t.depositId || 0})" title="Lihat Lembar STS" style="padding:4px 8px; font-size:11.5px;">
                <i class="fa-solid fa-eye"></i> STS
              </button>
              <button class="btn btn-danger btn-sm admin-only" onclick="quickCancelDeposit(${t.id})" title="Batalkan Status Setor" style="padding:4px 8px; font-size:11.5px;">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          `;
        } else {
          actionBtns = `
            <button class="btn btn-primary btn-sm admin-only" onclick="quickDepositTransaction(${t.id})" title="Catat Setoran ke Bank Jateng" style="padding:4px 10px; font-size:11.5px;">
              <i class="fa-solid fa-plus"></i> Setor
            </button>
          `;
        }

        return `
          <tr class="${isChecked ? 'selected' : ''}">
            <td style="text-align:center;">
              ${isDep ? `<i class="fa-solid fa-check" style="color:var(--accent-emerald);" title="Sudah Disetor"></i>` : `<input type="checkbox" class="setoran-row-check" data-id="${t.id}" ${isChecked ? 'checked' : ''} onchange="handleSetoranRowCheckChange(this, ${t.id})">`}
            </td>
            <td><strong style="color:var(--primary-600); font-family:monospace;">${t.receiptNo || t.referenceNo || '-'}</strong></td>
            <td><span style="font-size:12px;">${formatDateIndo(t.paymentDate)}</span></td>
            <td>
              <strong>${t.tenantName || 'Pembayar / Instansi'}</strong>
              ${t.payerOrigin ? `<div style="font-size:11px; color:var(--text-muted);">${t.payerOrigin}</div>` : ''}
            </td>
            <td><span style="font-size:12px; color:var(--text-muted);">${sName}</span></td>
            <td style="text-align:right; font-weight:700; color:var(--text-main);">${formatCurrency(t.amount)}</td>
            <td style="text-align:center;">${statusBadge}</td>
            <td style="text-align:center;">${actionBtns}</td>
          </tr>
        `;
      }).join('');
    }
  }

  setEl('setoranTableTotalAmount', formatCurrency(totalCash));
  setEl('setoranTableSummaryInfo', `${trxList.length} Transaksi (${depositedCount} Disetor, ${pendingCount} Belum)`);

  // Render TAB 2: STS History Table
  const tbodyHistory = document.getElementById('setoranHistoryTableBody');
  if (tbodyHistory) {
    if (historyList.length === 0) {
      tbodyHistory.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);">
            <i class="fa-solid fa-file-invoice" style="font-size:28px; opacity:0.4; margin-bottom:8px; display:block;"></i>
            Belum ada arsip Surat Tanda Setoran (STS) Bank Jateng pada periode ini.
          </td>
        </tr>
      `;
    } else {
      tbodyHistory.innerHTML = historyList.map((s, idx) => {
        const slipBtn = s.fileData
          ? `<button class="btn btn-outline btn-sm" onclick="previewSetoranSlip(${s.id})" title="Lihat Berkas Slip" style="padding:4px 8px; font-size:11.5px; color:#2563eb;"><i class="fa-solid fa-file-image"></i> Lihat</button>`
          : `<span style="font-size:11.5px; color:var(--text-muted);">-</span>`;

        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td><strong style="color:#1e40af; font-family:monospace; font-size:13px;">${s.stsNo}</strong></td>
            <td><span style="font-size:12px;">${formatDateIndo(s.depositDate)}</span></td>
            <td>
              <strong>${s.bankName} (${s.accountNo})</strong>
              <div style="font-size:11px; color:var(--text-muted);">${s.accountName}</div>
            </td>
            <td style="text-align:right; font-weight:800; color:var(--text-main); font-size:13px;">${formatCurrency(s.totalAmount)}</td>
            <td style="text-align:center;"><span class="badge" style="background:var(--primary-100); color:var(--primary-700); font-weight:700;">${s.transactionCount || s.transactionIds?.length || 0} Kuitansi</span></td>
            <td>
              <div style="font-size:12px; font-weight:600;">${s.depositorName || 'Petugas BLUD'}</div>
              <div style="font-size:11px; color:var(--text-muted);">${s.tellerName || 'Teller Bank Jateng'}</div>
            </td>
            <td style="text-align:center;">${slipBtn}</td>
            <td style="text-align:center;">
              <div style="display:flex; gap:4px; justify-content:center;">
                <button class="btn btn-primary btn-sm" onclick="previewSetoranDoc(${s.id})" title="Pratinjau Lembar STS" style="padding:4px 8px; font-size:11.5px;">
                  <i class="fa-solid fa-print"></i> Lembar
                </button>
                <button class="btn btn-danger btn-sm admin-only" onclick="deleteSetoranTunaiRecord(${s.id})" title="Hapus STS" style="padding:4px 8px; font-size:11.5px;">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  updateBatchBarState();
}

/**
 * Handle Single Checkbox Change in Main Table
 */
window.handleSetoranRowCheckChange = function(checkbox, trxId) {
  if (checkbox.checked) {
    AppState.selectedSetoranTrxIds.add(Number(trxId));
    checkbox.closest('tr')?.classList.add('selected');
  } else {
    AppState.selectedSetoranTrxIds.delete(Number(trxId));
    checkbox.closest('tr')?.classList.remove('selected');
  }
  updateBatchBarState();
};

/**
 * Update Batch Action Bar State
 */
function updateBatchBarState() {
  const bar = document.getElementById('setoranBatchBar');
  const summaryText = document.getElementById('setoranBatchSummaryText');
  const checkAll = document.getElementById('checkAllSetoranTrx');
  const size = AppState.selectedSetoranTrxIds.size;

  if (!bar) return;

  if (size > 0) {
    bar.style.display = 'flex';
    const allTrx = window.db.getTransactions();
    let total = 0;
    AppState.selectedSetoranTrxIds.forEach(id => {
      const t = allTrx.find(item => item.id === id);
      if (t) total += (Number(t.amount) || 0);
    });
    if (summaryText) {
      summaryText.textContent = `${size} transaksi kas tunai terpilih (Total: ${formatCurrency(total)})`;
    }
  } else {
    bar.style.display = 'none';
    if (checkAll) checkAll.checked = false;
  }
}

/**
 * Open Modal Form Catat Setoran Tunai ke Bank Jateng
 */
window.openAddSetoranModal = function(preselectedTrxIds = []) {
  const modal = document.getElementById('setoranTunaiFormModal');
  if (!modal) return;

  const today = new Date().toISOString().split('T')[0];
  const stsDateInput = document.getElementById('inputStsDate');
  const stsNoInput = document.getElementById('inputStsNo');
  const tellerInput = document.getElementById('inputStsTeller');
  const notesInput = document.getElementById('inputStsNotes');
  const valCodeInput = document.getElementById('inputStsValidationCode');
  const fileInput = document.getElementById('inputStsFile');

  if (stsDateInput) stsDateInput.value = today;
  if (stsNoInput) stsNoInput.value = window.db.generateNextStsNo(today);
  if (tellerInput) tellerInput.value = 'Teller Bank Jateng KC Surakarta';
  if (notesInput) notesInput.value = 'Setoran tunai penerimaan kas BLUD Solo Technopark ke Bank Jateng No. Rek 1-002-007181';
  if (valCodeInput) valCodeInput.value = '';
  if (fileInput) fileInput.value = '';

  AppState.stagedSetoranSlipFile = null;

  renderModalTrxSelection(preselectedTrxIds);
  modal.classList.add('active');
};

window.closeAddSetoranModal = function() {
  const modal = document.getElementById('setoranTunaiFormModal');
  if (modal) modal.classList.remove('active');
  AppState.stagedSetoranSlipFile = null;
};

/**
 * Render Modal Cash Transactions Multi-Select Table
 */
function renderModalTrxSelection(preselectedIds = []) {
  const tbody = document.getElementById('modalTrxSelectTableBody');
  const services = window.db.getServices();
  const allTrx = window.db.getTransactions();
  const methods = window.db.getPaymentMethods();

  // Filter only cash transactions that are pending OR are in preselectedIds
  const cashPending = allTrx.filter(t => {
    const method = methods.find(m => m.id === t.paymentMethodId);
    const isCash = t.paymentMethodId === 1 || (method && (method.code === 'CASH' || method.name.toLowerCase().includes('cash') || method.name.toLowerCase().includes('tunai')));
    if (!isCash) return false;
    if (preselectedIds.includes(t.id)) return true;
    return t.depositStatus !== 'DEPOSITED';
  });

  if (!tbody) return;

  if (cashPending.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">
          Semua transaksi penerimaan tunai telah disetorkan ke Bank Jateng (Tidak ada transaksi pending).
        </td>
      </tr>
    `;
    const amtInput = document.getElementById('inputStsAmount');
    if (amtInput) amtInput.value = 0;
    const helper = document.getElementById('inputStsTerbilangHelper');
    if (helper) helper.textContent = 'Nol Rupiah';
    const selCount = document.getElementById('modalStsSelectedCount');
    if (selCount) selCount.textContent = '0 transaksi dipilih';
    return;
  }

  tbody.innerHTML = cashPending.map(t => {
    const s = services.find(item => item.id === t.serviceId);
    const sName = s ? s.name : 'Layanan STP';
    const isChecked = preselectedIds.length === 0 || preselectedIds.includes(t.id);

    return `
      <tr class="${isChecked ? 'selected' : ''}">
        <td style="text-align:center;">
          <input type="checkbox" class="modal-trx-check" data-id="${t.id}" data-amount="${t.amount}" ${isChecked ? 'checked' : ''} onchange="handleModalTrxCheckChange(this)">
        </td>
        <td><strong style="color:var(--primary-600); font-family:monospace;">${t.receiptNo || t.referenceNo || '-'}</strong></td>
        <td><span style="font-size:11.5px;">${formatDateIndo(t.paymentDate)}</span></td>
        <td><strong>${t.tenantName || 'Pembayar'}</strong></td>
        <td><span style="font-size:11.5px; color:var(--text-muted);">${sName}</span></td>
        <td style="text-align:right; font-weight:700;">${formatCurrency(t.amount)}</td>
      </tr>
    `;
  }).join('');

  recalculateModalStsAmount();
}

window.handleModalTrxCheckChange = function(cb) {
  const row = cb.closest('tr');
  if (row) {
    if (cb.checked) row.classList.add('selected');
    else row.classList.remove('selected');
  }
  recalculateModalStsAmount();
};

function recalculateModalStsAmount() {
  const checkboxes = document.querySelectorAll('.modal-trx-check:checked');
  let total = 0;
  checkboxes.forEach(cb => {
    const amt = parseFloat(cb.getAttribute('data-amount')) || 0;
    total += amt;
  });

  const amtInput = document.getElementById('inputStsAmount');
  if (amtInput) {
    amtInput.value = total;
  }

  const helper = document.getElementById('inputStsTerbilangHelper');
  if (helper) {
    helper.textContent = total > 0 ? terbilangRupiah(total) : 'Nol Rupiah';
  }

  const selCount = document.getElementById('modalStsSelectedCount');
  if (selCount) {
    selCount.textContent = `${checkboxes.length} transaksi dipilih (Total: ${formatCurrency(total)})`;
  }
}

/**
 * Handle Submit Pencatatan Setoran Tunai (STS)
 */
function handleSetoranTunaiSubmit() {
  const stsNoInput = document.getElementById('inputStsNo');
  const stsDateInput = document.getElementById('inputStsDate');
  const amountInput = document.getElementById('inputStsAmount');
  const tellerInput = document.getElementById('inputStsTeller');
  const valCodeInput = document.getElementById('inputStsValidationCode');
  const notesInput = document.getElementById('inputStsNotes');

  const stsNo = stsNoInput ? stsNoInput.value.trim() : '';
  const depositDate = stsDateInput ? stsDateInput.value : '';
  const totalAmount = parseFloat(amountInput ? amountInput.value : 0) || 0;
  const tellerName = tellerInput ? tellerInput.value.trim() : 'Teller Bank Jateng KC Surakarta';
  const valCode = valCodeInput ? valCodeInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!stsNo) {
    showToast('Nomor STS / Bukti Setor wajib diisi.', 'error');
    if (stsNoInput) stsNoInput.focus();
    return;
  }

  if (!depositDate) {
    showToast('Tanggal Penyetoran ke Bank Jateng wajib diisi.', 'error');
    if (stsDateInput) stsDateInput.focus();
    return;
  }

  if (totalAmount <= 0) {
    showToast('Total nominal setoran tunai harus lebih dari Rp 0. Centang minimal satu transaksi penerimaan tunai.', 'error');
    return;
  }

  // Get selected transaction IDs
  const checkedBoxes = document.querySelectorAll('.modal-trx-check:checked');
  const trxIds = Array.from(checkedBoxes).map(cb => Number(cb.getAttribute('data-id')));

  const currentUser = window.db.getCurrentUser();
  const fileData = AppState.stagedSetoranSlipFile ? AppState.stagedSetoranSlipFile.fileData : '';
  const fileName = AppState.stagedSetoranSlipFile ? AppState.stagedSetoranSlipFile.fileName : '';
  const fileType = AppState.stagedSetoranSlipFile ? AppState.stagedSetoranSlipFile.fileType : '';

  const newRecord = window.db.addSetoranTunai({
    stsNo: stsNo,
    depositDate: depositDate,
    totalAmount: totalAmount,
    transactionIds: trxIds,
    tellerName: tellerName,
    tellerValidationCode: valCode,
    depositorName: currentUser ? currentUser.name : 'Bendahara Penerimaan BLUD',
    depositorNip: currentUser ? currentUser.nip : '',
    fileName: fileName,
    fileType: fileType,
    fileData: fileData,
    notes: notes
  });

  showToast(`✓ Setoran Tunai ${newRecord.stsNo} (${formatCurrency(newRecord.totalAmount)}) ke Bank Jateng berhasil dicatat!`, 'success');
  closeAddSetoranModal();

  AppState.selectedSetoranTrxIds.clear();
  renderSetoranTunaiView();
}

/**
 * Quick Single Deposit Button Click
 */
window.quickDepositTransaction = function(trxId) {
  openAddSetoranModal([Number(trxId)]);
};

/**
 * Quick Cancel Deposit
 */
window.quickCancelDeposit = function(trxId) {
  const trx = window.db.getTransactionById(trxId);
  if (!trx) return;

  const confirmMsg = `Batalkan status setoran untuk transaksi #${trx.receiptNo} (${formatCurrency(trx.amount)})?\n\nTransaksi akan kembali ke status 'Belum Disetor' dan dapat disetorkan kembali.`;
  if (!confirm(confirmMsg)) return;

  window.db.unmarkTransactionDeposit(trxId);
  window.db.logAudit('UPDATE', `Membatalkan status setoran transaksi #${trx.receiptNo}`);
  showToast(`Status setoran transaksi #${trx.receiptNo} berhasil dibatalkan.`, 'info');

  renderSetoranTunaiView();
};

/**
 * Delete STS Record
 */
window.deleteSetoranTunaiRecord = function(id) {
  const item = window.db.getSetoranTunaiById(id);
  if (!item) return;

  const confirmMsg = `Apakah Anda yakin ingin menghapus arsip Setoran Tunai ${item.stsNo} (${formatCurrency(item.totalAmount)})?\n\nSeluruh transaksi terkait akan dikembalikan ke status 'Belum Disetor'.`;
  if (!confirm(confirmMsg)) return;

  const success = window.db.deleteSetoranTunai(id);
  if (success) {
    showToast(`✓ Arsip Setoran Tunai ${item.stsNo} berhasil dihapus.`, 'info');
    renderSetoranTunaiView();
  }
};

/**
 * Preview Official Setoran Tunai (STS Bank Jateng) Sheet
 */
window.previewSetoranDoc = function(stsId = null) {
  const modal = document.getElementById('setoranTunaiPreviewModal');
  if (!modal) return;

  const allTrx = window.db.getTransactions();
  const services = window.db.getServices();
  const f = AppState.setoranTunaiFilters;
  const periodRange = calculatePeriodRange(f);

  let targetSts = null;
  let targetTrxList = [];
  let totalAmount = 0;
  let periodText = '';

  if (stsId) {
    targetSts = window.db.getSetoranTunaiById(stsId);
    if (targetSts) {
      targetTrxList = allTrx.filter(t => targetSts.transactionIds.includes(t.id));
      totalAmount = targetSts.totalAmount;
      periodText = `Nomor STS: ${targetSts.stsNo} • Tanggal Penyetoran: ${formatDateIndo(targetSts.depositDate)}`;
    }
  }

  if (!targetSts) {
    // If no specific STS id, preview all deposited (or pending + deposited) cash in current filter
    targetTrxList = getFilteredSetoranTrxList();
    targetTrxList.forEach(t => totalAmount += (Number(t.amount) || 0));
    periodText = `Periode: ${periodRange.label}`;
  }

  const periodEl = document.getElementById('setoranPreviewPeriodText');
  if (periodEl) periodEl.textContent = periodText;

  const countEl = document.getElementById('setoranPreviewMetaDocCount');
  if (countEl) countEl.textContent = `Total: ${targetTrxList.length} Transaksi (${formatCurrency(totalAmount)})`;

  const tbody = document.getElementById('setoranPreviewTableBody');
  if (tbody) {
    if (targetTrxList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:24px; color:#64748b;">
            Tidak ada transaksi kas tunai untuk dicetak pada lembar ini.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = targetTrxList.map((t, idx) => {
        const s = services.find(item => item.id === t.serviceId);
        const sName = s ? s.name : 'Layanan STP';
        const stsNo = t.depositStsNo || (targetSts ? targetSts.stsNo : 'STS-BJ');

        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${formatDateIndo(t.paymentDate)}</td>
            <td><strong>${t.receiptNo || t.referenceNo || '-'}</strong></td>
            <td>
              <strong>${t.tenantName || 'Pembayar / Instansi'}</strong>
              ${t.payerOrigin ? `<br><small style="color:#64748b;">${t.payerOrigin}</small>` : ''}
            </td>
            <td>${sName}</td>
            <td style="text-align:right; font-weight:700;">${formatCurrency(t.amount)}</td>
            <td style="text-align:center; font-family:monospace; font-size:9pt; color:#1e40af;">${stsNo}</td>
          </tr>
        `;
      }).join('') + `
        <tr class="total-row">
          <td colspan="5" style="text-align:right;">TOTAL PENYETORAN KE BANK JATENG:</td>
          <td style="text-align:right;">${formatCurrency(totalAmount)}</td>
          <td style="text-align:center; font-size:9pt;">${targetTrxList.length} Kuitansi</td>
        </tr>
      `;
    }
  }

  const terbilangEl = document.getElementById('setoranPreviewTerbilang');
  if (terbilangEl) {
    terbilangEl.textContent = `Terbilang: ${terbilangRupiah(totalAmount)}`;
  }

  // Signatures Section (Bendahara Penerimaan & Bendahara BLUD / Kepala UPTD)
  const sigContainer = document.getElementById('setoranPreviewSignaturesContainer');
  if (sigContainer) {
    const pimpinan = window.db.getOfficialByRole('kepala_uptd');
    const bendahara = window.db.getOfficialByRole('bendahara_penerimaan');
    const now = new Date();
    const todayIndo = formatDateIndo(now);

    sigContainer.innerHTML = `
      <div class="doc-sig-box">
        <div>Mengetahui,</div>
        <div style="font-weight:700;">${pimpinan.position || 'Kepala UPTD Kawasan Sains dan Teknologi'}</div>
        <div class="doc-sig-space"></div>
        <div class="doc-sig-name">${pimpinan.name || 'Rony Widjanarko SH. MH'}</div>
        <div class="doc-sig-nip">${pimpinan.nip ? `NIP. ${pimpinan.nip}` : 'NIP. 198412112009121002'}</div>
      </div>
      <div class="doc-sig-box">
        <div>Surakarta, ${todayIndo}</div>
        <div style="font-weight:700;">${bendahara.position || 'Bendahara Penerimaan BLUD'}</div>
        <div class="doc-sig-space"></div>
        <div class="doc-sig-name">${bendahara.name || 'Alvin Prayogo Anindito, A.Md.Ak'}</div>
        <div class="doc-sig-nip">${bendahara.nip ? `NIP. ${bendahara.nip}` : 'NIP. 199308042025211016'}</div>
      </div>
    `;
  }

  modal.classList.add('active');
};

window.closeSetoranPreviewModal = function() {
  const modal = document.getElementById('setoranTunaiPreviewModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Direct Print Setoran Tunai Report
 */
window.printSetoranTunaiReport = function() {
  const sheet = document.getElementById('setoranPrintableSheet');
  if (!sheet) return;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    showToast('Izinkan pop-up browser untuk mencetak lembar STS.', 'warning');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Surat Tanda Setoran (STS) Bank Jateng - Solo Technopark</title>
      <link rel="stylesheet" href="css/style.css">
      <style>
        body { background: #ffffff !important; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; color: #000000; }
        .report-preview-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
        .doc-table th, .doc-table td { border: 1px solid #333 !important; }
        @media print {
          body { padding: 0; }
          @page { margin: 1.5cm; size: portrait; }
        }
      </style>
    </head>
    <body>
      ${sheet.outerHTML}
      <script>
        window.onload = function() {
          window.focus();
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Preview Uploaded Slip File
 */
window.previewSetoranSlip = function(stsId) {
  const item = window.db.getSetoranTunaiById(stsId);
  if (!item || !item.fileData) {
    showToast('Berkas slip setoran tidak ditemukan.', 'warning');
    return;
  }

  const modal = document.getElementById('setoranSlipViewModal');
  const container = document.getElementById('setoranSlipContent');
  const subtitle = document.getElementById('setoranSlipSubtitle');

  if (subtitle) {
    subtitle.textContent = `Slip Bukti Setor ${item.stsNo} • Bank Jateng (${formatDateIndo(item.depositDate)})`;
  }

  if (container) {
    if (item.fileType === 'application/pdf') {
      container.innerHTML = `
        <iframe src="${item.fileData}" style="width:100%; height:480px; border:none; border-radius:var(--radius-sm);" title="Pratinjau PDF Slip"></iframe>
      `;
    } else {
      container.innerHTML = `
        <img src="${item.fileData}" alt="Slip Setoran" style="max-width:100%; max-height:480px; border-radius:var(--radius-sm); box-shadow:var(--shadow-md);">
      `;
    }
  }

  if (modal) modal.classList.add('active');
};

window.closeSetoranSlipModal = function() {
  const modal = document.getElementById('setoranSlipViewModal');
  if (modal) modal.classList.remove('active');
};

/**
 * Export Setoran Tunai to Excel (.xlsx)
 */
window.exportSetoranTunaiExcel = function() {
  if (typeof XLSX === 'undefined') {
    showToast('Library SheetJS belum dimuat.', 'error');
    return;
  }

  const trxList = getFilteredSetoranTrxList();
  const f = AppState.setoranTunaiFilters;
  const periodRange = calculatePeriodRange(f);
  const services = window.db.getServices();

  const excelData = [
    ['UPTD KAWASAN SAINS DAN TEKNOLOGI SOLO TECHNOPARK'],
    ['REKAPITULASI SETORAN TUNAI KAS BLUD KE BANK JATENG'],
    ['Rekening Bank Tujuan:', 'PT Bank Jateng (KC Surakarta) - No. Rek: 1-002-007181'],
    ['Periode Penyetoran:', periodRange.label],
    ['Tanggal Unduh:', formatDateIndo(new Date(), true)],
    [],
    ['No', 'No. Kuitansi / Slip', 'Tanggal Transaksi', 'Nama Pembayar / Instansi', 'Asal Pembayar', 'Jenis Layanan BLUD', 'Nominal Penerimaan (Rp)', 'Status Penyetoran', 'Nomor STS Bank Jateng', 'Tanggal Setor']
  ];

  let total = 0;
  trxList.forEach((t, idx) => {
    const s = services.find(item => item.id === t.serviceId);
    const amt = Number(t.amount) || 0;
    total += amt;

    excelData.push([
      idx + 1,
      t.receiptNo || t.referenceNo || '-',
      formatDateIndo(t.paymentDate),
      t.tenantName || 'Pembayar / Instansi',
      t.payerOrigin || '-',
      s ? s.name : 'Layanan STP',
      amt,
      t.depositStatus === 'DEPOSITED' ? 'Disetor ke Bank Jateng' : 'Belum Disetor',
      t.depositStsNo || '-',
      t.depositDate ? formatDateIndo(t.depositDate) : '-'
    ]);
  });

  excelData.push([]);
  excelData.push(['', '', '', '', '', 'TOTAL PENERIMAAN KAS TUNAI', total, '', '', '']);

  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Setoran Tunai Bank Jateng');

  const fileName = `Setoran_Tunai_Bank_Jateng_${periodRange.periodTag || 'Rekap'}.xlsx`;
  XLSX.writeFile(wb, fileName);

  window.db.logAudit('EXPORT', `Mengekspor data Setoran Tunai Bank Jateng (${periodRange.label}) ke format Excel`);
  showToast(`✓ Berkas Excel '${fileName}' berhasil diunduh!`, 'success');
};


/**
 * Handle Reset Demo Data action
 */
function handleResetDemoData() {
  if (confirm('Muat ulang seluruh data transaksi demo 2026 dan master data Solo Technopark?')) {
    window.db.resetDemoData();
    if (typeof closeAccountMenu === 'function') closeAccountMenu();
    showToast('Berhasil memuat ulang data demo 2026!', 'success');
    switchView(AppState.currentView);
  }
}
window.handleResetDemoData = handleResetDemoData;
