import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';

export default function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.userId || currentUser?.id;
  const token = localStorage.getItem('token');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('/chathub', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    newConnection.on('ReceiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    const startConnection = async () => {
      try {
        await newConnection.start();
        await newConnection.invoke('JoinChat', id.toString());
        setConnection(newConnection);
      } catch (e) {
        console.error('SignalR Connection Error: ', e);
      }
    };
    startConnection();

    return () => {
      newConnection.stop();
    };
  }, [id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        navigate('/'); // Not a participant or event not found
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const sendMessage = async (e) => {
    e.preventDefault();
    if (connection && newMessage.trim()) {
      try {
        await connection.invoke('SendMessage', id.toString(), newMessage);
        setNewMessage('');
      } catch (e) {
        console.error('Send Error: ', e);
      }
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'3rem'}}>Caricamento Chat...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <button onClick={() => navigate(`/events/${id}`)} className="btn">⬅ Torna all'Evento</button>
        <h2 style={{ margin: 0 }}>Chat dell'Evento</h2>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, i) => {
            const isMine = m.mittenteId === currentUserId;
            return (
              <div key={i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%', display: 'flex', gap: '0.8rem', alignItems: 'flex-end' }}>
                {!isMine && (
                  m.mittenteImmagine ? (
                    <img 
                      src={m.mittenteImmagine} 
                      alt="avatar" 
                      style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, fontWeight: 'bold' }}>
                      {m.mittenteNome ? m.mittenteNome[0].toUpperCase() : '?'}
                    </div>
                  )
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                  {!isMine && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem', marginLeft: '0.5rem' }}>{m.mittenteNome}</div>}
                  <div style={{ 
                    background: isMine ? '#f1f1f1' : 'var(--primary)', 
                    color: isMine ? '#333' : 'white',
                    padding: '0.8rem 1.2rem', 
                    borderRadius: '1.2rem',
                    borderBottomRightRadius: isMine ? 0 : '1.2rem',
                    borderBottomLeftRadius: isMine ? '1.2rem' : 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    {m.testo}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', padding: '1rem', background: 'var(--bg-secondary)', gap: '0.5rem' }}>
          <input 
            type="text" 
            className="form-control" 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)} 
            placeholder="Scrivi un messaggio..." 
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={!connection}>Invia</button>
        </form>
      </div>
    </div>
  );
}
