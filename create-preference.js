// api/webhook.js
// Recibe notificaciones de MercadoPago y actualiza el estado en Google Sheets

const { MercadoPagoConfig, Payment } = require('mercadopago');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // MercadoPago envía GET para validar la URL
  if (req.method === 'GET') return res.status(200).send('OK');

  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { type, data } = req.body;

    // Solo procesamos notificaciones de pagos
    if (type !== 'payment') return res.status(200).json({ ok: true });

    const paymentId = data?.id;
    if (!paymentId) return res.status(400).json({ error: 'Sin payment_id' });

    // Consultar el pago en MercadoPago
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.get({ id: paymentId });

    const estado   = payment.status;          // approved | rejected | pending
    const orderId  = payment.external_reference;
    const mpStatus = payment.status_detail;

    console.log(`Pago ${paymentId} | Orden ${orderId} | Estado: ${estado} (${mpStatus})`);

    // Actualizar estado en Google Sheets
    await updateSheetStatus(orderId, estado.toUpperCase(), paymentId);

    return res.status(200).json({ ok: true, estado });

  } catch (err) {
    console.error('Webhook error:', err);
    // Siempre responder 200 a MP para que no reintente
    return res.status(200).json({ ok: false, error: err.message });
  }
};

// ─── Google Sheets: actualizar estado ────────────────────────────
async function updateSheetStatus(orderId, nuevoEstado, paymentId) {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Pedidos'] || doc.sheetsByIndex[0];
    const rows  = await sheet.getRows();

    const row = rows.find(r => r.get('Orden ID') === orderId);
    if (row) {
      row.set('Estado', nuevoEstado);
      row.set('MP Preference ID', paymentId);
      await row.save();
      console.log(`Sheets actualizado: ${orderId} → ${nuevoEstado}`);
    }
  } catch (err) {
    console.error('Sheets update error:', err.message);
  }
}
