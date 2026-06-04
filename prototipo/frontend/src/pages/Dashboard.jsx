import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    materia: '',
    tipoDiLuogo: '',
    indirizzo: '',
    data: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = events;

    if (filters.materia) {
      result = result.filter(e => e.materia.toLowerCase().includes(filters.materia.toLowerCase()));
    }
    if (filters.tipoDiLuogo !== '') {
      result = result.filter(e => e.tipoDiLuogo.toString() === filters.tipoDiLuogo);
    }
    if (filters.indirizzo) {
      result = result.filter(e => e.indirizzoNomeLuogo.toLowerCase().includes(filters.indirizzo.toLowerCase()) || e.indirizzoVia.toLowerCase().includes(filters.indirizzo.toLowerCase()));
    }
    if (filters.data) {
      result = result.filter(e => e.data.startsWith(filters.data));
    }

    setFilteredEvents(result);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'3rem'}}>Caricamento bacheca...</div>;

  return (
    <div>
      <h1 className="title">Bacheca Eventi</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Scopri e partecipa ai gruppi di studio della tua università.</p>

      {/* FILTRI */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filtra Eventi</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <input type="text" name="materia" className="form-control" placeholder="Cerca per Materia..." value={filters.materia} onChange={handleFilterChange} />
          <input type="text" name="indirizzo" className="form-control" placeholder="Cerca Indirizzo/Luogo..." value={filters.indirizzo} onChange={handleFilterChange} />
          <input type="date" name="data" className="form-control" value={filters.data} onChange={handleFilterChange} />
          <select name="tipoDiLuogo" className="form-control" value={filters.tipoDiLuogo} onChange={handleFilterChange}>
            <option value="">Tutti i tipi di luogo</option>
            <option value="0">Pubblico</option>
            <option value="1">Privato</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.map(ev => (
          <div key={ev.id} className="card">
            <div className="event-badge">{ev.materia}</div>
            <h3 style={{ marginBottom: '0.5rem' }}>{ev.titolo}</h3>
            <div className="event-meta">
              <div>📅 {new Date(ev.data).toLocaleDateString()} - 🕒 {ev.orario}</div>
              <div>📍 {ev.indirizzoNomeLuogo} ({ev.tipoDiLuogo === 0 ? 'Pubblico' : 'Privato'})</div>
              <div>👤 Org: {ev.organizzatoreNome}</div>
              <div style={{ marginTop: '0.5rem', fontWeight: '600' }}>
                Posti: {ev.numeroPrenotazioni} / {ev.numeroPosti === 0 ? 'Illimitati' : ev.numeroPosti}
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => navigate(`/events/${ev.id}`)}
            >
              Visualizza Dettagli
            </button>
          </div>
        ))}
      </div>
      {filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
          Nessun evento corrisponde ai filtri. Sii il primo a crearne uno!
        </div>
      )}
    </div>
  );
}
