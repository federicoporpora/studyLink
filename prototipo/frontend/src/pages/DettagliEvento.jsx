import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, MapPin, Calendar, BookOpen, PenLine } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

const DettagliEvento = () => {
  const location = useLocation();
  const id = location.state?.eventoId;
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [msg, setMsg] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    const fetchEvento = async () => {
      if (!id) return navigate('/bacheca');
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
        setMyUserId(userId);

        const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/evento/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvento(res.data);
      } catch (error) {
        console.error("Errore fetch evento", error);
        setMsg({ type: 'error', text: "Impossibile caricare i dettagli dell'evento." });
      }
    };
    fetchEvento();
  }, [id, navigate]);

  if (!evento) return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento...</div>;

  const today = new Date();
  today.setHours(0,0,0,0);
  const tzOffset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - tzOffset);
  const todayStr = localToday.toISOString().split('T')[0];
  const isPast = evento.data < todayStr;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer', marginRight: '15px' }} />
          <h2 style={{ fontSize: '18px', margin: 0 }}>Info Evento</h2>
        </div>
        {evento.organizzatoreId === myUserId && (
          <PenLine size={22} onClick={() => navigate(`/edit-event/${evento.id}`)} style={{ cursor: 'pointer' }} />
        )}
      </div>

      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {msg && (
          <div style={{ 
            backgroundColor: msg.type === 'success' ? '#4caf50' : '#e57373', 
            color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' 
          }}>
            {msg.text}
          </div>
        )}
        {/* Info Box */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '15px', color: 'var(--text)' }}>{evento.titolo}</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-light)' }}>
              <Calendar size={18} style={{ marginRight: '10px', color: 'var(--primary)' }} />
              <span style={{ fontSize: '15px' }}>{evento.data} alle {evento.orario}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-light)' }}>
              <MapPin size={18} style={{ marginRight: '10px', color: '#ff9800' }} />
              <span style={{ fontSize: '15px' }}>{evento.indirizzo} ({evento.tipoLuogo})</span>
            </div>
          </div>
        </div>

        {/* Posti Disponibili */}
        <div style={{ marginBottom: '20px', padding: '0 5px' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '5px' }}>Posti Disponibili</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
            {evento.numeroPosti ? (evento.numeroPosti - evento.partecipantiAttuali - 1) + ' / ' + evento.numeroPosti : 'Illimitati'}
          </p>
        </div>

        {/* Lista Utenti */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '15px', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
            <Users size={18} style={{ marginRight: '8px' }} />
            Partecipanti ({evento.partecipanti.length + 1})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Organizzatore */}
            <div 
              style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 15px', borderRadius: '12px', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', cursor: 'pointer' }}
              onClick={() => navigate('/user-profile', { state: { id: evento.organizzatoreId } })}
            >
              <UserAvatar 
                user={{ 
                  nome: evento.organizzatoreNome, 
                  immagineProfilo: evento.organizzatoreImmagineProfilo 
                }} 
                size={40} 
                style={{ marginRight: '15px' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '500' }}>{evento.organizzatoreNome}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold' }}>Organizzatore</div>
              </div>
              {isPast && evento.organizzatoreId !== myUserId && (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/add-comment', { state: { targetId: evento.organizzatoreId, targetNome: evento.organizzatoreNome } }); }}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
                >
                  Lascia commento
                </button>
              )}
            </div>

            {/* Iscritti */}
            {evento.partecipanti.map((p, index) => (
              <div 
                key={index} 
                style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 15px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', cursor: 'pointer' }}
                onClick={() => navigate('/user-profile', { state: { id: p.utenteId } })}
              >
                <UserAvatar 
                  user={{ 
                    nome: p.nome, 
                    immagineProfilo: p.immagineProfilo 
                  }} 
                  size={40} 
                  style={{ marginRight: '15px' }} 
                />
                <div style={{ flex: 1, fontSize: '15px', fontWeight: '500' }}>{p.nome}</div>
                
                {isPast && p.utenteId !== myUserId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/add-comment', { state: { targetId: p.utenteId, targetNome: p.nome } }); }}
                    style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
                  >
                    Lascia commento
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DettagliEvento;
