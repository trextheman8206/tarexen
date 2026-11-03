"use client";

import { useState } from "react";

type Labels = { field: string; copied: string; copy: string; whatsapp: string };

export function CopyLink({ url, labels: L }: { url: string; labels: Labels }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`Te invito al equipo de TAREXEN. Crea tu acceso aquí (vence en 7 días): ${url}`)}`;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label={L.field} />
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
          {copied ? L.copied : L.copy}
        </button>
        <a className="btn btn-wa btn-sm" href={wa} target="_blank" rel="noopener noreferrer">{L.whatsapp}</a>
      </div>
    </div>
  );
}
