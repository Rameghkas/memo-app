/**
 * Formats a number to Indian currency format (Lakhs/Crores grouping)
 * with two decimal places.
 * @param {number} val 
 * @returns {string}
 */
export function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

/**
 * Formats date string from YYYY-MM-DD to DD/MM/YYYY
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDateToDMY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Normalizes and formats Excel dates (numbers, Date objects, or string patterns) to DD/MM/YYYY
 * @param {*} cellVal 
 * @returns {string}
 */
export function formatExcelDate(cellVal) {
  if (!cellVal) return '';
  if (cellVal instanceof Date) {
    const dd = String(cellVal.getDate()).padStart(2, '0');
    const mm = String(cellVal.getMonth() + 1).padStart(2, '0');
    const yyyy = cellVal.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  if (typeof cellVal === 'number') {
    // Excel base date is Dec 30, 1899
    const date = new Date(Math.round((cellVal - 25569) * 86400 * 1000));
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  if (typeof cellVal === 'string') {
    if (cellVal.includes('-')) {
      const parts = cellVal.split('-');
      if (parts[0].length === 4) { // YYYY-MM-DD
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return cellVal;
  }
  return String(cellVal);
}
