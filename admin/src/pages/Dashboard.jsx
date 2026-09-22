import React from 'react';
import { useGameState } from '../hooks/useGameState';
import ScoreBoard from '../components/ScoreBoard';
import EventLog from '../components/EventLog';
import BroadcastPanel from '../components/BroadcastPanel';
import TacticalMap from '../components/TacticalMap';

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  statCard: {
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  connectionStatus: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

function Dashboard() {
  const { state, isConnected, error, broadcastMessage } = useGameState();

  if (!isConnected) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.connectionStatus, backgroundColor: '#F44336', color: '#fff', width: 'fit-content' }}>
          ОШИБКА ПОДКЛЮЧЕНИЯ
        </div>
        {error && <div style={{ color: '#F44336' }}>{error}</div>}
      </div>
    );
  }

  if (!state) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.connectionStatus, backgroundColor: '#FF9800', color: '#fff', width: 'fit-content' }}>
          ПОДКЛЮЧЕНИЕ...
        </div>
      </div>
    );
  }

  const playersArray = Object.values(state.players || {});
  const redCount = playersArray.filter(p => p.team === 0).length;
  const blueCount = playersArray.filter(p => p.team === 1).length;

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={styles.title}>Дашборд</h1>
        <div style={{ ...styles.connectionStatus, backgroundColor: '#4CAF50', color: '#fff' }}>
          ПОДКЛЮЧЕНО
        </div>
      </div>

      <ScoreBoard scores={state.scores} match={state.match} />

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{playersArray.length}</div>
          <div style={styles.statLabel}>Игроков онлайн</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#E53935' }}>{redCount}</div>
          <div style={styles.statLabel}>Красные</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#1E88E5' }}>{blueCount}</div>
          <div style={styles.statLabel}>Синие</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{Object.keys(state.pois || {}).length}</div>
          <div style={styles.statLabel}>Точек (POI)</div>
        </div>
      </div>

      <TacticalMap players={state.players} pois={state.pois} />

      <div style={styles.grid}>
        <EventLog events={state.events} />
        <BroadcastPanel onSend={broadcastMessage} />
      </div>
    </div>
  );
}

export default Dashboard;
