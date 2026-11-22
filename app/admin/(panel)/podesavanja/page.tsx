import { deleteAdminAction } from "@/app/admin/actions";
import { AdminAddForm } from "@/components/admin/AdminAddForm";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "Podešavanja" };

export default async function Page() {
  const s = await requireAdmin();
  const admins = await query<{ id: number; email: string }>("SELECT id, email FROM admins ORDER BY id");
  return (
    <div className="max-w-md">
      <h1 className="font-serif text-4xl">Podešavanja</h1>
      <p className="mt-2 text-sm text-muted">Prijavljeni ste kao {s.email}</p>
      <h2 className="mt-10 mb-4 font-serif text-2xl">Promena lozinke</h2>
      <PasswordForm />

      <h2 className="mt-14 mb-4 font-serif text-2xl">Administratori</h2>
      <ul className="mb-8 divide-y divide-line border-y border-line">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="truncate">{a.email}{a.id === s.id && <span className="ml-2 text-xs text-muted">(Vi)</span>}</span>
            {a.id !== s.id && admins.length > 1 && (
              <form action={deleteAdminAction}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-xs text-red-400 hover:underline">Ukloni</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <h3 className="mb-3 text-sm font-medium">Dodaj novog administratora</h3>
      <AdminAddForm />
    </div>
  );
}
