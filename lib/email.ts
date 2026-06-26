import nodemailer from "nodemailer";

// SMTP transport using the Superhosting mailbox (info@premiumperfumes.bg)
function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
}

const FROM = `Premium Perfumes <${process.env.SMTP_USER || "info@premiumperfumes.bg"}>`;
const ADMIN_EMAIL = process.env.SMTP_USER || "info@premiumperfumes.bg";

// Wrap a plain-text message in the branded HTML template
function brandedWrapper(text: string) {
  const safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;color:#222">
    <div style="background:#0D0B08;padding:24px;text-align:center">
      <div style="color:#C9A84C;font-size:18px;letter-spacing:4px;font-weight:bold">PREMIUM PERFUMES</div>
      <div style="color:#9A7A2E;font-size:11px;letter-spacing:3px;margin-top:4px">premiumperfumes.bg</div>
    </div>
    <div style="padding:28px;color:#333;line-height:1.7;font-size:15px">${safe}</div>
    <div style="background:#0D0B08;padding:14px;text-align:center;color:#9A7A2E;font-size:11px">
      „ОМАЯ 2025" ЕООД · гр. Кюстендил, бул. „Цар Освободител" 91 · info@premiumperfumes.bg
    </div>
  </div>`;
}

// Send a custom email from the shop mailbox (used by the admin compose interface)
export async function sendCustomEmail({
  to,
  subject,
  message,
  branded = true,
}: {
  to: string;
  subject: string;
  message: string;
  branded?: boolean;
}) {
  const transport = getTransport();
  if (!transport) throw new Error("SMTP not configured");
  await transport.sendMail({
    from: FROM,
    to,
    subject,
    text: message,
    html: branded ? brandedWrapper(message) : message.replace(/\n/g, "<br>"),
  });
}

type OrderItem = { name: string; volume: string; price: number; qty?: number };

type OrderEmailData = {
  to: string;
  name: string;
  phone: string;
  email?: string | null;
  courier?: string | null;
  address?: string | null;
  items: OrderItem[];
  promoCode?: string | null;
  discount?: number | null;
  vouchers?: string[]; // freebie labels (free decant / free shipping) to honor
};

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

// Send order confirmation to the customer + a copy/notification to the shop
export async function sendOrderEmails(data: OrderEmailData) {
  const transport = getTransport();
  if (!transport) {
    console.warn("SMTP not configured — skipping order emails");
    return;
  }

  const subtotal = data.items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const total = data.discount ? Math.max(0, subtotal - data.discount) : subtotal;

  const itemsRows = data.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;color:#444">${it.name} — ${it.volume}${(it.qty || 1) > 1 ? ` × ${it.qty}` : ""}</td><td style="padding:6px 0;text-align:right;color:#9A7A2E;font-weight:600">${fmt(it.price * (it.qty || 1))}</td></tr>`
    )
    .join("");

  const discountRow = data.promoCode && data.discount
    ? `<tr><td style="padding:6px 0;color:#2e7d32">Промокод ${data.promoCode}</td><td style="padding:6px 0;text-align:right;color:#2e7d32">− ${fmt(data.discount)}</td></tr>`
    : "";

  const voucherRows = (data.vouchers || [])
    .map(v => `<tr><td style="padding:6px 0;color:#9A7A2E" colspan="2">🎁 ${v}</td></tr>`)
    .join("");

  const deliveryLine = data.courier
    ? `<p style="margin:4px 0;color:#555"><strong>Доставка:</strong> ${data.courier}${data.address ? ` — ${data.address}` : ""}</p>`
    : "";

  const body = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;color:#222">
    <div style="background:#0D0B08;padding:28px;text-align:center">
      <div style="color:#C9A84C;font-size:20px;letter-spacing:4px;font-weight:bold">PREMIUM PERFUMES</div>
      <div style="color:#9A7A2E;font-size:11px;letter-spacing:3px;margin-top:4px">premiumperfumes.bg</div>
    </div>
    <div style="padding:28px">
      <h2 style="color:#0D0B08;font-size:20px">Благодарим за заявката, ${data.name}!</h2>
      <p style="color:#555;line-height:1.6">Получихме Вашата заявка за покупка. Ще се свържем с Вас на посочения телефон за потвърждение на наличност и доставка.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;border-bottom:1px solid #eee">
        ${itemsRows}
        ${discountRow}
        ${voucherRows}
        <tr><td style="padding:10px 0;font-weight:bold;border-top:2px solid #0D0B08">Общо</td><td style="padding:10px 0;text-align:right;font-weight:bold;border-top:2px solid #0D0B08;color:#0D0B08">${fmt(total)}</td></tr>
      </table>

      <p style="margin:4px 0;color:#555"><strong>Телефон:</strong> ${data.phone}</p>
      ${deliveryLine}

      <p style="color:#999;font-size:12px;margin-top:28px;line-height:1.6">Това е автоматично съобщение. Ако имате въпроси, пишете ни на info@premiumperfumes.bg.</p>
    </div>
    <div style="background:#0D0B08;padding:16px;text-align:center;color:#9A7A2E;font-size:11px">
      „ОМАЯ 2025" ЕООД · гр. Кюстендил, бул. „Цар Освободител" 91
    </div>
  </div>`;

  // 1) Confirmation to the customer (only if they left an email)
  if (data.to) {
    try {
      await transport.sendMail({
        from: FROM,
        to: data.to,
        subject: "Потвърждение на заявка — Premium Perfumes",
        html: body,
      });
    } catch (e) {
      console.error("Customer email failed:", e);
    }
  }

  // 2) Notification to the shop
  try {
    const itemsText = data.items.map((it) => `${it.name} — ${it.volume}${(it.qty || 1) > 1 ? ` × ${it.qty}` : ""}: ${fmt(it.price * (it.qty || 1))}`).join("\n");
    await transport.sendMail({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: data.email || undefined,
      subject: `Нова заявка от ${data.name}`,
      text: `Нова заявка за покупка:

Име: ${data.name}
Телефон: ${data.phone}
Имейл: ${data.email || "—"}
Доставка: ${data.courier || "—"}${data.address ? ` — ${data.address}` : ""}
${data.promoCode ? `Промокод: ${data.promoCode} (− ${fmt(data.discount || 0)})\n` : ""}${(data.vouchers || []).length ? `ПОДАРЪК (добави в пратката): ${data.vouchers!.join(", ")}\n` : ""}
Артикули:
${itemsText}

Общо: ${fmt(total)}`,
    });
  } catch (e) {
    console.error("Admin email failed:", e);
  }
}
