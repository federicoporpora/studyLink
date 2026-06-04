import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PastEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events/past', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  if (loading) return <div style={{textAlign:'center', marginTop:'3rem'}}>Caricamento eventi passati...</div>;

  return (
    <div>
      <h1 className="title">Eventi Passati</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Gli eventi a cui hai partecipato in passato. Apri un evento per lasciare una recensione ai compagni di studio!
      </p>

      <div className="events-grid">
        {events.map(ev => (
          <div key={ev.id} className="card">
            <div className="event-badge" style={{ background: 'var(--text-muted)' }}>Concluso</div>
            <h3 style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>{ev.titolo}</h3>
            <div className="event-meta">
              <div>📅 {new Date(ev.data).toLocaleDateString()} - 🕒 {ev.orario}</div>
              <div>📍 {ev.indirizzoNomeLuogo}</div>
              <div>👤 Org: {ev.organizzatoreNome}</div>
            </div>
            <button 
              className="btn" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => navigate(`/events/${ev.id}`)}
            >
              Vedi Dettagli e Lascia Recensione
            </button>
          </div>
        ))}
      </div>
      {events.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
          Non hai ancora partecipato a nessun evento terminato.
        </div>
      )}
    </div>
  );
}
