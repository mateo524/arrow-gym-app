# Setup de Web Push Notifications

## 1. Generar VAPID keys

```bash
npx web-push generate-vapid-keys
```

## 2. Agregar al `.env` local

```
VITE_VAPID_PUBLIC_KEY=<public key>
```

## 3. Agregar secrets a Supabase Edge Functions

```bash
supabase secrets set VAPID_PUBLIC_KEY=<public key>
supabase secrets set VAPID_PRIVATE_KEY=<private key>
```

## 4. Deploy Edge Function

```bash
supabase functions deploy send-push
```

## 5. Aplicar migration de base de datos

```bash
supabase db push
```

## 6. Integrar en la app

Importar desde `src/lib/pushNotifications.js`:

```js
import {
  requestPushPermission,
  subscribeToPush,
  scheduleRestTimerPush,
  isPushSupported,
  isIosNotInstalled,
} from './lib/pushNotifications';
```

**Flujo típico al iniciar sesión:**
1. Llamar `requestPushPermission()` para pedir permiso al usuario
2. Llamar `subscribeToPush(userId, supabaseClient)` para registrar la subscription
3. Al iniciar un timer de descanso, llamar `scheduleRestTimerPush(subscription, delaySeconds)`

**Nota iOS:** Push notifications solo funcionan en iOS si la PWA está instalada en la pantalla de inicio.
Usar `isIosNotInstalled()` para mostrar el banner de instalación en iOS antes de pedir permiso.

## Arquitectura

```
App  →  scheduleRestTimerPush()
      →  POST /functions/v1/send-push  (con delaySeconds)
            →  Supabase Edge Function (Deno)
                  →  web-push → FCM / APNs
                        →  reactiva SW aunque esté muerto
                              →  push event en sw.js
                                    →  showNotification()
```
