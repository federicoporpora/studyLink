import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import UserAvatar from '../components/UserAvatar';

const Chat = () => {
  const location = useLocation();
  const eventoId = location.state?.eventoId;
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initChat = async () => {
      if (!eventoId) {
        navigate('/bacheca');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get my User ID from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
      setMyUserId(userId);

      // Fetch previous messages
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/evento/${eventoId}/messaggi`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages', err);
      }

      // Initialize SignalR
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/chathub`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    };

    initChat();
  }, [eventoId, navigate]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to SignalR');
          connection.invoke('JoinEventGroup', parseInt(eventoId));
        })
        .catch(e => console.error('Connection failed: ', e));

      const onReceiveMessage = (messageObj) => {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === messageObj.id)) return prev;
          return [...prev, messageObj];
        });
      };

      connection.on('ReceiveMessage', onReceiveMessage);

      return () => {
        connection.off('ReceiveMessage', onReceiveMessage);
        connection.invoke('LeaveEventGroup', parseInt(eventoId))
          .then(() => connection.stop())
          .catch(() => connection.stop());
      };
    }
  }, [connection, eventoId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !connection) return;

    try {
      await connection.invoke('SendMessage', parseInt(eventoId), newMessage);
      setNewMessage('');
    } catch (e) {
      console.error('Send failed: ', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', backgroundColor: '#ece5dd' }}>
      {/* Chat Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <ArrowLeft size={24} onClick={() => navigate('/bacheca')} style={{ cursor: 'pointer', marginRight: '15px' }} />
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }} 
          onClick={() => navigate('/dettagli-evento', { state: { eventoId } })}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', fontWeight: 'bold', marginRight: '15px' }}>
            💬
          </div>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Chat Evento</h2>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Tocca qui per info</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {messages.map((msg, index) => {
          const isMine = msg.utenteId === myUserId;
          const localTime = new Date(`${msg.data}T${msg.orario}:00Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          let showProfile = true;
          let isFirstInGroup = true;
          
          if (index > 0) {
            const prevMsg = messages[index - 1];
            if (prevMsg.utenteId === msg.utenteId) {
              const currDate = new Date(`${msg.data}T${msg.orario}:00Z`);
              const prevDate = new Date(`${prevMsg.data}T${prevMsg.orario}:00Z`);
              const diffMins = (currDate - prevDate) / (1000 * 60);
              if (diffMins < 5) {
                showProfile = false;
                isFirstInGroup = false;
              }
            }
          }

          // Generate a consistent color for the sender based on their name
          const colors = ['#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#ff8a65', '#d4e157', '#ffd54f', '#ffb74d'];
          const colorHash = msg.utenteNome ? msg.utenteNome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
          const nameColor = colors[colorHash % colors.length];

          return (
            <div key={index} style={{ display: 'flex', gap: '8px', alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '85%', marginTop: isFirstInGroup && index !== 0 ? '6px' : '0' }}>
              {!isMine && (
                <div style={{ width: '32px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                  {showProfile && (
                    <UserAvatar user={{ utenteNome: msg.utenteNome, immagineProfilo: msg.immagineProfilo }} size={32} />
                  )}
                </div>
              )}
              <div style={{
                backgroundColor: isMine ? '#4f7ca7' : 'white',
                color: isMine ? 'white' : 'var(--text)',
                padding: '6px 10px',
                borderRadius: '12px',
                borderTopRightRadius: isMine ? '0' : '12px',
                borderTopLeftRadius: !isMine && isFirstInGroup ? '0' : '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}>  {!isMine && showProfile && <div style={{ fontSize: '12px', color: nameColor, fontWeight: 'bold', marginBottom: '2px', paddingRight: '15px' }}>{msg.utenteNome}</div>}
                
                <div style={{ fontSize: '14px', wordBreak: 'break-word', lineHeight: '1.2', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ paddingBottom: '4px' }}>{msg.testo}</span>
                  <span style={{ fontSize: '10px', color: isMine ? 'rgba(255,255,255,0.7)' : '#999', position: 'relative', bottom: '-2px', flexShrink: 0 }}>{localTime}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={{ padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Scrivi un messaggio" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: 'none', outline: 'none', fontSize: '15px' }}
        />
        <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
          <Send size={20} style={{ marginLeft: '2px' }} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
