const API = 'http://localhost:5000/api';

async function req(endpoint, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Error ${res.status} on ${endpoint}: ${text}`);
    return null;
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

async function login(email, password) {
  const loginRes = await req('/auth/login', 'POST', { email, password });
  return loginRes ? loginRes.token : null;
}

function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

async function run() {
  console.log("Registering Laura Fontana (studio.unibo.it)...");
  let tLauraRaw = await req('/auth/register', 'POST', {
    email: 'laura.fontana@studio.unibo.it',
    password: 'Password123,',
    nome: 'Laura',
    cognome: 'Fontana'
  });
  let tLaura = null;
  if (tLauraRaw && tLauraRaw.token) {
     tLaura = tLauraRaw.token;
  } else {
     // try to login if already exists
     tLaura = await login('laura.fontana@studio.unibo.it', 'Password123,');
  }

  const payload = parseJwt(tLaura);
  const lauraId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
  console.log("Laura ID is:", lauraId);

  console.log("Logging in other users...");
  const tLucilla = await login('lucilla@studylink.it', 'Password123,');
  const tMatteo = await login('matteo@studylink.it', 'Password123,');
  const tMarco = await login('marco@studylink.it', 'Password123,');
  const tSofia = await login('sofia@studylink.it', 'Password123,');

  console.log("Adding comments to Laura...");
  if (tLucilla) await req(`/profilo/${lauraId}/commento`, 'POST', { testo: 'Ottima compagna di studio, molto preparata e ha preso degli appunti molto dettagliati che mi hanno aiutato a passare!', valutazione: 5 }, tLucilla);
  if (tMatteo) await req(`/profilo/${lauraId}/commento`, 'POST', { testo: 'Spiega molto bene gli argomenti complessi, mi ha salvato dall\'esame.', valutazione: 4 }, tMatteo);
  if (tMarco) await req(`/profilo/${lauraId}/commento`, 'POST', { testo: 'Molto disponibile e chiara nelle spiegazioni. Fantastica!', valutazione: 5 }, tMarco);
  if (tSofia) await req(`/profilo/${lauraId}/commento`, 'POST', { testo: 'Bravissima, abbiamo studiato benissimo insieme, atmosfera rilassante.', valutazione: 5 }, tSofia);

  console.log("Done.");
}

run();
