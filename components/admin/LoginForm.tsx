"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" required autoComplete="username" placeholder="Email" className="field" />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Lozinka" className="field" />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="btn btn-gold w-full">
        {pending ? "Prijava…" : "Prijavi se"}
      </button>
    </form>
  );
}
