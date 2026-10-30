# Despliegue gratis: GitHub + Turso + Netlify

**Por qué no Vercel:** su plan gratis (Hobby) es solo para uso personal **no comercial**; un negocio necesita Pro (de pago). Netlify y Turso tienen planes gratuitos sin esa restricción según fuentes de 2026 — **revisa sus términos al registrarte** porque cambian.

Costo: USD 0. Tiempo: ~20 minutos. Las cuentas las creas tú (nadie más debe crearlas ni ver tus contraseñas).

Los valores secretos de producción (ADMIN_PASSWORD y SESSION_SECRET ya generados) están en `.env.production.local` en tu computadora. **Ese archivo no se sube a GitHub.**

## 1. GitHub (repositorio privado)
1. Entra a https://github.com/new
2. Nombre: `tarexen` · **Private** · sin README, sin .gitignore, sin licencia.
3. Crear. Luego el código se sube con:
   ```bash
   git remote add origin https://github.com/trextheman8206/tarexen.git
   git push -u origin main
   ```

## 2. Turso (base de datos)
1. https://turso.tech → **Sign up with GitHub**.
2. Create Database → nombre `tarexen` → región en **EE. UU. Este** (cercana a Ecuador y a las funciones de Netlify).
3. En la base de datos: copia la **URL** (`libsql://tarexen-…turso.io`). **Cambia `libsql://` por `https://`** (HTTP funciona mejor en servidores sin estado).
4. **Create token** → permiso de lectura y escritura → copia el token (solo se muestra una vez).
5. Pega ambos en `.env.production.local` como `DATABASE_URL` y `DATABASE_AUTH_TOKEN`.

Las tablas y datos iniciales (12 categorías, 24 provincias, 221 cantones) se crean solos en la primera visita.

## 3. Netlify (hosting)
1. https://app.netlify.com → **Sign up with GitHub**.
2. **Add new project → Import an existing project → GitHub** → autoriza solo el repo `tarexen`.
3. La configuración de build se lee de `netlify.toml` (no cambies nada).
4. Antes de desplegar, en **Environment variables** agrega (marca las secretas como *Contains secret values*):

   | Variable | Valor |
   |---|---|
   | `ADMIN_PASSWORD` | de `.env.production.local` |
   | `SESSION_SECRET` | de `.env.production.local` |
   | `DATABASE_URL` | URL de Turso con `https://` |
   | `DATABASE_AUTH_TOKEN` | token de Turso |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | opcional, ej. `593991234567` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | opcional |

5. **Deploy**. Al terminar tendrás una URL tipo `https://nombre.netlify.app`.
6. Cambia el nombre del sitio en *Site configuration → Change site name* (ej. `tarexen`).
7. Agrega `NEXT_PUBLIC_SITE_URL` = tu URL final y vuelve a desplegar (*Deploys → Trigger deploy*). Las variables `NEXT_PUBLIC_*` se fijan al compilar, por eso requieren redeploy.

## 4. Verificación
- `/es` y `/en` cargan; `/es/categorias` muestra 12 categorías (confirma que la base de datos conecta).
- Envía un análisis de prueba → aparece en `/admin/negocios` → cámbialo a "Perdido" o anótalo como prueba.
- `/admin/integraciones` debe decir "Remota (libSQL/Turso)".

## Límites a vigilar
- Netlify gratis funciona con créditos mensuales; si se agotan, el sitio se pausa hasta el mes siguiente. Revisa el uso en el panel.
- El límite anti-spam y de intentos de login es por instancia de servidor (protección básica). La contraseña de admin es larga y aleatoria; no la reutilices.
- Dominio propio (`.com`/`.ec`): opcional, cuando haya ingresos.
