import { useState, useRef, useEffect } from "react";

// Uses BarcodeDetector (Chrome/Android) or camera stream + canvas for fallback
export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if ("BarcodeDetector" in window) {
          detectorRef.current = new BarcodeDetector({ formats: ["ean_13","ean_8","upc_a","upc_e","code_128","code_39","qr_code"] });
          setScanning(true);
          const detect = async () => {
            if (cancelled) return;
            try {
              const barcodes = await detectorRef.current.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                handleBarcode(code);
                return;
              }
            } catch {}
            rafRef.current = requestAnimationFrame(detect);
          };
          detect();
        } else {
          setError("Tu navegador no soporta escaneo nativo. Ingresá el código manualmente.");
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Verificá los permisos.");
      }
    }
    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  async function handleBarcode(code) {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setScanning(false);

    // Lookup in Open Food Facts
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
        setError(`Código ${code} no encontrado en la base de datos. Ingresá los datos manualmente.`);
        setTimeout(() => onClose(), 2000);
      }
    } catch {
      setError("Error de red. Verificá tu conexión.");
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.9)", zIndex:1000, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:400, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ margin:0, color:"#fff" }}>Escanear código de barras</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#fff", fontSize:24, cursor:"pointer" }}>×</button>
        </div>

        {!error ? (
          <>
            <div style={{ position:"relative", borderRadius:16, overflow:"hidden", background:"#000", aspectRatio:"4/3", marginBottom:16 }}>
              <video ref={videoRef} playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              {/* Scan frame overlay */}
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <div style={{ position:"relative", width:"70%", aspectRatio:"3/2", border:"2px solid #22d37a", borderRadius:8 }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"#22d37a", animation:"scan 2s linear infinite" }} />
                </div>
              </div>
            </div>
            <p style={{ color:"rgba(255,255,255,.6)", fontSize:13, textAlign:"center" }}>Apuntá la cámara al código de barras del producto</p>
          </>
        ) : (
          <div style={{ background:"rgba(239,68,68,.15)", border:"1px solid #ef4444", borderRadius:12, padding:16, marginBottom:16, color:"#f87171", fontSize:13 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop:12 }}>
          <p style={{ color:"rgba(255,255,255,.5)", fontSize:12, marginBottom:8 }}>O ingresá el código manualmente:</p>
          <div style={{ display:"flex", gap:8 }}>
            <input type="text" inputMode="numeric" placeholder="Ej: 7790000000000"
              value={manualCode} onChange={e => setManualCode(e.target.value)}
              style={{ flex:1, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:14 }} />
            <button onClick={() => manualCode && handleBarcode(manualCode)}
              style={{ padding:"10px 18px", background:"var(--green)", border:"none", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>
              Buscar
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes scan { from{top:0} to{top:100%} }`}</style>
    </div>
  );
}
