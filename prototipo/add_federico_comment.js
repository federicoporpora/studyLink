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
  console.log("Registering Federico Porpora...");
  let tFedeRaw = await req('/auth/register', 'POST', {
    email: 'federicoporpora@studio.unibo.it',
    password: 'Password123,',
    nome: 'Federico',
    cognome: 'Porpora'
  });
  let tFede = null;
  if (tFedeRaw && tFedeRaw.token) {
     tFede = tFedeRaw.token;
  } else {
     tFede = await login('federicoporpora@studio.unibo.it', 'Password123,');
  }

  // Get Laura's profile ID
  let tLaura = await login('laura.fontana@studio.unibo.it', 'Password123,');
  const payload = parseJwt(tLaura);
  const lauraId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
  console.log("Laura ID is:", lauraId);

  console.log("Adding comment from Federico...");
  if (tFede) await req(`/profilo/${lauraId}/commento`, 'POST', { testo: 'È molto simpatica!', valutazione: 5 }, tFede);

  console.log("Done.");
}

run();
