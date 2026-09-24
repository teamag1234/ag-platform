import { env } from '@/lib/env';

type Mail = { to: string; subject: string; html: string; text: string };

async function sendWithBrevo(mail: Mail) {
  const { EMAIL_FROM, BREVO_API_KEY } = env();
  if (!BREVO_API_KEY) throw new Error('Falta BREVO_API_KEY');
  const match = /^(.*)<(.+)>$/.exec(EMAIL_FROM);
  const sender = match ? { name: match[1].trim(), email: match[2].trim() } : { email: EMAIL_FROM };
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender, to: [{ email: mail.to }], subject: mail.subject, htmlContent: mail.html, textContent: mail.text }),
  });
  if (!res.ok) throw new Error(`Brevo respondió ${res.status}: ${await res.text()}`);
}

async function sendWithPostmark(mail: Mail) {
  const { EMAIL_FROM, POSTMARK_TOKEN } = env();
  if (!POSTMARK_TOKEN) throw new Error('Falta POSTMARK_TOKEN');
  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: { 'X-Postmark-Server-Token': POSTMARK_TOKEN, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ From: EMAIL_FROM, To: mail.to, Subject: mail.subject, HtmlBody: mail.html, TextBody: mail.text, MessageStream: 'outbound' }),
  });
  if (!res.ok) throw new Error(`Postmark respondió ${res.status}: ${await res.text()}`);
}

export async function sendMail(mail: Mail): Promise<void> {
  switch (env().EMAIL_PROVIDER) {
    case 'brevo':
      return sendWithBrevo(mail);
    case 'postmark':
      return sendWithPostmark(mail);
    default:
      console.log(`[email:console] Para: ${mail.to}\nAsunto: ${mail.subject}\n${mail.text}\n`);
  }
}

const emailHeader = () =>
  `<div style="background:#0a0e27;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center"><img src="${env().APP_URL}/logo-ag.png" alt="AG Academy" width="160" style="display:inline-block;height:auto"></div>`;

export async function sendMagicLinkEmail(to: string, url: string) {
  const text = `Hola,\n\nEntra en el aula de AG Academy con este enlace (caduca en 20 minutos):\n${url}\n\nSi no has pedido este acceso, ignora este correo.`;
  const html = `
    <div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:auto;color:#0a0e27">
      ${emailHeader()}
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 16px">Tu acceso al aula</h2>
      <p>Entra en el aula de AG Academy con este botón. El enlace caduca en 20 minutos.</p>
      <p style="margin:24px 0"><a href="${url}" style="background:#FFBD59;color:#0a0e27;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Entrar en el aula</a></p>
      <p style="font-size:13px;color:#555">Si el botón no funciona, copia este enlace:<br>${url}</p>
      <p style="font-size:13px;color:#555">Si no has pedido este acceso, ignora este correo.</p>
      </div>
    </div>`;
  await sendMail({ to, subject: 'Tu acceso al aula de AG Academy', html, text });
}

export async function sendNoCoursesEmail(to: string) {
  const text = `Hola,\n\nHemos recibido una solicitud de acceso al aula con este email, pero no encontramos ningún curso asociado.\n\nSi compraste con otro email, prueba con ese. Si crees que es un error, escríbenos por WhatsApp o responde a este correo.`;
  const html = `<div style="font-family:Poppins,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#0a0e27"><p>${text.replace(/\n/g, '<br>')}</p></div>`;
  await sendMail({ to, subject: 'No encontramos cursos con este email', html, text });
}
