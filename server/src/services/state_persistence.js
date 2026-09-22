const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class AtomicStateWriter {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.tempPath = `${dbPath}.tmp`;
    this.backupPath = `${dbPath}.bak`;
    this.writeLock = Promise.resolve();
    
    const dir = path.dirname(dbPath);
    fs.mkdir(dir, { recursive: true }).catch(() => {});
  }

  async write(state) {
    this.writeLock = this.writeLock.then(async () => {
      try {
        const data = JSON.stringify(state, null, 2);
        await fs.writeFile(this.tempPath, data, 'utf8');
        
        const fd = await fs.open(this.tempPath, 'r+');
        await fd.sync();
        await fd.close();
        
        try {
          await fs.copyFile(this.dbPath, this.backupPath);
        } catch (e) {
          // Первый запуск
        }
        
        await fs.rename(this.tempPath, this.dbPath);
        logger.debug('State saved successfully');
      } catch (error) {
        logger.error('Atomic write failed:', error);
        try {
          await fs.copyFile(this.backupPath, this.dbPath);
        } catch (recoveryError) {
          logger.error('Recovery failed:', recoveryError);
        }
        throw error;
      }
    });
    
    return this.writeLock;
  }

  async load() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      try {
        const data = await fs.readFile(this.backupPath, 'utf8');
        logger.warn('Loaded from backup file');
        return JSON.parse(data);
      } catch (e) {
        logger.info('No existing state, creating initial state');
        return this.getInitialState();
      }
    }
  }

  getInitialState() {
    return {
      match: { 
        status: 'idle', 
        startedAt: null, 
        pausedAt: null,
        timer: 0,
        duration: 3600,
        pausedDuration: 0
      },
      players: {},
      squads: {},
      pois: {},
      buildings: [],
      roads: [],
      waypoints: [],
      vectors: [],
      scores: { red: 0, blue: 0 },
      events: [],
      tokens: {},
      messages: [],
    };
  }
}

module.exports = AtomicStateWriter;
