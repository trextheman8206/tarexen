"use client";

import { useActionState, useEffect } from "react";
import { acceptInviteAction } from "../../actions";

type Labels = {
  done: string; name: string; email: string; emailHint: string; password: string;
  passwordHint: string; repeat: string; pending: string; submit: string;
};

export function JoinForm({ token, labels: L }: { token: string; labels: Labels }) {
  const [state, action, pending] = useActionState(acceptInviteAction, null);
  useEffect(() => {
    if (state?.done) window.location.assign("/admin");
  }, [state]);
  if (state?.done) return <p className="alert alert-ok">{L.done}</p>;
  return (
    <form action={action} className="stack" key={state?.error ?? "new"}>
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="alert alert-error" role="alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="name">{L.name}</label>
        <input id="name" name="name" type="text" required autoComplete="name" defaultValue={state?.values.name} />
      </div>
      <div className="field">
        <label htmlFor="email">{L.email}</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state?.values.email} />
        <span className="hint">{L.emailHint}</span>
      </div>
      <div className="field">
        <label htmlFor="password">{L.password}</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
        <span className="hint">{L.passwordHint}</span>
      </div>
      <div className="field">
        <label htmlFor="password2">{L.repeat}</label>
        <input id="password2" name="password2" type="password" required minLength={10} autoComplete="new-password" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? L.pending : L.submit}</button>
    </form>
  );
}
