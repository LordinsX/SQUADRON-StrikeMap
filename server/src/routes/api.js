const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

let stateWriter = null;
let state = null;

module.exports = (writer, st) => {
  stateWriter = writer;
  state = st;
  return router;
};

// Получить состояние игры
router.get('/state', async (req, res) => {
  try {
    const currentState = await stateWriter.load();
    res.json(currentState);
  } catch (error) {
    logger.error('Failed to load state:', error);
    res.status(500).json({ error: 'Failed to load state' });
  }
});

// Создать POI
router.post('/pois', async (req, res) => {
  try {
    const poi = {
      id: uuidv4(),
      ...req.body,
      createdAt: Date.now(),
    };
    
    const currentState = await stateWriter.load();
    currentState.pois[poi.id] = poi;
    await stateWriter.write(currentState);
    
    res.status(201).json(poi);
  } catch (error) {
    logger.error('Failed to create POI:', error);
    res.status(500).json({ error: 'Failed to create POI' });
  }
});

// Импорт POI
router.post('/pois/import', async (req, res) => {
  try {
    const imported = req.body;
    const currentState = await stateWriter.load();
    
    for (const poi of imported) {
      const id = poi.id || uuidv4();
      currentState.pois[id] = { ...poi, id, createdAt: Date.now() };
    }
    
    await stateWriter.write(currentState);
    res.json({ imported: imported.length });
  } catch (error) {
    logger.error('Failed to import POIs:', error);
    res.status(500).json({ error: 'Failed to import POIs' });
  }
});

// Генерация токена
router.post('/tokens', async (req, res) => {
  try {
    const crypto = require('crypto');
    const token = crypto.randomBytes(16).toString('hex');
    
    const currentState = await stateWriter.load();
    currentState.tokens[token] = {
      id: uuidv4(),
      role: 'gamemaster',
      note: req.body.note || '',
      used: false,
      createdAt: Date.now(),
    };
    
    await stateWriter.write(currentState);
    res.status(201).json({ token, ...currentState.tokens[token] });
  } catch (error) {
    logger.error('Failed to generate token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

module.exports = router;
