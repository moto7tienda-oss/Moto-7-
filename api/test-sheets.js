const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDiushBCIEBMe4R
897fMKiwVOdaFgIa1SbhAm9Y7METyPGNT862MThIyM0eupctGNtUhzh6RMs7TDiv
XaL02PWCCDEzwggDgIcK0048x7B6rorYFKHZadYx0VZn+F9vYr349OWRygQDoUop
VzduaxSJXJhlpSrydSmkmH4NvfGZG/VGpqf0FxCQLjPLHGsKQbRn3iGsquPoOSMY
VuRVNcZBKXwrwwdHMfwXXrapWf/qYQygyoMI/qkLW30Ly7UAHhEaPb6514UdRxak
JZwuXWnxM+4iwt8cOdFyU4Feu0JmuJ6AkThfaDIteHsrY5Rqw2ATj+9MR4mvwNNh
tFNkarmjAgMBAAECggEADc/0MCYM+d4pUzWon68ur6NUfsP1d94BYtbLor61mnd0
47d3b9j6xVBaUqNqX0hy4Cjms2gqe1/O2jwZl9H5zuSh3rXU2CXF1E6AJyrBIRAu
DDDhlUWh02Id4fKbGcWJrjd5HtMQQIpcYr1Z9qOWWjHmZNbVkXS6xzi1ATBPnhSd
FuNmG5vYAUzQKPP16GjcDEdhzlfuh5XcXRhjV6q3hNmShU28dfu2i6sjbd81/l/Q
EAHUcfA/AhphGLAe1s4775VB4zXzmr0BWvT5DI+JYiYK82pk6Xxi1Td4aCOVurL3
8mVo9vShAgLV3vfGXZGGH5iamE6tMPKx1KlL8z2QfQKBgQDz+Cb5ZQShdlQqO4Kf
SiA9GGCfMIDgQ6Low7k8k8JPVguhPQz8i92pURPiAEscU9pbjBBlTfy33Sf8G9gF
oyB7tyhbD88D027CgPeW6Qe37POBPDZ9MGrfHaAei+GHyBluZw9icAYAUMo3mxFE
QdbsgrvZ1EF4o1gPpijQB5MqtwKBgQDt6P9IB7eh6DPGstO8yWk4JKmWQGu+33TK
3D78W9lGiRIpXAUFZU0LOVghH4LkIKdNCGw+xGvGpXjWPrWt1D/eTa/jjdSkxE7A
sgTCQ1duIishj94ll3iezsQlQt57eZydHNnA4VXSaPxeswBQZPJ/nNYfmwQUNuVt
sUcOwfVsdQKBgG6g+ltg2Wa2F5hHAAZnQJMzuKy2+9m2EetmxVqYziXXqNJmsrra
WZtrro5u/6BKzdtxegXWBWECoh0KKzzzKcmv1lbkpkTf3XvJq3v9E4jto8XYngTK
rcuazX7Mg2pk7FNJ3IoQrkf6Wpg4cu32xRTee3xdaYrg1w/RkvQyWyOlAoGBALEz
Arj2roqUNcRAO774UTt06y8zKk1PiGD0LKGwE6QawgE2PbMoIXtDqeV53/bkb1fL
9zvE9vVNGDSTHqSrWyrLuD8Hy6MxZ+rUbQD4QW2RW4iy7GYZbMjz/lo2dRmImeLX
s0SbUV3XvmkWcBxxI8Fy4nVF84LO5JGQIfnW82JlAoGBAKmiTts5R87D8QmUruZr
Lx/myivzwLuIc0LKAlTw/wkxrofdSr0pVbATWXQQua4A29U23zVAunazIxaaH8Uv
vKMRk9xmwU0PsLhDGLQnYYZeKWXnlcIw5dK80a1N25glDujUt1F6JHP9pW68h9Cs
siKXlBmSjo/cHkUqB0r6DN8+
-----END PRIVATE KEY-----,
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
