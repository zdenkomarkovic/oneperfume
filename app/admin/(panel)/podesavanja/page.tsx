import { PasswordForm } from "@/components/admin/PasswordForm";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Podešavanja" };

export default async function Page() {
  const s = await requireAdmin();
  return (
    <div className="max-w-md">
      <h1 className="font-serif text-4xl">Podešavanja</h1>
      <p className="mt-2 text-sm text-muted">Prijavljeni ste kao {s.email}</p>
      <h2 className="mt-10 mb-4 font-serif text-2xl">Promena lozinke</h2>
      <PasswordForm />
    </div>
  );
}
