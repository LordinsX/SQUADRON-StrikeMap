import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MatchControl from './pages/MatchControl';
import PlayerManagement from './pages/PlayerManagement';
import PoiEditor from './pages/PoiEditor';
import SquadManagement from './pages/SquadManagement';
import TokenGenerator from './pages/TokenGenerator';

const navStyles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#1a1a1a',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#0d0d0d',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #333',
  },
  logo: {
    padding: '0 20px 20px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    borderBottom: '1px solid #333',
  },
  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '20px',
  },
  navLink: {
    padding: '12px 16px',
    color: '#aaa',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontSize: '14px',
  },
  activeNavLink: {
    backgroundColor: '#0D47A1',
    color: '#fff',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
};

function App() {
  return (
    <Router>
      <div style={navStyles.container}>
        <aside style={navStyles.sidebar}>
          <div style={navStyles.logo}>
            SQUADRON
            <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
              Command Center
            </div>
          </div>
          <nav style={navStyles.navLinks}>
            <NavLink 
              to="/" 
              style={({ isActive }) => ({
                ...navStyles.navLink,
                ...(isActive ? navStyles.activeNavLink : {}),
              })}
            >
              Дашборд
            </NavLink>
            <NavLink 
              to="/match" 
              style={({ isActive }) => ({
                ...navStyles.navLink,
                ...(isActive ? navStyles.activeNavLink : {}),
              })}
            >
              Управление матчем
            </NavLink>
            <NavLink 
              to="/players" 
              style={({ isActive }) => ({
                ...navStyles.navLink,
                ...(isActive ? navStyles.activeNavLink : {}),
              })}
            >
              Игроки
            </NavLink>
            <NavLink 
              to="/pois" 
              style={({ isActive }) => ({
                ...navStyles.navLink,
                ...(isActive ? navStyles.activeNavLink : {}),
              })}
            >
              Точки (POI)
            </NavLink>
            <NavLink 
              to="/squads" 
              style={({ isActive }) => ({
                ...navStyles.navLink,
                ...(isActive ? navStyles.activeNavLink : {}),
              })}
            >
              Взводы
            </NavLink>
            <NavLink 
              to="/tokens" 
              style={({ isActive }) => ({
                ...navStyles.navLink,
                ...(isActive ? navStyles.activeNavLink : {}),
              })}
            >
              Токены игротехов
            </NavLink>
          </nav>
        </aside>
        <main style={navStyles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/match" element={<MatchControl />} />
            <Route path="/players" element={<PlayerManagement />} />
            <Route path="/pois" element={<PoiEditor />} />
            <Route path="/squads" element={<SquadManagement />} />
            <Route path="/tokens" element={<TokenGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
