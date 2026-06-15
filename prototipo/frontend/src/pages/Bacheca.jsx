import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter } from 'lucide-react';
import logo from '../assets/logo.png';
import UserAvatar from '../components/UserAvatar';

const Bacheca = () => {
  const [eventi, setEventi] = useState([]);
  const [activeTab, setActiveTab] = useState('esplora'); // 'esplora' or 'miei'
  const [search, setSearch] = useState('');
  const [myProfile, setMyProfile] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState({ tipoLuogo: '', postiMinimi: '', dataInizio: '', dataFine: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        // Fetch My Profile for image and ID
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/profilo/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyProfile(profileRes.data);
        
        // We need userId to filter "I miei eventi". Let's decode token or fetch it from auth endpoint if available.
        // As a shortcut for this prototype, we'll fetch auth info or parse JWT (naive decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
        setMyUserId(userId);

        // Fetch Events
        const eventiRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/evento`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEventi(eventiRes.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handlePartecipa = async (eventoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/evento/' + eventoId + '/partecipa', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Prenotato con successo!');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data || 'Errore durante la prenotazione');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredEvents = eventi.filter(e => {
    // Tab filter
    if (activeTab === 'miei') {
      if (e.organizzatoreId !== myUserId && !e.isIscritto) return false;
    } else {
      if (e.organizzatoreId === myUserId || e.isIscritto) return false;
    }
    
    // Search filter
    if (search && !e.titolo.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Inline filter
    if (filter.tipoLuogo && e.tipoLuogo !== filter.tipoLuogo) return false;
    
    // Posti minimi
    if (filter.postiMinimi) {
      const minPosti = parseInt(filter.postiMinimi);
      const postiLiberi = e.numeroPosti ? (e.numeroPosti - e.partecipantiAttuali - 1) : 999999;
      if (postiLiberi < minPosti) return false;
    }
    
    // Data inizio
    if (filter.dataInizio) {
      if (e.data < filter.dataInizio) return false;
    }
    
    // Data fine
    if (filter.dataFine) {
      if (e.data > filter.dataFine) return false;
    }
    
    return true;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <img src={logo} alt="StudyLink" style={{ height: '30px' }} />
        <div style={{ position: 'relative' }}>
          <div onClick={() => setShowMenu(!showMenu)} style={{ cursor: 'pointer' }}>
            <UserAvatar user={myProfile} size={40} />
          </div>
          {showMenu && (
            <div style={{
              position: 'absolute', top: '50px', right: '0', backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '10px',
              display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000, width: '150px'
            }}>
              <div 
                style={{ padding: '8px', cursor: 'pointer', borderRadius: '8px', fontWeight: '500' }}
                onClick={() => navigate('/profile')}
              >
                Modifica Profilo
              </div>
              <div 
                style={{ padding: '8px', cursor: 'pointer', borderRadius: '8px', color: 'red', fontWeight: '500' }}
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
        <div 
          onClick={() => setActiveTab('esplora')}
          style={{ flex: 1, textAlign: 'center', padding: '15px 0', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'esplora' ? 'var(--primary)' : 'var(--text-light)', borderBottom: activeTab === 'esplora' ? '3px solid var(--primary)' : 'none' }}
        >
          ESPLORA
        </div>
        <div 
          onClick={() => setActiveTab('miei')}
          style={{ flex: 1, textAlign: 'center', padding: '15px 0', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'miei' ? 'var(--primary)' : 'var(--text-light)', borderBottom: activeTab === 'miei' ? '3px solid var(--primary)' : 'none' }}
        >
          I MIEI EVENTI
        </div>
      </div>

      {/* Search / Filters */}
      <div style={{ padding: '20px 20px 10px 20px', display: 'flex', gap: '10px' }}>
        <div className="input-group" style={{ margin: 0, flex: 1 }}>
          <Search className="input-icon" style={{ left: '15px' }} />
          <input 
            type="text" 
            placeholder="Cerca titolo..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '45px' }}
          />
        </div>
        <button className="btn btn-secondary" style={{ width: 'auto', marginTop: 0, padding: '0 15px' }} onClick={() => setShowFilterModal(!showFilterModal)}>
          <Filter size={18} />
        </button>
      </div>

      {/* Inline Filter Section */}
      <div style={{
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        maxHeight: showFilterModal ? '500px' : '0',
        opacity: showFilterModal ? 1 : 0,
        padding: '0 20px'
      }}>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '15px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ flex: '1 1 45%' }}>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Data Inizio</label>
              <input 
                type="date" 
                value={filter.dataInizio}
                onChange={e => setFilter({ ...filter, dataInizio: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              />
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Data Fine</label>
              <input 
                type="date" 
                value={filter.dataFine}
                onChange={e => setFilter({ ...filter, dataFine: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              />
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Tipo Luogo</label>
              <select 
                value={filter.tipoLuogo} 
                onChange={e => setFilter({ ...filter, tipoLuogo: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              >
                <option value="">Tutti</option>
                <option value="Pubblico">Pubblico</option>
                <option value="Privato">Privato</option>
              </select>
            </div>
            <div style={{ flex: '1 1 45%' }}>
              <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Posti Liberi Minimi</label>
              <input 
                type="number" 
                min="1"
                placeholder="Es. 2"
                value={filter.postiMinimi}
                onChange={e => setFilter({ ...filter, postiMinimi: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn" style={{ width: 'auto', backgroundColor: '#e0e0e0', color: '#333', padding: '6px 12px', fontSize: '12px', marginTop: 0 }} onClick={() => setFilter({ tipoLuogo: '', postiMinimi: '', dataInizio: '', dataFine: '' })}>Resetta Filtri</button>
          </div>
        </div>
      </div>

      {/* Event List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px 20px' }}>
        {filteredEvents.map(evento => (
          <div key={evento.id} style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '15px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
            border: '1px solid #eee',
            borderLeft: activeTab === 'miei' 
                          ? (evento.organizzatoreId === myUserId ? '6px solid var(--primary)' : '6px solid #28a745') 
                          : '1px solid #eee'
          }}>
            {activeTab === 'miei' && (
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: evento.organizzatoreId === myUserId ? 'var(--primary)' : '#28a745', marginBottom: '5px' }}>
                {evento.organizzatoreId === myUserId ? 'ORGANIZZATO DA TE' : 'PARTECIPI'}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{evento.data} • {evento.orario}</span>
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{evento.titolo}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '15px' }}>
              📍 {evento.indirizzo} ({evento.tipoLuogo})<br/>
              👤 {evento.organizzatoreNome}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                Posti disponibili: {evento.numeroPosti ? (evento.numeroPosti - evento.partecipantiAttuali - 1) + ' / ' + evento.numeroPosti : 'Illimitati'}
              </span>
              
              {activeTab === 'miei' || evento.organizzatoreId === myUserId || evento.isIscritto ? (
                <button className="btn btn-secondary" style={{ width: 'auto', padding: '8px 20px', marginTop: 0, fontSize: '12px' }} onClick={() => navigate('/chat', { state: { eventoId: evento.id } })}>
                  VAI ALLA CHAT
                </button>
              ) : (
                <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 20px', marginTop: 0, fontSize: '12px' }} onClick={() => handlePartecipa(evento.id)}>
                  PARTECIPA
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '40px' }}>Nessun evento trovato.</p>
        )}
      </div>

      {/* Floating Action Button */}
      <div 
        onClick={() => navigate('/create-event')}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          backgroundColor: 'var(--primary)',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(223, 110, 104, 0.4)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={30} />
      </div>
    </div>
  );
};

export default Bacheca;
