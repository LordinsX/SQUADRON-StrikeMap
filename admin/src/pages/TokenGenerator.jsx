import React, { useState } from 'react';
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
  form: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#0D47A1',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  tokenDisplay: {
    padding: '16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '16px',
    color: '#4CAF50',
    marginBottom: '12px',
    wordBreak: 'break-all',
  },
  list: {
    display: 'grid',
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
  },
  deleteButton: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#F44336',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

function TokenGenerator() {
  const { state, generateToken, revokeToken } = useGameState();
  const tokens = Object.entries(state?.tokens || {});
  const [note, setNote] = useState('');
  const [lastToken, setLastToken] = useState(null);

  const handleGenerate = () => {
    generateToken(note);
    setNote('');
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Токены игротехов</h1>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Сгенерировать новый токен</div>
        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Примечание (например: Судья поля 1)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button style={styles.button} onClick={handleGenerate}>
            СГЕНЕРИРОВАТЬ
          </button>
        </div>
      </div>

      {lastToken && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Новый токен</div>
          <div style={styles.tokenDisplay}>{lastToken}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Скопируйте токен и передайте игротеху. Токен одноразовый.
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>Активные токены ({tokens.length})</div>
        <div style={styles.list}>
          {tokens.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              Нет активных токенов
            </div>
          ) : (
            tokens.map(([token, data]) => (
              <div key={token} style={styles.listItem}>
                <div>
                  <div style={{ fontFamily: 'monospace', color: '#fff' }}>
                    {token.substring(0, 8)}...
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {data.note || 'Без примечания'} | 
                    {data.used ? ' Использован' : ' Активен'}
                  </div>
                </div>
                <button
                  style={styles.deleteButton}
                  onClick={() => revokeToken(token)}
                >
                  ОТОЗВАТЬ
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TokenGenerator;
