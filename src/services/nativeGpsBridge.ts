import { Capacitor, registerPlugin } from '@capacitor/core';

export interface NativeGpsBridgePlugin {
  startTracking(options: {
    employeeId: string;
    agentCode: string;
    teamId: string;
    trackingSessionId: string;
  }): Promise<{ status: string; message: string }>;
  stopTracking(): Promise<{ status: string; message: string }>;
  getTrackingStatus(): Promise<{
    isServiceRunning: boolean;
    isAuthorized: boolean;
    activeSessionId: string;
    isBatteryOptimizationIgnored: boolean;
  }>;
}

const NativeGpsBridge = registerPlugin<NativeGpsBridgePlugin>('NativeGpsBridge');

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform() || (typeof window !== 'undefined' && (window as any).Capacitor?.isNative);
};

export const startNativeForegroundGpsTracking = async (params: {
  employeeId: string;
  agentCode: string;
  teamId: string;
  trackingSessionId: string;
}) => {
  if (isNativePlatform()) {
    try {
      const result = await NativeGpsBridge.startTracking(params);
      console.log('⚡ Native Android Location Service Started:', result);
      return result;
    } catch (err) {
      console.error('Failed to start native location tracking:', err);
    }
  } else {
    console.log('🌐 Web Environment Detected: Using PWA Foreground Location Listener + Cloud Server Sync API');
  }
};

export const stopNativeForegroundGpsTracking = async () => {
  if (isNativePlatform()) {
    try {
      const result = await NativeGpsBridge.stopTracking();
      console.log('🛑 Native Android Location Service Stopped:', result);
      return result;
    } catch (err) {
      console.error('Failed to stop native location tracking:', err);
    }
  }
};

export const checkNativeGpsStatus = async () => {
  if (isNativePlatform()) {
    try {
      return await NativeGpsBridge.getTrackingStatus();
    } catch (err) {
      console.error('Error fetching native GPS status:', err);
    }
  }
  return {
    isServiceRunning: false,
    isAuthorized: false,
    activeSessionId: '',
    isBatteryOptimizationIgnored: true,
  };
};
