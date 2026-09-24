import type { Order } from "@/lib/orders"
import { formatBRL } from "@/lib/format"
import { siteConfig } from "@/lib/site"
import { getSiteUrl } from "@/lib/site-url"
import { listOrderNotificationRecipients } from "@/lib/admin-users"

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export function orderConfirmationHtml(order: Order) {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a1a1a;color:#efe8dd;font-size:14px;">
            ${item.quantity}x ${escapeHtml(item.name)} <span style="color:#a3958f;">(${escapeHtml(item.size)})</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #2a1a1a;color:#efe8dd;font-size:14px;text-align:right;white-space:nowrap;">
            ${formatBRL(item.unitPrice * item.quantity)}
          </td>
        </tr>`,
    )
    .join("")

  const address = order.shippingAddress
  const addressLine = address
    ? `${escapeHtml(address.street)}, ${escapeHtml(address.number)}${address.complement ? ` — ${escapeHtml(address.complement)}` : ""}<br>${escapeHtml(address.district)}, ${escapeHtml(address.city)}/${escapeHtml(address.state)} — CEP ${escapeHtml(address.cep)}`
    : ""

  const discountRow =
    order.discount > 0
      ? `<tr><td style="padding:4px 0;color:#e5353c;font-size:14px;">Desconto${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</td><td style="padding:4px 0;color:#e5353c;font-size:14px;text-align:right;">-${formatBRL(order.discount)}</td></tr>`
      : ""

  const siteUrl = getSiteUrl()

  return `
  <div style="background:#040202;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#0f0909;border-radius:8px;overflow:hidden;border:1px solid #2a1a1a;">
      <tr>
        <td style="padding:28px 28px 0 28px;">
          <p style="margin:0;color:#e5353c;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(siteConfig.name)}</p>
          <h1 style="margin:8px 0 4px 0;color:#efe8dd;font-size:24px;">Pedido confirmado!</h1>
          <p style="margin:0;color:#a3958f;font-size:14px;">
            Recebemos seu pagamento. Pedido <strong style="color:#efe8dd;">#${order.id.slice(0, 8).toUpperCase()}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <table role="presentation" width="100%">
            ${itemsRows}
            <tr><td style="padding:12px 0 4px 0;color:#a3958f;font-size:14px;">Subtotal</td><td style="padding:12px 0 4px 0;color:#efe8dd;font-size:14px;text-align:right;">${formatBRL(order.subtotal)}</td></tr>
            ${discountRow}
            <tr><td style="padding:4px 0;color:#a3958f;font-size:14px;">Entrega (${escapeHtml(order.shippingService)})</td><td style="padding:4px 0;color:#efe8dd;font-size:14px;text-align:right;">${order.shippingCost > 0 ? formatBRL(order.shippingCost) : "Grátis"}</td></tr>
            <tr><td style="padding:12px 0 0 0;border-top:1px solid #2a1a1a;color:#efe8dd;font-size:16px;font-weight:bold;">Total</td><td style="padding:12px 0 0 0;border-top:1px solid #2a1a1a;color:#e5353c;font-size:18px;font-weight:bold;text-align:right;">${formatBRL(order.total)}</td></tr>
          </table>
        </td>
      </tr>
      ${
        addressLine
          ? `<tr><td style="padding:0 28px 24px 28px;">
              <p style="margin:0 0 6px 0;color:#a3958f;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Endereço de entrega</p>
              <p style="margin:0;color:#efe8dd;font-size:14px;line-height:1.5;">${addressLine}</p>
            </td></tr>`
          : ""
      }
      <tr>
        <td style="padding:0 28px 28px 28px;">
          <div style="border:1px solid rgba(229,53,60,0.4);background:rgba(161,14,21,0.1);border-radius:6px;padding:14px;">
            <p style="margin:0;color:#e5353c;font-size:13px;line-height:1.5;">
              Após o pedido ser finalizado, chamaremos você no WhatsApp para confirmar os detalhes da entrega.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 28px 28px;border-top:1px solid #2a1a1a;padding-top:20px;">
          <p style="margin:0;color:#a3958f;font-size:12px;">
            Dúvidas? Fale com a gente no <a href="${siteConfig.instagramUrl}" style="color:#e5353c;">Instagram</a>.
            &nbsp;·&nbsp; <a href="${siteUrl}" style="color:#a3958f;">${escapeHtml(siteConfig.name)}</a>
          </p>
        </td>
      </tr>
    </table>
  </div>`
}

async function sendEmail(to: string, subject: string, html: string, logLabel: string) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to, subject, html }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) console.error(logLabel, res.status, await res.text().catch(() => ""))
  } catch (err) {
    console.error(logLabel, err)
  }
}

// Manda o e-mail de confirmação pro cliente quando o pedido é pago. Falha em silêncio (só avisa no
// log do servidor) — um e-mail que não sai não pode travar a confirmação do pagamento em si.
export async function sendOrderConfirmationEmail(order: Order) {
  if (!isEmailConfigured()) return
  await sendEmail(
    order.customerEmail,
    `Pedido confirmado — ${siteConfig.name} #${order.id.slice(0, 8).toUpperCase()}`,
    orderConfirmationHtml(order),
    "Falha ao enviar e-mail de confirmação:",
  )
}

