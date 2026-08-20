/**
 * STP e-Receipt - Utility Functions
 * UPTD Kawasan Sains dan Teknologi
 */

/**
 * Format number to Indonesian Rupiah currency format
 * @param {number|string} amount
 * @returns {string} e.g. "Rp 2.500.000" or "Rp 2.500.000,50"
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return 'Rp 0';
  let num = amount;
  if (typeof num === 'string') {
    let clean = num.trim();
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    num = parseFloat(clean);
  }
  if (isNaN(num)) return 'Rp 0';

  const hasDecimals = num % 1 !== 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num).replace('IDR', 'Rp').trim();
}

/**
 * Convert number (with up to 2 decimal places) to Indonesian words (Terbilang)
 * @param {number|string} number
 * @returns {string} e.g. "Dua Juta Lima Ratus Ribu Rupiah" or "Dua Juta Lima Ratus Ribu Koma Lima Puluh Rupiah"
 */
function terbilangRupiah(number) {
  if (number === null || number === undefined || number === '') return 'Nol Rupiah';
  
  let numVal = number;
  if (typeof numVal === 'string') {
    let clean = numVal.trim();
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    numVal = parseFloat(clean);
  }

  if (isNaN(numVal) || numVal === 0) return 'Nol Rupiah';

  const num = Math.abs(numVal);
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function convert(n) {
    let result = '';
    n = Math.floor(n);
    if (n < 12) {
      result = bilangan[n];
    } else if (n < 20) {
      result = convert(n - 10) + ' Belas';
    } else if (n < 100) {
      result = convert(Math.floor(n / 10)) + ' Puluh ' + convert(n % 10);
    } else if (n < 200) {
      result = 'Seratus ' + convert(n - 100);
    } else if (n < 1000) {
      result = convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
    } else if (n < 2000) {
      result = 'Seribu ' + convert(n - 1000);
    } else if (n < 1000000) {
      result = convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
    } else if (n < 1000000000) {
      result = convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
    } else if (n < 1000000000000) {
      result = convert(Math.floor(n / 1000000000)) + ' Miliar ' + convert(n % 1000000000);
    } else {
      result = convert(Math.floor(n / 1000000000000)) + ' Triliun ' + convert(n % 1000000000000);
    }
    return result.trim();
  }

  // Format to 2 decimal places fixed string to handle fractions accurately
  const fixedStr = num.toFixed(2);
  const parts = fixedStr.split('.');
  const intVal = parseInt(parts[0], 10);
  const decStr = parts[1]; // e.g. "00", "50", "05", "25"
  const decVal = parseInt(decStr, 10);

  let hasil = '';
  if (intVal === 0) {
    hasil = 'Nol';
  } else {
    hasil = convert(intVal);
  }

  // Mention decimals up to 2 digits behind comma if decimal > 0
  if (decVal > 0) {
    let decWords = '';
    if (decStr.startsWith('0')) {
      const secondDigit = parseInt(decStr[1], 10);
      decWords = 'Nol ' + bilangan[secondDigit];
    } else {
      decWords = convert(decVal);
    }
    hasil += ' Koma ' + decWords;
  }

  return (hasil + ' Rupiah').replace(/\s+/g, ' ').trim();
}

/**
 * Format ISO date or date string into Indonesian format
 * @param {string|Date} dateInput
 * @param {boolean} includeTime
 * @returns {string} e.g. "14 Agustus 2026" or "14 Agustus 2026, 09:30 WIB"
 */
function formatDateIndo(dateInput, includeTime = false) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let formatted = `${day} ${month} ${year}`;
  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    formatted += `, ${hours}:${minutes} WIB`;
  }
  return formatted;
}

/**
 * Show a sleek modern toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const colors = {
    success: { bg: '#059669', icon: '✓' },
    error: { bg: '#e11d48', icon: '✕' },
    warning: { bg: '#d97706', icon: '⚠' },
    info: { bg: '#4f46e5', icon: 'ℹ' }
  };
  const theme = colors[type] || colors.info;

  toast.style.cssText = `
    background: ${theme.bg};
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 400px;
  `;

  toast.innerHTML = `<span style="font-size:16px;">${theme.icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Export table data or structured array to Excel (.xlsx) using SheetJS
 * @param {Array<Object>} data
 * @param {string} fileName
 */
function exportToExcel(data, fileName = 'Laporan_Penerimaan_STP.xlsx') {
  if (!window.XLSX) {
    showToast('Library Excel belum dimuat. Pastikan koneksi internet aktif.', 'error');
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penerimaan');

    // Auto column width adjustment
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(item => String(item[key] || '').length)) + 3
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, fileName);
    showToast(`Berhasil mengekspor ${fileName}`, 'success');
  } catch (err) {
    console.error('Export Excel Error:', err);
    showToast('Gagal melakukan ekspor data Excel.', 'error');
  }
}
