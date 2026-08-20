/**
 * STP e-Receipt - Data Layer & Mock Storage
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'stp_ereceipt_transactions',
  TENANTS: 'stp_ereceipt_tenants',
  SERVICES: 'stp_ereceipt_services',
  PAYMENT_METHODS: 'stp_ereceipt_methods',
  AUDIT_LOGS: 'stp_ereceipt_audit_logs',
  CURRENT_USER: 'stp_ereceipt_current_user',
  AUTH_SESSION: 'stp_ereceipt_auth_session',
  THEME: 'stp_ereceipt_theme',
  OFFICIALS: 'stp_ereceipt_officials',
  REKENING_KORAN: 'stp_ereceipt_rekening_koran',
  SETORAN_TUNAI: 'stp_ereceipt_setoran_tunai'
};

// Rekening Resmi Penerimaan BLUD Solo Technopark di Bank Jateng
const BANK_JATENG_BLUD_ACCOUNT = {
  bankName: 'Bank Jateng',
  accountNo: '1-002-007181',
  accountName: 'Rekening Penerimaan BLUD Solo Technopark',
  branch: 'KC Surakarta'
};

// Initial Parameter Pejabat Penandatangan Laporan & Dokumen Resmi
const INITIAL_OFFICIALS = [
  {
    id: 'kepala_uptd',
    role: 'kepala_uptd',
    position: 'Kepala UPTD Kawasan Sains dan Teknologi Solo Technopark',
    shortTitle: 'Kepala UPTD Solo Technopark',
    name: 'Rony Widjanarko SH. MH',
    nip: '198412112009121002',
    description: 'Mengetahui & mengesahkan seluruh laporan rekapitulasi, BKU kas, dan pertanggungjawaban BLUD',
    icon: 'fa-user-tie',
    reports: ['Rekap Layanan', 'Riwayat Penerimaan', 'Rekap Rekening BLUD', 'Buku Kas Umum (BKU)', 'Rekap Penerimaan Kas']
  },
  {
    id: 'kasubag_tu',
    role: 'kasubag_tu',
    position: 'Kepala Sub Bagian Tata Usaha UPTD Kawasan Sains dan Teknologi Solo Technopark',
    shortTitle: 'Kasubag Tata Usaha',
    name: 'Wahyudi, S.Kom, M.Eng',
    nip: '198205152008011007',
    description: 'Verifikator administrasi tata usaha, kepatuhan prosedur operasional, dan arsip dokumen',
    icon: 'fa-user-gear',
    reports: ['Verifikasi Administrasi & Tata Kelola']
  },
  {
    id: 'bendahara_blud',
    role: 'bendahara_blud',
    position: 'Bendahara BLUD UPTD Kawasan Sains dan Teknologi Solo Technopark',
    shortTitle: 'Bendahara BLUD',
    name: 'Wahyu Kurniawan, ST',
    nip: '198506082009031004',
    description: 'Menerima setoran penerimaan kas, mutasi rekening operasional, dan pembukuan perbendaharaan BLUD',
    icon: 'fa-wallet',
    reports: ['Rekap Penerimaan Kas (Penerima Setoran)']
  },
  {
    id: 'bendahara_penerimaan',
    role: 'bendahara_penerimaan',
    position: 'Bendahara Penerimaan BLUD UPTD Kawasan Sains dan Teknologi Solo Technopark',
    shortTitle: 'Bendahara Penerimaan BLUD',
    name: 'Alvin Prayogo Anindito, A.Md.Ak',
    nip: '199308042025211016',
    description: 'Pencatat transaksi penerimaan, penerbit kuitansi sah, dan penyusun pembukuan kas harian/bulanan',
    icon: 'fa-cash-register',
    reports: ['Rekap Layanan', 'Riwayat Penerimaan', 'Rekap Rekening BLUD', 'Buku Kas Umum (BKU)', 'Rekap Penerimaan Kas', 'Kuitansi Resmi']
  }
];

// Initial Master Services (Katalog Layanan)
const INITIAL_SERVICES = [
  { id: 1, name: '001 Sertifikat Praktek kerja industri', status: 'active' },
  { id: 2, name: '002 Pelatihan Reguler (Basic, Applied, OJT)', status: 'active' },
  { id: 3, name: '003 Pelatihan Underwater Wet welding', status: 'active' },
  { id: 4, name: '004 Pelayanan Measuring Tool 8s Calibration', status: 'active' },
  { id: 5, name: '005 Kerjasama', status: 'active' },
  { id: 6, name: '006 Sewa Tenant Foodpark', status: 'active' },
  { id: 7, name: '007 Solo Science Center (SSC)', status: 'active' },
  { id: 8, name: '008 Sewa Ruangan Aula/Teori/Meeting Gedung Rnd', status: 'active' },
  { id: 9, name: '009 Sewa Lapangan Basket/Futsal', status: 'active' },
  { id: 10, name: '010 Sewa Ruang Podcast', status: 'active' },
  { id: 11, name: '011 Kontribusi Listrik', status: 'active' },
  { id: 12, name: '012 Jasa Giro', status: 'active' },
  { id: 13, name: '013 Hibah', status: 'active' }
];

// Struktur 5 Rekening Pendapatan BLUD Solo Technopark
const BLUD_REVENUE_ACCOUNTS = [
  {
    id: 1,
    code: '4.1.04.16.01',
    name: 'Jasa Layanan',
    description: '001 Sertifikat Praktek kerja industri, 002 Pelatihan Reguler (Basic, Applied, OJT), 003 Pelatihan Underwater Wet welding, 004 Pelayanan Measuring Tool 8s Calibration',
    serviceNames: [
      '001 Sertifikat Praktek kerja industri',
      '002 Pelatihan Reguler (Basic, Applied, OJT)',
      '003 Pelatihan Underwater Wet welding',
      '004 Pelayanan Measuring Tool 8s Calibration'
    ]
  },
  {
    id: 2,
    code: '4.1.04.16.02',
    name: 'Hibah',
    description: 'Penerimaan hibah pihak ketiga / institusi',
    serviceNames: [
      '013 Hibah'
    ]
  },
  {
    id: 3,
    code: '4.1.04.16.03',
    name: 'Hasil Kerjasama',
    description: '005 Kerjasama, 006 Sewa Tenant Foodpark',
    serviceNames: [
      '005 Kerjasama',
      '006 Sewa Tenant Foodpark'
    ]
  },
  {
    id: 4,
    code: '4.1.04.16.04',
    name: 'Lain-lain Pendapatan BLUD yang Sah',
    description: '007 Solo Science Center (SSC), 008 Sewa Ruangan Aula/Teori/Meeting Gedung Rnd, 009 Sewa Lapangan Basket/Futsal, 010 Sewa Ruang Podcast, 011 Kontribusi Listrik',
    serviceNames: [
      '007 Solo Science Center (SSC)',
      '008 Sewa Ruangan Aula/Teori/Meeting Gedung Rnd',
      '009 Sewa Lapangan Basket/Futsal',
      '010 Sewa Ruang Podcast',
      '011 Kontribusi Listrik'
    ]
  },
  {
    id: 5,
    code: '4.1.04.16.05',
    name: 'Jasa Giro',
    description: 'Penerimaan bunga / jasa giro kas BLUD',
    serviceNames: [
      '012 Jasa Giro'
    ]
  }
];

// Initial Master Tenants (Dikosongkan agar input manual sepenuhnya)
const INITIAL_TENANTS = [
  {
    "id": 1,
    "name": "PT Telekomunikasi Indonesia Tbk",
    "category": "Industri & Mitra",
    "phone": "0271-748900",
    "email": "contact@telkom.co.id",
    "status": "active"
  },
  {
    "id": 2,
    "name": "CV Digital Karya Nusantara",
    "category": "Startup Tenant Incubator",
    "phone": "08122938475",
    "email": "info@digitalkarya.id",
    "status": "active"
  },
  {
    "id": 3,
    "name": "SMK Negeri 2 Surakarta",
    "category": "Institusi Pendidikan",
    "phone": "0271-643322",
    "email": "smkn2solo@sch.id",
    "status": "active"
  },
  {
    "id": 4,
    "name": "Universitas Sebelas Maret (UNS)",
    "category": "Perguruan Tinggi",
    "phone": "0271-646994",
    "email": "humas@uns.ac.id",
    "status": "active"
  },
  {
    "id": 5,
    "name": "PT Astra Honda Motor Solo",
    "category": "Industri Otomotif",
    "phone": "0271-718899",
    "email": "corsec@astra-honda.com",
    "status": "active"
  },
  {
    "id": 6,
    "name": "Foodpark Tenant Kios A1 (Dapur Solo)",
    "category": "Tenant Kuliner Foodpark",
    "phone": "08571234991",
    "email": "dapursolo.stp@gmail.com",
    "status": "active"
  },
  {
    "id": 7,
    "name": "Foodpark Tenant Kios B2 (Kopi Technopark)",
    "category": "Tenant Kuliner Foodpark",
    "phone": "08139088776",
    "email": "kopitechno@gmail.com",
    "status": "active"
  },
  {
    "id": 8,
    "name": "PT Pertamina Training & Consulting",
    "category": "BUMN & Pelatihan",
    "phone": "021-319088",
    "email": "training@pertamina-ptc.com",
    "status": "active"
  },
  {
    "id": 9,
    "name": "Komunitas Robotika Soloraya",
    "category": "Komunitas Sains & Teknologi",
    "phone": "08967788112",
    "email": "robotika.solo@gmail.com",
    "status": "active"
  },
  {
    "id": 10,
    "name": "PT Solo Manufaktur Kreasi (Esemka)",
    "category": "Mitra Industri",
    "phone": "0271-789012",
    "email": "esemka@solo.id",
    "status": "active"
  }
];

// Initial Payment Methods (Cash, Transfer, dan Transfer Tanpa Bukti)
const INITIAL_PAYMENT_METHODS = [
  { id: 1, code: 'CASH', name: 'Cash', bankAccount: 'Pembayaran Tunai Langsung ke Kasir / Bendahara', isActive: true },
  { id: 2, code: 'TRANSFER', name: 'Transfer', bankAccount: 'Rekening Kasda / Bank Persepsi Resmi', isActive: true },
  { id: 3, code: 'TRANSFER_KM', name: 'Transfer Tanpa Bukti (KM)', bankAccount: 'Rekening Koran / Mutasi Bank Tanpa Bukti Fisik', isActive: true }
];

// Initial Transactions (Dikosongkan sesuai permintaan pengguna)
const INITIAL_TRANSACTIONS = [
  {
    "id": 1,
    "transactionNo": "TRX-STP-20260820-0001",
    "receiptNo": "KM-26-08-001",
    "referenceNo": "KM-26-08-001",
    "payerOrigin": "Surakarta",
    "tenantName": "PT Telekomunikasi Indonesia Tbk",
    "serviceId": 8,
    "serviceName": "008 Sewa Ruangan Aula/Teori/Meeting Gedung Rnd",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-08-20",
    "amount": 7500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Aula Utama Gedung RnD Workshop AI & IoT 2 Hari",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-20T08:30:00.000Z"
  },
  {
    "id": 2,
    "transactionNo": "TRX-STP-20260820-0002",
    "receiptNo": "KM-26-08-002",
    "referenceNo": "KM-26-08-002",
    "payerOrigin": "Solo Technopark",
    "tenantName": "Foodpark Tenant Kios A1 (Dapur Solo)",
    "serviceId": 6,
    "serviceName": "006 Sewa Tenant Foodpark",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-08-20",
    "amount": 2500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Kios Foodpark A1 Periode Agustus 2026",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-20T09:15:00.000Z"
  },
  {
    "id": 3,
    "transactionNo": "TRX-STP-20260819-0003",
    "receiptNo": "KM-26-08-003",
    "referenceNo": "KM-26-08-003",
    "payerOrigin": "Surakarta",
    "tenantName": "SMK Negeri 2 Surakarta",
    "serviceId": 1,
    "serviceName": "001 Sertifikat Praktek kerja industri",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-08-19",
    "amount": 3750000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Biaya Sertifikasi Uji Kompetensi PKL 25 Siswa Teknik Mesin",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-19T10:00:00.000Z"
  },
  {
    "id": 4,
    "transactionNo": "TRX-STP-20260818-0004",
    "receiptNo": "KM-26-08-004",
    "referenceNo": "TRF-BJ-88912",
    "payerOrigin": "Semarang",
    "tenantName": "PT Pertamina Training & Consulting",
    "serviceId": 3,
    "serviceName": "003 Pelatihan Underwater Wet welding",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-08-18",
    "amount": 18500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Pelatihan Underwater Wet Welding Batch III Kelas Industri",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-18T13:45:00.000Z"
  },
  {
    "id": 5,
    "transactionNo": "TRX-STP-20260817-0005",
    "receiptNo": "KM-26-08-005",
    "referenceNo": "KM-26-08-005",
    "payerOrigin": "Surakarta",
    "tenantName": "Universitas Sebelas Maret (UNS)",
    "serviceId": 7,
    "serviceName": "007 Solo Science Center (SSC)",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-08-17",
    "amount": 1800000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Kunjungan Edukasi Sains & Teknologi 60 Mahasiswa FT",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-17T11:20:00.000Z"
  },
  {
    "id": 6,
    "transactionNo": "TRX-STP-20260815-0006",
    "receiptNo": "KM-26-08-006",
    "referenceNo": "KM-26-08-006",
    "payerOrigin": "Surakarta",
    "tenantName": "CV Digital Karya Nusantara",
    "serviceId": 10,
    "serviceName": "010 Sewa Ruang Podcast",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-08-15",
    "amount": 1200000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Studio Podcast & Livestreaming Gedung Solo Technopark 4 Jam",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1723680000001,
    "depositStsNo": "STS-BJ-2026-08-001",
    "depositDate": "2026-08-16",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-08-15T14:10:00.000Z"
  },
  {
    "id": 7,
    "transactionNo": "TRX-STP-20260814-0007",
    "receiptNo": "KM-26-08-007",
    "referenceNo": "KM-26-08-007",
    "payerOrigin": "Surakarta",
    "tenantName": "Komunitas Basket Solo Technopark",
    "serviceId": 9,
    "serviceName": "009 Sewa Lapangan Basket/Futsal",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-08-14",
    "amount": 1500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Lapangan Olahraga Outdoor Sabtu Sore (Member Bulanan)",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1723680000001,
    "depositStsNo": "STS-BJ-2026-08-001",
    "depositDate": "2026-08-16",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-08-14T16:00:00.000Z"
  },
  {
    "id": 8,
    "transactionNo": "TRX-STP-20260812-0008",
    "receiptNo": "KM-26-08-008",
    "referenceNo": "TRF-KM-88120",
    "payerOrigin": "Jakarta",
    "tenantName": "PT Astra Honda Motor Solo",
    "serviceId": 4,
    "serviceName": "004 Pelayanan Measuring Tool 8s Calibration",
    "paymentMethodId": 3,
    "paymentMethod": "Transfer Tanpa Bukti (KM)",
    "paymentDate": "2026-08-12",
    "amount": 6200000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Kalibrasi Presisi Alat Ukur Industri Machining (Mutasi Bank Jateng Rek. 1-002-007181)",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-12T09:00:00.000Z"
  },
  {
    "id": 9,
    "transactionNo": "TRX-STP-20260810-0009",
    "receiptNo": "KM-26-08-009",
    "referenceNo": "KM-26-08-009",
    "payerOrigin": "Solo Technopark",
    "tenantName": "Foodpark Tenant Kios B2 (Kopi Technopark)",
    "serviceId": 11,
    "serviceName": "011 Kontribusi Listrik",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-08-10",
    "amount": 850000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Kontribusi Pemakaian Daya Listrik Kios Foodpark Juli-Agustus 2026",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1723680000001,
    "depositStsNo": "STS-BJ-2026-08-001",
    "depositDate": "2026-08-16",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-08-10T11:00:00.000Z"
  },
  {
    "id": 10,
    "transactionNo": "TRX-STP-20260805-0010",
    "receiptNo": "KM-26-08-010",
    "referenceNo": "TRF-MDR-99214",
    "payerOrigin": "Jakarta",
    "tenantName": "PT Solo Manufaktur Kreasi (Esemka)",
    "serviceId": 5,
    "serviceName": "005 Kerjasama",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-08-05",
    "amount": 15000000,
    "status": "BELUM LUNAS",
    "remainingAmount": 10000000,
    "notes": "Pembayaran Termin 1 Kerjasama Penggunaan Bengkel CNC & Machining Lab (Total Kontrak Rp 25.000.000)",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-08-05T14:30:00.000Z"
  },
  {
    "id": 11,
    "transactionNo": "TRX-STP-20260728-0011",
    "receiptNo": "KM-26-07-001",
    "referenceNo": "TRF-BJ-77112",
    "payerOrigin": "Surakarta",
    "tenantName": "PT Telekomunikasi Indonesia Tbk",
    "serviceId": 2,
    "serviceName": "002 Pelatihan Reguler (Basic, Applied, OJT)",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-07-28",
    "amount": 9500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Pelatihan Pemrograman PLC & Otomasi Industri 10 Peserta",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-07-28T09:00:00.000Z"
  },
  {
    "id": 12,
    "transactionNo": "TRX-STP-20260722-0012",
    "receiptNo": "KM-26-07-002",
    "referenceNo": "KM-26-07-002",
    "payerOrigin": "Surakarta",
    "tenantName": "SMK Negeri 5 Surakarta",
    "serviceId": 1,
    "serviceName": "001 Sertifikat Praktek kerja industri",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-07-22",
    "amount": 4200000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sertifikasi Prakerin 28 Siswa Gelombang 2",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1721800000002,
    "depositStsNo": "STS-BJ-2026-07-001",
    "depositDate": "2026-07-25",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-07-22T10:30:00.000Z"
  },
  {
    "id": 13,
    "transactionNo": "TRX-STP-20260715-0013",
    "receiptNo": "KM-26-07-003",
    "referenceNo": "KM-26-07-003",
    "payerOrigin": "Solo Technopark",
    "tenantName": "Foodpark Tenant Kios A1 (Dapur Solo)",
    "serviceId": 6,
    "serviceName": "006 Sewa Tenant Foodpark",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-07-15",
    "amount": 2500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Kios Foodpark A1 Periode Juli 2026",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1721800000002,
    "depositStsNo": "STS-BJ-2026-07-001",
    "depositDate": "2026-07-25",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-07-15T11:00:00.000Z"
  },
  {
    "id": 14,
    "transactionNo": "TRX-STP-20260710-0014",
    "receiptNo": "KM-26-07-004",
    "referenceNo": "TRF-BJ-77055",
    "payerOrigin": "Surakarta",
    "tenantName": "Bank Jateng KC Surakarta",
    "serviceId": 12,
    "serviceName": "012 Jasa Giro",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-07-10",
    "amount": 1425000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Pendapatan Bunga Jasa Giro Rekening BLUD Solo Technopark Periode Juni-Juli 2026",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-07-10T16:00:00.000Z"
  },
  {
    "id": 15,
    "transactionNo": "TRX-STP-20260620-0015",
    "receiptNo": "KM-26-06-001",
    "referenceNo": "TRF-MDR-66102",
    "payerOrigin": "Surakarta",
    "tenantName": "Yayasan CSR Peduli Bangsa",
    "serviceId": 13,
    "serviceName": "013 Hibah",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-06-20",
    "amount": 25000000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Penerimaan Dana Hibah Program Pembinaan Startup Muda Solo Technopark",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-06-20T10:00:00.000Z"
  },
  {
    "id": 16,
    "transactionNo": "TRX-STP-20260614-0016",
    "receiptNo": "KM-26-06-002",
    "referenceNo": "KM-26-06-002",
    "payerOrigin": "Surakarta",
    "tenantName": "Universitas Sebelas Maret (UNS)",
    "serviceId": 8,
    "serviceName": "008 Sewa Ruangan Aula/Teori/Meeting Gedung Rnd",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-06-14",
    "amount": 4000000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Ruang Meeting & Teori Lt. 2 Seminar Nasional Sains",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1718500000003,
    "depositStsNo": "STS-BJ-2026-06-001",
    "depositDate": "2026-06-16",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-06-14T15:00:00.000Z"
  },
  {
    "id": 17,
    "transactionNo": "TRX-STP-20260518-0017",
    "receiptNo": "KM-26-05-001",
    "referenceNo": "TRF-BJ-55101",
    "payerOrigin": "Surakarta",
    "tenantName": "PT Astra Honda Motor Solo",
    "serviceId": 2,
    "serviceName": "002 Pelatihan Reguler (Basic, Applied, OJT)",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-05-18",
    "amount": 12000000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Pelatihan Mekatronika & Otomasi Manufaktur",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-05-18T10:00:00.000Z"
  },
  {
    "id": 18,
    "transactionNo": "TRX-STP-20260425-0018",
    "receiptNo": "KM-26-04-001",
    "referenceNo": "KM-26-04-001",
    "payerOrigin": "Surakarta",
    "tenantName": "SMK Warga Surakarta",
    "serviceId": 1,
    "serviceName": "001 Sertifikat Praktek kerja industri",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-04-25",
    "amount": 3000000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sertifikat Prakerin 20 Siswa Jurusan Listrik & Mekatronika",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1714200000004,
    "depositStsNo": "STS-BJ-2026-04-001",
    "depositDate": "2026-04-27",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-04-25T11:00:00.000Z"
  },
  {
    "id": 19,
    "transactionNo": "TRX-STP-20260315-0019",
    "receiptNo": "KM-26-03-001",
    "referenceNo": "TRF-KM-33109",
    "payerOrigin": "Semarang",
    "tenantName": "PT Pertamina Training & Consulting",
    "serviceId": 3,
    "serviceName": "003 Pelatihan Underwater Wet welding",
    "paymentMethodId": 3,
    "paymentMethod": "Transfer Tanpa Bukti (KM)",
    "paymentDate": "2026-03-15",
    "amount": 18500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Pelatihan Underwater Wet Welding Batch I (Mutasi Bank Jateng)",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-03-15T09:00:00.000Z"
  },
  {
    "id": 20,
    "transactionNo": "TRX-STP-20260220-0020",
    "receiptNo": "KM-26-02-001",
    "referenceNo": "TRF-MDR-22001",
    "payerOrigin": "Surakarta",
    "tenantName": "CV Techno Mandiri",
    "serviceId": 5,
    "serviceName": "005 Kerjasama",
    "paymentMethodId": 2,
    "paymentMethod": "Transfer",
    "paymentDate": "2026-02-20",
    "amount": 8000000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Kerjasama Pemanfaatan Fasilitas FabLab Solo Technopark Q1",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "createdAt": "2026-02-20T14:00:00.000Z"
  },
  {
    "id": 21,
    "transactionNo": "TRX-STP-20260115-0021",
    "receiptNo": "KM-26-01-001",
    "referenceNo": "KM-26-01-001",
    "payerOrigin": "Surakarta",
    "tenantName": "Foodpark Tenant Kios A1 (Dapur Solo)",
    "serviceId": 6,
    "serviceName": "006 Sewa Tenant Foodpark",
    "paymentMethodId": 1,
    "paymentMethod": "Cash",
    "paymentDate": "2026-01-15",
    "amount": 2500000,
    "status": "LUNAS",
    "remainingAmount": 0,
    "notes": "Sewa Kios Foodpark A1 Periode Januari 2026",
    "officerName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositStatus": "DEPOSITED",
    "depositId": 1705500000005,
    "depositStsNo": "STS-BJ-2026-01-001",
    "depositDate": "2026-01-18",
    "depositBank": "Bank Jateng",
    "depositAccountNo": "1-002-007181",
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
];

// Initial Rekening Koran Sample Documents
const INITIAL_REKENING_KORAN = [
  {
    id: 1723620000001,
    bankName: 'Bank Jateng',
    accountNo: '1-002-007181',
    accountName: 'Rekening Penerimaan BLUD Solo Technopark',
    month: 8,
    monthName: 'Agustus',
    year: 2026,
    openingBalance: 154200000,
    closingBalance: 289450000,
    fileName: 'Rekening_Koran_Bank_Jateng_Agustus_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 2411724,
    fileSizeFormatted: '2.3 MB',
    fileData: '',
    uploadDate: '2026-08-14T08:30:00',
    uploadedBy: 'Alvin Prayogo Anindito, A.Md.Ak',
    notes: 'Rekening Koran Bank Jateng Rekening Penerimaan BLUD periode Agustus 2026 (Mutasi Kasda & QRIS)',
    status: 'VERIFIED'
  },
  {
    id: 1720941600002,
    bankName: 'Bank Jateng',
    accountNo: '1-002-007181',
    accountName: 'Rekening Penerimaan BLUD Solo Technopark',
    month: 7,
    monthName: 'Juli',
    year: 2026,
    openingBalance: 121500000,
    closingBalance: 154200000,
    fileName: 'Rekening_Koran_Bank_Jateng_Juli_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 1887436,
    fileSizeFormatted: '1.8 MB',
    fileData: '',
    uploadDate: '2026-07-31T16:15:00',
    uploadedBy: 'Alvin Prayogo Anindito, A.Md.Ak',
    notes: 'Rekening Koran Bank Jateng Penerimaan BLUD periode Juli 2026 telah diverifikasi dan rekonsiliasi.',
    status: 'VERIFIED'
  },
  {
    id: 1723620000003,
    bankName: 'Bank Mandiri',
    accountNo: '1380022007707',
    accountName: 'Rekening Transaksi BLUD Solo Technopark',
    month: 8,
    monthName: 'Agustus',
    year: 2026,
    openingBalance: 45000000,
    closingBalance: 78500000,
    fileName: 'Rekening_Koran_Bank_Mandiri_Agustus_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 1455360,
    fileSizeFormatted: '1.4 MB',
    fileData: '',
    uploadDate: '2026-08-12T11:20:00',
    uploadedBy: 'Alvin Prayogo Anindito, A.Md.Ak',
    notes: 'Rekening Koran Bank Mandiri transaksi virtual account dan transfer tenant Solo Technopark',
    status: 'VERIFIED'
  }
];

// Initial Setoran Tunai Sample Documents (STS Bank Jateng No. Rek 1-002-007181)
const INITIAL_SETORAN_TUNAI = [
  {
    "id": 1723680000001,
    "stsNo": "STS-BJ-2026-08-001",
    "bankName": "Bank Jateng",
    "accountNo": "1-002-007181",
    "accountName": "Rekening Penerimaan BLUD Solo Technopark",
    "depositDate": "2026-08-16",
    "totalAmount": 3550000,
    "transactionIds": [
      6,
      7,
      9
    ],
    "transactionCount": 3,
    "tellerName": "Budi Santoso - Teller Bank Jateng KC Surakarta",
    "tellerValidationCode": "VAL-BJ-20260816-0921",
    "depositorName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositorNip": "199308042025211016",
    "fileName": "Slip_Setoran_Bank_Jateng_STS_08001.pdf",
    "fileType": "application/pdf",
    "fileData": "",
    "notes": "Setoran Kas Tunai Penerimaan Periode 10 - 15 Agustus 2026",
    "createdAt": "2026-08-16T09:30:00.000Z",
    "status": "VERIFIED"
  },
  {
    "id": 1721800000002,
    "stsNo": "STS-BJ-2026-07-001",
    "bankName": "Bank Jateng",
    "accountNo": "1-002-007181",
    "accountName": "Rekening Penerimaan BLUD Solo Technopark",
    "depositDate": "2026-07-25",
    "totalAmount": 6700000,
    "transactionIds": [
      12,
      13
    ],
    "transactionCount": 2,
    "tellerName": "Dewi Sartika - Teller Bank Jateng KC Surakarta",
    "tellerValidationCode": "VAL-BJ-20260725-1104",
    "depositorName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositorNip": "199308042025211016",
    "fileName": "Slip_Setoran_Bank_Jateng_STS_07001.pdf",
    "fileType": "application/pdf",
    "fileData": "",
    "notes": "Setoran Kas Tunai Penerimaan Periode 15 - 22 Juli 2026",
    "createdAt": "2026-07-25T11:15:00.000Z",
    "status": "VERIFIED"
  },
  {
    "id": 1718500000003,
    "stsNo": "STS-BJ-2026-06-001",
    "bankName": "Bank Jateng",
    "accountNo": "1-002-007181",
    "accountName": "Rekening Penerimaan BLUD Solo Technopark",
    "depositDate": "2026-06-16",
    "totalAmount": 4000000,
    "transactionIds": [
      16
    ],
    "transactionCount": 1,
    "tellerName": "Budi Santoso - Teller Bank Jateng KC Surakarta",
    "tellerValidationCode": "VAL-BJ-20260616-1402",
    "depositorName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositorNip": "199308042025211016",
    "fileName": "Slip_Setoran_Bank_Jateng_STS_06001.pdf",
    "fileType": "application/pdf",
    "fileData": "",
    "notes": "Setoran Kas Tunai Sewa Ruang RnD",
    "createdAt": "2026-06-16T14:10:00.000Z",
    "status": "VERIFIED"
  },
  {
    "id": 1714200000004,
    "stsNo": "STS-BJ-2026-04-001",
    "bankName": "Bank Jateng",
    "accountNo": "1-002-007181",
    "accountName": "Rekening Penerimaan BLUD Solo Technopark",
    "depositDate": "2026-04-27",
    "totalAmount": 3000000,
    "transactionIds": [
      18
    ],
    "transactionCount": 1,
    "tellerName": "Dewi Sartika - Teller Bank Jateng KC Surakarta",
    "tellerValidationCode": "VAL-BJ-20260427-0955",
    "depositorName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositorNip": "199308042025211016",
    "fileName": "Slip_Setoran_Bank_Jateng_STS_04001.pdf",
    "fileType": "application/pdf",
    "fileData": "",
    "notes": "Setoran Kas Tunai Sertifikasi Siswa SMK",
    "createdAt": "2026-04-27T10:00:00.000Z",
    "status": "VERIFIED"
  },
  {
    "id": 1705500000005,
    "stsNo": "STS-BJ-2026-01-001",
    "bankName": "Bank Jateng",
    "accountNo": "1-002-007181",
    "accountName": "Rekening Penerimaan BLUD Solo Technopark",
    "depositDate": "2026-01-18",
    "totalAmount": 2500000,
    "transactionIds": [
      21
    ],
    "transactionCount": 1,
    "tellerName": "Budi Santoso - Teller Bank Jateng KC Surakarta",
    "tellerValidationCode": "VAL-BJ-20260118-0845",
    "depositorName": "Alvin Prayogo Anindito, A.Md.Ak",
    "depositorNip": "199308042025211016",
    "fileName": "Slip_Setoran_Bank_Jateng_STS_01001.pdf",
    "fileType": "application/pdf",
    "fileData": "",
    "notes": "Setoran Kas Tunai Sewa Kios Foodpark A1",
    "createdAt": "2026-01-18T09:00:00.000Z",
    "status": "VERIFIED"
  }
];

// Initial System Audit Logs
const INITIAL_AUDIT_LOGS = [
  {
    "id": 1,
    "user": "Alvin Prayogo Anindito, A.Md.Ak",
    "role": "admin",
    "action": "CREATE",
    "description": "Membuat transaksi baru #KM-26-08-001 (Rp 7.500.000 - PT Telekomunikasi Indonesia Tbk)",
    "timestamp": "2026-08-20T08:30:00.000Z"
  },
  {
    "id": 2,
    "user": "Alvin Prayogo Anindito, A.Md.Ak",
    "role": "admin",
    "action": "CREATE",
    "description": "Membuat transaksi baru #KM-26-08-002 (Rp 2.500.000 - Foodpark Tenant Kios A1)",
    "timestamp": "2026-08-20T09:15:00.000Z"
  },
  {
    "id": 3,
    "user": "Alvin Prayogo Anindito, A.Md.Ak",
    "role": "admin",
    "action": "CREATE",
    "description": "Mencatat Setoran Tunai ke Bank Jateng (STS: STS-BJ-2026-08-001, Nominal: Rp 3.550.000)",
    "timestamp": "2026-08-16T09:30:00.000Z"
  },
  {
    "id": 4,
    "user": "Rony Widjanarko SH. MH",
    "role": "pimpinan",
    "action": "REPORT",
    "description": "Membuka dan meninjau Laporan Rekapitulasi Rekening Pendapatan BLUD Periode Agustus 2026",
    "timestamp": "2026-08-15T11:00:00.000Z"
  },
  {
    "id": 5,
    "user": "Alvin Prayogo Anindito, A.Md.Ak",
    "role": "admin",
    "action": "AUTH",
    "description": "Pengguna Alvin Prayogo Anindito, A.Md.Ak (Petugas Administrasi Penerimaan) berhasil masuk ke sistem",
    "timestamp": "2026-08-20T08:00:00.000Z"
  }
];

// Current Session User Definition & Mock Credentials
const SYSTEM_USERS = {
  admin: {
    id: 1,
    username: 'admin',
    aliases: ['admin', 'petugas', 'alvin', 'petugas1'],
    passwords: ['admin', 'admin123', '123456', 'petugas'],
    name: 'Alvin Prayogo Anindito, A.Md.Ak',
    role: 'admin',
    roleTitle: 'Petugas Administrasi Penerimaan',
    nip: '199308042025211016',
    avatar: 'AA',
    email: 'admin.penerimaan@kst.go.id',
    unit: 'AdminPenerimaan UPTD KST'
  },
  pimpinan: {
    id: 2,
    username: 'pimpinan',
    aliases: ['pimpinan', 'kepala', 'deny', 'kasubbag'],
    passwords: ['pimpinan', 'pimpinan123', '123456', 'kepala'],
    name: 'Rony Widjanarko SH. MH',
    role: 'pimpinan',
    roleTitle: 'Kepala UPTD Kawasan Sains dan Teknologi Solo Technopark',
    nip: '198412112009121002',
    avatar: 'DW',
    email: 'kasubbag.tu@kst.go.id',
    unit: 'Kepala Subbagian Tata Usaha'
  }
};

/**
 * DataStore Helper Class
 * LocalStorage wrapper with auto initialization and seed data
 */
