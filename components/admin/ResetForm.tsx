"use client";

import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "@/app/admin/actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input name="next" type="password" required minLength={8} autoComplete="new-password" placeholder="Nova lozinka (min. 8 karaktera)" className="field" />
      <input name="repeat" type="password" required autoComplete="new-password" placeholder="Ponovite novu lozinku" className="field" />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="btn btn-gold w-full">{pending ? "Čuvanje…" : "Postavi lozinku"}</button>
    </form>
  );
}
