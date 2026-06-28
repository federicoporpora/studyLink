import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, PenLine, LogOut } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import axios from 'axios';

const PersonalProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/api/profilo/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento...</div>;
  if (!profile) return <div style={{ padding: '20px', textAlign: 'center' }}>Utente non trovato.</div>;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} onClick={() => navigate('/bacheca')} style={{ cursor: 'pointer', marginRight: '15px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>Il Mio Profilo</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <PenLine size={22} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} />
          <LogOut size={22} onClick={handleLogout} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Top Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <div style={{ width: '100px', height: '100px', marginBottom: '15px' }}>
             <UserAvatar user={profile} size={100} />
          </div>
          <h2 style={{ fontSize: '22px', color: 'var(--text-dark)', marginBottom: '5px' }}>{profile.nome} {profile.cognome}</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '14px', fontWeight: '500', marginBottom: '15px' }}>{profile.corsoDiStudi || "Corso non specificato"}</p>
          
          <div style={{ width: '100%', backgroundColor: '#f5f5f5', borderRadius: '10px', padding: '15px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Biografia</h3>
            <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--text-dark)' }}>{profile.biografia || "Nessuna biografia inserita."}</p>
          </div>
        </div>

        {/* Comments Section */}
        <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', marginBottom: '15px', fontWeight: '600' }}>I miei Commenti ({profile.commenti?.length || 0})</h3>
        
        {!profile.commenti || profile.commenti.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '10px' }}>Non hai ancora ricevuto commenti.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {profile.commenti.map(c => (
              <div key={c.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/user-profile', { state: { id: c.mittenteId } })}
                  >
                    <div style={{ width: '30px', height: '30px' }}>
                      <UserAvatar user={{ nome: c.mittenteNome?.split(' ')[0], cognome: c.mittenteNome?.split(' ')[1] || '', immagineProfilo: c.mittenteImmagine }} size={30} />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--primary)' }}>{c.mittenteNome}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ffb400' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < c.voto ? "#ffb400" : "none"} strokeWidth={i < c.voto ? 0 : 2} color={i < c.voto ? "#ffb400" : "#ccc"} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: '1.4' }}>{c.testo}</p>
                <div style={{ fontSize: '11px', color: 'var(--text-light)', textAlign: 'right', marginTop: '10px' }}>{c.data}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalProfile;
