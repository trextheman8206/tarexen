"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

// Si algo falla al cargar una página (por ejemplo, justo durante una actualización
// del sitio), mostramos esto en vez de una pantalla rota.
export default function SiteError({ error }: { error: Error & { digest?: string } }) {
  const { lang } = useParams<{ lang: string }>();
  const en = lang === "en";
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 560, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.8rem" }}>{en ? "Something went wrong" : "Algo salió mal"}</h1>
        <p className="muted">
          {en
            ? "The page didn't load correctly. Reloading usually fixes it."
            : "La página no cargó bien. Normalmente se arregla al recargar."}
        </p>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            {en ? "Reload" : "Recargar"}
          </button>
          <a className="btn btn-ghost" href={en ? "/en" : "/es"}>{en ? "Go to home" : "Ir al inicio"}</a>
        </div>
      </div>
    </section>
  );
}
