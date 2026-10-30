"use client";

import { useActionState, useEffect } from "react";
import { acceptInviteAction } from "../../actions";

export function JoinForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInviteAction, null);
  useEffect(() => {
    if (state?.done) window.location.assign("/admin");
  }, [state]);
  if (state?.done) return <p className="alert alert-ok">✓ Acceso creado. Entrando al panel…</p>;
  return (
    <form action={action} className="stack" key={state?.error ?? "new"}>
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="alert alert-error" role="alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="name">Tu nombre</label>
        <input id="name" name="name" type="text" required autoComplete="name" defaultValue={state?.values.name} />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state?.values.email} />
        <span className="hint">Lo usarás para ingresar al panel.</span>
      </div>
      <div className="field">
        <label htmlFor="password">Crea una contraseña</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
        <span className="hint">Mínimo 10 caracteres.</span>
      </div>
      <div className="field">
        <label htmlFor="password2">Repite la contraseña</label>
        <input id="password2" name="password2" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Creando acceso…" : "Crear mi acceso"}</button>
    </form>
  );
}
