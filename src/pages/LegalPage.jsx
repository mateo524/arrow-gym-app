import { useState } from "react";

// ⚠ BORRADOR: revisar con un/a abogado/a matriculado/a antes de publicar.
const PROVEEDOR = "[COMPLETAR: razón social, CUIT, domicilio]";
const EMAIL_CONTACTO = "[COMPLETAR: email de contacto/privacidad]";

const TABS = [
  { id: "terminos", label: "Términos" },
  { id: "privacidad", label: "Privacidad" },
  { id: "reembolso", label: "Reembolsos" },
  { id: "salud", label: "Aviso de salud" },
];

export function legalHref(id = "terminos") {
  return `#/legal/${id}`;
}

function sectionFromHash() {
  const m = window.location.hash.match(/^#\/?legal\/([a-z]+)/);
  return m && TABS.some((t) => t.id === m[1]) ? m[1] : "terminos";
}

const h2 = { fontSize: 16, fontWeight: 800, margin: "22px 0 8px" };
const p = { fontSize: 13.5, lineHeight: 1.6, color: "var(--text)", margin: "0 0 10px" };
const ul = { ...p, paddingLeft: 20 };

function Terminos() {
  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Términos y Condiciones</h1>
      <p style={{ ...p, color: "var(--muted)" }}>Última actualización: [COMPLETAR: fecha]</p>

      <h2 style={h2}>1. Quién brinda el servicio</h2>
      <p style={p}>Loop Gym (la "App") es provista por {PROVEEDOR} (el "Proveedor"). Al crear una cuenta o usar la App aceptás estos Términos, la Política de Privacidad, la Política de Reembolsos y el Aviso de Salud.</p>

      <h2 style={h2}>2. Quién puede usarla</h2>
      <p style={p}>Tenés que ser mayor de 18 años y tener capacidad legal para contratar. Si sos menor, solo podés usarla con autorización y supervisión de tu madre, padre o tutor.</p>

      <h2 style={h2}>3. Qué ofrece la App</h2>
      <p style={p}>Registro de entrenamientos, rutinas, mediciones corporales, registro de comidas, fotos de progreso, coach y vinculación con entrenadores. Algunas funciones requieren suscripción paga.</p>

      <h2 style={h2}>4. Cuenta y seguridad</h2>
      <p style={p}>Sos responsable de la confidencialidad de tu contraseña y de la actividad de tu cuenta. Los datos que cargues tienen que ser veraces. Avisanos ante cualquier uso no autorizado.</p>

      <h2 style={h2}>5. Prueba gratuita, precio y suscripción</h2>
      <p style={p}>Hay una prueba gratuita de 30 días. Después, el plan mensual cuesta $10.000 ARS (IVA incluido si corresponde), que se abona por Mercado Pago por períodos de 30 días, sin débito automático [COMPLETAR: confirmar si hay renovación automática]. Si no renovás, el acceso pago termina al vencer el período ya pagado. Podemos modificar el precio con aviso previo de al menos 30 días; si no estás de acuerdo, podés cancelar antes de la próxima renovación.</p>

      <h2 style={h2}>6. Uso aceptable</h2>
      <ul style={ul}>
        <li>No usar la App con fines ilegales ni para vulnerar derechos de terceros.</li>
        <li>No intentar acceder a datos de otras personas, ni alterar o sobrecargar el servicio.</li>
        <li>No subir contenido ilícito, ofensivo o que no te pertenezca.</li>
      </ul>

      <h2 style={h2}>7. Contenido del usuario</h2>
      <p style={p}>Conservás la titularidad de lo que cargás (entrenamientos, fotos, mediciones). Nos das una licencia limitada, no exclusiva, para almacenarlo y procesarlo solo para prestarte el servicio. Si compartís entrenamientos o fotos con tu entrenador, vos decidís qué compartir.</p>

      <h2 style={h2}>8. Entrenadores</h2>
      <p style={p}>Los entrenadores son profesionales independientes; el Proveedor no es responsable por las indicaciones, rutinas o planes que te den fuera de lo que la App genera automáticamente.</p>

      <h2 style={h2}>9. Limitación de responsabilidad</h2>
      <p style={p}>La App se brinda "tal cual" y puede tener interrupciones. En la medida permitida por la ley, el Proveedor no responde por lesiones o perjuicios derivados del entrenamiento o de la alimentación (ver Aviso de Salud), ni por daños indirectos. Nada de esto limita los derechos que la Ley 24.240 de Defensa del Consumidor te reconoce como consumidor/a.</p>

      <h2 style={h2}>10. Baja de la cuenta</h2>
      <p style={p}>Podés pedir la eliminación de tu cuenta y tus datos en cualquier momento escribiendo a {EMAIL_CONTACTO}. Podemos suspender cuentas que incumplan estos Términos.</p>

      <h2 style={h2}>11. Cambios</h2>
      <p style={p}>Si cambiamos estos Términos te avisaremos dentro de la App. Seguir usándola después del aviso implica aceptarlos.</p>

      <h2 style={h2}>12. Ley aplicable y jurisdicción</h2>
      <p style={p}>Rige la ley argentina. Para reclamos de consumo podés acudir a los tribunales del domicilio del consumidor o a la Dirección de Defensa del Consumidor de tu jurisdicción. Datos del Proveedor: {PROVEEDOR}.</p>
    </>
  );
}

