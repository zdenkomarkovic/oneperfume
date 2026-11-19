"use client";

import { useActionState } from "react";
import { addBrandAction, type FormState } from "@/app/admin/actions";

export function BrandAddForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addBrandAction, {});
  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <input name="name" required placeholder="Naziv brenda (npr. Lattafa)" className="field !w-72" />
        <button disabled={pending} className="btn btn-gold">Dodaj</button>
      </div>
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-300">{state.ok}</p>}
    </form>
  );
}
