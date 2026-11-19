"use client";

import { useActionState } from "react";
import { changePasswordAction, type FormState } from "@/app/admin/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="space-y-3">
      <input name="current" type="password" required autoComplete="current-password" placeholder="Trenutna lozinka" className="field" />
      <input name="next" type="password" required minLength={8} autoComplete="new-password" placeholder="Nova lozinka (min. 8 karaktera)" className="field" />
      <input name="repeat" type="password" required autoComplete="new-password" placeholder="Ponovite novu lozinku" className="field" />
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-300">{state.ok}</p>}
      <button disabled={pending} className="btn btn-gold">Promeni lozinku</button>
    </form>
  );
}