function Privacidad() {
  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Política de Privacidad</h1>
      <p style={{ ...p, color: "var(--muted)" }}>Última actualización: [COMPLETAR: fecha]</p>

      <h2 style={h2}>1. Responsable de la base de datos</h2>
      <p style={p}>{PROVEEDOR}. Contacto de privacidad: {EMAIL_CONTACTO}. Tratamos tus datos conforme a la Ley 25.326 de Protección de Datos Personales y su normativa complementaria. [COMPLETAR: número de inscripción de la base ante la AAIP, si corresponde.]</p>

      <h2 style={h2}>2. Qué datos recopilamos</h2>
      <ul style={ul}>
        <li><b>Cuenta:</b> nombre, email, contraseña (cifrada) y rol.</li>
        <li><b>Datos de salud (sensibles):</b> peso, altura, fecha de nacimiento, sexo, medidas corporales, composición corporal, fotos de progreso, objetivos, nivel de entrenamiento, registro de comidas y calorías, lesiones o molestias que cargues.</li>
        <li><b>Actividad:</b> entrenamientos, series, repeticiones, cargas, cardio, récords y logros.</li>
        <li><b>Técnicos:</b> dispositivo, navegador, suscripción de notificaciones push y, solo si lo aceptás, datos de uso de analítica.</li>
        <li><b>Pagos:</b> el cobro lo procesa Mercado Pago; no almacenamos los datos de tu tarjeta. Guardamos el estado y los identificadores de tu suscripción.</li>
      </ul>

      <h2 style={h2}>3. Datos sensibles y consentimiento</h2>
      <p style={p}>Los datos de salud son datos sensibles (art. 2 y 7 de la Ley 25.326). Los tratamos únicamente con tu consentimiento expreso, que das al registrarte y al cargarlos, y solo para brindarte las funciones de la App. Nadie puede obligarte a proporcionarlos: si no querés cargarlos, algunas funciones no van a estar disponibles. Podés retirar el consentimiento eliminando los datos o tu cuenta.</p>

      <h2 style={h2}>4. Para qué los usamos</h2>
      <ul style={ul}>
        <li>Prestar el servicio: registrar tu progreso, generar estadísticas y rutinas.</li>
        <li>Coach y recomendaciones de entrenamiento.</li>
        <li>Cobrar la suscripción y dar soporte.</li>
        <li>Mejorar la App mediante analítica, solo con tu consentimiento.</li>
        <li>Cumplir obligaciones legales.</li>
      </ul>

      <h2 style={h2}>5. Con quién los compartimos (encargados y cesionarios)</h2>
      <ul style={ul}>
        <li><b>Tu entrenador</b>, si te vinculás con uno: ve tus entrenamientos, mediciones y lo que compartas.</li>
        <li><b>Supabase</b> (base de datos, autenticación y almacenamiento de fotos).</li>
        <li><b>PostHog</b> (analítica de producto): solo si aceptás el banner de analítica. Registramos eventos de uso (por ejemplo "entrenamiento terminado"), sin enviar pesos, repeticiones ni medidas, y asociados a un identificador interno, no a tu nombre ni email.</li>
        <li><b>Mercado Pago</b> (cobros).</li>
        <li>Servicios de notificaciones push de tu navegador o sistema operativo.</li>
      </ul>
      <p style={p}>No vendemos tus datos ni los usamos para publicidad de terceros.</p>

      <h2 style={h2}>6. Transferencia internacional</h2>
      <p style={p}>Varios de estos proveedores almacenan o procesan datos fuera de la Argentina, incluso en países sin nivel de protección adecuado según la AAIP (por ejemplo Estados Unidos). Al aceptar esta Política consentís expresamente esas transferencias (art. 12 Ley 25.326), que hacemos con las salvaguardas contractuales disponibles. [COMPLETAR: confirmar regiones de hosting de cada proveedor.]</p>

      <h2 style={h2}>7. Fotos de progreso</h2>
      <p style={p}>Se guardan en un almacenamiento de Supabase asociado a tu cuenta. [COMPLETAR: confirmar que el bucket sea privado; si se mantienen enlaces públicos, avisar acá.] Podés borrarlas desde la App cuando quieras.</p>

      <h2 style={h2}>8. Datos guardados en tu dispositivo</h2>
      <p style={p}>Usamos almacenamiento local (localStorage/sessionStorage) y caché del navegador para que la App funcione sin conexión, mantener tu sesión, recordar preferencias, una cola de sincronización y tu elección sobre la analítica. Son necesarios para el funcionamiento; podés borrarlos desde tu navegador.</p>

      <h2 style={h2}>9. Cuánto tiempo los conservamos</h2>
      <p style={p}>Mientras tu cuenta esté activa. Al eliminarla borramos o anonimizamos tus datos, salvo los que debamos conservar por obligación legal (por ejemplo facturación). [COMPLETAR: plazos concretos.]</p>

      <h2 style={h2}>10. Tus derechos</h2>
      <p style={p}>Podés acceder a tus datos (de forma gratuita a intervalos no inferiores a seis meses), rectificarlos, actualizarlos y pedir su supresión, escribiendo a {EMAIL_CONTACTO}. Respondemos dentro de los plazos legales (10 días corridos para consultas de acceso, 5 días hábiles para rectificación o supresión).</p>
      <p style={p}><i>El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</i></p>

      <h2 style={h2}>11. Seguridad</h2>
      <p style={p}>Aplicamos medidas técnicas y organizativas razonables (cifrado en tránsito, control de acceso por usuario). Ningún sistema es 100% seguro; ante un incidente que afecte tus datos te vamos a avisar.</p>

      <h2 style={h2}>12. Cambios</h2>
      <p style={p}>Si modificamos esta Política te lo vamos a avisar en la App.</p>
    </>
  );
}

