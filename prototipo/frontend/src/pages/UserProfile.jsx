import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'3rem'}}>Caricamento...</div>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '1rem' }}>⬅ Indietro</button>
      
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {profile.immagine ? (
          <img src={profile.immagine} alt="Profilo" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white' }}>
            {profile.nome[0]}{profile.cognome[0]}
          </div>
        )}
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>{profile.nome} {profile.cognome}</h1>
          <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            🎓 {profile.corsoDiStudi || 'Corso non specificato'}
          </div>
          <p style={{ margin: 0 }}>{profile.biografia || 'Nessuna biografia.'}</p>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Recensioni Ricevute ({profile.commentiRicevuti?.length || 0})</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {profile.commentiRicevuti?.map(c => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{c.mittenteNome}</strong>
              <span style={{ color: 'gold' }}>{"⭐".repeat(c.valutazione)}</span>
            </div>
            <p style={{ margin: 0 }}>{c.testo}</p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {new Date(c.data).toLocaleDateString()}
            </div>
          </div>
        ))}
        {(!profile.commentiRicevuti || profile.commentiRicevuti.length === 0) && (
          <p style={{ color: 'var(--text-muted)' }}>Questo utente non ha ancora ricevuto recensioni.</p>
        )}
      </div>
    </div>
  );
}
