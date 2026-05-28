# Arrow Gym V4

App de entrenamiento mobile-first para iPhone.

## Qué corrige esta versión

- Usa el historial original de la primera carpeta/ZIP como seed base.
- Migra entrenamientos anteriores desde localStorage si se deploya en el mismo dominio.
- Recupera el coach post-entreno con estado, alertas, recomendaciones y volumen.
- Corrige hombros en analytics: Landmine Shoulder Press, Cable Lateral Raise y Cable Face Pull cuentan como Hombros.
- Mapa muscular frontal/posterior más profesional.
- Radar: Hombros, Pecho, Espalda, Brazos, Piernas y Core.
- Banco grande de ejercicios offline con filtros.

## Deploy Vercel

```bash
npm install
npm run build
```

En Vercel:

- Framework: Vite
- Build command: npm run build
- Output directory: dist

No subir node_modules, dist ni package-lock.json.
