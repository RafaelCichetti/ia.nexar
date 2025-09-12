const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST não configurado');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
    tls: { rejectUnauthorized: false },
  });
}

async function sendResetPinEmail(to, pin) {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM || 'Nexar.ia <contato@nexarhub.com.br>';
  const subject = 'Redefinição de senha - Nexar.ia';
  const text = 'Olá,\n\n' +
    'Recebemos um pedido para redefinir sua senha na Nexar.ia.\n\n' +
    'Seu PIN de verificação é: ' + pin + '\n\n' +
    'Ele expira em 15 minutos. Se você não solicitou, ignore este e-mail.\n\n' +
    'Atenciosamente,\nEquipe Nexar.ia';
  const html = '' +
    '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0b1526">' +
    '<h2>Redefinição de senha</h2>' +
    '<p>Recebemos um pedido para redefinir sua senha na <b>Nexar.ia</b>.</p>' +
    '<p style="font-size:16px">Use o PIN abaixo para continuar. Ele expira em <b>15 minutos</b>.</p>' +
    '<div style="font-size:28px;font-weight:700;background:#0f1b2d;color:#00ffb3;padding:14px 18px;border-radius:10px;display:inline-block;letter-spacing:4px">' + pin + '</div>' +
    '<p style="margin-top:16px;color:#2d3b52">Se você não solicitou, ignore este e-mail.</p>' +
    '<hr style="border:none;border-top:1px solid #e5ecf5;margin:20px 0" />' +
    '<p style="font-size:12px;color:#64748b">Este e-mail foi enviado automaticamente. Não responda.</p>' +
    '</div>';
  await transporter.sendMail({ from, to, subject, text, html });
}

async function sendLandingContactEmail({ nome, empresa, ramo, problema }) {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM || 'Nexar.ia <contato@nexarhub.com.br>';
  const to = ['rafael@nexarhub.com.br', 'pablo@nexarhub.com.br'];
  const subject = `Novo contato da Landing Page - ${nome || 'Sem nome'}`;
  const plain = [
    `Nome: ${nome}`,
    `Empresa: ${empresa}`,
    `Ramo: ${ramo}`,
    `Problema: ${problema}`,
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0b1526;line-height:1.6">
      <h2 style="margin:0 0 8px">Novo contato - Landing Page</h2>
      <p><b>Nome:</b> ${escapeHtml(nome)}</p>
      <p><b>Empresa:</b> ${escapeHtml(empresa)}</p>
      <p><b>Ramo:</b> ${escapeHtml(ramo)}</p>
      <p><b>Problema:</b><br/>${escapeHtml(problema)}</p>
      <hr style="border:none;border-top:1px solid #e5ecf5;margin:16px 0" />
      <small style="color:#64748b">Gerado automaticamente pela Landing Page.</small>
    </div>`;
  await transporter.sendMail({ from, to, subject, text: plain, html });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendResetPinEmail, sendLandingContactEmail };
