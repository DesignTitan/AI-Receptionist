import { money, type PurchaseReceipt } from "./purchase-receipt.ts";
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]!);
export function receiptEmail({ receipt, name, planName, siteUrl, setupPending, test = false }: {
  receipt: PurchaseReceipt; name: string; planName: string; siteUrl: string; setupPending: boolean; test?: boolean;
}) {
  const parsed = new URL(siteUrl);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password) throw Error("Invalid email site URL.");
  const site = parsed.origin;
  const first = name.trim().split(/\s+/)[0]?.slice(0,40);
  const greeting = first ? `Thanks, ${first}.` : "Thank you.";
  const action = setupPending ? "Set up your business" : "Open your dashboard";
  const destination = `${site}${setupPending ? "/account/setup" : "/account"}`;
  const subject = `${test ? "[Test] " : ""}Your AI Receptionist receipt · ${receipt.number}`;
  const rows = receipt.rows.map(row => `<tr><td style="padding:8px 0;color:#526b63">${escape(row.label)}</td><td align="right" style="padding:8px 0;white-space:nowrap">${escape(money(row.cents,receipt.currency))}</td></tr>`).join("");
  const text = `${greeting}\nYour payment is confirmed.\n${test ? "Sandbox payment — no real charge.\n" : ""}Receipt ${receipt.number}\n${planName}\n${receipt.rows.map(row=>`${row.label}: ${money(row.cents,receipt.currency)}`).join("\n")}\nTotal paid: ${money(receipt.amountPaid,receipt.currency)}\n${receipt.url ? `View receipt: ${receipt.url}\n` : ""}${action}: ${destination}\nQuestions? ${site}/#hear`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(subject)}</title><style>
@font-face{font-family:'Open Runde';src:url('${site}/fonts/open-runde/OpenRunde-Regular.woff2') format('woff2');font-weight:400}
@font-face{font-family:'Apfel Grotezk';src:url('${site}/fonts/apfel-grotezk/ApfelGrotezk-Mittel.woff2') format('woff2');font-weight:500}
@font-face{font-family:'Apfel Grotezk';src:url('${site}/fonts/apfel-grotezk/ApfelGrotezk-Fett.woff2') format('woff2');font-weight:700}
@media(max-width:480px){.email-pad{padding:24px!important}.email-heading{font-size:36px!important}}
</style></head><body style="margin:0;padding:0;background:#f4f7f3;color:#1e3a34;font-family:'Open Runde',Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">Payment confirmed. Your receipt and next step are inside.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#fff;border:1px solid #e2e9e1;border-radius:24px"><tr><td class="email-pad" style="padding:40px">
<table role="presentation" width="100%"><tr><td align="center" style="padding:0 0 32px;border-bottom:1px solid #e2e9e1"><img src="cid:brand-mascot" width="88" height="88" alt="" style="display:block;border:0;margin:0 auto 8px"><span style="font-family:'Apfel Grotezk',Arial,sans-serif;font-size:22px;font-weight:500">AI Receptionist</span></td></tr></table>
<p style="margin:32px 0 12px;font-size:17px">${escape(greeting)}</p><h1 class="email-heading" style="font-family:'Apfel Grotezk',Arial,sans-serif;font-size:44px;line-height:1.08;font-weight:700;letter-spacing:-1.5px;margin:0 0 16px">You’re all set.</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#526b63">Your payment is confirmed. Here’s your receipt.</p>
${test ? '<p style="font-size:12px;color:#526b63">Sandbox payment · No real charge</p>' : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f1;border-radius:18px"><tr><td style="padding:24px"><p style="font-size:16px;font-weight:600;margin:0 0 16px">${escape(planName)} · Monthly</p>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px"><tbody>${rows}<tr><th scope="row" align="left" style="padding:16px 0 0;border-top:1px solid #d5ded7">Total paid</th><td align="right" style="padding:16px 0 0;border-top:1px solid #d5ded7;font-weight:600;font-size:20px">${escape(money(receipt.amountPaid,receipt.currency))}</td></tr></tbody></table>
<p style="font-size:11px;line-height:1.6;margin:16px 0 0;color:#526b63">Receipt ${escape(receipt.number)} · ${escape(new Date(receipt.paidAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}))}</p></td></tr></table>
${receipt.url ? `<p style="margin:16px 0 24px"><a href="${escape(receipt.url)}" style="font-size:13px;color:#1e3a34;text-decoration:underline">View your Stripe receipt ↗</a></p>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr><td align="center" bgcolor="#1e3a34" style="border-radius:999px"><a href="${destination}" style="display:block;padding:16px 24px;color:#fff;text-decoration:none;font-size:15px;font-weight:600;border-radius:999px">${action} →</a></td></tr></table>
<p style="font-size:13px;line-height:1.6;color:#526b63;margin:24px 0 0">${setupPending ? 'Next, add your business details, opening hours and team. We’ll guide you through the rest.' : 'Visit your dashboard to see how your setup is progressing.'}</p>
<table role="presentation" width="100%" style="margin-top:32px;border-top:1px solid #e2e9e1"><tr><td style="padding-top:24px;font-size:13px;line-height:1.6">Questions? We’re here to help.<br><a href="${site}/#hear" style="color:#1e3a34">Contact us</a></td></tr></table>
<p style="font-size:11px;color:#526b63;line-height:1.8;margin:24px 0 0">AI Receptionist &nbsp; · &nbsp; <a href="${site}/legal#privacy" style="color:#526b63">Privacy</a> &nbsp; <a href="${site}/legal#terms" style="color:#526b63">Terms</a></p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject, html, text };
}
