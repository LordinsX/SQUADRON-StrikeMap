const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

module.exports = (io, stateWriter) => {
  let state = null;
  
  stateWriter.load().then(s => {
    state = s;
  });

  const adminIo = io.of('/admin');
  
  adminIo.on('connection', (socket) => {
    logger.info('Admin connected');
    
    // Отправка текущего состояния
    socket.emit('game:state', state);
    
    // === УПРАВЛЕНИЕ МАТЧЕМ ===
    socket.on('match:start', async (data) => {
      state.match.status = 'running';
      state.match.startedAt = Date.now();
      state.match.duration = data.duration || 3600;
      state.match.timer = 0;
      
      io.emit('match:status', state.match);
      await stateWriter.write(state);
      logger.info('Match started by admin');
    });
    
    socket.on('match:pause', async () => {
      state.match.status = 'paused';
      state.match.pausedAt = Date.now();
      
      io.emit('match:status', state.match);
      await stateWriter.write(state);
      logger.info('Match paused by admin');
    });
    
    socket.on('match:resume', async () => {
      if (state.match.status !== 'paused') return;
      
      const pausedDuration = Date.now() - state.match.pausedAt;
      state.match.pausedDuration = (state.match.pausedDuration || 0) + pausedDuration;
      state.match.status = 'running';
      state.match.pausedAt = null;
      
      io.emit('match:status', state.match);
      await stateWriter.write(state);
      logger.info('Match resumed by admin');
    });
    
    socket.on('match:stop', async () => {
      state.match.status = 'finished';
      state.match.finishedAt = Date.now();
      
      io.emit('match:status', state.match);
      io.emit('scores:update', state.scores);
      await stateWriter.write(state);
      logger.info('Match stopped by admin');
    });
    
    socket.on('match:reset', async () => {
      state.match = {
        status: 'idle',
        startedAt: null,
        pausedAt: null,
        timer: 0,
        duration: 3600,
        pausedDuration: 0
      };
      state.scores = { red: 0, blue: 0 };
      state.players = {};
      state.waypoints = [];
      state.vectors = [];
      state.events = [];
      
      io.emit('match:status', state.match);
      io.emit('scores:update', state.scores);
      io.emit('game:state', state);
      
      await stateWriter.write(state);
      logger.info('Match reset by admin');
    });
    
    // === УПРАВЛЕНИЕ ТОЧКАМИ ===
    socket.on('poi:create', async (data) => {
      const poi = {
        id: uuidv4(),
        ...data,
        createdAt: Date.now(),
      };
      
      state.pois[poi.id] = poi;
      io.emit('pois:update', { [poi.id]: poi });
      await stateWriter.write(state);
      logger.info(`POI created: ${poi.name}`);
    });
    
    socket.on('poi:update', async (data) => {
      const { id, ...updates } = data;
      if (!state.pois[id]) return;
      
      state.pois[id] = { ...state.pois[id], ...updates };
      io.emit('pois:update', { [id]: state.pois[id] });
      await stateWriter.write(state);
    });
    
    socket.on('poi:delete', async (poiId) => {
      if (!state.pois[poiId]) return;
      
      const name = state.pois[poiId].name;
      delete state.pois[poiId];
      
      io.emit('pois:delete', poiId);
      await stateWriter.write(state);
      logger.info(`POI deleted: ${name}`);
    });
    
    socket.on('pois:import', async (jsonString) => {
      try {
        const imported = JSON.parse(jsonString);
        for (const poi of imported) {
          const id = poi.id || uuidv4();
          state.pois[id] = { ...poi, id, createdAt: Date.now() };
        }
        io.emit('pois:full', state.pois);
        await stateWriter.write(state);
        logger.info(`Imported ${imported.length} POIs`);
      } catch (e) {
        socket.emit('error', { message: 'Invalid JSON' });
        logger.error('POI import error:', e);
      }
    });
    
    // === УПРАВЛЕНИЕ ВЗВОДАМИ ===
    socket.on('squad:create', async (data) => {
      const squad = {
        id: uuidv4(),
        ...data,
        createdAt: Date.now(),
        members: [],
      };
      
      state.squads[squad.id] = squad;
      io.emit('squads:update', { [squad.id]: squad });
      await stateWriter.write(state);
    });
    
    socket.on('squad:delete', async (squadId) => {
      if (!state.squads[squadId]) return;
      
      delete state.squads[squadId];
      io.emit('squads:delete', squadId);
      await stateWriter.write(state);
    });
    
    // === ГЕНЕРАЦИЯ ТОКЕНОВ ===
    socket.on('token:generate', async (data) => {
      const crypto = require('crypto');
      const token = crypto.randomBytes(16).toString('hex');
      
      state.tokens[token] = {
        id: uuidv4(),
        role: 'gamemaster',
        note: data.note || '',
        used: false,
        createdAt: Date.now(),
      };
      
      socket.emit('token:created', { token, ...state.tokens[token] });
      await stateWriter.write(state);
      logger.info('Gamemaster token generated');
    });
    
    socket.on('token:revoke', async (token) => {
      if (state.tokens[token]) {
        delete state.tokens[token];
        await stateWriter.write(state);
        logger.info('Token revoked');
      }
    });
    
    // === ВЕЩАНИЕ ===
    socket.on('broadcast:message', (data) => {
      const { message, target } = data;
      
      const msg = {
        id: uuidv4(),
        message,
        from: 'COMMAND',
        target,
        timestamp: Date.now(),
      };
      
      state.messages.push(msg);
      if (state.messages.length > 50) {
        state.messages = state.messages.slice(-50);
      }
      
      if (target === 'all') {
        io.emit('chat:message', msg);
      } else {
        io.to(target).emit('chat:message', msg);
      }
      
      logger.info(`Broadcast sent to ${target}: ${message}`);
    });
    
    // === ПОЛУЧЕНИЕ СТАТИСТИКИ ===
    socket.on('stats:request', () => {
      const stats = {
        players: Object.keys(state.players).length,
        playersByTeam: {
          red: Object.values(state.players).filter(p => p.team === 0).length,
          blue: Object.values(state.players).filter(p => p.team === 1).length,
        },
        pois: Object.keys(state.pois).length,
        squads: Object.keys(state.squads).length,
        events: state.events.length,
        uptime: process.uptime(),
      };
      
      socket.emit('stats:response', stats);
    });
    
    socket.on('disconnect', () => {
      logger.info('Admin disconnected');
    });
  });
};
