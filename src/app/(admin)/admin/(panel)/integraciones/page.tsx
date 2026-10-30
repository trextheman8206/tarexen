import { SITE } from "@/config/site";
import { isLocalDatabase } from "@/lib/db";

export const metadata = { title: "Integraciones" };

// Estado REAL: ningún conector de API está implementado todavía (Fase E). Aunque
// exista una clave en el entorno, se muestra "sin conector" en vez de "activo".
const AI = [
  { name: "ChatGPT", env: "OPENAI_API_KEY", note: "La app ChatGPT no tiene API. La API de OpenAI es de pago y no reproduce lo que ve un usuario de la app (sin memoria, ubicación ni búsqueda del usuario)." },
  { name: "Gemini", env: "GEMINI_API_KEY", note: "La API de Gemini tiene un nivel gratuito con límites. Candidata para la Fase E." },
  { name: "Claude", env: "ANTHROPIC_API_KEY", note: "API de pago. Igual que las demás, no equivale exactamente a la app de consumo." },
  { name: "Google Search / AI Overviews", env: null, note: "No existe API oficial de AI Overviews y el scraping viola los términos de Google. Solo manual." },
  { name: "Google Places (Maps)", env: "GOOGLE_PLACES_API_KEY", note: "Útil para leer datos de la ficha (horario, reseñas). Requiere cuenta de facturación de Google Cloud; tiene uso gratuito limitado." },
];

function Status({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`badge ${ok ? "badge-ok" : ""}`}>{label}</span>;
}

export default function IntegrationsPage() {
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Integraciones</h1>
          <p className="muted" style={{ margin: 0 }}>Estado real del sistema. Nada se muestra como activo si no está implementado y probado.</p>
        </div>
      </div>

      <div className="card">
        <h2>Plataformas de IA y búsqueda</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Plataforma</th><th>Método actual</th><th>Clave en el servidor</th><th>Conector</th><th>Notas</th></tr></thead>
            <tbody>
              {AI.map((p) => {
                const hasKey = p.env ? Boolean(process.env[p.env]) : false;
                return (
                  <tr key={p.name}>
                    <td><b>{p.name}</b></td>
                    <td><span className="badge badge-brand">Manual</span></td>
                    <td>{p.env ? <Status ok={hasKey} label={hasKey ? "Presente" : "No configurada"} /> : <span className="muted">—</span>}<div className="small muted">{p.env ?? ""}</div></td>
                    <td><span className="badge">No implementado</span></td>
                    <td className="small">{p.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Sistema</h2>
        <dl className="kv">
          <dt>Base de datos</dt>
          <dd>{isLocalDatabase() ? <><Status ok label="Archivo local" /> <span className="small muted">data/tarexen.db — para producción usa Turso (DATABASE_URL)</span></> : <Status ok label="Remota (libSQL/Turso)" />}</dd>
          <dt>WhatsApp público</dt>
          <dd>{SITE.whatsapp ? <Status ok label={`+${SITE.whatsapp}`} /> : <><Status ok={false} label="No configurado" /> <span className="small muted">NEXT_PUBLIC_WHATSAPP_NUMBER — el botón está oculto</span></>}</dd>
          <dt>Email público</dt>
          <dd>{SITE.email ? <Status ok label={SITE.email} /> : <><Status ok={false} label="No configurado" /> <span className="small muted">NEXT_PUBLIC_CONTACT_EMAIL</span></>}</dd>
          <dt>Envío de emails</dt>
          <dd><span className="badge">No implementado</span> <span className="small muted">Las notificaciones de nuevos leads se revisan en este panel.</span></dd>
          <dt>Pagos en línea</dt>
          <dd><span className="badge">No implementado</span> <span className="small muted">Cobro por transferencia; registra cada pago en la ficha del negocio.</span></dd>
          <dt>URL del sitio</dt>
          <dd>{SITE.url}</dd>
        </dl>
      </div>
    </div>
  );
}
