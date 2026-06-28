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
    throw new Error(`Error ${res.status} on ${endpoint}: ${text}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

async function login(email, password) {
  const loginRes = await req('/auth/login', 'POST', { email, password });
  return loginRes.token;
}

async function run() {
  try {
    console.log("Logging in users...");
    const tFede = await login('federico@studylink.it', 'Password123,');
    const tLucilla = await login('lucilla@studylink.it', 'Password123,');
    const tMatteo = await login('matteo@studylink.it', 'Password123,');

    console.log("Creating other events...");
    
    const e2 = await req('/evento', 'POST', {
      titolo: 'Ripasso Analisi I',
      materia: 'Analisi Matematica',
      data: '2026-07-05',
      orario: '09:00',
      indirizzo: 'Biblioteca Salaborsa, Piazza del Nettuno 3, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 10
    }, tLucilla);
    await req(`/evento/${e2.id}/partecipa`, 'POST', null, tFede);
    
    const e3 = await req('/evento', 'POST', {
      titolo: 'Gruppo di studio Fisica Generale',
      materia: 'Fisica',
      data: '2026-07-10',
      orario: '14:30',
      indirizzo: 'Aule Studio via Zamboni 32, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 6
    }, tFede);
    await req(`/evento/${e3.id}/partecipa`, 'POST', null, tLucilla);
    
    const e4 = await req('/evento', 'POST', {
      titolo: 'Progettazione Basi di Dati',
      materia: 'Basi di Dati',
      data: '2026-07-04',
      orario: '10:00',
      indirizzo: 'Biblioteca Dipartimento di Informatica, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: null
    }, tMatteo);
    
    const e5 = await req('/evento', 'POST', {
      titolo: 'Lezione di inglese (B2)',
      materia: 'Lingua Inglese',
      data: '2026-07-01',
      orario: '17:00',
      indirizzo: 'Scuderie, Piazza Verdi, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 5
    }, tLucilla);

    console.log("Seed complete! Run demo with federico@studylink.it");
  } catch(e) {
    console.error("Error during seed:", e);
  }
}

run();
