"use client";

import { useRouter } from "next/navigation";

/** Red tabele koji otvara stranicu klikom bilo gde u redu (Ctrl/Cmd+klik otvara u novom tabu). Linkovi unutar reda rade normalno. */
export function ClickableRow({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <tr
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button, input, select, textarea")) return;
        if (e.metaKey || e.ctrlKey) window.open(href, "_blank");
        else router.push(href);
      }}
      onMouseEnter={() => router.prefetch(href)}
      className="cursor-pointer hover:bg-surface"
    >
      {children}
    </tr>
  );
}
