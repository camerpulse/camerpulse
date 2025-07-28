import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateTrackingURL } from '@/utils/labelGeneration';

export interface ScanLogEntry {
  id: string;
  tracking_number: string;
  scan_type: string;
  scanned_at: string;
  shipment_id?: string;
  scan_location?: string;
  device_info?: any;
  user_agent?: string;
  ip_address?: string;
  redirected_to?: string;
  redirect_successful: boolean;
}

export interface ScanStats {
  total_scans: number;
  successful_scans: number;
  failed_scans: number;
  unique_tracking_numbers: number;
  scan_types: {
    qr_code: number;
    barcode: number;
  };
  recent_scans: ScanLogEntry[];
}

export const useLabelScanning = () => {
  const [loading, setLoading] = useState(false);
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Log a scan event (simplified to match actual schema)
  const logScan = useCallback(async (
    trackingNumber: string,
    scanType: 'qr_code' | 'barcode',
    options: {
      location?: string;
      deviceInfo?: any;
      additionalData?: any;
      success?: boolean;
    } = {}
  ) => {
    try {
      const redirectUrl = generateTrackingURL(trackingNumber);
      
      const scanData = {
        tracking_number: trackingNumber,
        scan_type: scanType,
        scan_location: options.location,
        device_info: options.deviceInfo || {},
        user_agent: navigator.userAgent,
        redirected_to: redirectUrl,
        redirect_successful: options.success !== false,
      };

      const { data, error } = await supabase
        .from('label_scan_logs')
        .insert(scanData)
        .select()
        .single();

      if (error) throw error;

      // Add to local logs  
      setScanLogs(prev => [data as ScanLogEntry, ...prev.slice(0, 49)]);

      return data;
    } catch (error) {
      console.error('Error logging scan:', error);
      throw error;
    }
  }, []);

  // Process QR code scan
  const processQRScan = useCallback(async (
    qrData: string,
    options: {
      location?: string;
      deviceInfo?: any;
      autoRedirect?: boolean;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Extract tracking number from QR data
      let trackingNumber = qrData;
      
      // If QR contains a URL, extract tracking number
      if (qrData.includes('/track/')) {
        const match = qrData.match(/\/track\/([^/?]+)/);
        if (match) {
          trackingNumber = match[1];
        }
      }

      // Log the scan
      const scanLog = await logScan(trackingNumber, 'qr_code', {
        location: options.location,
        deviceInfo: options.deviceInfo,
        additionalData: { originalQRData: qrData },
        success: true,
      });

      // Auto-redirect if enabled
      if (options.autoRedirect !== false) {
        const trackingUrl = generateTrackingURL(trackingNumber);
        window.open(trackingUrl, '_blank');
      }

      toast({
        title: "QR Code Scanned",
        description: `Tracking: ${trackingNumber}`,
      });

      return { trackingNumber, scanLog };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process QR scan';
      setError(errorMessage);
      
      // Log failed scan
      try {
        await logScan(qrData, 'qr_code', {
          location: options.location,
          deviceInfo: options.deviceInfo,
          additionalData: { error: errorMessage },
          success: false,
        });
      } catch (logError) {
        console.error('Error logging failed scan:', logError);
      }

      toast({
        title: "Scan Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, logScan]);

  // Process barcode scan
  const processBarcodeScan = useCallback(async (
    barcodeData: string,
    options: {
      location?: string;
      deviceInfo?: any;
      autoRedirect?: boolean;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      // For barcodes, the data is typically the tracking number itself
      const trackingNumber = barcodeData.trim();

      // Log the scan
      const scanLog = await logScan(trackingNumber, 'barcode', {
        location: options.location,
        deviceInfo: options.deviceInfo,
        additionalData: { originalBarcodeData: barcodeData },
        success: true,
      });

      // Auto-redirect if enabled
      if (options.autoRedirect !== false) {
        const trackingUrl = generateTrackingURL(trackingNumber);
        window.open(trackingUrl, '_blank');
      }

      toast({
        title: "Barcode Scanned",
        description: `Tracking: ${trackingNumber}`,
      });

      return { trackingNumber, scanLog };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process barcode scan';
      setError(errorMessage);
      
      // Log failed scan
      try {
        await logScan(barcodeData, 'barcode', {
          location: options.location,
          deviceInfo: options.deviceInfo,
          additionalData: { error: errorMessage },
          success: false,
        });
      } catch (logError) {
        console.error('Error logging failed scan:', logError);
      }

      toast({
        title: "Scan Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, logScan]);

  // Fetch scan logs
  const fetchScanLogs = useCallback(async (
    trackingNumber?: string,
    limit: number = 50
  ) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('label_scan_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (trackingNumber) {
        query = query.eq('tracking_number', trackingNumber);
      }

      const { data, error } = await query;

      if (error) throw error;

      setScanLogs(data as ScanLogEntry[] || []);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scan logs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get scan statistics
  const getScanStats = useCallback(async (
    dateRange?: { start: Date; end: Date }
  ): Promise<ScanStats | null> => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('label_scan_logs').select('*');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const logs = data || [];
      
      const stats: ScanStats = {
        total_scans: logs.length,
        successful_scans: logs.filter(log => log.redirect_successful).length,
        failed_scans: logs.filter(log => !log.redirect_successful).length,
        unique_tracking_numbers: new Set(logs.map(log => log.tracking_number)).size,
        scan_types: {
          qr_code: logs.filter(log => log.scan_type === 'qr_code').length,
          barcode: logs.filter(log => log.scan_type === 'barcode').length,
        },
        recent_scans: logs.slice(0, 10) as ScanLogEntry[],
      };

      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get scan statistics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get device info for logging
  const getDeviceInfo = useCallback(() => {
    const deviceInfo: any = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString(),
    };

    // Add geolocation if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          deviceInfo.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
        },
        (error) => {
          console.warn('Geolocation error:', error);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }

    return deviceInfo;
  }, []);

  return {
    loading,
    error,
    scanLogs,
    processQRScan,
    processBarcodeScan,
    fetchScanLogs,
    getScanStats,
    getDeviceInfo,
    logScan,
  };
};