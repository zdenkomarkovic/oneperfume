import "server-only";

/**
 * Šalje email preko Mailjet-a. Ako env varijable nisu ispravno podešene
 * (npr. u razvoju), poruka se samo loguje u konzolu i vraća se uspeh.
 */
export async function sendMail(subject: string, text: string, replyTo?: string): Promise<boolean> {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_SECRET_KEY;
  const from = process.env.SITE_MAIL_SENDER?.trim();
  const to = process.env.SITE_MAIL_RECEIVER?.trim();

  if (!key || !secret || !from || !to || to.startsWith("@")) {
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
        },
      ],
    }),
  });
  return res.ok;
}
