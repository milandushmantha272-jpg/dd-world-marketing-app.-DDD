/**
 * Web Audio Synthesizer & Web Push Notification Service
 * For DD WORLD HQ & Field Sales Reps Instant Real-time Alerts
 */

export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant double-chime (D5 to A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn('Audio chime playback disabled or muted:', e);
  }
};

export const playRingtone = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc2.frequency.setValueAtTime(480, ctx.currentTime); // Bb4

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn('Ringtone playback disabled or muted:', e);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Failed to request notification permission:', e);
    return false;
  }
};

export const triggerWebPushNotification = (
  title: string,
  body: string,
  onDeepLinkClick?: () => void
) => {
  if (typeof window === 'undefined') return;

  // 1. Play synthesized chime sound
  playNotificationChime();

  // 2. Native System / Mobile Push Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `ddworld-notif-${Date.now()}`,
        requireInteraction: true,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        if (onDeepLinkClick) {
          onDeepLinkClick();
        }
      };
    } catch (e) {
      console.warn('Native push notification error:', e);
    }
  }
};
