import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import * as XLSX from 'xlsx';

// Destination WhatsApp number in international format without + or other symbols
export const WHATSAPP_NUMBER = '919359458757';

/**
 * Checks if the application is running on a native platform (Android/iOS) via Capacitor.
 * @returns {boolean}
 */
export function isCapacitorNative() {
  return Capacitor.isNativePlatform();
}

/**
 * Saves a SheetJS workbook as an XLSX file in the app's cache storage
 * and shares it via the native system sharing sheet.
 * 
 * @param {object} workbook - The SheetJS workbook object
 * @param {string} fileName - Name of the Excel file
 * @returns {Promise<void>} Resolves on success, rejects on error
 */
export async function shareExcelWorkbook(workbook, fileName) {
  if (!isCapacitorNative()) {
    throw new Error('Native platform is not detected.');
  }

  try {
    // 1. Generate Excel binary data as Base64 representation
    const base64Data = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

    // 2. Save the file to the temporary cache directory (no runtime permissions required)
    const writeResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    // 3. Share the file via Capacitor native Share plugin
    // Although the Share sheet opens general sharing targets, we prefill metadata
    // directing user action toward WhatsApp and the configured number.
    await Share.share({
      title: fileName,
      text: `Excel report for ${fileName.replace('.xlsx', '')}. (Recipient: ${WHATSAPP_NUMBER})`,
      url: writeResult.uri,
      dialogTitle: 'Share Excel to WhatsApp',
    });
  } catch (error) {
    // Propagate the error so the caller can distinguish cancelled actions
    throw error;
  }
}
