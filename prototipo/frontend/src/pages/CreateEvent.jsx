import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PenLine, Atom, Calendar, Clock, MapPin, TreePine, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const CreateEvent = () => {
  const [evento, setEvento] = useState({
    titolo: '',
    materia: '',
    data: '',
    orario: '',
    indirizzo: '',
    tipoLuogo: 'Pubblico',
    numeroPosti: ''
  });
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEvento({ ...evento, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...evento,
        numeroPosti: evento.numeroPosti ? parseInt(evento.numeroPosti) : null
      };
      await axios.post('/api/evento', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg({ type: 'success', text: 'Evento creato con successo!' });
      setTimeout(() => navigate('/bacheca'), 1500);
    } catch (error) {
      if (error.response?.data) {
        setMsg({ type: 'error', text: 'Errore: ' + JSON.stringify(error.response.data) });
      } else {
        setMsg({ type: 'error', text: 'Errore durante la creazione dell\'evento.' });
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="StudyLink Logo" />
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Crea Nuovo Evento</h1>
      </div>
      
      {msg && (
          <div style={{ 
            backgroundColor: msg.type === 'success' ? '#4caf50' : '#e57373', 
            color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' 
          }}>
            {msg.text}
          </div>
      )}

      <div className="input-group">
        <label>Titolo</label>
        <PenLine className="input-icon" style={{ left: '115px' }} />
        <input 
          type="text" 
          name="titolo"
          placeholder="Nome dell'evento..." 
          style={{ paddingLeft: '40px' }}
          value={evento.titolo} 
          onChange={handleChange}
        />
      </div>


      <div className="input-group">
        <label>Data</label>
        <Calendar className="input-icon" style={{ left: '115px' }} />
        <input 
          type="date" 
          name="data"
          style={{ paddingLeft: '40px' }}
          value={evento.data} 
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label>Orario</label>
        <Clock className="input-icon" style={{ left: '115px' }} />
        <input 
          type="time" 
          name="orario"
          style={{ paddingLeft: '40px' }}
          value={evento.orario} 
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label>Indirizzo</label>
        <MapPin className="input-icon" style={{ left: '115px' }} />
        <input 
          type="text" 
          name="indirizzo"
          placeholder="Cerca o inserisci indirizzo..." 
          style={{ paddingLeft: '40px' }}
          value={evento.indirizzo} 
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label>Tipo di Luogo</label>
        <TreePine className="input-icon" style={{ left: '115px' }} />
        <select 
          name="tipoLuogo"
          style={{ paddingLeft: '40px' }}
          value={evento.tipoLuogo} 
          onChange={handleChange}
        >
          <option value="Pubblico">PUBBLICO</option>
          <option value="Privato">PRIVATO</option>
        </select>
      </div>

      <div className="input-group">
        <label>Numero posti</label>
        <Users className="input-icon" style={{ left: '115px' }} />
        <input 
          type="number" 
          name="numeroPosti"
          placeholder="Illimitati" 
          min="1"
          style={{ paddingLeft: '40px' }}
          value={evento.numeroPosti} 
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || parseInt(val) > 0) {
              setEvento({ ...evento, numeroPosti: val });
            }
          }}
        />
      </div>
      
      <button className="btn btn-primary" onClick={handleSave}>
        SALVA EVENTO
      </button>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          Annulla
        </span>
      </div>
    </div>
  );
};

export default CreateEvent;
