import { adminT, adminTitle } from "@/lib/admin-i18n";
import { SITE } from "@/config/site";
import { requirePerm } from "@/lib/auth";
import { databaseDiagnostics, isLocalDatabase } from "@/lib/db";
import { alertRecipient, emailAlertsConfigured } from "@/lib/notify";

export async function generateMetadata() {
  return adminTitle("Integraciones");
}

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

export default async function IntegrationsPage() {
  const T = await adminT();
  await requirePerm("integrations.view");
  const diag = await databaseDiagnostics();
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{T("Integraciones")}</h1>
          <p className="muted" style={{ margin: 0 }}>{T("Estado real del sistema. Nada se muestra como activo si no está implementado y probado.")}</p>
        </div>
      </div>

      <div className="card">
        <h2>{T("Plataformas de IA y búsqueda")}</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>{T("Plataforma")}</th><th>{T("Método actual")}</th><th>{T("Clave en el servidor")}</th><th>{T("Conector")}</th><th>{T("Notas")}</th></tr></thead>
            <tbody>
              {AI.map((p) => {
                const hasKey = p.env ? Boolean(process.env[p.env]) : false;
                return (
                  <tr key={p.name}>
                    <td><b>{p.name}</b></td>
                    <td><span className="badge badge-brand">Manual</span></td>
                    <td>{p.env ? <Status ok={hasKey} label={hasKey ? T("Presente") : T("No configurada")} /> : <span className="muted">—</span>}<div className="small muted">{p.env ?? ""}</div></td>
                    <td><span className="badge">{T("No implementado")}</span></td>
                    <td className="small">{T(p.note)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>{T("Sistema")}</h2>
        <dl className="kv">
          <dt>{T("Base de datos")}</dt>
          <dd>{isLocalDatabase() ? <><Status ok label={T("Archivo local")} /> <span className="small muted">{T("data/tarexen.db — para producción usa Turso (DATABASE_URL)")}</span></> : <Status ok label={T("Remota (libSQL/Turso)")} />}</dd>
          <dt>{T("Conexión a la base")}</dt>
          <dd><Status ok={diag.connection === "OK"} label={diag.connection === "OK" ? "OK" : "Error"} />{diag.connection !== "OK" && <div className="small muted">{diag.connection}</div>}</dd>
          <dt>DATABASE_URL</dt>
          <dd className="small">{T("esquema: {scheme} · host: {host}", { scheme: diag.scheme, host: diag.host || "—" })}</dd>
          <dt>DATABASE_AUTH_TOKEN</dt>
          <dd className="small">
            {diag.token.present ? T("{kind} · {length} caracteres · {parts} partes", { kind: T(diag.token.kind), length: diag.token.length, parts: diag.token.parts }) : T("no configurado")}
            {diag.token.suspiciousChars && T(" · ⚠ contiene espacios, comillas o paréntesis")}
            <div className="muted">{T("El valor del token nunca se muestra.")}</div>
          </dd>
          <dt>{T("WhatsApp público")}</dt>
          <dd>{SITE.whatsapp ? <Status ok label={`+${SITE.whatsapp}`} /> : <><Status ok={false} label={T("No configurado")} /> <span className="small muted">{T("NEXT_PUBLIC_WHATSAPP_NUMBER — el botón está oculto")}</span></>}</dd>
          <dt>{T("Email público")}</dt>
          <dd>{SITE.email ? <Status ok label={SITE.email} /> : <><Status ok={false} label={T("No configurado")} /> <span className="small muted">NEXT_PUBLIC_CONTACT_EMAIL</span></>}</dd>
          <dt>{T("Avisos por email")}</dt>
          <dd>
            {emailAlertsConfigured()
              ? <><Status ok label={T("Clave presente")} /> <span className="small muted">{T("Avisos de solicitudes nuevas a {email} (Resend). Si no llegan, revisa spam y que la cuenta de Resend use ese mismo email.", { email: alertRecipient() })}</span></>
              : <><Status ok={false} label={T("No configurado")} /> <span className="small muted">{T("RESEND_API_KEY — las solicitudes se guardan, pero solo se ven en este panel.")}</span></>}
          </dd>
          <dt>{T("Pagos en línea")}</dt>
          <dd><span className="badge">{T("No implementado")}</span> <span className="small muted">{T("Cobro por transferencia; registra cada pago en la ficha del negocio.")}</span></dd>
          <dt>{T("URL del sitio")}</dt>
          <dd>{SITE.url}</dd>
        </dl>
      </div>
    </div>
  );
}
