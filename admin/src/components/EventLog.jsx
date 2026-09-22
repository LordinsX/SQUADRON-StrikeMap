import React from 'react';

const styles = {
  container: {
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    padding: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#fff',
  },
  event: {
    padding: '8px 12px',
    marginBottom: '8px',
    backgroundColor: '#1a1a1a',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventText: {
    color: '#ccc',
  },
  eventTime: {
    color: '#666',
    fontSize: '11px',
  },
};

function EventLog({ events = [] }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU');
  };

  const getEventText = (event) => {
    switch (event.type) {
      case 'capture':
        return `${event.playerName} захватил ${event.poiName}`;
      case 'death':
        return `${event.playerName} погиб в зоне поражения`;
      case 'respawn':
        return `${event.playerName} возродился`;
      case 'sos':
        return `${event.playerName} запросил помощь`;
      default:
        return `${event.type}: ${JSON.stringify(event)}`;
    }
  };

  const getEventColor = (event) => {
    switch (event.type) {
      case 'capture': return '#4CAF50';
      case 'death': return '#F44336';
      case 'respawn': return '#2196F3';
      case 'sos': return '#FF9800';
      default: return '#ccc';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Журнал событий</div>
      {events.length === 0 ? (
        <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          Нет событий
        </div>
      ) : (
        [...events].reverse().map((event, index) => (
          <div key={event.id || index} style={styles.event}>
            <span style={{ ...styles.eventText, color: getEventColor(event) }}>
              {getEventText(event)}
            </span>
            <span style={styles.eventTime}>{formatTime(event.timestamp)}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default EventLog;
