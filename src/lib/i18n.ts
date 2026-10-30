export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

const es = {
  nav: { home: "Inicio", how: "Cómo funciona", categories: "Categorías", services: "Servicios", pricing: "Precios", faq: "Preguntas", contact: "Contacto", cta: "Análisis gratis" },
  hero: {
    eyebrow: "Visibilidad en IA para negocios de Ecuador",
    title: "¿Tu negocio aparece cuando los clientes preguntan a la IA?",
    subtitle: "Analizamos cómo ChatGPT, Gemini y otros buscadores presentan tu negocio y te ayudamos a mejorar tu presencia digital.",
    primary: "Analizar mi negocio gratis",
    secondary: "Cómo funciona",
    trust: ["Sin garantías falsas de posiciones", "Consultas reales, registradas con fecha", "Nunca reseñas falsas"],
  },
  example: {
    badge: "Ejemplo ilustrativo · datos ficticios",
    question: "¿Cuál es el mejor lugar para comer comida típica en Cotacachi?",
    platform: "Asistente de IA",
    answer: "Algunas opciones bien valoradas son:",
    items: ["Restaurante Ejemplo A — carnes coloradas y fritada", "Picantería Ejemplo B — cerca del parque central", "Tu negocio podría estar aquí"],
    auditTitle: "Lo que registra nuestra auditoría",
    rows: [["Plataforma", "ChatGPT · manual"], ["Fecha", "12-oct-2026 10:42"], ["¿Apareció tu negocio?", "No"], ["Competidores", "2 mencionados"], ["Fuentes citadas", "Google Maps, TripAdvisor"]],
  },
  beforeAfter: {
    title: "Antes y después",
    note: "Ejemplo ilustrativo con datos ficticios. Los resultados reales varían y nadie puede garantizar que una IA recomiende tu negocio.",
    before: "Antes",
    after: "Después de 30 días",
    beforeItems: ["Apareció en 0 de 10 preguntas", "Ficha de Google sin horario ni menú", "Descripción: “Restaurante”", "6 reseñas, la última hace 1 año"],
    afterItems: ["Apareció en 3 de 10 preguntas", "Horario, menú y fotos actualizados", "Descripción con cocina, zona y especialidades", "Proceso para pedir reseñas reales a clientes"],
  },
  steps: {
    title: "Cómo funciona",
    items: [
      ["Analizamos tu negocio", "Hacemos las preguntas que tus clientes hacen a ChatGPT, Gemini y Google, y revisamos tu ficha, web y redes con un checklist de tu categoría."],
      ["Preparamos las mejoras", "Te entregamos textos listos: descripción, preguntas frecuentes, servicios, contenido por ubicación y plantillas para pedir reseñas reales."],
      ["Volvemos a medir", "A los 30 días repetimos las mismas preguntas y te mostramos qué cambió, con fecha y evidencia."],
    ],
  },
  categories: { title: "Para todo tipo de negocio en Ecuador", subtitle: "Cada categoría tiene su propio checklist: un restaurante no se evalúa igual que un hotel o una mecánica.", all: "Ver todas las categorías", more: "Ver detalles" },
  services: {
    title: "Qué incluye el AI Visibility Improvement Pack",
    subtitle: "Todo en español por defecto, y en inglés si atiendes turistas.",
    items: ["Auditoría inicial de visibilidad en IA", "Comparación con competidores", "Análisis de preguntas de clientes", "Recomendaciones para Google Business Profile", "Reescritura de la descripción del negocio", "Preguntas frecuentes para tu web", "Descripciones de servicios y productos", "Contenido por ubicación", "Plantillas para pedir reseñas", "Directorios recomendados", "Mejoras para redes sociales", "SEO técnico cuando aplique", "Plan de mejora de 30 días", "Informe de seguimiento"],
  },
  pricing: {
    title: "Precios simples",
    subtitle: "Precios de lanzamiento. Pagas una vez; el plan mensual es opcional.",
    ec: "Negocios en Ecuador",
    intl: "Clientes internacionales",
    once: "pago único",
    month: "/mes",
    founder: "Precio fundador · primeros 10 clientes",
    names: { free: "Gratis", business: "Business", pro: "Pro" },
    cta: { free: "Pedir mi análisis gratis", business: "Quiero el plan Business", pro: "Quiero el plan Pro" },
    disclaimer: "No garantizamos posiciones, recomendaciones, clientes ni ventas. Ningún proveedor honesto puede hacerlo.",
    payNow: "Paga ahora con PayPal o tarjeta",
    payFirstMonth: "Paga tu primer mes con PayPal o tarjeta",
    payAfter: "Después de pagar, completa el formulario para empezar.",
    payFail: "El pago con PayPal no cargó. Escríbenos por WhatsApp y te enviamos el enlace de pago.",
    monthlyNote: "Se paga mes a mes: cada mes te enviamos el enlace de pago por WhatsApp. Cancelas cuando quieras.",
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      ["¿Garantizan que ChatGPT recomiende mi negocio?", "No. Nadie puede garantizarlo: las respuestas de la IA cambian y dependen de cada usuario. Lo que sí hacemos es medir con preguntas reales y mejorar la información pública que la IA usa para decidir."],
      ["¿Cómo hacen las consultas?", "Hoy la mayoría son manuales: escribimos las preguntas en cada plataforma desde una sesión limpia y registramos la respuesta, la fecha y las fuentes citadas. Cada informe indica qué fue manual y qué fue automatizado."],
      ["¿Necesitan mi contraseña de Google?", "Nunca. Si quieres que apliquemos los cambios, nos agregas como administrador de tu ficha y puedes quitarnos cuando quieras. Sin tu permiso no modificamos nada."],
      ["¿Escriben reseñas?", "No. Jamás escribimos ni compramos reseñas. Te damos plantillas para pedir reseñas honestas a tus clientes reales, sin ofrecer nada a cambio."],
      ["Mi negocio es pequeño o está en una parroquia rural, ¿sirve?", "Sí. Los negocios de pueblos y zonas rurales suelen tener menos competencia en la IA, y pequeñas mejoras pueden notarse más."],
      ["¿Cuánto tiempo me toma?", "Unos 20 minutos para responder algunas preguntas. Nosotros hacemos el resto."],
      ["¿Emiten factura?", "Sí, emitimos el comprobante de venta que corresponde según nuestro régimen tributario ante el SRI."],
    ],
  },
  contact: { title: "¿Hablamos?", subtitle: "Pide tu análisis gratis o escríbenos directamente.", whatsapp: "Escribir por WhatsApp", email: "Enviar un email", form: "Usar el formulario", waText: "Hola TAREXEN, quiero un análisis gratis de mi negocio." },
  footer: { tagline: "Visibilidad en IA para negocios de Ecuador.", privacy: "Privacidad", disclaimer: "ChatGPT, Gemini, Claude y Google son marcas de sus respectivos dueños. TAREXEN no está afiliado a ninguna empresa de IA.", admin: "Acceso equipo" },
  form: {
    title: "Análisis gratis de tu negocio",
    subtitle: "Toma unos 5 minutos. Te enviamos tu snapshot por WhatsApp o email en 2 a 3 días hábiles.",
    sections: { business: "Tu negocio", location: "Ubicación", area: "Dónde atiendes", online: "Presencia en línea", offer: "Qué ofreces", contact: "Contacto" },
    name: "Nombre del negocio", category: "Categoría", subcategory: "Tipo de negocio", otherIndustry: "¿Cuál es tu industria?",
    province: "Provincia", canton: "Cantón", parish: "Parroquia", parishText: "Parroquia o sector (escríbelo)", neighborhood: "Barrio o referencia", address: "Dirección (opcional)",
    hasLocation: "Tengo un local físico donde atiendo clientes", inPerson: "Atiendo en persona", online: "Atiendo en línea", delivery: "Hago entregas a domicilio",
    deliveryArea: "Zona de entrega", serviceArea: "Zona de servicio (cantones o sectores que atiendes)", nearby: "Ciudades cercanas que atiendes",
    website: "Sitio web", gbp: "Enlace de Google Maps / Google Business Profile", social: "Redes sociales (una por línea)",
    products: "Productos o servicios principales", target: "¿Quiénes son tus clientes?", targetHint: "Ej.: familias del barrio, turistas extranjeros, empresas…",
    contactName: "Tu nombre", email: "Email", whatsapp: "WhatsApp", contactHint: "Deja al menos un email o WhatsApp.", lang: "Idioma del informe",
    consent: "Acepto que TAREXEN use estos datos para preparar mi análisis y contactarme sobre él, según la política de privacidad.", privacyLink: "Leer política de privacidad",
    submit: "Enviar y pedir mi análisis gratis", sending: "Enviando…", select: "Selecciona…", optional: "opcional", noParishes: "No tenemos la lista de parroquias de este cantón todavía: escríbela abajo.",
    errors: "Revisa los campos marcados.",
  },
  thanks: { title: "¡Recibimos tu solicitud!", body: "Vamos a revisar cómo aparece tu negocio en las principales plataformas de IA y búsqueda. Te escribimos en 2 a 3 días hábiles.", next: "Mientras tanto:", tip: "Revisa que tu ficha de Google tenga horario, fotos y teléfono actualizados.", back: "Volver al inicio" },
  catPage: { eyebrow: "Visibilidad en IA para", questions: "Preguntas que hacen tus clientes", questionsNote: "Ejemplos de lo que probamos en ChatGPT, Gemini y Google, adaptado a tu ciudad.", checks: "Lo que revisamos en tu negocio", base: "Para todos los negocios", specific: "Específico de tu categoría", types: "Tipos de negocio", cta: "Analizar mi negocio gratis" },
  meta: { title: "TAREXEN AI Visibility — ¿Tu negocio aparece en ChatGPT y Gemini?", description: "Análisis de visibilidad en IA para negocios de Ecuador: restaurantes, hoteles, tiendas, mecánicas y más. Snapshot gratis." },
};

