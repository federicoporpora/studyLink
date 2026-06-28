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

const fakes = [
  { n: 'Giulia', c: 'Bianchi', e: 'giulia@studylink.it' },
  { n: 'Marco', c: 'Rossi', e: 'marco@studylink.it' },
  { n: 'Sofia', c: 'Conti', e: 'sofia@studylink.it' },
  { n: 'Alessandro', c: 'Ricci', e: 'alessandro@studylink.it' },
  { n: 'Francesca', c: 'Marino', e: 'francesca@studylink.it' },
  { n: 'Andrea', c: 'Bruno', e: 'andrea@studylink.it' },
  { n: 'Martina', c: 'Gallo', e: 'martina@studylink.it' },
  { n: 'Davide', c: 'Costa', e: 'davide@studylink.it' },
  { n: 'Chiara', c: 'Giordano', e: 'chiara@studylink.it' },
  { n: 'Lorenzo', c: 'Rizzo', e: 'lorenzo@studylink.it' }
];

async function run() {
  try {
    console.log("Logging in users...");
    const tLaura = await login('laura.fontana@studylink.it', 'Password123,');
    const tLucilla = await login('lucilla@studylink.it', 'Password123,');
    const tMatteo = await login('matteo@studylink.it', 'Password123,');

    const tFakes = [];
    for (const f of fakes) {
      tFakes.push(await login(f.e, 'Password123,'));
    }

    console.log("Creating FUTURE events (Esplora - Laura does not join)...");
    await req('/evento', 'POST', {
      titolo: '🎨 Gruppo di Disegno e Storia dell\'Arte',
      materia: 'Storia dell\'Arte',
      data: '2026-06-29',
      orario: '10:00',
      indirizzo: 'Pinacoteca Nazionale, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 6
    }, tFakes[0]);

    await req('/evento', 'POST', {
      titolo: '🇬🇧 Conversazione in Inglese (B2/C1) 🗣️',
      materia: 'Lingua Inglese',
      data: '2026-06-29',
      orario: '17:30',
      indirizzo: 'Bar delle Scuderie, Piazza Verdi, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 8
    }, tFakes[1]);

    await req('/evento', 'POST', {
      titolo: '🧬 Ripasso Biologia Molecolare 🔬',
      materia: 'Biologia',
      data: '2026-06-30',
      orario: '09:00',
      indirizzo: 'Biblioteca Navile, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 4
    }, tFakes[2]);

    await req('/evento', 'POST', {
      titolo: '📚 Sessione di studio intensiva: Pomodoro 🍅',
      materia: 'Studio Libero',
      data: '2026-06-30',
      orario: '14:00',
      indirizzo: 'Aule Studio Via Zamboni 32, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: null
    }, tFakes[3]);

    console.log("Creating FUTURE events (I Miei Eventi - Laura created or joined)...");
    const e_mio1 = await req('/evento', 'POST', {
      titolo: '☕ Studio & Caffè: Matematica Applicata 🧮',
      materia: 'Matematica',
      data: '2026-06-30',
      orario: '10:30',
      indirizzo: 'Caffè Pasticceria Gamberini, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 4
    }, tLaura);
    await req(`/evento/${e_mio1.id}/partecipa`, 'POST', null, tLucilla);
    await req(`/evento/${e_mio1.id}/partecipa`, 'POST', null, tFakes[4]);

    const e_mio2 = await req('/evento', 'POST', {
      titolo: '💻 Lezione aperta: React & Node.js 🚀',
      materia: 'Informatica',
      data: '2026-07-02',
      orario: '16:00',
      indirizzo: 'Lab Informatica, Viale Risorgimento, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 15
    }, tLaura);
    for(let i=0; i<5; i++) {
      await req(`/evento/${e_mio2.id}/partecipa`, 'POST', null, tFakes[i]);
    }

    const e_mio3 = await req('/evento', 'POST', {
      titolo: '🧘‍♀️ Mindfulness post-studio 🌿',
      materia: 'Benessere',
      data: '2026-07-03',
      orario: '18:00',
      indirizzo: 'Giardini Margherita, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 20
    }, tFakes[5]);
    await req(`/evento/${e_mio3.id}/partecipa`, 'POST', null, tLaura);
    await req(`/evento/${e_mio3.id}/partecipa`, 'POST', null, tFakes[6]);

    console.log("Creating PAST events (Laura created or joined)...");
    const e_past1 = await req('/evento', 'POST', {
      titolo: '🍕 Pizza & Studio: Preparazione Esame Diritto ⚖️',
      materia: 'Diritto Privato',
      data: '2026-06-25',
      orario: '19:00',
      indirizzo: 'Pizzeria da Michele, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 10
    }, tLaura);
    for(let i=0; i<8; i++) {
      await req(`/evento/${e_past1.id}/partecipa`, 'POST', null, tFakes[i]);
    }

    const e_past2 = await req('/evento', 'POST', {
      titolo: '🎸 Pausa chitarra in Montagnola 🌳',
      materia: 'Musica',
      data: '2026-06-22',
      orario: '16:00',
      indirizzo: 'Parco della Montagnola, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 15
    }, tFakes[7]);
    await req(`/evento/${e_past2.id}/partecipa`, 'POST', null, tLaura);
    for(let i=0; i<5; i++) {
      await req(`/evento/${e_past2.id}/partecipa`, 'POST', null, tFakes[i+2]);
    }

    const e_past3 = await req('/evento', 'POST', {
      titolo: '📝 Scrittura tesi di Laurea 🎓',
      materia: 'Tesi',
      data: '2026-06-18',
      orario: '09:00',
      indirizzo: 'Biblioteca Archiginnasio, Bologna',
      tipoLuogo: 'Pubblico',
      numeroPosti: 3
    }, tLaura);
    await req(`/evento/${e_past3.id}/partecipa`, 'POST', null, tFakes[8]);
    await req(`/evento/${e_past3.id}/partecipa`, 'POST', null, tFakes[9]);

    console.log("Seed complete! Run demo with laura.fontana@studylink.it");
  } catch(e) {
    console.error("Error during seed:", e);
  }
}

run();
