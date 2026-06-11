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
    const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDfcKziJlviVDF3
lCcpok6nm3NW+CDIfeQfleBXpGjJGNF/rc04nl8l5skC/L/IyxzGG8pSMlpGrhDr
h0GNvvbcfwaJmqCtFaxG6UeVK4KpEZ2PwGqHB/78gWY267jdgJ/o8QVjpHbAeCIT
zY2PDTOPKcbii3nf3LE1nzLeG/W75zyCGoycKD5D9A2N++odC7Y6JmKf9rClwqMa
e7EfqJCElvAefrz12zjf/vVgISRjWnxI35fQeCMlrjRnSrlWgV2oTjK9pvQD6N5t
dtccm9KWAcLNtu2b8pjDp+qGNzZXjF0T0fBw3FgeyiP6ijc0UieJiV/VucEFoi4f
XDFhIrAdAgMBAAECggEANCenWyRsBzDy2QAuggPeSzY4XoENme70zECePKbmRKZz
5FMr1370I7MykW1w0MxEW6PJ/pS9SMlBrtCEBzOfiMlnu7/pqG0qKOUz7chZt+Ai
QJc/5mQB62vC8aflH2LyMJvtz5vokjWYcrnkxJLmyZCNWX0IBi6L+MG/zGOHYQQB
bXpc7Cti1HV9Uh5wE0igmJrSH8Glm9HmP1xYwSplmFqRsf3pZF6iS820rXIKgWVA
nxw1sUKpzYBI2Gzd90Vp8cx2jJ8GCpsCaxHVyeOjB/fFwWMuOLmA+07rod7O6cH0
EtGOMLlQgAvEVk5MI9/B6cxV6CMp8Se8mbjgtzkDcQKBgQD7CJ+JfPj14OPO3B8G
D7pRxWe80pQema85Me2ayMqiwjSCFa2C5Ge6Tym6oVbwkHL5sHgbvb/zTZg2zott
ey3aMy80UO7QPMym4t4usxi7oCHS0I844odXxCXpf/OVRkaMzptkmyEO0X6mOvZ8
lsJrtL4UkAz8FapaX1ZeePmTCQKBgQDj3E2DFWgMDWjb8O6NFgzS4GAvOhKhfEyL
iFZCF5caViZRV3gIUcMsl3Fwvu2uUsdYfA7xwKEop1x2mAYreyUr3Tzo5wHg9ksD
6/R1cVQVRLtzsngMNxfel6uXQ6gZlO1j0PI30lwFHDDNHJp1Dfh2oc64omA7RZrv
w8eydNzVdQKBgH5iagfLXoBT9/12fzwLARAYJdE/54i8cSaHh4uNGc/1nH/9r/yd
R8faATVP8zhsUSZ6fQ3ia1hwMXkuZa35/SzE5jgdow49/f7ra1bxnjsgNMcxb1oB
WoiKXVgArj7yQaS0hDGTlIIkYPIJ73zsXffh6Gzr1U25DqovI4muuGAZAoGAW0/S
hCBU9Nd+2PzhLArVEsC16tcT1kDwj84P+yZm+Dfj3R73TCYv17PM0wjASOaFWlFE
z96I9riy1hewCUatK7naCd9hIlywzR6GdXX34xoLIJ85enOtjhcrvU9wkufahfCa
0IHtPGMCr3+x6gyyMCBBrj3r4HTRVRoY8cvhH20CgYA2eKAj2sErhm39y8hlhTRt
N9vFdREXVLa2grucbaVAnJ3oFRKzZU6FNylSFUSF5i1bmiI2e7sb2FgtkciCTIeg
Qv++li3At/YFhzbIagu4i3E87U+d87y5M4XcaW7SCKFZi6vt14/jkX79w7NiWTws
WSPiLcBGk+WB6Q+wP2le2g==
-----END PRIVATE KEY-----`;

    const auth = new JWT({
      email: 'moto7-sheets2@modern-cubist-499013-v1.iam.gserviceaccount.com',
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet('1slJkaAvudPN_Avh32n2gHcK4HKyZqBK1nN0uaAbnoP4', auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['PEDIDOS'] || doc.sheetsByIndex[0];
    await sheet.addRow([
      data.orderId, data.estado, data.nombre, data.dni,
      data.telefono, data.email, data.productos,
      data.total, data.fecha, data.mp_id,
    ]);
    console.log('Pedido guardado en Sheets OK');

  } catch (err) {
    console.error('Google Sheets error:', err.message);
  }
}