type Dict = typeof es;

const en: Dict = {
  nav: { home: "Home", how: "How it works", categories: "Categories", services: "Services", pricing: "Pricing", faq: "FAQ", contact: "Contact", cta: "Free audit" },
  hero: {
    eyebrow: "AI visibility for businesses in Ecuador",
    title: "Does your business show up when customers ask AI?",
    subtitle: "We analyze how ChatGPT, Gemini and other search tools present your business, and help you improve your online presence.",
    primary: "Analyze my business for free",
    secondary: "How it works",
    trust: ["No fake ranking guarantees", "Real queries, logged with date and time", "Never fake reviews"],
  },
  example: {
    badge: "Illustrative example · fictional data",
    question: "Where's the best place to eat traditional food in Cotacachi?",
    platform: "AI assistant",
    answer: "Some well-rated options are:",
    items: ["Example Restaurant A — carne colorada and fritada", "Example Picantería B — near the main park", "Your business could be here"],
    auditTitle: "What our audit records",
    rows: [["Platform", "ChatGPT · manual"], ["Date", "Oct 12, 2026 10:42"], ["Did your business appear?", "No"], ["Competitors", "2 mentioned"], ["Sources cited", "Google Maps, TripAdvisor"]],
  },
  beforeAfter: {
    title: "Before and after",
    note: "Illustrative example with fictional data. Real results vary, and nobody can guarantee an AI will recommend your business.",
    before: "Before",
    after: "After 30 days",
    beforeItems: ["Appeared in 0 of 10 questions", "Google profile without hours or menu", "Description: “Restaurant”", "6 reviews, the latest one a year ago"],
    afterItems: ["Appeared in 3 of 10 questions", "Hours, menu and photos updated", "Description with cuisine, area and specialties", "Process to request genuine reviews from customers"],
  },
  steps: {
    title: "How it works",
    items: [
      ["We analyze your business", "We ask ChatGPT, Gemini and Google the questions your customers ask, and review your profile, website and social media with a checklist for your category."],
      ["We prepare the improvements", "You get ready-to-use copy: description, FAQ, services, location content and templates to request genuine reviews."],
      ["We measure again", "After 30 days we repeat the same questions and show you what changed, with dates and evidence."],
    ],
  },
  categories: { title: "For every kind of business in Ecuador", subtitle: "Each category has its own checklist: a restaurant isn't evaluated like a hotel or a mechanic.", all: "See all categories", more: "See details" },
  services: {
    title: "What the AI Visibility Improvement Pack includes",
    subtitle: "Spanish by default, English if you serve international visitors.",
    items: ["Initial AI visibility audit", "Competitor comparison", "Customer question analysis", "Google Business Profile recommendations", "Business description rewrite", "Website FAQ", "Service and product descriptions", "Location-specific content", "Review-request templates", "Directory recommendations", "Social media improvements", "Technical SEO where relevant", "30-day improvement plan", "Follow-up report"],
  },
  pricing: {
    title: "Simple pricing",
    subtitle: "Launch pricing. Pay once; the monthly plan is optional.",
    ec: "Businesses in Ecuador",
    intl: "International clients",
    once: "one-time",
    month: "/mo",
    founder: "Founder price · first 10 clients",
    names: { free: "Free", business: "Business", pro: "Pro" },
    cta: { free: "Get my free audit", business: "I want Business", pro: "I want Pro" },
    disclaimer: "We don't guarantee rankings, recommendations, customers or sales. No honest provider can.",
    payNow: "Pay now with PayPal or card",
    payFirstMonth: "Pay your first month with PayPal or card",
    payAfter: "After paying, fill in the form to get started.",
    payFail: "PayPal didn't load. Message us on WhatsApp and we'll send you a payment link.",
    monthlyNote: "Billed month to month: each month we send you the payment link on WhatsApp. Cancel anytime.",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      ["Do you guarantee ChatGPT will recommend my business?", "No. Nobody can: AI answers change and depend on each user. What we do is measure with real questions and improve the public information AI uses to decide."],
      ["How do you run the queries?", "Today most are manual: we type the questions into each platform from a clean session and log the answer, date and cited sources. Every report states what was manual and what was automated."],
      ["Do you need my Google password?", "Never. If you want us to apply changes, you add us as a manager on your profile and can remove us anytime. Nothing is changed without your permission."],
      ["Do you write reviews?", "No. We never write or buy reviews. We give you templates to ask real customers for honest reviews, with nothing offered in return."],
      ["My business is small or rural — does this work?", "Yes. Small-town businesses often face less competition in AI answers, so small improvements can show more."],
      ["How much of my time does it take?", "About 20 minutes to answer a few questions. We do the rest."],
      ["Do you issue invoices?", "Yes, we issue the sales receipt that applies under our tax regime with Ecuador's SRI."],
    ],
  },
  contact: { title: "Let's talk", subtitle: "Request your free audit or write to us directly.", whatsapp: "Message on WhatsApp", email: "Send an email", form: "Use the form", waText: "Hi TAREXEN, I'd like a free audit of my business." },
  footer: { tagline: "AI visibility for businesses in Ecuador.", privacy: "Privacy", disclaimer: "ChatGPT, Gemini, Claude and Google are trademarks of their respective owners. TAREXEN is not affiliated with any AI company.", admin: "Team login" },
  form: {
    title: "Free audit of your business",
    subtitle: "Takes about 5 minutes. We'll send your snapshot by WhatsApp or email within 2–3 business days.",
    sections: { business: "Your business", location: "Location", area: "Where you serve", online: "Online presence", offer: "What you offer", contact: "Contact" },
    name: "Business name", category: "Category", subcategory: "Business type", otherIndustry: "What is your industry?",
    province: "Province", canton: "Canton", parish: "Parish", parishText: "Parish or area (type it)", neighborhood: "Neighborhood or landmark", address: "Address (optional)",
    hasLocation: "I have a physical location where I serve customers", inPerson: "I serve in person", online: "I serve online", delivery: "I offer delivery",
    deliveryArea: "Delivery area", serviceArea: "Service area (cantons or areas you cover)", nearby: "Nearby cities you serve",
    website: "Website", gbp: "Google Maps / Business Profile link", social: "Social media links (one per line)",
    products: "Main products or services", target: "Who are your customers?", targetHint: "E.g.: local families, international tourists, companies…",
    contactName: "Your name", email: "Email", whatsapp: "WhatsApp", contactHint: "Leave at least an email or WhatsApp.", lang: "Report language",
    consent: "I agree that TAREXEN may use this data to prepare my audit and contact me about it, according to the privacy policy.", privacyLink: "Read the privacy policy",
    submit: "Send and request my free audit", sending: "Sending…", select: "Select…", optional: "optional", noParishes: "We don't have this canton's parish list yet — please type it below.",
    errors: "Please check the highlighted fields.",
  },
  thanks: { title: "We received your request!", body: "We'll review how your business appears on the main AI and search platforms and get back to you within 2–3 business days.", next: "Meanwhile:", tip: "Make sure your Google profile has current hours, photos and phone number.", back: "Back to home" },
  catPage: { eyebrow: "AI visibility for", questions: "Questions your customers ask", questionsNote: "Examples of what we test on ChatGPT, Gemini and Google, adapted to your city.", checks: "What we check", base: "For every business", specific: "Specific to your category", types: "Business types", cta: "Analyze my business for free" },
  meta: { title: "TAREXEN AI Visibility — Does your business show up in ChatGPT and Gemini?", description: "AI visibility audits for businesses in Ecuador: restaurants, hotels, shops, mechanics and more. Free snapshot." },
};

const DICTS: Record<Lang, Dict> = { es, en };

export function t(lang: Lang): Dict {
  // Respaldo en español por si una ruta llega con un idioma inválido.
  return DICTS[lang] ?? DICTS.es;
}

export function catName(c: { name_es: string; name_en: string }, lang: Lang) {
  return lang === "en" ? c.name_en : c.name_es;
}
