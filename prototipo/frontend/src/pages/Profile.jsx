import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ corsoDiStudi: '', biografia: '', immagine: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({ corsoDiStudi: data.corsoDiStudi || '', biografia: data.biografia || '', immagine: data.immagine || '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ATTENZIONE! L'eliminazione dell'account è irreversibile. Sei sicuro?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/profile', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) { console.error(err); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, immagine: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) return <div style={{textAlign:'center', marginTop:'3rem'}}>Caricamento...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h1 className="title" style={{ marginBottom: '1.5rem' }}>Il mio Profilo</h1>
        
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Immagine Profilo</label>
              {formData.immagine && <img src={formData.immagine} alt="Preview" style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', marginBottom:'1rem', display:'block'}} />}
              <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Corso di Studi</label>
              <input type="text" className="form-control" value={formData.corsoDiStudi} onChange={e => setFormData({...formData, corsoDiStudi: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Biografia</label>
              <textarea className="form-control" value={formData.biografia} onChange={e => setFormData({...formData, biografia: e.target.value})} rows="4"></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Salva Modifiche</button>
              <button type="button" className="btn" onClick={() => setIsEditing(false)}>Annulla</button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {profile.immagine ? (
                  <img src={profile.immagine} alt="Profilo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white' }}>
                    {profile.nome[0]}{profile.cognome[0]}
                  </div>
                )}
                <div>
                  <h2>{profile.nome} {profile.cognome}</h2>
                  <div style={{ color: 'var(--text-muted)' }}>{profile.email}</div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Modifica</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>🎓 Corso di Studi:</strong> <br/>
              {profile.corsoDiStudi || 'Non specificato'}
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <strong>📝 Biografia:</strong> <br/>
              {profile.biografia || 'Nessuna biografia inserita.'}
            </div>

            <button onClick={handleDeleteAccount} className="btn btn-danger">Elimina Account</button>
          </div>
        )}
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
          <p style={{ color: 'var(--text-muted)' }}>Nessuna recensione ricevuta al momento.</p>
        )}
      </div>
    </div>
  );
}
