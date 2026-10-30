// PRECIOS PROPUESTOS — hipótesis de lanzamiento, NO validados con clientes.
// Fundamento y rangos a probar: docs/01-negocio.md §4. Cambiar `status` a
// "validated" solo cuando haya ventas reales a ese precio.
//
// Referencia verificada (no es nuestro precio): topoftheanswer.com cobra USD 297
// pago único (regular USD 497) y USD 149/mes — revisado el 30-oct-2026.

export type Region = "ec" | "intl";
export type PlanId = "free" | "business" | "pro";

export const PRICING_STATUS: "proposed" | "validated" = "proposed";

// PayPal "Hosted Buttons" (pago único). El client-id es público por diseño de PayPal.
// El monto lo define el botón en PayPal: si cambias el precio aquí, cámbialo también allá.
// Una suscripción mensual necesita un "plan" de suscripción creado en PayPal (no es un hosted button).
export const PAYPAL = {
  clientId: "BAATVRlYKMcD2WKRL_GvrdmTAUJ9qmRSk48hlIKvWNIMhaDKyiJgkuPCtExNVP7hTUqKWBBx2Em7yhZWEo",
  // Verificado en el botón renderizado: 557TC4Q5JXDCN cobra USD 29.00 ("pro"), pago único.
  // Falta crear en PayPal un botón de USD 69 para Business y agregarlo aquí como business_ec.
  hostedButtons: {
    pro_ec: "557TC4Q5JXDCN", // USD 29, pago de un mes
  } as Partial<Record<`${PlanId}_${Region}`, string>>,
};

export const PLANS: {
  id: PlanId;
  price: Record<Region, number>;
  interval: "once" | "month";
  founder?: boolean;
  features: { es: string; en: string }[];
}[] = [
  {
    id: "free",
    price: { ec: 0, intl: 0 },
    interval: "once",
    features: [
      { es: "Snapshot básico de tu negocio", en: "Basic business snapshot" },
      { es: "3 preguntas reales en 2 plataformas", en: "3 real questions on 2 platforms" },
      { es: "3 sugerencias de mejora", en: "3 improvement suggestions" },
    ],
  },
  {
    id: "business",
    price: { ec: 69, intl: 197 },
    interval: "once",
    founder: true,
    features: [
      { es: "Auditoría completa: 10 preguntas × plataformas", en: "Full audit: 10 questions × platforms" },
      { es: "Comparación con competidores", en: "Competitor comparison" },
      { es: "Mejoras para Google Business Profile", en: "Google Business Profile improvements" },
      { es: "Descripción del negocio y FAQ para tu web", en: "Business description and website FAQ" },
      { es: "Checklist específico de tu categoría", en: "Category-specific checklist" },
      { es: "Plantillas para pedir reseñas reales", en: "Templates to request genuine reviews" },
      { es: "Plan de 30 días + re-medición", en: "30-day plan + re-measurement" },
    ],
  },
  {
    id: "pro",
    price: { ec: 29, intl: 79 },
    interval: "month",
    features: [
      { es: "Todo lo de Business", en: "Everything in Business" },
      { es: "Monitoreo mensual de visibilidad", en: "Monthly visibility monitoring" },
      { es: "Informe mensual", en: "Monthly report" },
      { es: "Nuevas ideas de contenido", en: "New content suggestions" },
      { es: "Borradores de respuesta a reseñas", en: "Review-response drafts" },
      { es: "Ubicaciones adicionales (cotización)", en: "Additional locations (quoted)" },
    ],
  },
];
