import QRCode from 'qrcode';
import { createWorker } from 'tesseract.js';
import { logger } from './logger';

export const eidVerificationUtils = {
  /**
   * Generates a QR code for eID verification linking
   */
  async generateVerificationQR(data: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (error: any) {
      logger.error(`[QR_GENERATOR] Failed to generate QR: ${error.message}`);
      throw error;
    }
  },

  /**
   * Performs OCR on an image buffer (e.g. uploaded ID card)
   */
  async performOCR(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');
    try {
      logger.info('[OCR_ENGINE] Processing image buffer...');
      const { data: { text } } = await worker.recognize(imageBuffer);
      await worker.terminate();
      return text;
    } catch (error: any) {
      logger.error(`[OCR_ENGINE] OCR failed: ${error.message}`);
      if (worker) await worker.terminate();
      throw error;
    }
  }
};
