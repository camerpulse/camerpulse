import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
}

export interface BarcodeOptions {
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14';
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'bottom' | 'top';
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
}

export class CodeGenerator {
  static async generateQRCode(text: string, options: QRCodeOptions = {}): Promise<string> {
    try {
      const qrOptions = {
        errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        type: options.type || 'image/png',
        quality: options.quality || 0.92,
        margin: options.margin || 1,
        color: {
          dark: options.color?.dark || '#000000',
          light: options.color?.light || '#FFFFFF',
        },
        width: options.width || 256,
      };

      return await QRCode.toDataURL(text, qrOptions);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static generateBarcode(text: string, options: BarcodeOptions = {}): string {
    try {
      const canvas = document.createElement('canvas');
      const barcodeOptions = {
        format: options.format || 'CODE128',
        width: options.width || 2,
        height: options.height || 100,
        displayValue: options.displayValue !== false,
        text: options.text || text,
        fontOptions: options.fontOptions || '',
        font: options.font || 'monospace',
        textAlign: options.textAlign || 'center',
        textPosition: options.textPosition || 'bottom',
        textMargin: options.textMargin || 2,
        fontSize: options.fontSize || 20,
        background: options.background || '#FFFFFF',
        lineColor: options.lineColor || '#000000',
        margin: options.margin || 10,
      };

      JsBarcode(canvas, text, barcodeOptions);
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw new Error('Failed to generate barcode');
    }
  }

  static validateBarcodeText(text: string, format: string): boolean {
    switch (format) {
      case 'CODE128':
        return /^[\x00-\x7F]*$/.test(text) && text.length > 0;
      case 'CODE39':
        return /^[0-9A-Z\-\.\$\/\+\%\s]*$/.test(text) && text.length > 0;
      case 'EAN13':
        return /^\d{12,13}$/.test(text);
      case 'EAN8':
        return /^\d{7,8}$/.test(text);
      case 'UPC':
        return /^\d{11,12}$/.test(text);
      case 'ITF14':
        return /^\d{13,14}$/.test(text);
      default:
        return text.length > 0;
    }
  }

  static getFormatDescription(format: string): string {
    switch (format) {
      case 'CODE128':
        return 'Supports all ASCII characters. Most versatile format.';
      case 'CODE39':
        return 'Supports numbers, uppercase letters, and some symbols.';
      case 'EAN13':
        return 'Standard product barcode (13 digits).';
      case 'EAN8':
        return 'Compact product barcode (8 digits).';
      case 'UPC':
        return 'Universal Product Code (12 digits).';
      case 'ITF14':
        return 'Shipping container code (14 digits).';
      default:
        return 'Standard barcode format.';
    }
  }
}

export default CodeGenerator;