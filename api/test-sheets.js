const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
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

    const sheet = doc.sheetsByTitle['Pedidos'] || doc.sheetsByIndex[0];

    await sheet.addRow([
      'TEST-001', 'APPROVED', 'Juan Perez', '30123456',
      '1123456789', 'test@test.com', 'Candado x1',
      '14000', new Date().toLocaleString('es-AR'), 'MP-TEST'
    ]);

    return res.status(200).json({ ok: true, sheet: sheet.title });

  } catch (err) {
    return res.status(500).json({ 
      error: err.message, 
      code: err.code,
      status: err.status 
    });
  }
};
