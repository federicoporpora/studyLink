import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import ChatView from './pages/ChatView';
import UserProfile from './pages/UserProfile';
import PastEvents from './pages/PastEvents';

function App() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="nav-brand">StudyLink</Link>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Bacheca</Link>
              <Link to="/create" className="nav-link">Crea Evento</Link>
              <Link to="/past-events" className="nav-link">Eventi Passati</Link>
              <Link to="/profile" className="nav-link">Profilo</Link>
              <button onClick={handleLogout} className="btn btn-primary" style={{padding: '0.5rem 1rem'}}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{padding: '0.5rem 1rem'}}>Registrati</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/chat" element={<ChatView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route path="/past-events" element={<PastEvents />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
