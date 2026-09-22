const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const GameLogic = require('../services/game_logic');

module.exports = (io, stateWriter) => {
  let state = null;
  let gameLogic = null;
  
  stateWriter.load().then(s => {
    state = s;
    gameLogic = new GameLogic(state, io, stateWriter);
    logger.info('Game state loaded successfully');
    
    // Восстановление таймера если матч был запущен
    if (state.match.status === 'running') {
      gameLogic.matchInterval = setInterval(() => {
        gameLogic.updateTimer();
      }, 1000);
    }
  });

  io.on('connection', (socket) => {
    
    // === ВХОД В ИГРУ ===
    socket.on('player:join', async (data, callback) => {
      try {
        const { callsign, team, role, squadId, token } = data;
        
        if (!callsign || team === undefined || role === undefined) {
          return callback({ success: false, error: 'Missing required fields' });
        }
        
        // Валидация токена для игротехов
        if (role === 2) { // gamemaster
          if (!token || !state.tokens[token] || state.tokens[token].used) {
            return callback({ success: false, error: 'Invalid or used token' });
          }
          state.tokens[token].used = true;
          state.tokens[token].usedAt = Date.now();
          await stateWriter.write(state);
        }
        
        const playerId = uuidv4();
        state.players[playerId] = {
          id: playerId,
          callsign: callsign.trim().toUpperCase(),
          team,
          role,
          squadId,
          position: null,
          status: 'active',
          speed: 0,
          heading: 0,
          lastSeen: Date.now(),
        };
        
        socket.playerId = playerId;
        socket.join(team === 0 ? 'red' : 'blue');
        
        if (role === 1 || role === 2) {
          socket.join('commanders');
        }
        
        socket.emit('game:state', state);
        io.emit('players:update', { [playerId]: state.players[playerId] });
        
        await stateWriter.write(state);
        logger.info(`Player joined: ${callsign} (${team === 0 ? 'RED' : 'BLUE'})`);
        
        callback({ success: true, playerId });
      } catch (error) {
        logger.error('Player join error:', error);
        callback({ success: false, error: 'Internal error' });
      }
    });
    
    // === ОБНОВЛЕНИЕ ПОЗИЦИИ ===
    socket.on('player:position', (data) => {
      const player = state.players[socket.playerId];
      if (!player) return;
      
      const { lat, lng, accuracy, heading } = data;
      
      if (accuracy > 40) return;
      
      if (player.position) {
        const { calculateDistance, calculateSpeed } = require('../utils/geo');
        const distance = calculateDistance(
          player.position.lat, player.position.lng,
          lat, lng
        );
        
        const timeDiff = (Date.now() - player.lastSeen) / 1000;
        if (timeDiff > 0) {
          const speedKmh = (distance / timeDiff) * 3.6;
          
          if (speedKmh > 100) {
            logger.warn(`Suspicious speed for ${player.callsign}: ${speedKmh} km/h`);
            return;
          }
          
          player.speed = speedKmh;
        }
      }
      
      player.position = { lat, lng, accuracy };
      player.heading = heading || 0;
      player.lastSeen = Date.now();
      
      socket.to(player.team === 0 ? 'red' : 'blue').emit('players:update', { [player.id]: player });
      io.to('commanders').emit('players:update', { [player.id]: player });
      
      // Проверка гео-фенсинга
      checkGeoFencing(player);
    });
    
    // === ЗАХВАТ ТОЧЕК ===
    socket.on('zone:capture', async (data) => {
      const { poiId } = data;
      if (socket.playerId && poiId) {
        await gameLogic.handleCapture(socket.playerId, poiId);
      }
    });
    
    // === SOS ===
    socket.on('player:sos', async () => {
      const player = state.players[socket.playerId];
      if (!player) return;
      
      player.status = player.status === 'sos' ? 'active' : 'sos';
      
      socket.to(player.team === 0 ? 'red' : 'blue').emit('players:update', { [player.id]: player });
      io.to('commanders').emit('players:update', { [player.id]: player });
      
      await stateWriter.write(state);
    });
    
    // === ВЕЙПОИНТЫ ===
    socket.on('waypoint:create', async (data) => {
      const player = state.players[socket.playerId];
      if (!player) return;
      
      const waypoint = {
        id: uuidv4(),
        ...data,
        createdBy: player.id,
        team: player.team,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      
      state.waypoints.push(waypoint);
      
      socket.to(player.team === 0 ? 'red' : 'blue').emit('waypoints:create', waypoint);
      io.to('commanders').emit('waypoints:create', waypoint);
      
      await stateWriter.write(state);
    });
    
    // === ВЕКТОРЫ ===
    socket.on('vector:create', async (data) => {
      const player = state.players[socket.playerId];
      if (!player || player.role !== 1) return;
      
      const vector = {
        id: uuidv4(),
        ...data,
        createdBy: player.id,
        createdAt: Date.now(),
      };
      
      state.vectors.push(vector);
      io.to('commanders').emit('vectors:create', vector);
      
      await stateWriter.write(state);
    });
    
    // === ОЧИСТКА ПРИ ОТКЛЮЧЕНИИ ===
    socket.on('disconnect', async () => {
      if (socket.playerId && state.players[socket.playerId]) {
        const player = state.players[socket.playerId];
        delete state.players[socket.playerId];
        io.emit('players:update', { [socket.playerId]: null });
        await stateWriter.write(state);
        logger.info(`Player disconnected: ${player.callsign}`);
      }
    });
  });
  
  // Проверка гео-фенсинга
  function checkGeoFencing(player) {
    if (!player.position) return;
    
    const { calculateDistance } = require('../utils/geo');
    
    for (const poi of Object.values(state.pois)) {
      const dist = calculateDistance(
        player.position.lat, player.position.lng,
        poi.lat, poi.lng
      );
      
      if (dist <= poi.captureRadius) {
        if (poi.type === 4) {
          gameLogic.handleKillZone(player.id, poi.id);
        } else if (poi.type === 0 || poi.type === 1) {
          gameLogic.handleCapture(player.id, poi.id);
        }
      }
    }
  }
};
