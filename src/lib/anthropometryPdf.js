// Genera el PDF del informe antropométrico. jsPDF se importa recién al descargar (no pesa en el arranque).
// Solo usa fuentes estándar (Helvetica): sin letras griegas ni símbolos fuera de Latin-1.
const VIOLET = [124, 58, 237];
const DARK = [30, 27, 46];
const MUTED = [110, 106, 130];
const LINE = [225, 222, 238];
const SOFT = [245, 241, 255];

const fmtDate = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
const level = (v) => (v < 2.75 ? "bajo" : v < 5.25 ? "moderado" : v < 7.25 ? "alto" : "muy alto");
const num = (v, d = 1) => Number(v).toFixed(d).replace(".", ",");

export function pdfFileName(report) {
  const name = String(report.person.name || "informe").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "informe";
  const d = report.date;
  return `antropometria-${name}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.pdf`;
}

export async function buildAnthropometryPdf(report) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 14;
  const text = (s, x, y, o = {}) => {
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setFontSize(o.size || 10);
    doc.setTextColor(...(o.color || DARK));
    doc.text(String(s), x, y, o.align ? { align: o.align } : undefined);
  };

  function footer(page) {
    doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, 285, W - M, 285);
    text("Loop Gym · Informe orientativo, no reemplaza la evaluación de un profesional de la salud.", M, 290, { size: 7.5, color: MUTED });
    text(`Página ${page} de 2`, W - M, 290, { size: 7.5, color: MUTED, align: "right" });
  }

  function section(title, x, y, w) {
    text(title.toUpperCase(), x, y, { bold: true, size: 8.5, color: VIOLET });
    doc.setDrawColor(...VIOLET); doc.setLineWidth(0.4); doc.line(x, y + 1.6, x + w, y + 1.6);
    return y + 6;
  }

  function stat(x, y, w, label, value, sub) {
    doc.setFillColor(...SOFT); doc.roundedRect(x, y, w, 22, 2, 2, "F");
    text(label, x + 3, y + 5.5, { size: 7.5, color: MUTED, bold: true });
    text(value, x + 3, y + 13.5, { size: 15, bold: true });
    if (sub) text(sub, x + 3, y + 19, { size: 7.5, color: MUTED });
  }

  function table(x, y, w, rows, unit) {
    rows.forEach((r, i) => {
      if (i % 2 === 0) { doc.setFillColor(250, 249, 254); doc.rect(x, y - 4.2, w, 6.2, "F"); }
      text(r.label, x + 2, y, { size: 9 });
      text(`${num(r.value)} ${unit}`, x + w - 2, y, { size: 9, bold: true, align: "right" });
      y += 6.2;
    });
    return y;
  }

  // ---------- Página 1 ----------
  doc.setFillColor(...VIOLET); doc.rect(0, 0, W, 34, "F");
  text("Informe antropométrico", M, 17, { bold: true, size: 22, color: [255, 255, 255] });
  text("Perfil restringido ISAK · Somatotipo Heath-Carter", M, 25, { size: 10, color: [233, 224, 255] });
  text(fmtDate(report.date), W - M, 17, { bold: true, size: 11, color: [255, 255, 255], align: "right" });
  text("Loop Gym", W - M, 25, { size: 10, color: [233, 224, 255], align: "right" });

  const p = report.person;
  let y = 44;
  text(p.name || "Sin nombre", M, y, { bold: true, size: 14 });
  y += 7;
  const pill = (x, label, value) => {
    doc.setFillColor(...SOFT); doc.roundedRect(x, y - 4.5, 41, 11, 2, 2, "F");
    text(label, x + 3, y - 0.6, { size: 7, color: MUTED, bold: true });
    text(value, x + 3, y + 4.2, { size: 10, bold: true });
  };
  pill(M, "SEXO", p.sex === "F" ? "Femenino" : "Masculino");
  pill(M + 45, "EDAD", `${p.age} años`);
  pill(M + 90, "TALLA", `${num(p.height)} cm`);
  pill(M + 135, "PESO", `${num(p.weight)} kg`);
  y += 16;

  y = section("Composición corporal", M, y, W - 2 * M);
  const cw = (W - 2 * M - 9) / 4;
  const row1 = [
    ["IMC", num(report.bmi), report.bmiCategory],
    ["% GRASA DURNIN-W.", `${num(report.fatDW)} %`, report.fatDWCategory],
    ["% GRASA FAULKNER", `${num(report.fatFaulkner)} %`, "4 pliegues"],
    ["MASA GRASA", `${num(report.fatMassKg)} kg`, "según Durnin-W."],
  ];
  const row2 = [
    ["MASA LIBRE DE GRASA", `${num(report.leanMassKg)} kg`, "peso menos masa grasa"],
    ["SUMA DE 6 PLIEGUES", `${num(report.sum6)} mm`, "perfil restringido ISAK"],
    ["SUMA DE 8 PLIEGUES", `${num(report.sum8)} mm`, "los 8 pliegues"],
    ["CINTURA / CADERA", num(report.waistHip, 2), report.waistHipRisk.replace("Por encima del límite OMS", "Sobre límite OMS").replace("Dentro del límite OMS", "Dentro de OMS").replace(".", ",")],
  ];
  row1.forEach((s, i) => stat(M + i * (cw + 3), y, cw, s[0], s[1], s[2]));
  y += 25;
  row2.forEach((s, i) => stat(M + i * (cw + 3), y, cw, s[0], s[1], s[2]));
  y += 25;
  const cw3 = (W - 2 * M - 6) / 3;
  [
    ["% GRASA YUHASZ", `${num(report.fatYuhasz)} %`, report.fatYuhaszCategory],
    ["PROMEDIO % GRASA", `${num(report.fatAvg)} %`, "Durnin-W., Faulkner y Yuhasz"],
    ["MASA MUSCULAR (LEE)", `${num(report.muscle.kg)} kg`, `${num(report.muscle.pct)} % del peso corporal`],
  ].forEach((s3, i) => stat(M + i * (cw3 + 3), y, cw3, s3[0], s3[1], s3[2]));
  y += 31;

  const half = (W - 2 * M - 8) / 2;
  const yStart = y;
  let yl = section("Pliegues cutáneos", M, yStart, half);
  yl = table(M, yl + 1, half, report.skinfolds, "mm");

  let yr = section("Perímetros", M + half + 8, yStart, half);
  yr = table(M + half + 8, yr + 1, half, report.girths, "cm");
  yr += 3;
  yr = section("Perímetros corregidos", M + half + 8, yr, half);
  yr = table(M + half + 8, yr + 1, half, [
    { label: "Brazo corregido", value: report.somatotype.armCorr },
    { label: "Pantorrilla corregida", value: report.somatotype.calfCorr },
  ], "cm");
  yr += 3;
  yr = section("Diámetros óseos", M + half + 8, yr, half);
  yr = table(M + half + 8, yr + 1, half, report.breadths.map((b) => ({ label: b.label.replace(" (biepicondíleo)", ""), value: b.value })), "cm");

  y = Math.max(yl, yr) + 6;
  doc.setFillColor(250, 249, 254); doc.roundedRect(M, y, W - 2 * M, 22, 2, 2, "F");
  text("Cómo leer esta página", M + 3, y + 5.5, { bold: true, size: 8.5, color: VIOLET });
  const note = "Los pliegues miden la grasa subcutánea en puntos fijos del cuerpo; cuanto menor la suma, menos grasa subcutánea. Los perímetros corregidos restan el pliegue al perímetro para estimar el músculo. El % de grasa es una estimación indirecta con margen de error de unos 3 a 5 puntos: sirve para comparar mediciones tuyas en el tiempo, no como valor absoluto.";
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize(note, W - 2 * M - 6), M + 3, y + 10);
  footer(1);

  // ---------- Página 2 ----------
  doc.addPage();
  doc.setFillColor(...VIOLET); doc.rect(0, 0, W, 16, "F");
  text("Somatotipo y método", M, 10.5, { bold: true, size: 13, color: [255, 255, 255] });
  y = 26;
  y = section("Somatotipo Heath-Carter", M, y, W - 2 * M);
  const s = report.somatotype;
  text(`${num(s.endo)}  –  ${num(s.meso)}  –  ${num(s.ecto)}`, M, y + 8, { bold: true, size: 24, color: VIOLET });
  text("Endomorfia  –  Mesomorfia  –  Ectomorfia", M, y + 14, { size: 8.5, color: MUTED });
  text(report.somatotypeLabel, M, y + 22, { bold: true, size: 12 });
  text("Clasificación orientativa", M, y + 27, { size: 7.5, color: MUTED });

  const expl = [
    ["Endomorfia", s.endo, "adiposidad relativa (suma de tríceps, subescapular y supraespinal, corregida por talla)."],
    ["Mesomorfia", s.meso, "desarrollo músculo-esquelético relativo (diámetros de húmero y fémur, y perímetros de brazo y pantorrilla corregidos)."],
    ["Ectomorfia", s.ecto, `linealidad relativa (índice altura-peso = ${num(s.hwr, 2)}).`],
  ];
  let ey = y + 38;
  expl.forEach(([name, v, desc]) => {
    text(`${name}: ${num(v)} (${level(v)})`, M, ey, { bold: true, size: 9.5 });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(desc, 88);
    doc.text(lines, M, ey + 4.6);
    ey += 5 + lines.length * 4 + 3;
  });
  text("Escala: 1 a 2,5 bajo · 3 a 5 moderado · 5,5 a 7 alto · 7,5 o más muy alto.", M, ey + 1, { size: 7.5, color: MUTED });

  // Somatocarta (derecha): X de -8 a 8, Y de -8 a 16
  const cx0 = 112, cy0 = y + 2, unit = 5, cwid = 16 * unit, chei = 24 * unit;
  const px = (X) => cx0 + ((X + 8) / 16) * cwid;
  const py = (Y) => cy0 + chei - ((Y + 8) / 24) * chei;
  doc.setDrawColor(...LINE); doc.setLineWidth(0.15);
  for (let i = -8; i <= 8; i += 2) doc.line(px(i), cy0, px(i), cy0 + chei);
  for (let j = -8; j <= 16; j += 2) doc.line(cx0, py(j), cx0 + cwid, py(j));
  doc.setFillColor(237, 230, 255);
  doc.triangle(px(-6), py(-6), px(0), py(12), px(6), py(-6), "F");
  doc.setDrawColor(...VIOLET); doc.setLineWidth(0.5);
  doc.triangle(px(-6), py(-6), px(0), py(12), px(6), py(-6), "S");
  doc.setDrawColor(...MUTED); doc.setLineWidth(0.3);
  doc.line(px(0), cy0, px(0), cy0 + chei); doc.line(cx0, py(0), cx0 + cwid, py(0));
  doc.rect(cx0, cy0, cwid, chei);
  text("MESOMORFO", px(0), py(12) - 2, { size: 7.5, bold: true, color: VIOLET, align: "center" });
  text("ENDOMORFO", px(-6), py(-6) + 5, { size: 7.5, bold: true, color: VIOLET, align: "center" });
  text("ECTOMORFO", px(6), py(-6) + 5, { size: 7.5, bold: true, color: VIOLET, align: "center" });
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ptx = px(clamp(s.x, -8, 8)), pty = py(clamp(s.y, -8, 16));
  doc.setFillColor(239, 68, 68); doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.6);
  doc.circle(ptx, pty, 2.2, "FD");
  text(`X ${num(s.x)}  ·  Y ${num(s.y)}`, cx0 + cwid / 2, cy0 + chei + 6, { size: 8, color: MUTED, align: "center" });
  text("Somatocarta", cx0 + cwid / 2, cy0 - 2, { size: 8, bold: true, color: MUTED, align: "center" });

  y = Math.max(ey + 8, cy0 + chei + 14);
  y = section("Masa muscular esquelética (Lee 2000)", M, y, W - 2 * M);
  text(`${num(report.muscle.kg)} kg  (${num(report.muscle.pct)} % del peso corporal)`, M, y + 2, { bold: true, size: 11 });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.2); doc.setTextColor(...MUTED);
  doc.text(doc.splitTextToSize(`Perímetros corregidos usados (perímetro menos pi x pliegue): brazo ${num(report.muscle.cag)} cm, muslo ${num(report.muscle.ctg)} cm, pantorrilla ${num(report.muscle.ccg)} cm. La ecuación original suma un ajuste por etnia que no se aplica acá; en personas asiáticas o afrodescendientes el valor puede diferir.`, W - 2 * M), M, y + 7);
  y += 22;
  y = section("Método y fuentes", M, y, W - 2 * M);
  const refs = [
    "Pliegues, perímetros y diámetros: medidos según el perfil restringido de ISAK (International Society for the Advancement of Kinanthropometry).",
    "% de grasa Durnin-Womersley (1974): densidad corporal con la suma de tríceps, bíceps, subescapular y cresta ilíaca, con coeficientes por sexo y edad; conversión a % de grasa con la ecuación de Siri.",
    "% de grasa Faulkner (1968): 0,153 x (tríceps + subescapular + supraespinal + abdominal) + 5,783.",
    "% de grasa Yuhasz: hombres 0,1051 x suma de 6 pliegues + 2,585; mujeres 0,1548 x suma de 6 pliegues + 3,580 (versión estándar, fuente secundaria).",
    "Masa muscular: Lee, Wang, Heo, Ross, Janssen y Heymsfield (2000), Am J Clin Nutr 72:796-803, con perímetros de brazo relajado, muslo medio y pantorrilla corregidos por pliegue.",
    "Somatotipo: método antropométrico de Heath y Carter (1990). Perímetros corregidos: perímetro menos pliegue (en cm).",
    "IMC y relación cintura-cadera: criterios de la OMS. Categorías de % de grasa: American Council on Exercise.",
  ];
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.2); doc.setTextColor(...DARK);
  refs.forEach((r) => {
    const lines = doc.splitTextToSize(r, W - 2 * M - 5);
    doc.text("•", M, y); doc.text(lines, M + 4, y);
    y += lines.length * 3.8 + 1.8;
  });

  if (report.warnings?.length) {
    y += 3;
    doc.setFillColor(255, 247, 230); doc.roundedRect(M, y, W - 2 * M, 6 + report.warnings.length * 4.4, 2, 2, "F");
    text("Revisá estos datos", M + 3, y + 5, { bold: true, size: 8.5, color: [180, 83, 9] });
    report.warnings.forEach((w, i) => text(w, M + 3, y + 10 + i * 4.4, { size: 8, color: [146, 64, 14] }));
  }
  footer(2);

  return { blob: doc.output("blob"), filename: pdfFileName(report) };
}