function adminOrderNotificationHtml(order: Order, event: "created" | "paid") {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #2a1a1a;color:#efe8dd;font-size:14px;">
            ${item.quantity}x ${escapeHtml(item.name)} <span style="color:#a3958f;">(${escapeHtml(item.size)})</span>
          </td>
        </tr>`,
    )
    .join("")

  const address = order.shippingAddress
  const addressLine = address
    ? `${escapeHtml(address.street)}, ${escapeHtml(address.number)}${address.complement ? ` — ${escapeHtml(address.complement)}` : ""}<br>${escapeHtml(address.district)}, ${escapeHtml(address.city)}/${escapeHtml(address.state)} — CEP ${escapeHtml(address.cep)}`
    : ""

  const heading = event === "created" ? "Novo pedido recebido" : "Pedido aprovado!"
  const subheading =
    event === "created"
      ? "Um cliente acabou de fazer um pedido. Ainda está aguardando o pagamento."
      : "O pagamento foi aprovado. Hora de separar e combinar a entrega."

  return `
  <div style="background:#040202;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#0f0909;border-radius:8px;overflow:hidden;border:1px solid #2a1a1a;">
      <tr>
        <td style="padding:28px 28px 0 28px;">
          <p style="margin:0;color:#e5353c;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(siteConfig.name)} — Painel</p>
          <h1 style="margin:8px 0 4px 0;color:#efe8dd;font-size:22px;">${heading}</h1>
          <p style="margin:0;color:#a3958f;font-size:14px;">
            ${subheading} Pedido <strong style="color:#efe8dd;">#${order.id.slice(0, 8).toUpperCase()}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <div style="border:1px solid #2a1a1a;border-radius:6px;padding:14px;">
            <p style="margin:0 0 6px 0;color:#a3958f;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Cliente</p>
            <p style="margin:0;color:#efe8dd;font-size:15px;font-weight:bold;">${escapeHtml(order.customerName)}</p>
            <p style="margin:4px 0 0 0;color:#efe8dd;font-size:14px;">
              WhatsApp/telefone: <strong style="color:#e5353c;">${escapeHtml(order.customerPhone)}</strong>
            </p>
            <p style="margin:2px 0 0 0;color:#a3958f;font-size:13px;">${escapeHtml(order.customerEmail)}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 24px 28px;">
          <table role="presentation" width="100%">
            ${itemsRows}
            <tr><td style="padding:10px 0 0 0;color:#efe8dd;font-size:15px;font-weight:bold;">Total: ${formatBRL(order.total)}</td></tr>
            <tr><td style="padding:2px 0 0 0;color:#a3958f;font-size:13px;">Entrega: ${escapeHtml(order.shippingService)}</td></tr>
          </table>
        </td>
      </tr>
      ${
        addressLine
          ? `<tr><td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 6px 0;color:#a3958f;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Endereço</p>
              <p style="margin:0;color:#efe8dd;font-size:14px;line-height:1.5;">${addressLine}</p>
            </td></tr>`
          : ""
      }
      <tr>
        <td style="padding:0 28px 28px 28px;border-top:1px solid #2a1a1a;padding-top:20px;">
          <p style="margin:0;color:#a3958f;font-size:12px;">Painel: <a href="${getSiteUrl()}/admin/pedidos" style="color:#a3958f;">${getSiteUrl()}/admin/pedidos</a></p>
        </td>
      </tr>
    </table>
  </div>`
}

// Avisa quem tem permissão de ver pedidos (cadastrados em /admin/equipe) quando um pedido é feito
// ou aprovado. Sem membro cadastrado com essa permissão, não manda nada.
export async function sendAdminOrderNotifications(order: Order, event: "created" | "paid") {
  if (!isEmailConfigured()) return
  const recipients = await listOrderNotificationRecipients()
  if (recipients.length === 0) return

  const subject =
    event === "created"
      ? `Novo pedido recebido — #${order.id.slice(0, 8).toUpperCase()}`
      : `Pedido aprovado — #${order.id.slice(0, 8).toUpperCase()}`
  const html = adminOrderNotificationHtml(order, event)

  await Promise.all(recipients.map((to) => sendEmail(to, subject, html, "Falha ao enviar aviso de pedido pra equipe:")))
}
