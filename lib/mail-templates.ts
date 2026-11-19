import { SHOP } from "@/lib/products";

export type OrderMail = {
  name: string;
  rows: { qty: number; title: string; price: string }[];
  total: string;
  address: string;
  payment: string; // npr. "Plaćanje pouzećem kuriru" ili "Plaćeno karticom"
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function customerConfirmationText(o: OrderMail): string {
  return [
    `Poštovani/a ${o.name},`,
    "",
    "hvala vam na porudžbini! Primili smo je i uskoro ćemo vam se javiti radi potvrde. Pošiljku šaljemo kurirskom službom, a cenu dostave obračunava kurir prema svom cenovniku.",
    "",
    ...o.rows.map((r) => `${r.qty} × ${r.title} – ${r.price}`),
    "",
    `Ukupno: ${o.total} (${o.payment})`,
    `Adresa isporuke: ${o.address} (kurirska služba)`,
    "",
    `Pitanja? ${SHOP.phone} · ${SHOP.email}`,
    "",
    "One Perfume",
  ].join("\n");
}

/** HTML mejl u stilu sajta (tamna pozadina, zlatni akcenti, serif naslovi). Samo inline stilovi radi mail klijenata. */
export function customerConfirmationHtml(o: OrderMail): string {
  const serif = "Georgia,'Times New Roman',serif";
  const sans = "'Helvetica Neue',Arial,sans-serif";
  const gold = "#e8dfcf";
  const rows = o.rows
    .map(
      (r) => `<tr>
        <td style="padding:14px 0;border-bottom:1px solid #2a2420;font-family:${sans};font-size:14px;color:#f4ede2;">
          <span style="color:${gold};">${r.qty} ×</span>&nbsp; ${esc(r.title)}
        </td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid #2a2420;font-family:${sans};font-size:14px;color:#f4ede2;white-space:nowrap;">${esc(r.price)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="sr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Primili smo vašu porudžbinu</title></head>
<body style="margin:0;padding:0;background:#0c0a09;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a09;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#151210;border:1px solid #2a2420;">
    <tr><td align="center" style="background:${gold};padding:10px;font-family:${sans};font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#0c0a09;">
      One Perfume
    </td></tr>
    <tr><td align="center" style="padding:44px 32px 8px;">
      <div style="font-family:${sans};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${gold};">Porudžbina primljena</div>
      <h1 style="margin:18px 0 0;font-family:${serif};font-weight:normal;font-size:38px;line-height:1.1;color:#f4ede2;">
        Hvala vam, <em style="color:${gold};">${esc(o.name)}</em>
      </h1>
      <div style="margin:22px auto 0;width:40px;height:1px;background:${gold};"></div>
      <p style="margin:22px 0 0;font-family:${sans};font-size:15px;line-height:1.7;color:#9b9084;">
        Primili smo vašu porudžbinu. <strong style="color:#f4ede2;">Uskoro ćemo vam se javiti</strong> radi potvrde. Pošiljku šaljemo <strong style="color:#f4ede2;">kurirskom službom</strong>, a cenu dostave obračunava kurir prema svom cenovniku.
      </p>
    </td></tr>
    <tr><td style="padding:28px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
        <tr>
          <td style="padding:20px 0 0;font-family:${sans};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${gold};">Ukupno</td>
          <td align="right" style="padding:20px 0 0;font-family:${serif};font-size:26px;color:#f4ede2;">${esc(o.total)}</td>
        </tr>
        <tr><td colspan="2" style="padding-top:6px;font-family:${sans};font-size:12px;color:#9b9084;">${esc(o.payment)}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:28px 32px 0;">
      <div style="background:#1d1916;border:1px solid #2a2420;padding:18px 20px;font-family:${sans};font-size:13px;line-height:1.7;color:#9b9084;">
        <span style="color:${gold};letter-spacing:2px;text-transform:uppercase;font-size:11px;">Adresa isporuke</span><br>
        <span style="color:#f4ede2;">${esc(o.address)}</span>
      </div>
    </td></tr>
    <tr><td align="center" style="padding:36px 32px 40px;">
      <p style="margin:0 0 18px;font-family:${sans};font-size:13px;color:#9b9084;">Imate pitanje? Rado ćemo vam pomoći.</p>
      <a href="tel:${SHOP.phoneHref}" style="display:inline-block;background:${gold};color:#0c0a09;font-family:${sans};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">${esc(SHOP.phone)}</a>
      <p style="margin:18px 0 0;font-family:${sans};font-size:13px;"><a href="mailto:${SHOP.email}" style="color:${gold};text-decoration:none;">${esc(SHOP.email)}</a></p>
    </td></tr>
    <tr><td align="center" style="border-top:1px solid #2a2420;padding:20px;font-family:${sans};font-size:11px;letter-spacing:1px;color:#6b6159;">
      ${esc(SHOP.address)}
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}
