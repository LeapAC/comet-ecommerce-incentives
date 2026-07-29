/**
 * Post-purchase confirmation email.
 *
 * Structure and voice mirror Leap's transactional templates in
 * `incentives-service/supabase/functions/applications/email.ts` — the same
 * "{Company} via Leap" sender identity and incentive-forward framing — but
 * rendered as self-contained inline HTML (Comet doesn't own Leap's hosted
 * Resend templates). This is a DEMO email showing the customer how their
 * incentive claim reaches them after purchase.
 */

export interface ConfirmationEmailItem {
  name: string
  quantity: number
  price: number
}

export interface ConfirmationEmailData {
  customerName: string
  orderId: string
  items: ConfirmationEmailItem[]
  /** One-time money back after purchase (install + upfront). */
  oneTimeBack: number
  /** Recurring money, per year. */
  ongoingAmount: number
  utilityName?: string | null
  connectUrl?: string | null
  companyName?: string
  currentYear?: number
}

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US")

export function confirmationSubject(data: ConfirmationEmailData): string {
  if (data.oneTimeBack > 0) {
    return `Your Comet order is confirmed — ${usd(data.oneTimeBack)} in incentives on the way`
  }
  return "Your Comet order is confirmed"
}

/** Returns a full, standalone HTML document for the confirmation email. */
export function renderConfirmationEmail(data: ConfirmationEmailData): string {
  const company = data.companyName ?? "Comet"
  const year = data.currentYear ?? new Date().getFullYear()
  const hasIncentives = data.oneTimeBack > 0 || data.ongoingAmount > 0

  const itemRows = data.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;">${escapeHtml(it.name)}${
          it.quantity > 1 ? ` &times; ${it.quantity}` : ""
        }</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:right;white-space:nowrap;">${usd(
          it.price * it.quantity,
        )}</td>
      </tr>`,
    )
    .join("")

  const incentiveBlock = hasIncentives
    ? `
    <tr><td style="padding:0 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:linear-gradient(100deg,#ecfdf5,#f5f3ff);border:1px solid #a7f3d0;border-radius:14px;margin:8px 0 4px;">
        <tr><td style="padding:20px 22px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#047857;">
            Money back on the way
          </p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.2;">
            ${usd(data.oneTimeBack)} back after purchase${
              data.ongoingAmount > 0
                ? ` <span style="color:#7c3aed;font-size:16px;font-weight:700;">+ ${usd(
                    data.ongoingAmount,
                  )}/yr</span>`
                : ""
            }
          </p>
          <p style="margin:8px 0 0;font-size:14px;color:#475569;">
            ${
              data.utilityName
                ? `Through ${escapeHtml(data.utilityName)} programs, `
                : ""
            }Comet files the paperwork for you — no forms to chase. We'll email you as each incentive is submitted and approved.
          </p>
          ${
            data.connectUrl
              ? `<a href="${escapeAttr(
                  data.connectUrl,
                )}" style="display:inline-block;margin-top:14px;background:#059669;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:10px;">
                   Track your incentives &rarr;
                 </a>`
              : ""
          }
        </td></tr>
      </table>
    </td></tr>`
    : ""

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Order confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Sender identity: "{Company} via Leap" -->
        <tr><td style="padding:22px 32px 6px;">
          <span style="font-size:20px;font-weight:800;color:#059669;letter-spacing:-.01em;">${escapeHtml(
            company,
          )}</span>
          <span style="font-size:13px;color:#94a3b8;"> &nbsp;via&nbsp; <strong style="color:#0f172a;">Leap</strong></span>
        </td></tr>

        <tr><td style="padding:8px 32px 0;">
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#0f172a;">Order confirmed 🎉</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#475569;">
            Thanks, ${escapeHtml(
              data.customerName || "there",
            )} — your order <strong>#${escapeHtml(
    data.orderId,
  )}</strong> is confirmed and will ship soon.
          </p>
        </td></tr>

        ${incentiveBlock}

        <!-- Order summary -->
        <tr><td style="padding:16px 32px 0;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94a3b8;">Order summary</p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #e2e8f0;">
            ${itemRows}
          </table>
        </td></tr>

        <tr><td style="padding:20px 32px 28px;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">
            You're receiving this because you placed an order with ${escapeHtml(
              company,
            )}. Incentive eligibility and processing are powered by <strong style="color:#475569;">Leap</strong>.
          </p>
          <p style="margin:12px 0 0;font-size:12px;color:#cbd5e1;">© ${year} ${escapeHtml(
    company,
  )}. This is a demonstration email from a reference implementation.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;")
}
