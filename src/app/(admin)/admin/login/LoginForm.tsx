"use client";

import { useActionState } from "react";
import { login } from "../actions";

type Labels = { email: string; emailHint: string; password: string; submit: string; pending: string };

export function LoginForm({ labels: L }: { labels: Labels }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="stack">
      {state?.error && <p className="alert alert-error" role="alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="email">{L.email}</label>
        <input id="email" name="email" type="email" autoComplete="username" />
        <span className="hint">{L.emailHint}</span>
      </div>
      <div className="field">
        <label htmlFor="password">{L.password}</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? L.pending : L.submit}</button>
    </form>
  );
}
