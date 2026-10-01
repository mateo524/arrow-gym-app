import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Bundle ID: formato reverse-domain. Cambiar cuando tengamos nombre final.
  // Ej: si la app se llama "FitTrack" y el dominio es fittrack.com → "com.fittrack.app"
  appId: 'com.pulse.gymapp',

  // Nombre que aparece debajo del ícono en el teléfono
  appName: 'Loop Gym',

  // Carpeta de build web que Capacitor empaqueta
  webDir: 'dist-native',

  server: {
    // En desarrollo podés apuntar al servidor local de Vite para hot-reload en el device
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },

  android: {
    // minSdk 24 (Android 7.0) en android/variables.gradle; WebView 60 es el piso de Capacitor
    minWebViewVersion: 60,
  },

  ios: {
    // Esquema de URL para deep links (opcional, cambiar con el nombre final)
    scheme: 'LoopGym',
  },
};

export default config;
