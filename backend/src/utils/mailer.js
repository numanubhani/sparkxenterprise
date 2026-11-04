import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const appUrl = () => (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');

const layout = (body) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#0b1f44">
    <div style="background:#00102a;padding:18px 24px;color:#fff;font-weight:bold;font-size:18px">SPARK X Technology</div>
    <div style="padding:24px;border:1px solid #e2e8f0;border-top:0">${body}</div>
  </div>`;

const button = (href, label) =>
  `<p><a href="${href}" style="display:inline-block;background:#0051fc;color:#fff;padding:12px 22px;text-decoration:none;border-radius:4px">${label}</a></p>`;

export async function sendMail({ to, subject, html, replyTo }) {
  const t = getTransporter();
  if (!t) {
    // Development fallback: print the email so links (verify/reset) can still be used
    const text = html
      .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, '$2: $1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    console.warn(`[mail skipped — SMTP not configured] To: ${to} | ${subject}\n${text}`);
    return false;
  }
  await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html, replyTo });
  return true;
}

export async function sendInquiryEmails(inq) {
  const items = inq.items?.length
    ? `<ul>${inq.items.map((i) => `<li>${esc(i.name)} &times; ${i.quantity}${i.note ? ` — <em>${esc(i.note)}</em>` : ''}</li>`).join('')}</ul>`
    : '<p>No products (general inquiry)</p>';

  const adminHtml = layout(`
    <h2>New ${esc(inq.type)} request — ${esc(inq.requestId)}</h2>
    <p><b>Date:</b> ${new Date(inq.createdAt).toUTCString()}</p>
    <p><b>Name:</b> ${esc(inq.fullName)}<br/>
       <b>Company:</b> ${esc(inq.company || '-')}<br/>
       <b>Email:</b> ${esc(inq.email)}<br/>
       <b>Phone:</b> ${esc(inq.phone || '-')}<br/>
       <b>Destination country:</b> ${esc(inq.country || '-')}<br/>
       <b>End user:</b> ${esc(inq.endUserOrg || '-')} (${esc(inq.endUserCountry || '-')})<br/>
       <b>Target delivery:</b> ${inq.targetDeliveryDate ? new Date(inq.targetDeliveryDate).toISOString().slice(0, 10) : '-'}<br/>
       <b>Inquiry type:</b> ${esc(inq.inquiryType || '-')}<br/>
       <b>Account:</b> ${inq.user ? 'Registered customer' : 'Guest'}</p>
    <h3>Products</h3>${items}
    <h3>Message</h3><p>${esc(inq.message || '-').replace(/\n/g, '<br/>')}</p>
    ${button(`${appUrl()}/admin/requests/${inq._id}`, 'Open in admin dashboard')}`);

  await Promise.all([
    sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL, replyTo: inq.email, subject: `[SPARK X] New ${inq.type} request ${inq.requestId}`, html: adminHtml }),
    sendMail({
      to: inq.email,
      subject: `We received your request (${inq.requestId}) — SPARK X Technology`,
      html: layout(`<p>Hi ${esc(inq.fullName)},</p>
        <p>Thank you for contacting SPARK X Technology. Your request ID is <b>${esc(inq.requestId)}</b>.</p>
        <p>Our team will review your requirements and get back to you. No payment is required at this stage.</p>`),
    }),
  ]);
}

export const sendVerificationEmail = (user, token) =>
  sendMail({
    to: user.email,
    subject: 'Verify your email — SPARK X Technology',
    html: layout(`<p>Hi ${esc(user.name)},</p><p>Please confirm your email address to activate your SPARK X account.</p>
      ${button(`${appUrl()}/verify-email?token=${token}`, 'Verify email')}
      <p style="color:#64748b;font-size:13px">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`),
  });

export const sendPasswordResetEmail = (user, token) =>
  sendMail({
    to: user.email,
    subject: 'Reset your password — SPARK X Technology',
    html: layout(`<p>Hi ${esc(user.name)},</p><p>We received a request to reset your password.</p>
      ${button(`${appUrl()}/reset-password?token=${token}`, 'Choose a new password')}
      <p style="color:#64748b;font-size:13px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`),
  });

