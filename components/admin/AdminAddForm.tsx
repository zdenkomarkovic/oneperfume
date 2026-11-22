"use client";

import { useActionState } from "react";
import { addAdminAction, type FormState } from "@/app/admin/actions";

export function AdminAddForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAdminAction, {});
  return (
    <form action={action} className="space-y-3">
      <input name="email" type="email" required autoComplete="off" placeholder="Email novog administratora" className="field" />
      <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Početna lozinka (min. 8 karaktera)" className="field" />
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-300">{state.ok}</p>}
      <button disabled={pending} className="btn btn-gold">Dodaj administratora</button>
    </form>
  );
}
