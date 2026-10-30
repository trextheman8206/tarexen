# TAREXEN AI Visibility — Arquitectura de negocio

> Estado: borrador v0.1 (30-oct-2026). Todo lo marcado **HIPÓTESIS** debe validarse con clientes reales antes de tratarse como hecho.

## 1. Qué aprendimos del modelo de referencia (topoftheanswer.com)

Revisado el 30-oct-2026. Es una sola página (una landing con anclas). Resumen del **modelo** (no copiamos marca, texto ni diseño):

| Elemento | Referencia (verificado en su web) | Lo que hacemos distinto |
|---|---|---|
| Cliente | Un solo nicho: contratistas de servicios del hogar en Tampa Bay, una sola ubicación | 12 categorías + "otra", todo Ecuador incluyendo pueblos y zonas rurales |
| Oferta gratis | "Snapshot" de una página, solicitado por email/teléfono (no tiene formulario) | Formulario guiado con ubicación INEC (provincia → cantón → parroquia) + WhatsApp |
| Oferta principal | Pago único: auditoría de 10 preguntas, reescritura de Google Business Profile, FAQ con datos estructurados, plantillas de reseñas, checklist de directorios, re-medición a 30 días | Igual de enfocado, pero con **checklists por categoría** (restaurante ≠ hotel ≠ mecánica) |
| Recurrente | Mensual: chequeo, posts en GBP, borradores de respuestas a reseñas | Plan Pro similar + multi-ubicación |
| Precios verificados | **USD 297** pago único (precio "fundador" para 5 clientes; regular USD 497) y **USD 149/mes** | Ver §4 — Ecuador necesita precios muy inferiores |
| Confianza | Reembolso de 14 días, sin garantías de ranking, sin reseñas falsas, fundador con nombre y teléfono | Mismo nivel de honestidad + registro auditable de cada consulta (plataforma, fecha, método) |
| Método | No declara si es manual o automatizado | **Declaramos** qué fue manual y qué fue por API en cada informe |

Debilidades de la referencia que aprovechamos: no tiene testimonios ni informe de ejemplo publicado, no publica sus datos crudos, y solo atiende un nicho. Nosotros publicamos un **informe de ejemplo ilustrativo** claramente rotulado y guardamos evidencia de cada consulta.

## 2. Propuesta de valor

**Para** dueños de negocios en Ecuador **que** pierden clientes porque ChatGPT, Gemini o Google no los mencionan (o los describen mal), **TAREXEN** mide cómo aparecen hoy, corrige la información pública que la IA usa (Google Business Profile, web, directorios, reseñas reales) y **vuelve a medir** a los 30 días.

Lo que **nunca** prometemos: posiciones, recomendaciones garantizadas, clientes ni ventas.

## 3. Segmentos — hipótesis de prioridad

| Segmento | Capacidad de pago | Urgencia percibida | Facilidad de venta | Prioridad inicial |
|---|---|---|---|---|
| Hoteles, hostales, tour operadores (Quito, Otavalo/Cotacachi, Baños, Cuenca, Galápagos, Montañita) | Alta (venden a turistas en USD, ya pagan Booking/Airbnb) | Alta: turistas extranjeros usan ChatGPT para planificar | Media | **1** |
| Restaurantes en zonas turísticas | Media | Media-alta | Alta (muchos, visibles, fácil de demostrar) | **2** |
| Clínicas, dentistas, veterinarias, profesionales | Media-alta | Media | Media | **3** |
| Mecánicas, servicios del hogar | Media-baja | Baja-media | Media | 4 |
| Tiendas de barrio / bodegas | Baja | Baja (clientela de barrio, WhatsApp) | Baja | 5 — solo oferta gratuita o paquete mínimo |

**HIPÓTESIS:** turismo y salud tienen mayor disposición a pagar; bodegas probablemente no pagarán por "visibilidad en IA" pero sí por "aparecer en Google Maps con horario y delivery". Se valida en `03-validacion.md`.

## 4. Precios

### 4.1 Datos verificados
- Referencia (EE. UU.): USD 297 pago único (regular USD 497) y USD 149/mes — topoftheanswer.com, 30-oct-2026.
- Salario Básico Unificado Ecuador 2026: **USD 482/mes** (El Universo, Teleamazonas).
- Referencias de SEO local (no ecuatorianas): Perú S/ 800–2.500/mes (kom.pe); media global de SEO local USD 1.557/mes (encuesta Ahrefs). **No encontramos tarifas publicadas de Ecuador** → hay que levantarlas pidiendo 3–5 cotizaciones a agencias locales.

### 4.2 Precios propuestos (HIPÓTESIS — no publicar como definitivos sin validar)

| Plan | Ecuador (local) | Internacional / negocios turísticos que cobran en USD altos | Contenido |
|---|---|---|---|
| Gratis | USD 0 | USD 0 | Snapshot: 3 preguntas en 2 plataformas, puntaje básico, 3 sugerencias |
| Business (pago único) | **USD 49–99** a probar (ancla ~10–20 % de un SBU) | **USD 197–297** | Auditoría completa (10 preguntas × plataformas), competidores, GBP, descripción, FAQ, checklist por categoría, plan 30 días, re-medición |
| Pro (mensual) | **USD 19–39/mes** | **USD 79–149/mes** | Monitoreo mensual, informe, contenido nuevo, borradores de respuesta a reseñas, ubicaciones extra |