const money = (n, cur) => `${cur} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function sendQuoteEmail(inq) {
  const q = inq.quote;
  const rows = q.lines
    .map((l) => `<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0">${esc(l.name)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:right">${l.quantity}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:right">${money(l.unitPrice, q.currency)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:right">${money(l.unitPrice * l.quantity, q.currency)}</td></tr>`)
    .join('');
  return sendMail({
    to: inq.email,
    subject: `Your quotation ${inq.requestId} — SPARK X Technology`,
    html: layout(`<p>Hi ${esc(inq.fullName)},</p><p>Please find your quotation for request <b>${esc(inq.requestId)}</b> below.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="background:#f1f5f9"><th style="padding:6px;text-align:left">Item</th><th style="padding:6px;text-align:right">Qty</th><th style="padding:6px;text-align:right">Unit price</th><th style="padding:6px;text-align:right">Total</th></tr>${rows}
      <tr><td colspan="3" style="padding:8px;text-align:right"><b>Total</b></td><td style="padding:8px;text-align:right"><b>${money(q.total, q.currency)}</b></td></tr></table>
      ${q.leadTime ? `<p><b>Estimated lead time:</b> ${esc(q.leadTime)}</p>` : ''}
      ${q.validUntil ? `<p><b>Valid until:</b> ${new Date(q.validUntil).toDateString()}</p>` : ''}
      ${q.terms ? `<p><b>Terms:</b><br/>${esc(q.terms).replace(/\n/g, '<br/>')}</p>` : ''}
      ${q.notes ? `<p>${esc(q.notes).replace(/\n/g, '<br/>')}</p>` : ''}
      <p>100% advance payment is required before the order is placed with the supplier.</p>
      ${button(`${appUrl()}/account/requests/${inq._id}`, 'View & approve in your account')}
      <p style="color:#64748b;font-size:13px">No account yet? Register with ${esc(inq.email)} and verify your email to see this quote in your dashboard, or simply reply to this email.</p>`),
  });
}

// ---- Live chat ----------------------------------------------------------------
// New visitor message -> owner (automatic, the dashboard does not need to be open)
export async function sendChatNotification(chat, text, { isFirst = false } = {}) {
  await sendMail({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    replyTo: chat.email,
    subject: `[SPARK X] ${isFirst ? 'New chat' : 'New chat message'} from ${chat.name}${chat.company ? ` (${chat.company})` : ''}`,
    html: layout(`
      <h2>${isFirst ? 'New live chat' : 'New chat message'}</h2>
      <p><b>Name:</b> ${esc(chat.name)}<br/>
         <b>Company:</b> ${esc(chat.company || '-')}<br/>
         <b>Email:</b> ${esc(chat.email)}<br/>
         <b>Account:</b> ${chat.user ? 'Registered customer' : 'Guest'}<br/>
         <b>Page:</b> ${esc(chat.page || '-')}<br/>
         <b>Date:</b> ${new Date().toUTCString()}</p>
      <h3>Message</h3><p>${esc(text).replace(/\n/g, '<br/>')}</p>
      ${button(`${appUrl()}/admin/chats/${chat._id}`, 'Reply in chat dashboard')}`),
  });
}

// Owner replied but the visitor has left the site -> follow up by email
export async function sendChatReplyEmail(chat, text) {
  await sendMail({
    to: chat.email,
    subject: 'Reply from SPARK X Technology',
    html: layout(`<p>Hi ${esc(chat.name)},</p>
      <p>Thanks for chatting with us. Here is our reply:</p>
      <blockquote style="margin:12px 0;padding:10px 14px;border-left:3px solid #0051fc;background:#f1f5f9">${esc(text).replace(/\n/g, '<br/>')}</blockquote>
      <p>You can reply to this email, or send a quote request on our website. Pricing, availability and delivery dates are always confirmed in a written quotation.</p>
      ${button(`${appUrl()}/quote`, 'Request a Quote')}`),
  });
}
