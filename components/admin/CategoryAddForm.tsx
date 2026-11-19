"use client";

import { useActionState } from "react";
import { addCategoryAction, type FormState } from "@/app/admin/actions";

export function CategoryAddForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addCategoryAction, {});
  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <input name="name" required placeholder="Naziv (npr. Muški setovi)" className="field !w-72" />
        <input name="slug" placeholder="slug (opciono)" className="field !w-56" />
        <button disabled={pending} className="btn btn-gold">Dodaj</button>
      </div>
      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-300">{state.ok}</p>}
    </form>
  );
}
