import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getGameState = async () => {
  const response = await api.get('/api/state');
  return response.data;
};

export const createPoi = async (poiData) => {
  const response = await api.post('/api/pois', poiData);
  return response.data;
};

export const importPois = async (poisArray) => {
  const response = await api.post('/api/pois/import', poisArray);
  return response.data;
};

export const generateToken = async (note) => {
  const response = await api.post('/api/tokens', { note });
  return response.data;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
