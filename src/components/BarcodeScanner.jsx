import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        // Prefer rear camera
        const device = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];
        const deviceId = device?.deviceId || undefined;

        await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (cancelled) return;
          if (result) {
            handleBarcode(result.getText());
          }
        });
        if (!cancelled) setScanning(true);
      } catch (err) {
        if (!cancelled) {
          setError("No se pudo acceder a la cámara. Usá el campo manual o subí una foto.");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      try { readerRef.current?.reset(); } catch {}
    };
  }, []);

  async function handleBarcode(code) {
    try { readerRef.current?.reset(); } catch {}
    setScanning(false);
    setLoading(true);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}?fields=product_name,nutriments,serving_size`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        onDetect({
          name: p.product_name || `Producto ${code}`,
          kcal: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
          protein: Math.round((n["proteins_100g"] || 0) * 10) / 10,
          carbs: Math.round((n["carbohydrates_100g"] || 0) * 10) / 10,
          fat: Math.round((n["fat_100g"] || 0) * 10) / 10,
          serving: p.serving_size || "100g",
          barcode: code,
        });
      } else {
        setLoading(false);
        setError(`Código ${code} no encontrado. Ingresá los datos manualmente.`);
      }
    } catch {
      setLoading(false);
      setError("Error de red. Ingresá los datos manualmente.");
    }
  }

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new BrowserMultiFormatReader();
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          const result = await reader.decodeFromImageElement(img);
          URL.revokeObjectURL(url);
          handleBarcode(result.getText());
        } catch {
          URL.revokeObjectURL(url);
          setLoading(false);
          setError("No se detectó ningún código en la imagen. Intentá con mejor iluminación o ingresá el código manualmente.");
        }
      };
      img.src = url;
    } catch {
      setLoading(false);
      setError("Error al procesar la imagen.");
    }
    e.target.value = "";
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.95)", zIndex:1000, display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", flexShrink:0 }}>
        <h3 style={{ margin:0, color:"#fff", fontSize:16 }}>Escanear código de barras</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", fontSize:26, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>

      {/* Camera view */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#000" }}>
        <video ref={videoRef} playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        {scanning && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
            <div style={{ position:"relative", width:"72%", maxWidth:280, aspectRatio:"3/2", border:"2px solid #22d37a", borderRadius:10 }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"#22d37a", animation:"scan 2s linear infinite" }} />
            </div>
          </div>
        )}
        {loading && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <p style={{ color:"#fff", fontSize:14 }}>Buscando producto…</p>
          </div>
        )}
        {error && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            <div style={{ background:"rgba(239,68,68,.2)", border:"1px solid #ef4444", borderRadius:12, padding:16, color:"#f87171", fontSize:13, textAlign:"center" }}>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{ flexShrink:0, padding:"14px 20px", paddingBottom:"max(20px, env(safe-area-inset-bottom, 20px))", background:"rgba(0,0,0,.9)", display:"flex", flexDirection:"column", gap:10 }}>
        {/* Photo fallback for iOS */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ width:"100%", padding:"11px", background:"rgba(168,85,247,.2)", border:"1px solid rgba(168,85,247,.5)", borderRadius:12, color:"#c084fc", fontWeight:700, fontSize:14, cursor:"pointer" }}
        >
          📷 Tomar foto del código (iOS)
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleImageFile} />

        {/* Manual entry */}
        <div style={{ display:"flex", gap:8 }}>
          <input
            type="text" inputMode="numeric" placeholder="O ingresá el código: ej. 7790000000000"
            value={manualCode} onChange={e => setManualCode(e.target.value)}
            style={{ flex:1, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14 }}
          />
          <button
            onClick={() => manualCode && handleBarcode(manualCode)}
            style={{ padding:"10px 16px", background:"#22d37a", border:"none", borderRadius:10, color:"#000", fontWeight:800, cursor:"pointer" }}
          >
            Buscar
          </button>
        </div>
      </div>

      <style>{`@keyframes scan { from{top:0} to{top:100%} }`}</style>
    </div>
  );
}
