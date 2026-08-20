# STP e-Receipt - UPTD Kawasan Sains dan Teknologi

Aplikasi Web **STP e-Receipt** (*Optimalisasi Pengelolaan Penerimaan melalui Digitalisasi Bukti dan Monitoring Pembayaran*) dikembangkan sebagai solusi digitalisasi administrasi penerimaan, pencatatan transaksi, penerbitan kuitansi digital otomatis, dan monitoring dashboard untuk UPTD Kawasan Sains dan Teknologi.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dapat langsung dijalankan tanpa perlu instalasi server atau dependensi tambahan:
1. Buka folder `f:\latsar apin\`
2. Klik ganda (**double-click**) pada file **`index.html`**
3. Aplikasi akan otomatis terbuka di browser Anda (Google Chrome, Microsoft Edge, Firefox, dll.).

---

## 📂 Struktur File

- **`index.html`** : Halaman utama aplikasi web interaktif (Single Page App).
- **`css/style.css`** : Design system modern, responsive layout, dark/light theme, dan printable stylesheet kuitansi.
- **`js/data.js`** : Master data (Tenant & Layanan STP), data transaksi realistis 2026, dan LocalStorage database manager.
- **`js/utils.js`** : Fungsi format mata uang Rupiah, fungsi konversi angka ke kata ("Terbilang"), dan modul ekspor Excel/PDF.
- **`js/app.js`** : Logika controller aplikasi, navigasi view, Chart.js analytics, form handler, role switcher, dan audit logging.
- **`latsar.txt`** : Dokumen acuan dan rancangan inovasi proyek Latsar.

---

## 🌟 Fitur Utama

1. **Portal Login Multi-Peran (Halaman Awal)**:
   - Akses terpisah untuk **Petugas Admin** dan **Pimpinan (Kepala UPTD)**.
   - Sesi autentikasi aman, validasi input kredensial, toggle show/hide password, dan tombol keluar (*Logout*).
2. **Dashboard Monitoring Realtime (Pimpinan)**: Metrik penerimaan harian, bulanan, tahunan, rata-rata transaksi, grafik tren bulanan, dan proporsi layanan.
3. **Form Input Transaksi & Auto Numbering**: Pemilihan tenant & layanan, pilihan status (Lunas / Belum Lunas), input manual **Kekurangan Pembayaran (Rp)** dengan terbilang dinamis, penomoran bukti/kuitansi otomatis unik (`KM-26-08-008`), serta **indikator visual tanda centang (✓) jika inputan berhasil/valid dan tanda silang (✗) jika inputan gagal/belum lengkap**.
4. **Kuitansi Digital Resmi**: Kop resmi UPTD KST dengan logo Solo Technopark, cap verifikasi digital, status pelunasan dinamis (LUNAS / BELUM LUNAS), informasi kekurangan pembayaran, tombol cetak langsung & unduh PDF.
5. **Riwayat & Multi-Filter**: Pencarian live search dan multi filter (status pelunasan, rentang tanggal, tenant, layanan).
6. **Pusat Rekapitulasi & Laporan Penerimaan**:
   - **Rekapitulasi Per Layanan**: Rekap pendapatan 13 unit layanan resmi dan persentase kontribusi, **fitur Pratinjau (*Interactive Document Preview*)**, filter periode lengkap (**Harian, Bulanan, Triwulan, Semester, dan Tahunan**), cetak dokumen resmi, unduh PDF, dan ekspor Excel (`.xlsx`).
   - **Rekap Rekening Pendapatan BLUD**: Rekapitulasi 5 kelompok rekening kode pendapatan BLUD (1. Jasa Layanan, 2. Hibah, 3. Hasil Kerjasama, 4. Lain-lain Pendapatan BLUD yang Sah, 5. Jasa Giro) beserta rincian sub-layanan, **fitur Pratinjau (*Interactive Document Preview*)**, filter periode lengkap (**Harian, Bulanan, Triwulan, Semester, dan Tahunan**), cetak dokumen resmi, unduh PDF, dan ekspor Excel (`.xlsx`).
   - **Buku Kas Umum (Tunai) - Khusus Admin**: Rekapitulasi pembukuan kasir seluruh penerimaan kas tunai (*Cash*), *running balance* saldo kasir otomatis, **fitur Pratinjau (*Interactive Document Preview*)**, filter periode lengkap (**Harian, Bulanan, Triwulan, Semester, dan Tahunan**), cetak dokumen resmi BKU Tunai, unduh PDF, dan ekspor Excel (`.xlsx`).
   - **Rekap Penerimaan Kas (Cash & Transfer) - Khusus Admin**: Rekapitulasi komparatif metode pembayaran Cash dan Transfer secara terpisah dengan tabel bertingkat (*stacked*), **fitur Pratinjau (*Interactive Document Preview*)**, filter periode lengkap (**Harian, Bulanan, Triwulan, Semester, dan Tahunan**), cetak dokumen resmi Rekap Kas, unduh PDF, dan ekspor Excel (`.xlsx`).
8. **Manajemen & Unggah Rekening Koran Bank (Menu Utama)**:
   - Pengunggahan berkas digital rekening koran resmi bank penerimaan (**Bank Jateng** & **Bank Mandiri**).
   - Fitur pilihan **Bulan** lengkap dari **Januari sampai Desember**.
   - Fitur pilihan **Tahun** hingga **2030** (2024 s/d 2030).
   - Area *Drag & Drop* berkas dengan dukungan format PDF, Excel (`.xlsx`, `.xls`), CSV, dan Gambar.
   - Filter arsip dokumen (Tahun, Bulan, Bank, Live Search), pratinjau (*preview*) berkas, dan tombol unduh (*download*).
9. **Manajemen & Monitoring Setoran Tunai Kas BLUD (Khusus Rekening Bank Jateng `1-002-007181`)**:
   - Menu utama baru di sidebar tepat di bawah **Rekening Koran** dengan badge `Bank Jateng`.
   - Widget eksekutif **Monitoring Setoran Tunai** pada Dashboard utama dengan tombol filter cepat (Hari Ini, Bulan Ini, Triwulan, Semester, dan Tahun 2026).
   - Filter periode komprehensif pada halaman utama: **Harian (Daily)**, **Bulanan (Monthly)**, **Triwulan (Quarterly)**, **Semester (Half-Yearly)**, dan **Tahunan (Yearly)**.
   - Pemantauan status kas tunai: **Disetor ke Bank Jateng (STS)** vs **Belum Disetor (Sisa Fisik Kas)**.
   - Pencatatan Surat Tanda Setoran (**STS**) ke Bank Jateng (`1-002-007181`) dengan multi-select transaksi, validasi teller, dan unggah berkas slip setoran fisik.
   - **Pratinjau Lembar Bukti Setoran Resmi**: Lembar cetak berformat standar UPTD KST & Bank Jateng KC Surakarta lengkap dengan terbilang Rupiah dan 2 penandatangan resmi (Bendahara Penerimaan & Bendahara BLUD / Kepala UPTD).
   - Ekspor data rekapitulasi setoran ke format **Microsoft Excel (`.xlsx`)** dan cetak langsung.
10. **Manajemen Master Data**: Katalog tarif/layanan resmi dan kanal pembayaran UPTD.
11. **Audit Trail**: Pencatatan riwayat aktivitas pengguna (termasuk login/logout, upload rekening koran, pencatatan setoran tunai, dan edit catatan) untuk transparansi dan akuntabilitas.

---

## 🔐 Kredensial Login Demo

| Peran Pengguna | Username | Password | Nama Pejabat / Petugas | Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Petugas Admin** | `admin` | `admin123` | Alvin Prayogo Anindito, A.Md.Ak | Akses penuh (Input transaksi, Buku Kas Umum Tunai & Rekap Kas di menu Rekap & Laporan, Rekap Rekening Pendapatan BLUD, kelola master data, kuitansi, audit log, cetak laporan & ekspor Excel) |
| **Pimpinan UPTD** | `pimpinan` | `pimpinan123` | Rony Widjanarko SH. MH (Kepala UPTD) | Akses monitoring eksekutif (Dashboard analytics, Rekap Rekening Pendapatan BLUD, rekapitulasi per layanan berfilter tanggal, riwayat transaksi, audit log) |

---

## 📋 Daftar 13 Jenis Layanan UPTD KST

1. **001 Praktek kerja industry**
2. **002 Pelatihan Reguler (Basic, Applied, OJT)**
3. **003 Pelatihan Underwater Wet welding**
4. **004 Pelayanan Measuring Tool 8s Calibration**
5. **005 Kerjasama**
6. **006 Sewa Tenant Foodpark**
7. **007 Solo Science Center (SSC)**
8. **008 Sewa Ruangan Aula/Teori/Meeting Gedung Rnd**
9. **009 Sewa Lapangan Basket/Futsal**
10. **010 Sewa Ruang Podcast**
11. **011 Kontribusi Listrik**
12. **012 Jasa Giro**
13. **013 Hibah**

---

## 💳 Metode Pembayaran Resmi
1. **Cash** (Pembayaran Tunai Langsung ke Kasir / Bendahara)
2. **Transfer** (Rekening Resmi Penerimaan UPTD / Kasda)
3. **Transfer Tanpa Bukti (KM)** (Mutasi / Rekening Koran Bank Tanpa Bukti Fisik)




