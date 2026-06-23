import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Bundle ID: formato reverse-domain. Cambiar cuando tengamos nombre final.
  // Ej: si la app se llama "FitTrack" y el dominio es fittrack.com → "com.fittrack.app"
  appId: 'com.pulse.gymapp',

  // Nombre que aparece debajo del ícono en el teléfono
  appName: 'Pulse',

  // Carpeta de build web que Capacitor empaqueta
  webDir: 'dist-native',

  server: {
    // En desarrollo podés apuntar al servidor local de Vite para hot-reload en el device
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },

  android: {
    // Versión mínima de Android: 6.0 (API 23) cubre el 98% de dispositivos
    minWebViewVersion: 60,
  },

  ios: {
    // Esquema de URL para deep links (opcional, cambiar con el nombre final)
    scheme: 'Pulse',
  },
};

export default config;
