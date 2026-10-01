# Operaciones Loop Gym (SOPs)

Responsable por defecto: superadmin. Registrar cada acción en un hilo de soporte con fecha y motivo.

## 1. Alta de usuario
1. El alumno se registra solo (link `#/join/CODIGO` de su entrenador) o el admin lo crea desde el panel Admin.
2. Verificar que existe la fila en `profiles` con `role = user` y `created_at` correcto (arranca el trial de 30 días).
3. Si tiene entrenador: confirmar `trainer_id` o que la solicitud en `trainer_requests` está pendiente/aceptada.
4. Usuarios creados por admin: tienen `has_changed_password = false`; se les pide cambiar la contraseña en el primer ingreso.
5. Alta de entrenador: invitación trainer-to-trainer o cambio de `role` por superadmin.

## 2. Baja de usuario
1. Pedido por el propio usuario (email o soporte). Confirmar identidad por el mismo email de la cuenta.
2. Cancelar suscripción activa en Mercado Pago antes de borrar datos.
3. Si es alumno: desvincular de su entrenador (`trainer_id = null`).
4. Eliminar la cuenta de auth y datos asociados (perfil, entrenamientos, rutinas, notificaciones). Es irreversible: avisar al usuario.
5. Si hay pagos, conservar el registro mínimo requerido contablemente.
6. Responder confirmando la baja dentro de 48 h.

## 3. Moderación de alimentos
1. Revisar alimentos cargados por usuarios (nombre, macros, duplicados) al menos 1 vez por semana.
2. Aprobar si es coherente (kcal ≈ 4P + 4C + 9G, +/-15%) y no duplica uno existente.
3. Corregir macros evidentemente erróneos o fusionar duplicados; rechazar spam u ofensivos.
4. Avisar al usuario sólo si se rechaza y el motivo no es obvio.
5. Ante un reporte de un alimento mal cargado: ocultarlo primero, revisar después.

## 4. Soporte
- Canal: email/WhatsApp de soporte. SLA: primera respuesta en 24 h hábiles.
- Triage: P0 no puede entrenar/entrar/cobros duplicados; P1 función rota con alternativa; P2 consultas y mejoras.
- Casos frecuentes: pago hecho pero sigue bloqueado (revisar `subscription_status` y `subscription_expires_at`, reconciliar con Mercado Pago); olvido de contraseña (flujo de recuperación); alumno no ve rutinas (revisar `trainer_id` y tabla `routines`).
- Todo caso repetido 3 veces se convierte en ítem del backlog o ayuda en la app.

## 5. Incidentes
1. Detectar y declarar: quién lo ve abre un hilo y asigna un responsable (IC).
2. Clasificar severidad: SEV1 caída total/pagos/pérdida de datos; SEV2 función crítica degradada; SEV3 menor.
3. Mitigar primero (rollback, desactivar función), investigar después.
4. Comunicar: SEV1/SEV2 avisar a entrenadores y usuarios afectados con estado y próxima actualización (cada 60 min en SEV1).
5. Cerrar: confirmar recuperación y verificar que no se perdieron datos (cola offline, sync).
6. Postmortem en 5 días hábiles: línea de tiempo, causa raíz, acciones con dueño y fecha. Sin culpables.
