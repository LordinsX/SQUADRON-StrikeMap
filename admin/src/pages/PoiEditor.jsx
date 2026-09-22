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
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: '#888',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
  },
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '14px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0D47A1',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    gridColumn: 'span 3',
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

const poiTypes = [
  { value: 0, label: 'Флаг' },
  { value: 1, label: 'Медпункт' },
  { value: 2, label: 'База' },
  { value: 3, label: 'Точка респавна' },
  { value: 4, label: 'Kill Zone' },
  { value: 5, label: 'Опасная зона' },
  { value: 6, label: 'Другое' },
];

function PoiEditor() {
  const { state, createPoi, deletePoi, importPois } = useGameState();
  const pois = Object.values(state?.pois || {});

  const [formData, setFormData] = useState({
    name: '',
    type: 0,
    lat: '',
    lng: '',
    captureRadius: 15,
    points: 10,
  });

  const [importJson, setImportJson] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    createPoi({
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      captureRadius: parseFloat(formData.captureRadius),
      points: parseInt(formData.points),
    });
    setFormData({ name: '', type: 0, lat: '', lng: '', captureRadius: 15, points: 10 });
  };

  const handleImport = () => {
    try {
      importPois(importJson);
      setImportJson('');
    } catch (e) {
      alert('Невалидный JSON');
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Точки (POI)</h1>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Создать новую точку</div>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Название</label>
            <input
              style={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Тип</label>
            <select
              style={styles.select}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
            >
              {poiTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Радиус захвата (м)</label>
            <input
              style={styles.input}
              type="number"
              value={formData.captureRadius}
              onChange={(e) => setFormData({ ...formData, captureRadius: e.target.value })}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Широта</label>
            <input
              style={styles.input}
              type="number"
              step="any"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Долгота</label>
            <input
              style={styles.input}
              type="number"
              step="any"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Очки</label>
            <input
              style={styles.input}
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            />
          </div>
          <button type="submit" style={styles.button}>
            СОЗДАТЬ ТОЧКУ
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Импорт точек из JSON</div>
        <textarea
          style={{ ...styles.input, width: '100%', minHeight: '100px', marginBottom: '12px' }}
          placeholder='[{"name": "Base", "type": 2, "lat": 55.75, "lng": 37.61}]'
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
        />
        <button
          style={{ ...styles.button, gridColumn: 'auto' }}
          onClick={handleImport}
        >
          ИМПОРТИРОВАТЬ
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Существующие точки ({pois.length})</div>
        <div style={styles.list}>
          {pois.map(poi => (
            <div key={poi.id} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>{poi.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {poiTypes.find(t => t.value === poi.type)?.label} | 
                  Радиус: {poi.captureRadius}м | 
                  Очки: {poi.points}
                </div>
              </div>
              <button
                style={styles.deleteButton}
                onClick={() => deletePoi(poi.id)}
              >
                УДАЛИТЬ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PoiEditor;
