# TAREXEN — Arquitectura de producto y técnica

## 1. Principios
- **Vendible primero**: lo mínimo que permite captar leads, hacer auditorías manuales y entregar un informe profesional.
- **Honestidad verificable**: cada resultado de IA se guarda con plataforma, fecha/hora, método (`manual` | `api`) y evidencia. La UI nunca muestra una integración como activa si no está configurada y probada.
- **Configurable sin código**: categorías, subcategorías, checklists y preguntas de ejemplo viven en la base de datos y se editan desde el panel de administración.
- **Costo USD 0**: todo corre en planes gratuitos.

## 2. Stack

| Capa | Elección | Por qué / plan gratis |
|---|---|---|
| Web + API | Next.js 15 (App Router, Server Actions), TypeScript | Despliegue gratis en Vercel (Hobby) o Netlify |
| Base de datos | libSQL/SQLite vía `@libsql/client` | Local: archivo `data/tarexen.db` sin cuentas. Producción: Turso (plan gratis) cambiando solo `DATABASE_URL` + `DATABASE_AUTH_TOKEN` |
| Estilos | CSS propio con tokens (sin dependencias) | Carga rápida, accesible |
| Auth admin | Contraseña en variable de entorno + cookie firmada HMAC (httpOnly, SameSite=Lax) | Sin servicios externos. Cuentas de clientes llegan en Fase D (Auth.js o Supabase Auth) |
| Informes | Página HTML imprimible → "Guardar como PDF" del navegador | Sin servicios de PDF pagados |
| Contacto | Enlaces `wa.me` y `mailto:` | Sin API de WhatsApp Business pagada |

## 3. Modelo de datos (resumen)

```
categories(id, slug, name_es, name_en, description_es, description_en, icon, sort, active)
subcategories(id, category_id → categories, slug, name_es, name_en, active)
checklist_items(id, category_id → categories, key, label_es, label_en, help_es, weight, sort, active)
example_questions(id, category_id → categories, text_es, text_en)

provinces(code, name)            -- 24, códigos INEC
cantons(code, province_code, name)   -- 221
parishes(code, canton_code, name, kind urbana|rural)  -- importable desde DPA INEC

businesses(id, name, category_id, subcategory_id, other_industry, province_code, canton_code,
           parish_code, parish_text, neighborhood, address, website, gbp_url, social_json,
           contact_name, contact_email, contact_whatsapp, products_services, target_customers,
           service_mode in_person|online|both, delivery_area, service_area, nearby_cities,
           preferred_lang es|en, consent_at, consent_text_version, source, status, notes,
           created_at, updated_at)
           status: nuevo → contactado → snapshot_enviado → propuesta → cliente → perdido

audits(id, business_id, kind snapshot|full|followup, status borrador|en_progreso|completada,
       parent_audit_id (re-medición), summary, created_at, completed_at)
audit_queries(id, audit_id, question, platform, method manual|api, tested_at, location_context,
       business_appeared 0/1, position, businesses_mentioned, competitors, sources_cited,
       raw_answer, observations, retest_of_id)
audit_checks(id, audit_id, checklist_item_id, result pass|partial|fail|unknown, evidence, note)
recommendations(id, audit_id, area, text, basis finding|assumption, basis_ref, priority, lang)
payments(id, business_id, amount_usd, plan, method, paid_at, invoice_ref, note)
```

## 4. Integraciones con IA — situación real (USD 0)

| Plataforma | ¿API oficial? | Costo | Equivale a lo que ve el usuario | Modo en el prototipo |
|---|---|---|---|---|
| ChatGPT (app) | No hay API de la app; la API de OpenAI es un producto distinto | Pago | **No** (sin memoria/ubicación/búsqueda del usuario) | **Manual** |
| Gemini | API de Gemini con nivel gratuito limitado | Gratis con límites | Parcial | Manual (API en Fase E) |
| Claude | API de Anthropic | Pago | Parcial | Manual |
| Google Search / AI Overviews | No hay API oficial de AI Overviews; scraping viola los términos | — | — | **Manual** |
| Google Maps / Places | Places API (requiere cuenta de facturación) | Uso gratuito limitado | Sí para datos de la ficha | Manual (API opcional en Fase E) |

Flujo manual (el que se usa desde el día 1): navegador en ventana privada, sin sesión iniciada, ubicación declarada en la pregunta ("en Cotacachi"), se copia la respuesta completa y se registra en el panel. El informe indica "Método: manual" en cada consulta.

Las claves de API, cuando existan, viven **solo** en variables de entorno del servidor. La página `/admin/integraciones` muestra el estado real (no configurado / configurado, sin probar / probado con fecha).

## 5. Fases

| Fase | Contenido | Estado |
|---|---|---|
| A | Landing ES/EN, categorías, precios, FAQ, contacto, WhatsApp, páginas por categoría, privacidad | **Implementada (v0.1)** |
| B | Registro del negocio = formulario de snapshot gratis con ubicación dependiente y áreas de servicio | **Implementada (v0.1)** |
| C | Flujo de auditoría manual: consultas, re-test, checklist por categoría, recomendaciones con base | **Implementada (v0.1)** |
| D | Informe imprimible (implementado); panel del cliente con login, descargas, historial | Informe: hecho. Panel cliente: pendiente |
| E | Automatización por categoría (Gemini API gratis, Places API), generación asistida de FAQ/descripciones | Pendiente |
| F | Monitoreo recurrente, suscripciones, cobros (PayPhone / Kushki / PayPal / transferencia) | Pendiente |
| G | Expansión internacional (Perú, Colombia), multi-moneda | Pendiente |

## 6. Despliegue gratis (cuando quieras publicarlo)
1. Crear base en Turso (plan gratis) → copiar `DATABASE_URL` y `DATABASE_AUTH_TOKEN`.
2. Subir el repo a GitHub → importar en Vercel → definir variables de `.env.example`.
3. `npm run db:init` apuntando a Turso para crear tablas y datos semilla.
4. Dominio: empezar con el subdominio gratis de Vercel; comprar `.com`/`.ec` cuando haya ingresos.
