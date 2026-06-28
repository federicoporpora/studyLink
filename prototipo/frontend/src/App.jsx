import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import Bacheca from './pages/Bacheca';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';

import DettagliEvento from './pages/DettagliEvento';
import PersonalProfile from './pages/PersonalProfile';
import AddComment from './pages/AddComment';
import EditEvent from './pages/EditEvent';
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
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/personal-profile" element={<PersonalProfile />} />
        <Route path="/add-comment" element={<AddComment />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
