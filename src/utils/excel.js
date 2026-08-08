import * as XLSX from 'xlsx';
import { CONFIG } from '../constants.js';
import { Capacitor } from '@capacitor/core';
import { shareExcelWorkbook } from './whatsappShare.js';

/**
 * Parses an Excel file using the global XLSX library.
 * @param {File} file 
 * @param {function} onParsed Callback on parsed array-of-arrays
 * @param {function} onError Callback on error
 */
export function parseExcelFile(file, onParsed, onError) {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      onParsed(rawData);
    } catch (err) {
      console.error(err);
      onError(err);
    }
  };
}

/**
 * Builds and downloads an Excel workbook containing logistics entries with spreadsheet formulas.
 * @param {Array} entries 
 * @param {number} globalMargin 
 * @param {string} fileName 
 * @param {string} activeVehicle 
 * @param {function} onExported Callback on successful download
 * @param {function} onError Callback on error
 */
export function generateExcelWorkbook(entries, globalMargin, fileName, activeVehicle, onExported, onError) {
  try {
    const headers = [
      'Date',
      'Challan No',
      'Gate No',
      'Loading Location',
      'Unloading Location',
      'Weight (Kilo)',
      'Rate'
    ];

    const dataRows = entries.map(e => [
      e.date,
      e.challanNo || '',
      e.gateNo || '',
      e.loading,
      e.unloading,
      e.weight,
      e.rate
    ]);

    const sheetData = [headers, ...dataRows];

    const totalRowIdx = dataRows.length + 3;
    const marginRowIdx = totalRowIdx + 1;
    const netPaymentRowIdx = marginRowIdx + 1;

    const totalRateVal = entries.reduce((sum, e) => sum + e.rate, 0);
    const netPaymentVal = totalRateVal - (totalRateVal * (globalMargin / 100));

    sheetData.push([]);

    sheetData.push([
      '', '', '', '', '', 'Total',
      { f: `SUM(G2:G${dataRows.length + 1})`, v: totalRateVal }
    ]);

    sheetData.push([
      '', '', '', '', '', 'Global Margin %',
      globalMargin / 100
    ]);

    sheetData.push([
      '', '', '', '', '', 'Net Payment',
      { f: `G${totalRowIdx}*(1-G${marginRowIdx})`, v: netPaymentVal }
    ]);

    sheetData.push([
      '', '', '', '', '', 'Vehicle No',
      "MH14-" + activeVehicle || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Formatting margin cells
    const marginCellRef = `G${marginRowIdx}`;
    if (worksheet[marginCellRef]) {
      worksheet[marginCellRef].t = 'n';
      worksheet[marginCellRef].z = '0.0%';
    }

    // Formatting entries rate column
    for (let r = 2; r <= dataRows.length + 1; r++) {
      const rateRef = `G${r}`;
      if (worksheet[rateRef]) {
        worksheet[rateRef].t = 'n';
        worksheet[rateRef].z = '#,##0.00';
      }
    }

    // Formatting total rates and payments
    const totalRateRef = `G${totalRowIdx}`;
    if (worksheet[totalRateRef]) {
      worksheet[totalRateRef].t = 'n';
      worksheet[totalRateRef].z = '#,##0.00';
    }

    const netPaymentRef = `G${netPaymentRowIdx}`;
    if (worksheet[netPaymentRef]) {
      worksheet[netPaymentRef].t = 'n';
      worksheet[netPaymentRef].z = '#,##0.00';
    }

    // Adjusting column widths
    const maxColWidths = headers.map((h, i) => {
      let maxLen = h.length;
      sheetData.forEach(row => {
        if (!row || row[i] === undefined || row[i] === null) return;
        let valStr = '';
        if (typeof row[i] === 'object') {
          if (row[i].v !== undefined) {
            valStr = String(row[i].v);
          } else if (row[i].f !== undefined) {
            valStr = '123,456.78';
          }
        } else {
          valStr = String(row[i]);
        }
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: maxLen + 3 };
    });
    worksheet['!cols'] = maxColWidths;

    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Logistics Log');

    if (Capacitor.isNativePlatform()) {
      shareExcelWorkbook(newWorkbook, fileName)
        .then(() => {
          if (onExported) onExported(fileName);
        })
        .catch((err) => {
          if (onError) onError(err);
        });
    } else {
      XLSX.writeFile(newWorkbook, fileName);
      if (onExported) onExported(fileName);
    }
  } catch (err) {
    console.error(err);
    if (onError) onError(err);
  }
}
