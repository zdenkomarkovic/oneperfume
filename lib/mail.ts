import "server-only";

/**
 * Šalje email preko Mailjet-a. Ako env varijable nisu ispravno podešene
 * (npr. u razvoju), poruka se samo loguje u konzolu i vraća se uspeh.
 */
export async function sendMail(
  subject: string,
  text: string,
  replyTo?: string,
  opts: { to?: string; html?: string } = {},
): Promise<boolean> {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_SECRET_KEY;
  const from = process.env.SITE_MAIL_SENDER?.trim();
  const receiver = process.env.SITE_MAIL_RECEIVER?.trim();
  const to = opts.to ?? receiver;

  if (!key || !secret || !from || !receiver || receiver.startsWith("@") || !to) {
    console.log("[mail:dev]", subject, "\n" + text);
    return true;
  }

  const res = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"),
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: from, Name: "One Perfume" },
          To: [{ Email: to }],
          ...(replyTo && { ReplyTo: { Email: replyTo } }),
          Subject: subject,
          TextPart: text,
          ...(opts.html && { HTMLPart: opts.html }),
        },
      ],
    }),
  });
  return res.ok;
}
