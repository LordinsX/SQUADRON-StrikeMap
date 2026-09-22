const { calculateDistance, calculateBearing } = require('../utils/geo');
const logger = require('../utils/logger');

class GameLogic {
  constructor(state, io, stateWriter) {
    this.state = state;
    this.io = io;
    this.stateWriter = stateWriter;
    this.matchInterval = null;
  }

  // Запуск матча
  startMatch(duration = 3600) {
    this.state.match.status = 'running';
    this.state.match.startedAt = Date.now();
    this.state.match.duration = duration;
    this.state.match.timer = 0;
    this.state.match.pausedDuration = 0;
    
    this.io.emit('match:status', this.state.match);
    
    this.matchInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
    
    logger.info('Match started');
  }

  // Пауза матча
  pauseMatch() {
    if (this.state.match.status !== 'running') return;
    
    this.state.match.status = 'paused';
    this.state.match.pausedAt = Date.now();
    
    clearInterval(this.matchInterval);
    this.matchInterval = null;
    
    this.io.emit('match:status', this.state.match);
    logger.info('Match paused');
  }

  // Возобновление матча
  resumeMatch() {
    if (this.state.match.status !== 'paused') return;
    
    const pausedDuration = Date.now() - this.state.match.pausedAt;
    this.state.match.pausedDuration += pausedDuration;
    this.state.match.status = 'running';
    this.state.match.pausedAt = null;
    
    this.matchInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
    
    this.io.emit('match:status', this.state.match);
    logger.info('Match resumed');
  }

  // Остановка матча
  async stopMatch() {
    clearInterval(this.matchInterval);
    this.matchInterval = null;
    
    this.state.match.status = 'finished';
    this.state.match.finishedAt = Date.now();
    
    this.io.emit('match:status', this.state.match);
    this.io.emit('scores:update', this.state.scores);
    
    await this.stateWriter.write(this.state);
    logger.info('Match finished');
  }

  // Обновление таймера
  updateTimer() {
    if (this.state.match.status !== 'running') return;
    
    const elapsed = (Date.now() - this.state.match.startedAt - this.state.match.pausedDuration) / 1000;
    this.state.match.timer = Math.floor(elapsed);
    
    if (elapsed >= this.state.match.duration) {
      this.stopMatch();
      return;
    }
    
    this.io.emit('match:timer', this.state.match.timer);
  }

  // Обработка захвата точки
  async handleCapture(playerId, poiId) {
    const player = this.state.players[playerId];
    const poi = this.state.pois[poiId];
    
    if (!player || !poi) {
      logger.warn(`Capture rejected: player or poi not found`);
      return { success: false, error: 'Not found' };
    }
    
    // Валидация расстояния
    if (player.position) {
      const dist = calculateDistance(
        player.position.lat, player.position.lng,
        poi.lat, poi.lng
      );
      
      if (dist > poi.captureRadius + 10) {
        logger.warn(`Capture rejected: ${player.callsign} too far from ${poi.name} (${dist}m)`);
        return { success: false, error: 'Too far' };
      }
    }
    
    // Начисление очков
    if (poi.owner !== player.team) {
      const oldOwner = poi.owner;
      poi.owner = player.team;
      
      this.state.scores[player.team] += poi.points || 10;
      
      // Логирование события
      this.state.events.push({
        id: require('uuid').v4(),
        type: 'capture',
        playerId: player.id,
        playerName: player.callsign,
        poiId,
        poiName: poi.name,
        team: player.team,
        oldOwner,
        timestamp: Date.now(),
      });
      
      // Сохранение только последних 100 событий
      if (this.state.events.length > 100) {
        this.state.events = this.state.events.slice(-100);
      }
      
      this.io.emit('scores:update', this.state.scores);
      this.io.emit('pois:update', { [poiId]: poi });
      this.io.emit('events:new', this.state.events[this.state.events.length - 1]);
      
      await this.stateWriter.write(this.state);
      logger.info(`POI captured: ${poi.name} by ${player.callsign} (${player.team})`);
      
      return { success: true };
    }
    
    return { success: false, error: 'Already owned' };
  }

  // Обработка входа в Kill Zone
  async handleKillZone(playerId, poiId) {
    const player = this.state.players[playerId];
    const poi = this.state.pois[poiId];
    
    if (!player || !poi || poi.type !== 4) return; // 4 = killzone
    
    if (player.status === 'dead') return;
    
    player.status = 'dead';
    player.diedAt = Date.now();
    player.respawnAt = Date.now() + 60000;
    
    this.state.events.push({
      id: require('uuid').v4(),
      type: 'death',
      playerId: player.id,
      playerName: player.callsign,
      cause: 'killzone',
      poiId,
      timestamp: Date.now(),
    });
    
    this.io.to(player.team).emit('players:update', { [player.id]: player });
    this.io.to('commanders').emit('players:update', { [player.id]: player });
    
    await this.stateWriter.write(this.state);
    logger.info(`Player ${player.callsign} died in killzone ${poi.name}`);
  }

  // Проверка респавна
  checkRespawn(playerId) {
    const player = this.state.players[playerId];
    if (!player || player.status !== 'dead') return false;
    
    if (Date.now() < player.respawnAt) return false;
    
    // Проверка нахождения на базе
    const bases = Object.values(this.state.pois).filter(
      p => (p.type === 2 || p.type === 3) && p.team === player.team
    );
    
    if (!player.position) return false;
    
    for (const base of bases) {
      const dist = calculateDistance(
        player.position.lat, player.position.lng,
        base.lat, base.lng
      );
      
      if (dist <= base.captureRadius + 5) {
        player.status = 'active';
        player.diedAt = null;
        player.respawnAt = null;
        
        this.io.to(player.team).emit('players:update', { [player.id]: player });
        this.io.to('commanders').emit('players:update', { [player.id]: player });
        
        logger.info(`Player ${player.callsign} respawned`);
        return true;
      }
    }
    
    return false;
  }

  // Очистка при отключении
  cleanup() {
    clearInterval(this.matchInterval);
  }
}

module.exports = GameLogic;
