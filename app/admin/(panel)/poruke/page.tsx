import Link from "next/link";
import { emptyTrashAction, messageAction } from "@/app/admin/actions";
import { query } from "@/lib/db";

export const metadata = { title: "Poruke" };

const FOLDERS = [
  { key: "nove", label: "Nepročitano", where: "is_read = 0 AND deleted_at IS NULL" },
  { key: "procitano", label: "Pročitano", where: "is_read = 1 AND deleted_at IS NULL" },
  { key: "obrisano", label: "Obrisano", where: "deleted_at IS NOT NULL" },
] as const;

type Folder = (typeof FOLDERS)[number]["key"];

function Op({ id, op, label, danger }: { id: number; op: string; label: string; danger?: boolean }) {
  return (
    <form action={messageAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button className={danger ? "text-red-300" : "text-muted hover:text-gold"}>{label}</button>
    </form>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ folder?: string }> }) {
  const { folder: f } = await searchParams;
  const folder: Folder = FOLDERS.some((x) => x.key === f) ? (f as Folder) : "nove";
  const current = FOLDERS.find((x) => x.key === folder)!;

  const [[counts], msgs] = await Promise.all([
    query<Record<Folder, number>>(
      `SELECT SUM(is_read = 0 AND deleted_at IS NULL) AS nove,
              SUM(is_read = 1 AND deleted_at IS NULL) AS procitano,
              SUM(deleted_at IS NOT NULL) AS obrisano FROM messages`,
    ),
    query<{ id: number; name: string; email: string; message: string; is_read: number; created_at: Date; deleted_at: Date | null }>(
      `SELECT * FROM messages WHERE ${current.where} ORDER BY id DESC LIMIT 200`,
    ),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl">Poruke</h1>
      <p className="mt-2 text-sm text-muted">Poruke poslate preko kontakt forme.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FOLDERS.map((x) => (
          <Link
            key={x.key}
            href={`/admin/poruke?folder=${x.key}`}
            className={`border px-3 py-1.5 text-xs uppercase tracking-widest ${
              folder === x.key ? "border-gold text-gold" : "border-line text-muted hover:text-gold"
            }`}
          >
            {x.label} <span className="ml-1 opacity-70">{Number(counts?.[x.key] ?? 0)}</span>
          </Link>
        ))}
        {folder === "obrisano" && msgs.length > 0 && (
          <form action={emptyTrashAction} className="ml-auto">
            <button className="text-xs uppercase tracking-widest text-red-300">Isprazni obrisano</button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {msgs.map((m) => (
          <article key={m.id} className={`border p-5 ${folder === "nove" ? "border-gold/50 bg-surface" : "border-line bg-surface/60"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-xl">{m.name}</p>
              <p className="text-xs text-muted">{new Date(m.created_at).toLocaleString("sr-RS")}</p>
            </div>
            <a href={`mailto:${m.email}`} className="text-sm text-gold">{m.email}</a>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-5 text-xs uppercase tracking-widest">
              {folder === "nove" && <Op id={m.id} op="read" label="Označi kao pročitano" />}
              {folder === "procitano" && <Op id={m.id} op="unread" label="Vrati u nepročitano" />}
              {folder === "obrisano" ? (
                <>
                  <Op id={m.id} op="restore" label="Vrati" />
                  <Op id={m.id} op="purge" label="Obriši trajno" danger />
                </>
              ) : (
                <Op id={m.id} op="trash" label="Obriši" danger />
              )}
            </div>
          </article>
        ))}
        {msgs.length === 0 && (
          <p className="py-10 text-muted">
            {folder === "nove" ? "Nema nepročitanih poruka." : folder === "procitano" ? "Nema pročitanih poruka." : "Folder Obrisano je prazan."}
          </p>
        )}
      </div>
    </div>
  );
}
