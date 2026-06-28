const API = 'http://localhost:5000/api';
async function req(endpoint, method, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if(!res.ok) { console.error(await res.text()); return null; }
  return res.json();
}
async function run() {
  const loginRes = await req('/auth/login', 'POST', { email: 'laura.fontana@studio.unibo.it', password: 'Password123,' });
  const event = await req('/evento/14', 'GET', null, loginRes.token);
  console.log(JSON.stringify(event, null, 2));
}
run();
