const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
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
      'TEST-001', 'APPROVED', 'Juan Perez', '30123456',
      '1123456789', 'test@test.com', 'Candado x1',
      '14000', new Date().toLocaleString('es-AR'), 'MP-TEST'
    ]);

    return res.status(200).json({ ok: true, sheet: sheet.title });

  } catch (err) {
    return res.status(500).json({ error: err.message, code: err.code });
  }
};
