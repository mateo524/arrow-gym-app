# Loop Gym

App de entrenamiento y comidas, mobile-first. PWA (Vite + React) con empaquetado nativo vía Capacitor (Android/iOS). Backend en Supabase.

## Funciones

- Registro de entrenamientos, historial y analytics por grupo muscular (radar, mapa muscular frontal/posterior).
- Banco de ejercicios offline con filtros.
- Registro de comidas con escáner de códigos de barras.
- Medidas corporales y coach post-entreno.
- Notificaciones push (nativas).

## Desarrollo

```bash
cp .env.example .env   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm ci
npm run dev
npm test
npm run build
```

## Deploy (Vercel)

El único destino de deploy es Vercel (framework Vite, build `npm run build`, salida `dist`). Variables requeridas en Vercel: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Los headers de seguridad (CSP, HSTS, etc.) están en `vercel.json`.

La CI (`.github/workflows/ci.yml`) corre `npm ci`, `npm test`, `npm run build` y `npm audit --audit-level=high`; no despliega.

## Apps nativas

```bash
npm run sync:android && npm run open:android
npm run sync:ios && npm run open:ios
```

Ver `PUSH_SETUP.md` para notificaciones push. Pendiente manual: firma de release (keystore Android, certificados/provisioning iOS), credenciales APNs/FCM y capacidad HealthKit.
