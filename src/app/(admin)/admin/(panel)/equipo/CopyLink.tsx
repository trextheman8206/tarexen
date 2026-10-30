"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`Te invito al equipo de TAREXEN. Crea tu acceso aquí (vence en 7 días): ${url}`)}`;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Enlace de invitación" />
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "✓ Copiado" : "Copiar enlace"}
        </button>
        <a className="btn btn-wa btn-sm" href={wa} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
      </div>
    </div>
  );
}
