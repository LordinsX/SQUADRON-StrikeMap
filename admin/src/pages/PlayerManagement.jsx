import React from 'react';
import { useGameState } from '../hooks/useGameState';

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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    backgroundColor: '#1a1a1a',
    color: '#888',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #222',
    color: '#ccc',
    fontSize: '14px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
};

function PlayerManagement() {
  const { state } = useGameState();
  const players = Object.values(state?.players || {});

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span style={{ ...styles.statusBadge, backgroundColor: '#4CAF50', color: '#fff' }}>АКТИВЕН</span>;
      case 'dead':
        return <span style={{ ...styles.statusBadge, backgroundColor: '#F44336', color: '#fff' }}>МЁРТВ</span>;
      case 'sos':
        return <span style={{ ...styles.statusBadge, backgroundColor: '#FF9800', color: '#fff' }}>SOS</span>;
      default:
        return <span style={{ ...styles.statusBadge, backgroundColor: '#666', color: '#fff' }}>{status}</span>;
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Игроки ({players.length})</h1>

      {players.length === 0 ? (
        <div style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
          Нет игроков в игре
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Позывной</th>
              <th style={styles.th}>Команда</th>
              <th style={styles.th}>Роль</th>
              <th style={styles.th}>Взвод</th>
              <th style={styles.th}>Статус</th>
              <th style={styles.th}>Скорость</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td style={styles.td}>{player.callsign}</td>
                <td style={styles.td}>
                  <span style={{ color: player.team === 0 ? '#E53935' : '#1E88E5' }}>
                    {player.team === 0 ? 'КРАСНЫЕ' : 'СИНИЕ'}
                  </span>
                </td>
                <td style={styles.td}>
                  {player.role === 0 && 'СОЛДАТ'}
                  {player.role === 1 && 'КОМАНДИР'}
                  {player.role === 2 && 'ИГРОТЕХ'}
                </td>
                <td style={styles.td}>{player.squadId || '-'}</td>
                <td style={styles.td}>{getStatusBadge(player.status)}</td>
                <td style={styles.td}>{player.speed ? player.speed.toFixed(1) + ' км/ч' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PlayerManagement;
