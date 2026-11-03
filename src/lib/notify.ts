import "server-only";
import { SITE } from "@/config/site";
import { envValue } from "./env";

export function emailAlertsConfigured(): boolean {
  return Boolean(envValue("RESEND_API_KEY"));
}

export function alertRecipient(): string {
  return envValue("NOTIFY_EMAIL") || SITE.email;
}

export type LeadAlert = {
  id: number;
  name: string;
  category: string;
  location: string;
  contactName: string;
  whatsapp: string | null;
  email: string | null;
  products: string;
  source: string;
};

/**
 * Avisa por email de una solicitud nueva. Nunca lanza errores: la solicitud ya está
 * guardada y un fallo del correo no debe afectar a quien llenó el formulario.
 * Con el remitente de pruebas de Resend solo se puede enviar al email de la cuenta de Resend.
 */
export async function sendLeadAlert(lead: LeadAlert): Promise<void> {
  const apiKey = envValue("RESEND_API_KEY");
  if (!apiKey) return;
  const plan = lead.source.replace(/^web:?/, "") || "análisis gratis";
  const text = [
    `Nueva solicitud en TAREXEN (${plan})`,
    "",
    `Negocio: ${lead.name}`,
    `Categoría: ${lead.category}`,
    `Ubicación: ${lead.location}`,
    `Contacto: ${lead.contactName}`,
    `WhatsApp: ${lead.whatsapp ?? "—"}`,
    `Email: ${lead.email ?? "—"}`,
    "",
    `Productos o servicios: ${lead.products}`,
    "",
    `Ver en el panel: ${SITE.url}/admin/negocios/${lead.id}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "TAREXEN <onboarding@resend.dev>",
        to: [alertRecipient()],
        subject: `Nueva solicitud: ${lead.name}`.replace(/[\r\n]+/g, " ").slice(0, 150),
        text,
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
      signal: AbortSignal.timeout(5000),
    });
    // Solo el código de estado: los registros no deben contener datos del cliente.
    if (!res.ok) console.error(`[aviso-email] Resend respondió ${res.status} para el lead ${lead.id}`);
  } catch (err) {
    console.error(`[aviso-email] no se pudo enviar el aviso del lead ${lead.id}:`, (err as Error).name);
  }
}
