import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/bacheca');
    } catch (error) {
      alert('Login fallito. Controlla le tue credenziali.');
    }
  };

  return (
    <div className="container form-no-label" style={{ justifyContent: 'center' }}>
      <div className="header">
        <img src={logo} alt="StudyLink Logo" />
        <h1 className="page-title">Accesso</h1>
      </div>
      
      <form onSubmit={handleLogin}>
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
          ACCEDI
        </button>
      </form>
      
      <Link to="/register" className="link-text">
        NON SEI ANCORA REGISTRATO? CLICCA QUI
      </Link>
    </div>
  );
};

export default Login;
