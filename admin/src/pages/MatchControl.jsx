import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    padding: '24px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#fff',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '16px 32px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
    color: '#fff',
  },
  stopButton: {
    backgroundColor: '#F44336',
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#607D8B',
    color: '#fff',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
    width: '120px',
  },
  statusText: {
    fontSize: '14px',
    color: '#888',
    marginTop: '12px',
  },
};

function MatchControl() {
  const { state, startMatch, pauseMatch, resumeMatch, stopMatch, resetMatch } = useGameState();
  const [duration, setDuration] = useState(60);

  const match = state?.match;
  const isRunning = match?.status === 'running';
  const isPaused = match?.status === 'paused';

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Управление матчем</h1>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Статус матча</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
          {match?.status === 'running' && 'ИДЁТ БОЙ'}
          {match?.status === 'paused' && 'ПАУЗА'}
          {match?.status === 'finished' && 'ЗАВЕРШЁН'}
          {match?.status === 'idle' && 'ОЖИДАНИЕ'}
        </div>
        <div style={styles.statusText}>
          Таймер: {Math.floor((match?.timer || 0) / 60)}:{((match?.timer || 0) % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Управление</div>
        <div style={styles.buttonRow}>
          {!isRunning && !isPaused && (
            <>
              <input
                style={styles.input}
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                min="1"
                max="480"
              />
              <button
                style={{ ...styles.button, ...styles.startButton }}
                onClick={() => startMatch(duration * 60)}
              >
                СТАРТ
              </button>
            </>
          )}
          {isRunning && (
            <button
              style={{ ...styles.button, ...styles.pauseButton }}
              onClick={pauseMatch}
            >
              ПАУЗА
            </button>
          )}
          {isPaused && (
            <button
              style={{ ...styles.button, ...styles.startButton }}
              onClick={resumeMatch}
            >
              ПРОДОЛЖИТЬ
            </button>
          )}
          {(isRunning || isPaused) && (
            <button
              style={{ ...styles.button, ...styles.stopButton }}
              onClick={stopMatch}
            >
              СТОП
            </button>
          )}
          <button
            style={{ ...styles.button, ...styles.resetButton }}
            onClick={resetMatch}
          >
            СБРОС
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Счёт</div>
        <div style={{ display: 'flex', gap: '40px', fontSize: '32px', fontWeight: 'bold' }}>
          <span style={{ color: '#E53935' }}>
            КРАСНЫЕ: {state?.scores?.red || 0}
          </span>
          <span style={{ color: '#1E88E5' }}>
            СИНИЕ: {state?.scores?.blue || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MatchControl;
