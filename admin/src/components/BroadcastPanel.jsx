import React, { useState } from 'react';

const styles = {
  container: {
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    padding: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '80px',
  },
  targetRow: {
    display: 'flex',
    gap: '8px',
  },
  targetButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '13px',
  },
  activeTarget: {
    backgroundColor: '#0D47A1',
    color: '#fff',
    borderColor: '#0D47A1',
  },
  sendButton: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0D47A1',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

function BroadcastPanel({ onSend }) {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message, target);
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Вещание сообщений</div>
      <div style={styles.form}>
        <textarea
          style={styles.input}
          placeholder="Введите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={styles.targetRow}>
          <button
            style={{ 
              ...styles.targetButton, 
              ...(target === 'all' ? styles.activeTarget : {}) 
            }}
            onClick={() => setTarget('all')}
          >
            Все
          </button>
          <button
            style={{ 
              ...styles.targetButton, 
              ...(target === 'red' ? { ...styles.activeTarget, backgroundColor: '#E53935' } : {}) 
            }}
            onClick={() => setTarget('red')}
          >
            Красные
          </button>
          <button
            style={{ 
              ...styles.targetButton, 
              ...(target === 'blue' ? { ...styles.activeTarget, backgroundColor: '#1E88E5' } : {}) 
            }}
            onClick={() => setTarget('blue')}
          >
            Синие
          </button>
        </div>
        <button style={styles.sendButton} onClick={handleSend}>
          ОТПРАВИТЬ
        </button>
      </div>
    </div>
  );
}

export default BroadcastPanel;
