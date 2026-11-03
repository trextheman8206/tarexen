// Contacto público del negocio. Las variables de entorno NEXT_PUBLIC_* permiten
// cambiarlo sin tocar código; si se vacían explícitamente, el botón se oculta.
const DEFAULT_WHATSAPP = "593967904552";
const DEFAULT_EMAIL = "aihub8206@gmail.com";

export const SITE = {
  name: "TAREXEN",
  product: "TAREXEN AI Visibility",
  // En Netlify, URL es la dirección principal del sitio (la pone Netlify automáticamente).
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP).replace(/\D/g, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? DEFAULT_EMAIL,
};

export function whatsappLink(text: string): string | null {
  if (!SITE.whatsapp) return null;
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Versión del texto de consentimiento guardada con cada registro (LOPDP).
export const CONSENT_VERSION = "2026-11-03";

export const PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT" },
  { id: "gemini", name: "Gemini" },
  { id: "claude", name: "Claude" },
  { id: "google_search", name: "Google Search" },
  { id: "google_ai_overview", name: "Google AI Overviews" },
  { id: "google_maps", name: "Google Maps" },
  { id: "perplexity", name: "Perplexity" },
  { id: "copilot", name: "Microsoft Copilot" },
] as const;

export function platformName(id: string): string {
  return PLATFORMS.find((p) => p.id === id)?.name ?? id;
}

// Las 14 áreas del AI Visibility Improvement Pack.
export const REC_AREAS = [
  { id: "auditoria", es: "Auditoría de visibilidad en IA", en: "AI visibility audit" },
  { id: "competencia", es: "Comparación con competidores", en: "Competitor comparison" },
  { id: "preguntas", es: "Preguntas de clientes", en: "Customer questions" },
  { id: "gbp", es: "Google Business Profile", en: "Google Business Profile" },
  { id: "descripcion", es: "Descripción del negocio", en: "Business description" },
  { id: "faq", es: "Preguntas frecuentes (web)", en: "Website FAQ" },
  { id: "servicios", es: "Servicios y productos", en: "Services and products" },
  { id: "ubicacion", es: "Contenido por ubicación", en: "Location content" },
  { id: "resenas", es: "Solicitud de reseñas", en: "Review requests" },
  { id: "directorios", es: "Directorios", en: "Directory listings" },
  { id: "redes", es: "Redes sociales", en: "Social media" },
  { id: "seo_tecnico", es: "SEO técnico", en: "Technical SEO" },
  { id: "plan_30", es: "Plan de 30 días", en: "30-day plan" },
  { id: "seguimiento", es: "Seguimiento", en: "Follow-up" },
] as const;
