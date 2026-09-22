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
    marginBottom: '20px',
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

function SquadManagement() {
  const { state, createSquad, deleteSquad } = useGameState();
  const squads = Object.values(state?.squads || {});
  const [newSquadName, setNewSquadName] = useState('');

  const handleCreate = () => {
    if (newSquadName.trim()) {
      createSquad({ name: newSquadName, team: 0 });
      setNewSquadName('');
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Взводы</h1>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Создать взвод</div>
        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Название взвода"
            value={newSquadName}
            onChange={(e) => setNewSquadName(e.target.value)}
          />
          <button style={styles.button} onClick={handleCreate}>
            СОЗДАТЬ
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Список взводов ({squads.length})</div>
        <div style={styles.list}>
          {squads.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              Нет взводов
            </div>
          ) : (
            squads.map(squad => (
              <div key={squad.id} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff' }}>{squad.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Участников: {squad.members?.length || 0}
                  </div>
                </div>
                <button
                  style={styles.deleteButton}
                  onClick={() => deleteSquad(squad.id)}
                >
                  УДАЛИТЬ
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default SquadManagement;
