import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { PenLine, Calendar, Clock, MapPin, TreePine, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState({
    titolo: '', materia: '', data: '', orario: '', indirizzo: '', tipoLuogo: 'Pubblico', numeroPosti: ''
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/evento/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setEvento({
          titolo: data.titolo || '',
          materia: data.materia || '',
          data: data.data || '',
          orario: data.orario ? data.orario.substring(0,5) : '', // HH:mm
          indirizzo: data.indirizzo || '',
          tipoLuogo: data.tipoLuogo || 'Pubblico',
          numeroPosti: data.numeroPosti || ''
        });
      } catch (err) {
        setMsg({ type: 'error', text: "Errore caricamento evento" });
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id]);

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
      await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/evento/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg({ type: 'success', text: 'Evento modificato con successo!' });
      setTimeout(() => navigate('/bacheca'), 1500);
    } catch (error) {
      setMsg({ type: 'error', text: 'Errore durante la modifica dell\'evento.' });
    }
  };

  const handleDelete = async () => {
    if(window.confirm('Sei sicuro di voler eliminare questo evento?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL || ''}/api/evento/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMsg({ type: 'success', text: 'Evento eliminato.' });
        setTimeout(() => navigate('/bacheca'), 1500);
      } catch (error) {
        setMsg({ type: 'error', text: 'Errore durante l\'eliminazione.' });
      }
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Caricamento...</div>;

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="StudyLink Logo" />
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Modifica Evento</h1>
      </div>
      
      {msg && (
          <div style={{ backgroundColor: msg.type === 'success' ? '#4caf50' : '#e57373', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
            {msg.text}
          </div>
      )}

      <div className="input-group">
        <label>Titolo</label>
        <PenLine className="input-icon" style={{ left: '115px' }} />
        <input type="text" name="titolo" style={{ paddingLeft: '40px' }} value={evento.titolo} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Data</label>
        <Calendar className="input-icon" style={{ left: '115px' }} />
        <input type="date" name="data" style={{ paddingLeft: '40px' }} value={evento.data} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Orario</label>
        <Clock className="input-icon" style={{ left: '115px' }} />
        <input type="time" name="orario" style={{ paddingLeft: '40px' }} value={evento.orario} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Indirizzo</label>
        <MapPin className="input-icon" style={{ left: '115px' }} />
        <input type="text" name="indirizzo" style={{ paddingLeft: '40px' }} value={evento.indirizzo} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Tipo di Luogo</label>
        <TreePine className="input-icon" style={{ left: '115px' }} />
        <select name="tipoLuogo" style={{ paddingLeft: '40px' }} value={evento.tipoLuogo} onChange={handleChange}>
          <option value="Pubblico">PUBBLICO</option>
          <option value="Privato">PRIVATO</option>
        </select>
      </div>

      <div className="input-group">
        <label>Numero posti</label>
        <Users className="input-icon" style={{ left: '115px' }} />
        <input type="number" name="numeroPosti" placeholder="Illimitati" min="1" style={{ paddingLeft: '40px' }} value={evento.numeroPosti || ''} onChange={(e) => { const val = e.target.value; if (val === '' || parseInt(val) > 0) { setEvento({ ...evento, numeroPosti: val }); } }} />
      </div>
      
      <button className="btn btn-primary" onClick={handleSave} style={{ marginBottom: '10px' }}>
        SALVA MODIFICHE
      </button>
      <button className="btn" onClick={handleDelete} style={{ backgroundColor: '#e57373', color: 'white', marginBottom: '10px' }}>
        ELIMINA EVENTO
      </button>

      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '500', cursor: 'pointer' }} onClick={() => navigate(-1)}>
          Annulla e Torna Indietro
        </span>
      </div>
    </div>
  );
};

export default EditEvent;
