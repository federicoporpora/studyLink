import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import Bacheca from './pages/Bacheca';
import Chat from './pages/Chat';

import DettagliEvento from './pages/DettagliEvento';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/bacheca" element={<Bacheca />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dettagli-evento" element={<DettagliEvento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
