# Roadmap Loop Gym

Precio y trial: ver `src/config/pricing.js` (PRICE_ARS, TRIAL_DAYS). Umbral de inactividad: 5 días.
Cada ítem es una hipótesis: necesita dueño, métrica y horizonte antes de pasar a "Now".

## Next (1-2 trimestres)

| Iniciativa | Problema | Métrica de éxito | Horizonte |
|---|---|---|---|
| Preapproval de Mercado Pago (cobro recurrente) | Hoy el alumno paga a mano cada mes; hay churn involuntario y el entrenador registra "Cobrado" manualmente | % de pagos renovados sin intervención >85%; tickets de "no me renovó" -50% | Q4 |
| Plan gratis limitado | El trial de 30 días corta el hábito; cuesta convertir | Conversión trial→pago +X pp; retención D30 del plan gratis | Q4-Q1 |
| Cobro a entrenadores por alumnos activos | Los entrenadores no pagan; los ingresos dependen sólo del alumno | Ingreso por entrenador; % de entrenadores que aceptan el modelo | Q1 |

Notas de diseño:
- Preapproval: webhook que actualice `subscription_status` y `subscription_expires_at`; conciliar con `mp-create-subscription`. Riesgo: rechazo de tarjetas, definir reintentos.
- Plan gratis: definir límites (rutinas, historial, sin coach IA). Decidir qué queda detrás del paywall antes de construir.
- Cobro a entrenadores: "alumno activo" = entrenó al menos 1 vez en los últimos 30 días. Definir tramos y período de gracia.

## Later (3-6 meses)

| Iniciativa | Hipótesis | Señal para avanzar |
|---|---|---|
| Referido alumno-alumno | Un alumno que invita a otro mejora la retención de ambos | Tasa de invitación actual (`student_referrals`) y conversión del referido |
| Streak freeze | Perder la racha por un día es la principal causa de abandono | Datos de abandono tras racha rota |
| Liga sin entrenador | Usuarios sin coach pueden competir y quedarse | Cantidad de usuarios sin `trainer_id` activos |

## No estamos construyendo ahora
- Planes anuales: sin evidencia de demanda; revisar tras preapproval.
- Multi-moneda: foco en ARS.
