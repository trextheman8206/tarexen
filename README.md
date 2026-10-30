# TAREXEN AI Visibility

Plataforma para medir y mejorar cómo aparecen los negocios de Ecuador en ChatGPT, Gemini, Google y otros asistentes de IA. Español primero, inglés disponible. Costo de operación: USD 0.

- **Negocio, precios, legal:** [docs/01-negocio.md](docs/01-negocio.md)
- **Arquitectura y fases:** [docs/02-arquitectura.md](docs/02-arquitectura.md)
- **Plan de validación (1–2 h/día):** [docs/03-validacion.md](docs/03-validacion.md)

## Qué hay en v0.1 (Fases A, B, C y parte de D)

| Área | Ruta |
|---|---|
| Landing ES/EN con ejemplo ilustrativo, antes/después, 3 pasos, servicios, precios, FAQ, contacto | `/es`, `/en` |
| Páginas por categoría (contenido real desde la BD, sin páginas delgadas) | `/es/categorias/[slug]` |
| Formulario de análisis gratis: provincia → cantón → parroquia, áreas de servicio, consentimiento LOPDP | `/es/analisis-gratis` |
| Panel: resumen, embudo, ingresos, re-mediciones pendientes | `/admin` |
| Negocios y leads: estado comercial, notas, pagos, auditorías | `/admin/negocios` |
| Auditoría manual: consultas (plataforma, fecha, mencionados, competidores, fuentes), re-prueba, checklist por categoría, recomendaciones con base (hallazgo/supuesto) | `/admin/auditorias/[id]` |
| Informe imprimible ES/EN → PDF | `/admin/informe/[id]` |
| Categorías editables sin código (tipos, checklist, preguntas) | `/admin/categorias` |
| Estado real de integraciones | `/admin/integraciones` |

**No incluido todavía:** panel del cliente con login, conectores de API de IA, envío de emails, cobros en línea, suscripciones. Ver fases en `docs/02-arquitectura.md`.

## Ejecutar en local

```bash
npm install
cp .env.example .env.local   # completa ADMIN_PASSWORD y SESSION_SECRET
npm run dev
```

Abre http://localhost:3000. La base de datos (`data/tarexen.db`) se crea sola con las 12 categorías, 24 provincias y 221 cantones.

## Parroquias

Vienen precargadas solo las de Cotacachi, Ibarra y Otavalo. En los demás cantones el formulario pide escribir la parroquia. Para cargar el DPA oficial del INEC (CSV con columnas `provincia,canton,parroquia[,tipo]`):

```bash
npm run import:parishes -- ruta/al/archivo.csv
```

## Publicar gratis

1. Base de datos en [Turso](https://turso.tech) (plan gratis) → `DATABASE_URL` y `DATABASE_AUTH_TOKEN`.
2. Repo en GitHub → importar en Vercel (Hobby) → copiar variables de `.env.example`.
3. Configurar `NEXT_PUBLIC_WHATSAPP_NUMBER` y `NEXT_PUBLIC_CONTACT_EMAIL` para que aparezcan los botones de contacto.

## Reglas del producto (no negociables)

- Nunca mostrar una consulta a IA que no se hizo. Cada consulta guarda plataforma, método (manual/API), fecha y hora.
- Nunca garantizar rankings, recomendaciones, clientes ni ventas.
- Nunca escribir ni comprar reseñas.
- Datos DEMO siempre marcados como DEMO y excluidos de las métricas.
- Las claves de API solo viven en variables de entorno del servidor.
