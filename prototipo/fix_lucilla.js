const API = 'http://localhost:5000/api';
async function req(endpoint, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if(!res.ok) { console.error(await res.text()); return null; }
  return res.json();
}
async function run() {
  const loginRes = await req('/auth/login', 'POST', { email: 'lucilla@studylink.it', password: 'Password123,' });
  
  // Create or update profile
  const profile = {
    nome: 'Lucilla',
    cognome: 'Lucchi',
    corsoDiStudi: 'Ingegneria Gestionale',
    biografia: 'Studiosa e metodica.'
  };
  
  await fetch(`${API}/profilo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${loginRes.token}` },
    body: JSON.stringify(profile)
  });
  
  console.log("Lucilla profile updated.");
}
run();
