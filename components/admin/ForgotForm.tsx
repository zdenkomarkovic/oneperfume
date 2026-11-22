"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "@/app/admin/actions";

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" required autoComplete="username" placeholder="Email administratora" className="field" />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-500">{state.ok}</p>}
      <button disabled={pending} className="btn btn-gold w-full">{pending ? "Slanje…" : "Pošalji link"}</button>
    </form>
  );
}
