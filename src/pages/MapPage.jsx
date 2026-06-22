import { useEffect } from "react";
import useStore from "../store/useStore.js";

export default function MapPage() {
  const setPage = useStore(s => s.setPage);
  useEffect(() => { setPage("prs"); }, []);
  // Render a background-filled div so there's no black flash while redirecting
  return <div style={{ minHeight: "100vh", background: "var(--bg, #fff)" }} />;
}

