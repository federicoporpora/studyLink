import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        email,
        password,
        nome,
        cognome
      });
      localStorage.setItem('token', response.data.token);
      navigate('/bacheca');
    } catch (error) {
      if (error.response && error.response.data) {
        alert('Registrazione fallita: ' + error.response.data);
      } else {
        alert('Registrazione fallita. Riprova più tardi.');
      }
    }
  };

  return (
    <div className="container form-no-label" style={{ justifyContent: 'center' }}>
      <div className="header">
        <img src={logo} alt="StudyLink Logo" />
        <h1 className="page-title">Registrazione</h1>
      </div>
      
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Nome..." 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Cognome..." 
            value={cognome}
            onChange={(e) => setCognome(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <input 
            type="email" 
            placeholder="Mail Istituzionale..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Password..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        
        <button type="submit" className="btn btn-secondary">
          REGISTRATI
        </button>
      </form>
      
      <Link to="/login" className="link-text">
        SEI GIÀ REGISTRATO? CLICCA QUI
      </Link>
    </div>
  );
};

export default Register;
