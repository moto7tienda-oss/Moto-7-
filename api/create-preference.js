const { MercadoPagoConfig, Preference } = require('mercadopago');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items, customer, total } = req.body;
    if (!items?.length || !customer) return res.status(400).json({ error: 'Datos incompletos' });

    const baseUrl = process.env.BASE_URL || 'https://moto-7.vercel.app';
    const orderId = `MOTO7-${Date.now()}`;

    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        external_reference: orderId,
        items: items.map(item => ({
          id:          item.id,
          title:       item.title,
          quantity:    item.quantity,
          unit_price:  item.unit_price,
          currency_id: 'ARS',
        })),
        payer: {
          name:  customer.nombre,
          email: customer.mail,
          identification: { type: 'DNI', number: customer.dni },
          phone: { area_code: '', number: customer.tel },
        },
        back_urls: {
          success: `${baseUrl}/success.html`,
          failure: `${baseUrl}/failure.html`,
          pending: `${baseUrl}/pending.html`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhook`,
        metadata: { customer, orderId },
      },
    });

    await saveToSheets({
      orderId,
      estado:    'PENDIENTE',
      nombre:    customer.nombre,
      dni:       customer.dni,
      telefono:  customer.tel,
      email:     customer.mail,
      productos: items.map(i => `${i.title} x${i.quantity}`).join(' | '),
      total,
      fecha:     new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
      mp_id:     result.id,
    });

    return res.status(200).json({ preference_id: result.id, init_point: result.init_point });

  } catch (err) {
    console.error('Google Sheets error completo:', JSON.stringify({
      message: err.message,
      code: err.code,
      status: err.status,
      stack: err.stack?.split('\n')[0]
    }));
  }
};

async function saveToSheets(data) {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Pedidos'] || doc.sheetsByIndex[0];
    await sheet.addRow([
      data.orderId, data.estado, data.nombre, data.dni,
      data.telefono, data.email, data.productos,
      data.total, data.fecha, data.mp_id,
    ]);
  } catch (err) {
    console.error('Google Sheets error:', err.message);
  }
}
