import { safeStorage } from './safeStorage';

export interface OfflineQueuedAction {
  id: string;
  type: 'attendance' | 'call_log' | 'sale' | 'leave' | 'gps_location' | 'generic';
  payload: any;
  timestamp: string;
  retryCount: number;
}

const STORAGE_KEY = 'ddworld_offline_queue_v1';

export class OfflineSyncManager {
  private static listeners: Set<(queue: OfflineQueuedAction[]) => void> = new Set();

  static getQueue(): OfflineQueuedAction[] {
    try {
      const raw = safeStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static enqueue(type: OfflineQueuedAction['type'], payload: any): OfflineQueuedAction {
    const queue = this.getQueue();
    const newAction: OfflineQueuedAction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    queue.push(newAction);
    this.saveQueue(queue);
    this.notifyListeners(queue);
    return newAction;
  }

  static dequeue(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
    this.notifyListeners(queue);
  }

  static clearQueue(): void {
    safeStorage.removeItem(STORAGE_KEY);
    this.notifyListeners([]);
  }

  private static saveQueue(queue: OfflineQueuedAction[]): void {
    try {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save offline queue to storage:', e);
    }
  }

  static subscribe(listener: (queue: OfflineQueuedAction[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getQueue());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(queue: OfflineQueuedAction[]): void {
    this.listeners.forEach((listener) => {
      try {
        listener(queue);
      } catch (err) {
        console.error('Error notifying offline sync listener:', err);
      }
    });
  }

  /**
   * Process all queued items when internet connection is restored
   */
  static async flushQueue(onItemProcessed?: (action: OfflineQueuedAction) => Promise<boolean>): Promise<number> {
    if (!navigator.onLine) return 0;
    const queue = this.getQueue();
    if (queue.length === 0) return 0;

    let processedCount = 0;
    const remaining: OfflineQueuedAction[] = [];

    for (const action of queue) {
      try {
        let success = true;
        if (onItemProcessed) {
          success = await onItemProcessed(action);
        } else {
          // Default post to sync endpoint
          const res = await fetch('/api/sync/offline-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
          });
          success = res.ok;
        }

        if (success) {
          processedCount++;
        } else {
          action.retryCount += 1;
          if (action.retryCount < 5) {
            remaining.push(action);
          }
        }
      } catch (err) {
        console.warn(`Failed to process queued offline item ${action.id}:`, err);
        action.retryCount += 1;
        if (action.retryCount < 5) {
          remaining.push(action);
        }
      }
    }

    this.saveQueue(remaining);
    this.notifyListeners(remaining);
    return processedCount;
  }
}
