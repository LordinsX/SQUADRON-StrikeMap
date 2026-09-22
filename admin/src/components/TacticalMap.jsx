import React from 'react';

const styles = {
  container: {
    backgroundColor: '#0d0d0d',
    borderRadius: '12px',
    padding: '16px',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#fff',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '14px',
  },
};

function TacticalMap({ players = {}, pois = {} }) {
  return (
    <div style={styles.container}>
      <div style={styles.title}>Тактическая карта</div>
      <div style={styles.mapPlaceholder}>
        Здесь будет интерактивная карта (требуется Mapbox токен)
      </div>
    </div>
  );
}

export default TacticalMap;