function Reembolso() {
  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Reembolsos y botón de arrepentimiento</h1>
      <p style={{ ...p, color: "var(--muted)" }}>Última actualización: [COMPLETAR: fecha]</p>

      <h2 style={h2}>Derecho de arrepentimiento (10 días)</h2>
      <p style={p}>Como contratás a distancia, podés revocar la aceptación del servicio dentro de los 10 días corridos contados desde la contratación o desde que se activa el servicio, lo que ocurra último, sin costo ni responsabilidad (art. 34 Ley 24.240 y art. 1110 y ss. del Código Civil y Comercial). Para ejercerlo usá el botón "Botón de arrepentimiento" en Perfil o escribinos a {EMAIL_CONTACTO} indicando tu email de cuenta. Te enviamos una constancia de recepción.</p>
      <p style={p}>Si ejercés el derecho en término, te devolvemos el importe abonado por el mismo medio de pago, y se da de baja cualquier renovación. [COMPLETAR: plazo máximo de devolución, p. ej. 10 días hábiles.]</p>

      <h2 style={h2}>Cancelación de la renovación</h2>
      <p style={p}>Podés dejar de renovar cuando quieras desde Perfil. No se cobran nuevos períodos y mantenés el acceso hasta el fin del período ya pagado. Pasado el plazo de arrepentimiento, los períodos ya abonados no se reembolsan, salvo error de cobro o cobros duplicados, que se devuelven íntegramente.</p>

      <h2 style={h2}>Reclamos</h2>
      <p style={p}>Proveedor: {PROVEEDOR}. Si no estás conforme con la respuesta, podés presentar tu reclamo ante la Dirección de Defensa del Consumidor de tu jurisdicción o en argentina.gob.ar/produccion/defensadelconsumidor. [COMPLETAR: incluir enlace obligatorio a Defensa del Consumidor y leyenda de ventanilla.]</p>
    </>
  );
}

function Salud() {
  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Aviso de salud y nutrición</h1>
      <p style={p}>Loop Gym es una herramienta de registro y orientación general. <b>No brinda atención médica ni nutricional, no diagnostica ni trata enfermedades</b>, y su contenido (incluido el coach y las estimaciones de calorías y macronutrientes) no reemplaza el consejo de un/a profesional de la salud matriculado/a.</p>
      <ul style={ul}>
        <li>Antes de empezar o cambiar un plan de entrenamiento o alimentación, consultá a tu médico/a, sobre todo si tenés una condición de salud, lesión, embarazo, medicación o antecedentes cardíacos.</li>
        <li>Frená el ejercicio y consultá ante dolor, mareos, falta de aire u otros síntomas.</li>
        <li>Las sugerencias del coach pueden ser incorrectas o incompletas; las estimaciones de comidas son aproximadas, y pueden no ser adecuadas si tenés alergias, diabetes, trastornos de la conducta alimentaria u otras condiciones.</li>
        <li>Entrenás bajo tu propia responsabilidad. Usá técnica y cargas acordes a tu nivel.</li>
        <li>Si estás en una situación de emergencia, llamá al 107 (SAME) o al servicio de emergencias de tu zona.</li>
      </ul>
    </>
  );
}

const BODY = { terminos: Terminos, privacidad: Privacidad, reembolso: Reembolso, salud: Salud };

export default function LegalPage({ onBack }) {
  const [tab, setTab] = useState(sectionFromHash);
  const Body = BODY[tab] || Terminos;

  function go(id) {
    setTab(id);
    try { history.replaceState(null, "", legalHref(id)); } catch {}
    window.scrollTo?.(0, 0);
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 18px 48px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, position: "sticky", top: 0, background: "var(--bg)", padding: "6px 0", zIndex: 1 }}>
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? "primary" : "ghost"}
              style={{ padding: "7px 12px", fontSize: 12.5, borderRadius: 10 }} onClick={() => go(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <Body />
        <div style={{ marginTop: 28 }}>
          <button type="button" className="ghost" onClick={onBack || (() => { if (window.history.length > 1) window.history.back(); else window.close(); })}>
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
