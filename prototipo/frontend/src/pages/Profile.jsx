import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';
import UserAvatar from '../components/UserAvatar';

const Profile = () => {
  const [profile, setProfile] = useState({
    nome: '',
    cognome: '',
    corsoDiStudi: '',
    biografia: '',
    immagineProfilo: null
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profilo/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profilo/me`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profilo aggiornato con successo!');
      navigate('/bacheca');
    } catch (error) {
      alert('Errore durante l\'aggiornamento del profilo.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/profilo/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(prev => ({ ...prev, immagineProfilo: res.data.url }));
    } catch (error) {
      alert('Errore caricamento immagine');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      alert('Inserisci sia la vecchia che la nuova password.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password aggiornata con successo!');
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert('Errore durante l\'aggiornamento della password.');
      }
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Sei sicuro di voler eliminare il tuo profilo? Questa azione non può essere annullata.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/delete-account`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Profilo eliminato con successo.');
        localStorage.removeItem('token');
        navigate('/login');
      } catch (error) {
        alert('Errore durante l\'eliminazione del profilo.');
      }
    }
  };

  return (
    <div className="container">
      <div className="header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          onClick={() => navigate('/bacheca')}
          style={{ position: 'absolute', left: '20px', cursor: 'pointer', color: 'var(--primary)' }}
        >
          <ArrowLeft size={24} />
        </div>
        <h2 style={{margin: 0}}>Modifica Profilo</h2>
      </div>
      
      <div className="profile-avatar-container">
        <UserAvatar 
          user={profile} 
          size={120} 
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
        />
        <div className="camera-icon" onClick={() => fileInputRef.current.click()} style={{cursor: 'pointer'}}>
          <Camera size={18} />
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          style={{ display: 'none' }} 
          accept="image/png, image/jpeg" 
        />
      </div>
      
      <div className="input-group">
        <label>Nome:</label>
        <input 
          type="text" 
          name="nome"
          value={profile.nome} 
          onChange={handleChange}
        />
      </div>
      
      <div className="input-group">
        <label>Cognome:</label>
        <input 
          type="text" 
          name="cognome"
          value={profile.cognome} 
          onChange={handleChange}
        />
      </div>
      
      <div className="input-group">
        <label>Corso di studi:</label>
        <input 
          type="text" 
          name="corsoDiStudi"
          value={profile.corsoDiStudi} 
          onChange={handleChange}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
          Biografia:
        </label>
        <textarea 
          name="biografia"
          value={profile.biografia} 
          onChange={handleChange}
          style={{ width: '100%', padding: '12px 15px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#f9f9f9', outline: 'none' }}
        />
      </div>
      
      <button className="btn btn-secondary" onClick={handleSave}>
        SALVA MODIFICHE PROFILO
      </button>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Modifica Password</h3>
      <div className="input-group">
        <label>Vecchia Password:</label>
        <input 
          type="password" 
          name="oldPassword"
          value={passwordData.oldPassword} 
          onChange={handlePasswordChange}
        />
      </div>
      <div className="input-group">
        <label>Nuova Password:</label>
        <input 
          type="password" 
          name="newPassword"
          value={passwordData.newPassword} 
          onChange={handlePasswordChange}
        />
      </div>
      <button className="btn btn-primary" onClick={handleSavePassword}>
        CAMBIA PASSWORD
      </button>

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      <button className="btn" style={{ backgroundColor: '#dc3545', color: 'white', marginBottom: '30px' }} onClick={handleDeleteProfile}>
        ELIMINA PROFILO
      </button>

      <div style={{ flex: 1 }}></div>
    </div>
  );
};

export default Profile;
