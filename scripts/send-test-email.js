require('dotenv').config();
const { sendResetPinEmail } = require('../src/services/emailService');

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL || process.env.SMTP_USER;
  if (!to) {
    console.error('Uso: node scripts/send-test-email.js destinatario@example.com');
    process.exit(1);
  }
  const pin = String(Math.floor(10000000 + Math.random() * 90000000));
  try {
    await sendResetPinEmail(to, pin);
    console.log(`✅ E-mail de teste enviado para ${to} com PIN ${pin}`);
  } catch (err) {
    console.error('❌ Falha ao enviar e-mail:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
