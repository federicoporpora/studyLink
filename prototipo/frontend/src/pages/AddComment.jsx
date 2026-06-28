import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const AddComment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const targetId = location.state?.targetId;
  const targetNome = location.state?.targetNome;

  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [msg, setMsg] = useState(null);

  if (!targetId) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Nessun utente selezionato.</div>;
  }

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/profilo/${targetId}/commento`, {
        testo: commentText,
        valutazione: commentRating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg({ type: 'success', text: 'Commento inviato!' });
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data || 'Errore invio commento' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', backgroundColor: '#f9f9f9' }}>
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <ArrowLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer', marginRight: '15px' }} />
        <h2 style={{ fontSize: '18px', margin: 0 }}>Lascia un commento</h2>
      </div>

      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {msg && (
          <div style={{ backgroundColor: msg.type === 'success' ? '#4caf50' : '#e57373', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
            {msg.text}
          </div>
        )}
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Commento per {targetNome}</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Valutazione (1-5)</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => setCommentRating(v)} style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', backgroundColor: commentRating >= v ? '#ffb400' : '#eee', color: commentRating >= v ? 'white' : '#666' }}>★</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>Commento</label>
            <textarea 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '120px', fontFamily: 'inherit' }}
              placeholder="Scrivi la tua opinione..."
            />
          </div>

          <button onClick={handlePostComment} className="btn btn-secondary" style={{ width: '100%' }}>
            INVIA COMMENTO
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddComment;