Reglas de prueba: precio "fundador" para los primeros 10 clientes a cambio de testimonio y permiso para publicar el caso (anonimizado si lo prefieren). Probar dos precios (p. ej. 49 vs 89) en conversaciones distintas y registrar la tasa de cierre. Los precios viven en `src/config/pricing.ts` con la etiqueta `status: "proposed"` hasta validarse.

## 5. Entregables (AI Visibility Improvement Pack)

1. Auditoría inicial de visibilidad en IA (consultas reales registradas)
2. Comparación con competidores mencionados
3. Análisis de preguntas de clientes
4. Recomendaciones para Google Business Profile
5. Reescritura de la descripción del negocio
6. Preguntas frecuentes para la web (con datos estructurados FAQPage/LocalBusiness)
7. Descripciones de servicios y productos
8. Contenido por ubicación (cantón, parroquia, zonas atendidas)
9. Plantillas para pedir reseñas (sin incentivos)
10. Directorios recomendados (Google, Apple Maps, Bing Places, TripAdvisor, Booking/Airbnb, PedidosYa, Facebook, Instagram, directorios de cámaras de comercio)
11. Mejoras de redes sociales
12. SEO técnico cuando aplique
13. Plan de 30 días
14. Informe de seguimiento (re-medición)

Español por defecto; inglés para negocios con clientes turistas. Cada recomendación lleva su base: **hallazgo** (enlazado a la consulta/chequeo) o **supuesto** (explícito).

## 6. Adquisición de clientes (USD 0)

1. **Snapshot gratis como gancho** — el formulario del sitio + WhatsApp.
2. **Prospección directa con evidencia**: elegir 20 negocios de una ciudad, hacer la consulta real ("mejor restaurante en Cotacachi") y mostrarle al dueño la captura de pantalla de quién aparece. Es el argumento de venta más fuerte y es verdadero.
3. **Visitas presenciales** en zonas turísticas (Imbabura, Quito centro histórico, Baños).
4. **Alianzas**: cámaras de turismo/comercio cantonales, contadores (ya atienden pymes), diseñadores web.
5. **Páginas por categoría** con contenido real (checklists, preguntas típicas) — no cientos de páginas delgadas por ciudad.
6. **Grupos de Facebook/WhatsApp de emprendedores** locales: aportar valor (mini-guías), no spam.

## 7. Legal y ética (Ecuador) — a verificar con un contador/abogado

- **RUC**: obligatorio para facturar. Persona natural es lo más simple al inicio.
- **RIMPE** (según fuentes secundarias 2026, verificar en sri.gob.ec):
  - *Negocio popular*: ingresos brutos anuales hasta USD 20.000; no obligado a factura electrónica; comprobantes con la leyenda "Negocio Popular – Régimen RIMPE". Hay actividades excluidas — **confirmar si servicios profesionales/consultoría califican**.
  - *Emprendedor*: USD 20.000–300.000; factura electrónica obligatoria (requiere firma electrónica).
  - En 2026 el SRI anunció recategorizaciones y nuevas obligaciones para proveedores de facturación electrónica.
- **Clientes internacionales**: exportación de servicios; consultar tratamiento de IVA con un contador.
- **Protección de datos**: Ley Orgánica de Protección de Datos Personales (R.O. 459, 26-may-2021) y su Reglamento (Decreto 904, R.O. 435, 13-nov-2023). Implementado en el sitio: consentimiento explícito en el formulario, política de privacidad, finalidad limitada, derecho de acceso/eliminación por email. Pendiente: revisión por abogado.
- **Prohibido**: reseñas falsas o compradas, incentivos por reseñas, prometer rankings, inventar resultados de IA, editar fichas de clientes sin permiso escrito (se pide acceso como *administrador* del perfil, nunca la contraseña).
- **Marcas**: ChatGPT, Gemini, Claude y Google son marcas de terceros; no estamos afiliados — se declara en el pie de página.

## Fuentes
- https://topoftheanswer.com/ (revisado 30-oct-2026)
- https://www.eluniverso.com/noticias/economia/salario-basico-unificado-2026-482-ecuador-servicio-incrementos-multas-nota/
- https://www.siigo.com/ec/blog/obligaciones-fiscales/rimpe-emprendedores/
- https://primicias.ec/noticias/economia/negocios-populares-facturacion-electronica-ecuador
- https://www.vistazo.com/negocios/economia/2026-07-30-proveedores-sistemas-facturacion-electronica-deberan-registrarse-sri-ecuador-NC11138036
- https://seps.gob.ec/wp-content/uploads/Ley-Orgánica-de-Protección-de-Datos-Personales-2022.pdf
- https://nmslaw.com.ec/?p=13184 (Reglamento LOPDP)
- https://kom.pe/cuanto-cuesta-seo-peru-2026/ · https://ahrefs.com/es/blog/seo-pricing/
