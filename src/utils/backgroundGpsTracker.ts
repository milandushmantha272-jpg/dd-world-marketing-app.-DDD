// DD WORLD MARKETING PVT LIMITED - Native Background & Diagnostic Geolocation Tracker
// Works seamlessly across PWA / Web Browsers / Android WebView Containers
import { safeStorage } from './safeStorage';
import { detectFakeGps } from './antiCheatDetector';

export interface DiagnosticLocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
  appState: 'FOREGROUND' | 'BACKGROUND';
  networkState: 'ONLINE' | 'OFFLINE';
  gpsState: 'ON' | 'OFF' | 'UNAVAILABLE';
  timestamp: string;
}

export interface OfflineGpsRecord extends DiagnosticLocationUpdate {
  userId: string;
  sessionId: string;
}

const OFFLINE_QUEUE_KEY = 'ddworld_offline_gps_queue_v1';

class BackgroundGpsTrackerManager {
  private watchId: number | null = null;
  private intervalId: any = null;
  private wakeLock: any = null;
  private isTrackingActive = false;
  private currentUserId: string | null = null;
  private currentSessionId: string | null = null;
  private onUpdateCallback: ((data: DiagnosticLocationUpdate) => void) | null = null;

  public appState: 'FOREGROUND' | 'BACKGROUND' = 'FOREGROUND';
  public networkState: 'ONLINE' | 'OFFLINE' = typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'OFFLINE';
  public gpsState: 'ON' | 'OFF' | 'UNAVAILABLE' = 'ON';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  private initListeners() {
    // 1. Page Visibility API Listeners
    document.addEventListener('visibilitychange', () => {
      this.appState = document.visibilityState === 'visible' ? 'FOREGROUND' : 'BACKGROUND';
      console.log(`[DD WORLD GPS Tracker] App state changed: ${this.appState}`);
    });

    window.addEventListener('blur', () => {
      this.appState = 'BACKGROUND';
    });

    window.addEventListener('focus', () => {
      this.appState = 'FOREGROUND';
    });

    // 2. Network Connectivity Listeners
    window.addEventListener('online', () => {
      this.networkState = 'ONLINE';
      console.log('[DD WORLD GPS Tracker] Network ONLINE. Flushing offline queue...');
      this.flushOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.networkState = 'OFFLINE';
      console.log('[DD WORLD GPS Tracker] Network OFFLINE. Offline buffer queue active.');
    });
  }

  // Request Screen WakeLock to prevent browser sleep when app is active
  private async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('[DD WORLD GPS Tracker] WakeLock acquired successfully.');
      } catch (err) {
        console.warn('[DD WORLD GPS Tracker] WakeLock request failed:', err);
      }
    }
  }

  // Release Screen WakeLock
  private releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
        this.wakeLock = null;
      } catch (e) {
        // ignore
      }
    }
  }

  // Start continuous background geolocation watch
  public startTracking(
    userId: string,
    sessionId: string,
    onUpdate: (data: DiagnosticLocationUpdate) => void
  ) {
    this.currentUserId = userId;
    this.currentSessionId = sessionId;
    this.onUpdateCallback = onUpdate;
    this.isTrackingActive = true;

    this.requestWakeLock();

    if (!('geolocation' in navigator)) {
      this.gpsState = 'UNAVAILABLE';
      return;
    }

    // Direct Position Capture
    this.captureSinglePosition();

    // 1. Hardware Watch Position
    try {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.gpsState = 'ON';
          this.handleNewPosition(position);
        },
        (error) => {
          console.warn('[DD WORLD GPS Tracker] Geolocation Watch Error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            this.gpsState = 'OFF';
          } else {
            this.gpsState = 'UNAVAILABLE';
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      console.warn('[DD WORLD GPS Tracker] WatchPosition exception:', err);
    }

    // 2. Adaptive Heartbeat Interval (30s) to guarantee background execution
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        if (this.isTrackingActive) {
          this.captureSinglePosition();
        }
      }, 30000);
    }
  }

  public stopTracking() {
    this.isTrackingActive = false;
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.releaseWakeLock();
  }

  private captureSinglePosition() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.gpsState = 'ON';
        this.handleNewPosition(pos);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          this.gpsState = 'OFF';
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  private handleNewPosition(position: GeolocationPosition) {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    const timestamp = new Date().toISOString();

    // Anti-Cheat Check: Detect Mock Location / Fake GPS Injection
    const fakeCheck = detectFakeGps(position.coords);
    if (fakeCheck.isFake) {
      console.warn('[DD WORLD Anti-Cheat] Spoofed GPS signal detected:', fakeCheck.reason);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ddworld_fake_gps_detected', {
            detail: {
              userId: this.currentUserId,
              coords: { latitude, longitude, accuracy },
              reason: fakeCheck.reason,
              confidence: fakeCheck.confidence,
              timestamp,
            },
          })
        );
      }
      // Drop spoofed coordinate to protect system integrity
      return;
    }

    const update: DiagnosticLocationUpdate = {
      latitude,
      longitude,
      accuracy: Math.round(accuracy),
      speed: speed || null,
      heading: heading || null,
      appState: this.appState,
      networkState: this.networkState,
      gpsState: this.gpsState,
      timestamp,
    };

    if (this.networkState === 'OFFLINE') {
      this.enqueueOfflineRecord(update);
    } else {
      if (this.onUpdateCallback) {
        this.onUpdateCallback(update);
      }
    }
  }

  // Save record to local device buffer when network is offline
  private enqueueOfflineRecord(update: DiagnosticLocationUpdate) {
    if (!this.currentUserId || !this.currentSessionId) return;

    const offlineRecord: OfflineGpsRecord = {
      ...update,
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
    };

    try {
      const existingStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: OfflineGpsRecord[] = existingStr ? JSON.parse(existingStr) : [];
      queue.push(offlineRecord);
      // Cap offline queue to last 200 points to prevent storage bloating
      const cappedQueue = queue.slice(-200);
      safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(cappedQueue));
      console.log(`[DD WORLD GPS Tracker] Queued offline record (Total in queue: ${cappedQueue.length})`);
    } catch (e) {
      console.warn('[DD WORLD GPS Tracker] Offline queue write error:', e);
    }
  }

  // Flush buffered offline records to server when network reconnects
  public async flushOfflineQueue() {
    try {
      const existingStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!existingStr) return;
      const queue: OfflineGpsRecord[] = JSON.parse(existingStr);
      if (!queue.length) return;

      console.log(`[DD WORLD GPS Tracker] Synchronizing ${queue.length} offline GPS records...`);
      safeStorage.removeItem(OFFLINE_QUEUE_KEY);

      for (const record of queue) {
        if (this.onUpdateCallback) {
          this.onUpdateCallback(record);
        }
      }
    } catch (e) {
      console.warn('[DD WORLD GPS Tracker] Offline queue flush error:', e);
    }
  }
}

export const backgroundGpsTracker = new BackgroundGpsTrackerManager();
