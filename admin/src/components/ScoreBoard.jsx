import React from 'react';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    padding: '20px',
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  team: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  teamName: {
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  score: {
    fontSize: '48px',
    fontWeight: 'bold',
  },
  timer: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    padding: '0 40px',
  },
  status: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
};

function ScoreBoard({ scores, match }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (match?.status) {
      case 'running': return 'ИДЁТ БОЙ';
      case 'paused': return 'ПАУЗА';
      case 'finished': return 'ЗАВЕРШЁН';
      default: return 'ОЖИДАНИЕ';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.team}>
        <div style={{ ...styles.teamName, color: '#E53935' }}>Красные</div>
        <div style={{ ...styles.score, color: '#E53935' }}>
          {scores?.red || 0}
        </div>
      </div>

      <div style={styles.timer}>
        {formatTime(match?.timer || 0)}
        <div style={styles.status}>{getStatusText()}</div>
      </div>

      <div style={styles.team}>
        <div style={{ ...styles.teamName, color: '#1E88E5' }}>Синие</div>
        <div style={{ ...styles.score, color: '#1E88E5' }}>
          {scores?.blue || 0}
        </div>
      </div>
    </div>
  );
}

export default ScoreBoard;
