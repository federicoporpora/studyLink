const API = 'http://localhost:5000/api';
async function run() {
  const res = await fetch(`${API}/profilo/15`);
  const data = await res.json();
  console.log(data);
}
run();
