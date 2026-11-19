import type { ReactNode } from "react";

export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Informacije</p>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl">{title}</h1>
      {intro && <p className="mt-6 max-w-3xl text-muted">{intro}</p>}
      <div className="mt-12 max-w-3xl space-y-10 leading-relaxed text-ink/80">{children}</div>
    </div>
  );
}

export function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 [&_a]:text-gold [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc">
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
