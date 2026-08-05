const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function requestPushPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { supported: false, reason: 'Browser no soporta push' };
  }
  const permission = await Notification.requestPermission();
  return { supported: true, permission };
}

export async function subscribeToPush(userId, supabaseClient) {
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      if (!VAPID_PUBLIC_KEY) {
        console.warn('VITE_VAPID_PUBLIC_KEY not set — push disabled');
        return null;
      }
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    // Guardar subscription en Supabase
    if (userId && supabaseClient) {
      await supabaseClient.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(sub),
        updated_at: new Date().toISOString()
      });
    }
    return sub;
  } catch (e) {
    console.warn('Push subscription failed:', e);
    return null;
  }
}

export async function scheduleRestTimerPush(delaySeconds, supabaseClient) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: { session } } = await supabaseClient.auth.getSession();
    const token = session?.access_token;
    if (!token) { console.warn('No session token — push skipped'); return; }
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Loop — Descanso terminado',
        body: 'Lista para la proxima serie.',
        tag: 'rest-timer',
        delaySeconds,
      })
    });
  } catch (e) {
    console.warn('Schedule push failed:', e);
  }
}

export function isPushSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function isIosNotInstalled() {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone;
  return isIos && !isStandalone;
}
