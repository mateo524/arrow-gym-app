// Herramienta de desarrollo: dibuja inicio y final de los movimientos del muñeco para revisarlos a ojo.
//   node scripts/motion-sheet.cjs --group=Pecho --out=sheet.png
//   node scripts/motion-sheet.cjs --match="curl" --out=sheet.png
//   node scripts/motion-sheet.cjs --group=Piernas --slice=0:39 --list     (solo lista los nombres y cuáles faltan)
//   --view=front|side fuerza la vista (por defecto la propia de cada ejercicio)
//   --slice=a:b recorta la lista del grupo (para revisar de a tandas)
// Los ejercicios sin movimiento definido salen marcados "FALTA".
const path = require("path");
const fs = require("fs");
const os = require("os");
const arg = (n, d) => (process.argv.find((a) => a.startsWith("--" + n + "=")) || "").slice(n.length + 3) || d;
const root = path.join(__dirname, "..");
const out = path.resolve(arg("out", path.join(os.tmpdir(), "motion-sheet.png")));
const entry = path.join(root, "_sheet_entry_" + process.pid + ".jsx");
fs.writeFileSync(entry, `
import { renderToStaticMarkup } from "react-dom/server";
import { EXERCISE_DATABASE } from "./src/data/exerciseDatabase.js";
import { motionForName } from "./src/data/motion/index.js";
import { FigureSvg } from "./src/components/motion/rig.jsx";
const VIEW = ${JSON.stringify(arg("view", ""))} || undefined;
const group = ${JSON.stringify(arg("group", ""))}, match = ${JSON.stringify(arg("match", "").toLowerCase())};
let list = EXERCISE_DATABASE.filter((e) => (!group || e.group === group) && (!match || e.name.toLowerCase().includes(match)));
const sl = ${JSON.stringify(arg("slice", ""))};
if (sl) { const [a, b] = sl.split(":").map(Number); list = list.slice(a, b); }
if (${JSON.stringify(process.argv.includes("--list"))}) { console.log(list.map((e) => e.name + " [" + e.equipment + ", " + e.muscle + "]" + (motionForName(e.name) ? "" : "  <- FALTA")).join(String.fromCharCode(10))); process.exit(0); }
const cells = list.map((e) => {
  const def = motionForName(e.name);
  const body = def
    ? renderToStaticMarkup(<FigureSvg def={def} k={0} size={230} view={VIEW} />) + renderToStaticMarkup(<FigureSvg def={def} k={1} size={230} view={VIEW} />)
    : '<div style="width:466px;height:172px;border:1px dashed #a33;color:#f88;display:flex;align-items:center;justify-content:center">FALTA</div>';
  return '<div style="margin:5px;color:#ddd;font:12px sans-serif"><b>' + e.name + '</b> <span style="color:#889">[' + e.equipment + ']</span><div style="display:flex;gap:4px">' + body + '</div></div>';
});
console.log('<body style="background:#000;display:flex;flex-wrap:wrap;width:1000px">' + cells.join("") + '</body>');
`);
const { execFileSync } = require("child_process");
const esbuild = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "esbuild.cmd" : "esbuild");
const bundle = path.join(root, "_sheet_" + process.pid + ".cjs");
try {
  execFileSync(esbuild, [entry, "--bundle", "--platform=node", "--format=cjs", "--jsx=automatic", "--loader:.js=jsx", "--outfile=" + bundle, "--log-level=error"], { stdio: "inherit", shell: process.platform === "win32" });
  const html = execFileSync("node", [bundle], { maxBuffer: 1 << 28 }).toString();
  if (process.argv.includes("--list")) { console.log(html); return; }
  const htmlPath = out.replace(/\.png$/, ".html");
  fs.writeFileSync(htmlPath, html);
  const { chromium } = require(require("path").join(require("child_process").execSync("npm root -g").toString().trim(), "@playwright", "test"));
  (async () => {
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1030, height: 900 } });
    await p.goto("file:///" + htmlPath.split(path.sep).join("/"));
    await p.screenshot({ path: out, fullPage: true });
    await b.close();
    console.log("OK ->", out);
  })();
} finally {
  for (const f of [entry, bundle]) try { fs.unlinkSync(f); } catch {}
}
