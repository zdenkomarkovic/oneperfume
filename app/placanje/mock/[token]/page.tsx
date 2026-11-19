import { notFound, redirect } from "next/navigation";
import { getOrderByToken, markFailed, markPaid } from "@/lib/orders";
import { getProvider } from "@/lib/payments";
import { formatPrice } from "@/lib/products";

export const metadata = { title: "Test plaćanje", robots: { index: false, follow: false } };

/** LAŽNI gateway – postoji samo kad je PAYMENT_PROVIDER=mock i nije produkcija. */
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (getProvider()?.name !== "mock") notFound();
  const o = await getOrderByToken(token);
  if (!o) notFound();

  async function pay() {
    "use server";
    if (getProvider()?.name !== "mock") return;
    await markPaid(token, `mock-${Date.now()}`, o!.total);
    redirect(`/placanje/rezultat?token=${token}`);
  }
  async function decline() {
    "use server";
    if (getProvider()?.name !== "mock") return;
    await markFailed(token);
    redirect(`/placanje/rezultat?token=${token}`);
  }

  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">Test okruženje – nije pravi gateway</p>
      <h1 className="mt-4 font-serif text-5xl">Plaćanje karticom</h1>
      <p className="mt-6 text-muted">Porudžbina #{o.id} · {formatPrice(o.total)}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <form action={pay}><button className="btn btn-gold">Simuliraj uspešno plaćanje</button></form>
        <form action={decline}><button className="btn btn-ghost">Simuliraj odbijenu karticu</button></form>
      </div>
    </div>
  );
}
