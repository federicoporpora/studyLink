import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for comments
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentTarget, setCommentTarget] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.userId || currentUser?.id;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvento(data);
      } else if (res.status === 404) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Sei sicuro di voler annullare questo evento?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/');
      } else {
        alert(await res.text());
      }
    } catch (err) { console.error(err); }
  };

  const handleLeaveEvent = async () => {
    if (!window.confirm("Sei sicuro di voler disiscriverti da questo evento?")) return;
    try {
      const res = await fetch(`/api/events/${id}/prenota`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/');
      } else {
        alert(await res.text());
      }
    } catch (err) { console.error(err); }
  };

  const handleRemoveParticipant = async (partecipanteId) => {
    if (!window.confirm("Sei sicuro di voler rimuovere questo partecipante?")) return;
    try {
      const res = await fetch(`/api/events/${id}/partecipanti/${partecipanteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEventDetails();
      } else {
        alert(await res.text());
      }
    } catch (err) { console.error(err); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          destinatarioId: commentTarget.id,
          testo: commentText,
          valutazione: parseInt(commentRating)
        })
      });
      if (res.ok) {
        alert("Recensione inviata con successo!");
        setShowCommentForm(false);
        setCommentTarget(null);
        setCommentText('');
        setCommentRating(5);
      } else {
        alert(await res.text());
      }
    } catch (err) { console.error(err); }
  };

  if (loading || !evento) return <div style={{textAlign:'center', marginTop:'3rem'}}>Caricamento...</div>;

  const isOrganizer = evento.organizzatoreId === currentUserId;
  const isParticipant = evento.partecipanti.some(p => p.id === currentUserId);
  
  // Check if event has passed
  const eventDate = new Date(`${evento.data.split('T')[0]}T${evento.orario}`);
  const isPastEvent = eventDate < new Date();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="event-badge">{evento.materia}</div>
            <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{evento.titolo}</h1>
          </div>
          {isParticipant && (
            <button className="btn btn-primary" onClick={() => navigate(`/events/${id}/chat`)}>
              💬 Apri Chat di Gruppo
            </button>
          )}
        </div>

        <div className="event-meta" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
          <div>📅 {new Date(evento.data).toLocaleDateString()} - 🕒 {evento.orario}</div>
          <div>📍 {evento.indirizzoNomeLuogo} ({evento.indirizzoVia}) - {evento.tipoDiLuogo === 0 ? 'Pubblico' : 'Privato'}</div>
          <div>👤 Organizzatore: {evento.organizzatoreNome}</div>
          <div>👥 Posti: {evento.numeroPrenotazioni} / {evento.numeroPosti === 0 ? 'Illimitati' : evento.numeroPosti}</div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {isOrganizer ? (
            <button onClick={handleDeleteEvent} className="btn btn-danger">Elimina Evento</button>
          ) : isParticipant ? (
            <button onClick={handleLeaveEvent} className="btn btn-danger">Disiscriviti</button>
          ) : (
            <button className="btn btn-primary" onClick={async () => {
              await fetch(`/api/events/${id}/prenota`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }});
              fetchEventDetails();
            }}>Partecipa</button>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Partecipanti ({evento.partecipanti.length})</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {evento.partecipanti.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/profile/${p.id}`} style={{ textDecoration: 'none', color: 'var(--primary)' }}>
                    {p.nome} {p.cognome}
                  </Link>
                  {p.id === evento.organizzatoreId ? ' 👑' : ''}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{p.bio || 'Nessuna bio'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isPastEvent && isParticipant && p.id !== currentUserId && (
                  <button onClick={() => { setCommentTarget(p); setShowCommentForm(true); }} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Lascia Recensione</button>
                )}
                {isOrganizer && p.id !== currentUserId && !isPastEvent && (
                  <button onClick={() => handleRemoveParticipant(p.id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Rimuovi</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCommentForm && commentTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <h3>Recensisci {commentTarget.nome}</h3>
            <form onSubmit={submitComment}>
              <div className="form-group">
                <label className="form-label">Valutazione</label>
                <select className="form-control" value={commentRating} onChange={e => setCommentRating(e.target.value)}>
                  <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                  <option value="4">⭐⭐⭐⭐ (4)</option>
                  <option value="3">⭐⭐⭐ (3)</option>
                  <option value="2">⭐⭐ (2)</option>
                  <option value="1">⭐ (1)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Commento</label>
                <textarea className="form-control" rows="4" value={commentText} onChange={e => setCommentText(e.target.value)} required placeholder="Come ti sei trovato a studiare con questa persona?"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Invia</button>
                <button type="button" className="btn" onClick={() => { setShowCommentForm(false); setCommentTarget(null); }}>Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