class DataStore {
  constructor() {
    this.init();
  }

  init() {
    // Persistent Storage Initialization - Auto-seed if empty or null
    const existingTrx = this.get(STORAGE_KEYS.TRANSACTIONS);
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || existingTrx.length === 0) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    const existingLogs = this.get(STORAGE_KEYS.AUDIT_LOGS);
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || existingLogs.length === 0) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (localStorage.getItem(STORAGE_KEYS.CURRENT_USER) === null) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SYSTEM_USERS.admin));
    }

    const existingServices = this.get(STORAGE_KEYS.SERVICES);
    const existingMethods = this.get(STORAGE_KEYS.PAYMENT_METHODS);

    if (!localStorage.getItem(STORAGE_KEYS.SERVICES) || existingServices.length !== INITIAL_SERVICES.length || existingServices.some((s, idx) => s.name !== INITIAL_SERVICES[idx]?.name)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS) || existingMethods.length !== INITIAL_PAYMENT_METHODS.length || !existingMethods.some(m => m.name === 'Transfer Tanpa Bukti (KM)')) {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(INITIAL_PAYMENT_METHODS));
    }
    const existingTenants = this.get(STORAGE_KEYS.TENANTS);
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS) || existingTenants.length === 0) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFICIALS)) {
      localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(INITIAL_OFFICIALS));
    }
    const existingRK = this.get(STORAGE_KEYS.REKENING_KORAN);
    if (!localStorage.getItem(STORAGE_KEYS.REKENING_KORAN) || existingRK.some(r => r.accountNo === '1.002.00012.3' || r.accountNo === '138.00.99812.1' || (r.bankName !== 'Bank Jateng' && r.bankName !== 'Bank Mandiri'))) {
      localStorage.setItem(STORAGE_KEYS.REKENING_KORAN, JSON.stringify(INITIAL_REKENING_KORAN));
    }
    const existingSetoran = this.get(STORAGE_KEYS.SETORAN_TUNAI);
    if (!localStorage.getItem(STORAGE_KEYS.SETORAN_TUNAI) || existingSetoran.length === 0) {
      localStorage.setItem(STORAGE_KEYS.SETORAN_TUNAI, JSON.stringify(INITIAL_SETORAN_TUNAI));
    }
  }

  // Generic Getters & Setters
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading localStorage key:', key, e);
      return [];
    }
  }

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Error writing to localStorage key:', key, e);
    }
  }

  // Transactions
  getTransactions() {
    return this.get(STORAGE_KEYS.TRANSACTIONS);
  }

  getTransactionById(id) {
    const list = this.getTransactions();
    return list.find(t => t.id === Number(id)) || null;
  }

  /**
   * Generate Next Receipt / Slip Number with format KM-Tahun(2digit)-Bulan-NomerUrut
   * @param {string|Date} dateInput
   * @returns {string} e.g. "KM-26-08-001" or "KM-26-08-008"
   */
  generateNextReceiptNo(dateInput) {
    const list = this.getTransactions();
    const d = dateInput ? new Date(dateInput) : new Date();
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const yearShort = String(year).slice(-2);

    let maxSeq = 0;
    list.forEach(t => {
      const ref = (t.referenceNo || t.receiptNo || '').trim();
      // Match KM-YY-MM-XXX or KM-YYYY-MM-XXXX
      const match = ref.match(/^KM-(\d{2,4})-(\d{2})-(\d+)$/i);
      if (match) {
        const tYear = match[1];
        const tMonth = match[2];
        const tSeq = parseInt(match[3], 10);

        // Matches if year matches (either 2-digit or 4-digit) and month matches
        const isYearMatch = (tYear === yearShort || tYear === String(year));
        if (isYearMatch && tMonth === month && !isNaN(tSeq)) {
          if (tSeq > maxSeq) maxSeq = tSeq;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    const seqStr = String(nextSeq).padStart(3, '0');
    return `KM-${yearShort}-${month}-${seqStr}`;
  }

  addTransaction(trxData) {
    const list = this.getTransactions();
    const newId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;

    // Auto-generate Transaction Number
    const trxDate = trxData.paymentDate ? new Date(trxData.paymentDate) : new Date();
    const validDate = isNaN(trxDate.getTime()) ? new Date() : trxDate;
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');
    const seq = String(newId).padStart(4, '0');

    const transactionNo = `TRX-STP-${year}${month}${day}-${seq}`;
    const autoNumber = this.generateNextReceiptNo(trxData.paymentDate);

    // Nomor kuitansi disamakan dengan nomor bukti/slip (bisa diisi manual atau fallback autoNumber)
    const refNo = (trxData.referenceNo && trxData.referenceNo.trim()) ? trxData.referenceNo.trim() : autoNumber;
    const receiptNo = refNo;

    const newRecord = {
      id: newId,
      transactionNo,
      receiptNo,
      referenceNo: refNo,
      payerOrigin: trxData.payerOrigin || '',
      ...trxData,
      createdAt: new Date().toISOString()
    };

    list.unshift(newRecord);
    this.set(STORAGE_KEYS.TRANSACTIONS, list);

    // Add Audit Log
    const payerName = newRecord.tenantName || 'Pembayar / Instansi';
    this.logAudit('CREATE', `Membuat transaksi baru #${receiptNo} (${newRecord.amount.toLocaleString('id-ID')} - ${payerName})`);

    return newRecord;
  }

  updateTransaction(id, updateData) {
    const list = this.getTransactions();
    const idx = list.findIndex(t => t.id === Number(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updateData, updatedAt: new Date().toISOString() };
      this.set(STORAGE_KEYS.TRANSACTIONS, list);
      this.logAudit('UPDATE', `Memperbarui data transaksi #${list[idx].transactionNo}`);
      return list[idx];
    }
    return null;
  }

  deleteTransaction(id) {
    const list = this.getTransactions();
    const target = list.find(t => t.id === Number(id));
    if (target) {
      const filtered = list.filter(t => t.id !== Number(id));
      this.set(STORAGE_KEYS.TRANSACTIONS, filtered);
      this.logAudit('DELETE', `Menghapus data transaksi #${target.transactionNo} (${formatCurrency(target.amount)})`);
      return true;
    }
    return false;
  }

  // Rekening Koran Documents
  getRekeningKoran() {
    return this.get(STORAGE_KEYS.REKENING_KORAN);
  }

  getRekeningKoranById(id) {
    const list = this.getRekeningKoran();
    return list.find(r => r.id === Number(id)) || null;
  }

  addRekeningKoran(data) {
    const list = this.getRekeningKoran();
    const currentUser = this.getCurrentUser();
    const newRecord = {
      id: Date.now(),
      bankName: data.bankName || 'Bank Jateng',
      accountNo: data.accountNo || '',
      accountName: data.accountName || 'Rekening Penerimaan BLUD',
      month: Number(data.month) || 1,
      monthName: data.monthName || '',
      year: Number(data.year) || 2026,
      openingBalance: Number(data.openingBalance) || 0,
      closingBalance: Number(data.closingBalance) || 0,
      fileName: data.fileName || 'Dokumen_Rekening_Koran.pdf',
      fileType: data.fileType || 'application/pdf',
      fileSize: Number(data.fileSize) || 0,
      fileSizeFormatted: data.fileSizeFormatted || '1.0 MB',
      fileData: data.fileData || '',
      uploadDate: data.uploadDate || new Date().toISOString(),
      uploadedBy: data.uploadedBy || (currentUser ? currentUser.name : 'Petugas Admin'),
      notes: data.notes || '',
      status: 'VERIFIED'
    };
    list.unshift(newRecord);
    this.set(STORAGE_KEYS.REKENING_KORAN, list);
    this.logAudit('UPLOAD', `Mengunggah Rekening Koran ${newRecord.bankName} Periode ${newRecord.monthName} ${newRecord.year} (${newRecord.fileName})`);
    return newRecord;
  }

  deleteRekeningKoran(id) {
    let list = this.getRekeningKoran();
    const target = list.find(r => r.id === Number(id));
    if (!target) return false;
    list = list.filter(r => r.id !== Number(id));
    this.set(STORAGE_KEYS.REKENING_KORAN, list);
    this.logAudit('DELETE', `Menghapus Dokumen Rekening Koran #${target.id} - ${target.bankName} (${target.monthName} ${target.year})`);
    return true;
  }

  // Setoran Tunai Bank Jateng Documents
  getSetoranTunai() {
    return this.get(STORAGE_KEYS.SETORAN_TUNAI);
  }

  getSetoranTunaiById(id) {
    const list = this.getSetoranTunai();
    return list.find(s => s.id === Number(id)) || null;
  }

  generateNextStsNo(dateInput) {
    const list = this.getSetoranTunai();
    const d = dateInput ? new Date(dateInput) : new Date();
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');

    let maxSeq = 0;
    list.forEach(s => {
      const stsNo = (s.stsNo || '').trim();
      const match = stsNo.match(/^STS-BJ-(\d{4})-(\d{2})-(\d+)$/i);
      if (match) {
        const sYear = match[1];
        const sMonth = match[2];
        const sSeq = parseInt(match[3], 10);
        if (sYear === String(year) && sMonth === month && !isNaN(sSeq)) {
          if (sSeq > maxSeq) maxSeq = sSeq;
        }
      }
    });

    const nextSeq = maxSeq + 1;
    const seqStr = String(nextSeq).padStart(3, '0');
    return `STS-BJ-${year}-${month}-${seqStr}`;
  }

  addSetoranTunai(data) {
    const list = this.getSetoranTunai();
    const currentUser = this.getCurrentUser();
    const newId = Date.now();
    const autoSts = this.generateNextStsNo(data.depositDate);
    const stsNo = (data.stsNo && data.stsNo.trim()) ? data.stsNo.trim() : autoSts;

    const newRecord = {
      id: newId,
      stsNo: stsNo,
      bankName: 'Bank Jateng',
      accountNo: '1-002-007181',
      accountName: 'Rekening Penerimaan BLUD Solo Technopark',
      depositDate: data.depositDate || new Date().toISOString().split('T')[0],
      totalAmount: Number(data.totalAmount) || 0,
      transactionIds: Array.isArray(data.transactionIds) ? data.transactionIds : [],
      transactionCount: Array.isArray(data.transactionIds) ? data.transactionIds.length : (Number(data.transactionCount) || 0),
      tellerName: data.tellerName || 'Teller Bank Jateng KC Surakarta',
      tellerValidationCode: data.tellerValidationCode || '',
      depositorName: data.depositorName || (currentUser ? currentUser.name : 'Alvin Prayogo Anindito, A.Md.Ak'),
      depositorNip: data.depositorNip || (currentUser ? currentUser.nip : '199308042025211016'),
      fileName: data.fileName || '',
      fileType: data.fileType || '',
      fileData: data.fileData || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      status: 'VERIFIED'
    };

    list.unshift(newRecord);
    this.set(STORAGE_KEYS.SETORAN_TUNAI, list);

    // Update transactions to be marked as deposited
    if (newRecord.transactionIds.length > 0) {
      this.markTransactionsAsDeposited(newRecord.transactionIds, {
        depositId: newRecord.id,
        stsNo: newRecord.stsNo,
        depositDate: newRecord.depositDate
      });
    }

    this.logAudit('CREATE', `Mencatat Setoran Tunai ke Bank Jateng (STS: ${newRecord.stsNo}, Nominal: ${formatCurrency(newRecord.totalAmount)})`);
    return newRecord;
  }

  deleteSetoranTunai(id) {
    let list = this.getSetoranTunai();
    const target = list.find(s => s.id === Number(id));
    if (!target) return false;

    // Unmark transactions
    if (target.transactionIds && target.transactionIds.length > 0) {
      target.transactionIds.forEach(trxId => {
        this.unmarkTransactionDeposit(trxId);
      });
    }

    list = list.filter(s => s.id !== Number(id));
    this.set(STORAGE_KEYS.SETORAN_TUNAI, list);
    this.logAudit('DELETE', `Menghapus Rekam Setoran Tunai STS #${target.stsNo} (${formatCurrency(target.totalAmount)})`);
    return true;
  }

  markTransactionsAsDeposited(trxIds, depositInfo) {
    const transactions = this.getTransactions();
    let updated = false;
    transactions.forEach(t => {
      if (trxIds.includes(t.id)) {
        t.depositStatus = 'DEPOSITED';
        t.depositId = depositInfo.depositId;
        t.depositStsNo = depositInfo.stsNo;
        t.depositDate = depositInfo.depositDate;
        t.depositBank = 'Bank Jateng';
        t.depositAccountNo = '1-002-007181';
        updated = true;
      }
    });
    if (updated) {
      this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  }

  unmarkTransactionDeposit(trxId) {
    const transactions = this.getTransactions();
    const target = transactions.find(t => t.id === Number(trxId));
    if (target) {
      delete target.depositStatus;
      delete target.depositId;
      delete target.depositStsNo;
      delete target.depositDate;
      delete target.depositBank;
      delete target.depositAccountNo;
      this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  }

  // Tenants
  getTenants() {
    return this.get(STORAGE_KEYS.TENANTS);
  }

  getTenantById(id) {
    return this.getTenants().find(t => t.id === Number(id)) || null;
  }

  addTenant(tenantData) {
    const list = this.getTenants();
    const newId = list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1;
    const code = `TNT-${String(newId).padStart(3, '0')}`;
    const record = { id: newId, code, status: 'active', ...tenantData };
    list.push(record);
    this.set(STORAGE_KEYS.TENANTS, list);
    this.logAudit('CREATE', `Menambahkan master tenant baru: ${record.name}`);
    return record;
  }

  // Services
  getServices() {
    return this.get(STORAGE_KEYS.SERVICES);
  }

  getServiceById(id) {
    return this.getServices().find(s => s.id === Number(id)) || null;
  }

  // BLUD Revenue Accounts
  getBludRevenueAccounts() {
    return BLUD_REVENUE_ACCOUNTS;
  }

  // Payment Methods
  getPaymentMethods() {
    return this.get(STORAGE_KEYS.PAYMENT_METHODS);
  }

  // Audit Logs
  getAuditLogs() {
    return this.get(STORAGE_KEYS.AUDIT_LOGS);
  }

  // ==========================================================================
  // Parameter Pejabat Penandatangan Dokumen
  // ==========================================================================
  getOfficials() {
    const data = this.get(STORAGE_KEYS.OFFICIALS);
    if (!data || !Array.isArray(data) || data.length === 0) {
      this.set(STORAGE_KEYS.OFFICIALS, INITIAL_OFFICIALS);
      return INITIAL_OFFICIALS;
    }
    return data;
  }

  getOfficialByRole(roleId) {
    const list = this.getOfficials();
    const found = list.find(o => o.role === roleId || o.id === roleId);
    if (found) return found;
    // Fallback to initial
    const fallback = INITIAL_OFFICIALS.find(o => o.role === roleId || o.id === roleId);
    return fallback || { name: 'Pejabat Berwenang', nip: '-', position: 'Pejabat UPTD' };
  }

  updateOfficial(id, updatedFields) {
    const list = this.getOfficials();
    const index = list.findIndex(o => o.id === id || o.role === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      this.set(STORAGE_KEYS.OFFICIALS, list);
      this.logAudit('UPDATE', `Memperbarui parameter pejabat ${list[index].position}: ${list[index].name} (NIP: ${list[index].nip})`);
      return list[index];
    }
    return null;
  }

  updateAllOfficials(officialsArray) {
    if (!Array.isArray(officialsArray)) return false;
    this.set(STORAGE_KEYS.OFFICIALS, officialsArray);
    this.logAudit('UPDATE', `Memperbarui data parameter 4 pejabat penandatangan laporan resmi`);
    return officialsArray;
  }

  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(INITIAL_PAYMENT_METHODS));
    localStorage.setItem(STORAGE_KEYS.OFFICIALS, JSON.stringify(INITIAL_OFFICIALS));
    localStorage.setItem(STORAGE_KEYS.REKENING_KORAN, JSON.stringify(INITIAL_REKENING_KORAN));
    localStorage.setItem(STORAGE_KEYS.SETORAN_TUNAI, JSON.stringify(INITIAL_SETORAN_TUNAI));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    this.logAudit('RESET', 'Memulihkan dataset transaksi & master data demo');
    return true;
  }

  resetOfficialsToDefault() {
    this.set(STORAGE_KEYS.OFFICIALS, INITIAL_OFFICIALS);
    this.logAudit('RESET', `Mereset data parameter pejabat penandatangan ke pengaturan standar`);
    return INITIAL_OFFICIALS;
  }

  logAudit(action, description) {
    const logs = this.getAuditLogs();
    const user = this.getCurrentUser();
    const newLog = {
      id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      user: user ? user.name : 'Sistem',
      role: user ? user.role : 'admin',
      action,
      description,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep max 100 logs
    if (logs.length > 100) logs.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // User & Authentication Management
  getCurrentUser() {
    const session = this.getAuthSession();
    if (session) return session;
    return this.get(STORAGE_KEYS.CURRENT_USER) || SYSTEM_USERS.admin;
  }

  getAuthSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading auth session:', e);
      return null;
    }
  }

  isAuthenticated() {
    return this.getAuthSession() !== null;
  }

  authenticate(username, password) {
    const u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();

    if (!u || !p) {
      return { success: false, message: 'Username dan Password wajib diisi.' };
    }

    // Check admin
    const adminMatch = (
      SYSTEM_USERS.admin.username.toLowerCase() === u ||
      SYSTEM_USERS.admin.aliases.some(a => a.toLowerCase() === u)
    );
    if (adminMatch) {
      if (SYSTEM_USERS.admin.passwords.includes(p)) {
        return { success: true, user: SYSTEM_USERS.admin };
      }
      return { success: false, message: 'Password untuk akun Petugas Admin tidak valid.' };
    }

    // Check pimpinan
    const pimpinanMatch = (
      SYSTEM_USERS.pimpinan.username.toLowerCase() === u ||
      SYSTEM_USERS.pimpinan.aliases.some(a => a.toLowerCase() === u)
    );
    if (pimpinanMatch) {
      if (SYSTEM_USERS.pimpinan.passwords.includes(p)) {
        return { success: true, user: SYSTEM_USERS.pimpinan };
      }
      return { success: false, message: 'Password untuk akun Pimpinan / Kepala UPTD tidak valid.' };
    }

    return { success: false, message: 'Username tidak terdaftar dalam sistem SIDIGIMON.' };
  }

  login(userObj) {
    if (!userObj) return false;
    const sessionData = {
      ...userObj,
      loggedInAt: new Date().toISOString()
    };
    this.set(STORAGE_KEYS.AUTH_SESSION, sessionData);
    this.set(STORAGE_KEYS.CURRENT_USER, sessionData);
    this.logAudit('AUTH', `Pengguna ${sessionData.name} (${sessionData.roleTitle}) berhasil masuk ke sistem`);
    return sessionData;
  }

  logout() {
    const user = this.getCurrentUser();
    this.logAudit('AUTH', `Pengguna ${user ? user.name : 'Pengguna'} (${user ? user.roleTitle : 'User'}) keluar dari sistem`);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    return true;
  }

  setCurrentRole(roleName) {
    const user = SYSTEM_USERS[roleName] || SYSTEM_USERS.admin;
    const session = {
      ...user,
      loggedInAt: new Date().toISOString()
    };
    this.set(STORAGE_KEYS.AUTH_SESSION, session);
    this.set(STORAGE_KEYS.CURRENT_USER, session);
    this.logAudit('AUTH', `Beralih peran aktif ke: ${user.roleTitle} (${user.name})`);
    return session;
  }
}

// Global Store Instance
window.db = new DataStore();
