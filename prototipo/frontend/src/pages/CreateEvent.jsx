import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titolo: '',
    materia: '',
    data: '',
    orario: '',
    indirizzoVia: '',
    indirizzoNomeLuogo: '',
    tipoDiLuogo: 0,
    numeroPosti: 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eventDate = new Date(`${formData.data}T${formData.orario}`);
    if (eventDate < new Date()) {
      alert("Non puoi creare un evento nel passato.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        tipoDiLuogo: parseInt(formData.tipoDiLuogo),
        numeroPosti: parseInt(formData.numeroPosti),
        orario: formData.orario + ":00" // convert to TimeSpan
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        navigate('/');
      } else {
        const text = await res.text();
        alert("Errore: " + text);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 className="title">Crea Nuovo Gruppo di Studio</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Titolo</label>
            <input type="text" name="titolo" className="form-control" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Materia</label>
            <input type="text" name="materia" className="form-control" onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" name="data" className="form-control" min={new Date().toISOString().split('T')[0]} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Orario</label>
              <input type="time" name="orario" className="form-control" onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Indirizzo / Luogo</label>
            <input type="text" name="indirizzoNomeLuogo" className="form-control" placeholder="es. Biblioteca Centrale" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Via</label>
            <input type="text" name="indirizzoVia" className="form-control" placeholder="es. Via Mezzocannone 8" onChange={handleChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo di Luogo</label>
              <select name="tipoDiLuogo" className="form-control" onChange={handleChange}>
                <option value={0}>Pubblico</option>
                <option value={1}>Privato</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Numero Posti (0 = Illimitati)</label>
              <input type="number" name="numeroPosti" className="form-control" min="0" defaultValue="0" onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Crea Evento
          </button>
        </form>
      </div>
    </div>
  );
}
