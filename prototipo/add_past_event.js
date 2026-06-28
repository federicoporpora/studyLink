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

async function run() {
  console.log("Logging in users...");
  const tLaura = await login('laura.fontana@studio.unibo.it', 'Password123,');
  const tFede = await login('federicoporpora@studio.unibo.it', 'Password123,');
  const tLucilla = await login('lucilla@studylink.it', 'Password123,');

  if (!tLaura || !tFede || !tLucilla) {
    console.error("Failed to login all users");
    return;
  }

  console.log("Creating past event...");
  const event = await req('/evento', 'POST', {
    titolo: '📚 Ripasso pre-esame Ingegneria del Software 💻',
    materia: 'Ingegneria del Software',
    data: '2026-06-26',
    orario: '14:30',
    indirizzo: 'Biblioteca Sala Borsa, Bologna',
    tipoLuogo: 'Pubblico',
    numeroPosti: 6
  }, tLaura);

  if (event && event.id) {
    console.log("Event created with ID:", event.id);
    
    console.log("Adding participants to event...");
    await req(`/evento/${event.id}/partecipa`, 'POST', null, tFede);
    await req(`/evento/${event.id}/partecipa`, 'POST', null, tLucilla);
    
    console.log("Done! Event successfully created and participants added.");
  } else {
    console.error("Failed to create event.");
  }
}

run();
