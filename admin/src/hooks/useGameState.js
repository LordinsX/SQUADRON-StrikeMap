import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';

export function useGameState() {
  const [state, setState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
        setError(null);

        socketService.on('game:state', (data) => {
          setState(data);
        });

        socketService.on('players:update', (update) => {
          setState(prev => {
            if (!prev) return prev;
            const players = { ...prev.players };
            for (const [id, player] of Object.entries(update)) {
              if (player === null) {
                delete players[id];
              } else {
                players[id] = player;
              }
            }
            return { ...prev, players };
          });
        });

        socketService.on('scores:update', (scores) => {
          setState(prev => prev ? { ...prev, scores } : null);
        });

        socketService.on('pois:update', (update) => {
          setState(prev => {
            if (!prev) return prev;
            const pois = { ...prev.pois };
            for (const [id, poi] of Object.entries(update)) {
              pois[id] = poi;
            }
            return { ...prev, pois };
          });
        });

        socketService.on('match:status', (match) => {
          setState(prev => prev ? { ...prev, match } : null);
        });

        socketService.on('match:timer', (timer) => {
          setState(prev => prev ? { 
            ...prev, 
            match: { ...prev.match, timer } 
          } : null);
        });

        socketService.on('events:new', (event) => {
          setState(prev => prev ? { 
            ...prev, 
            events: [...(prev.events || []), event] 
          } : null);
        });

      } catch (err) {
        console.error('Socket connection failed:', err);
        setIsConnected(false);
        setError('Не удалось подключиться к серверу');
      }
    };

    initSocket();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const startMatch = useCallback((duration = 3600) => {
    socketService.emit('match:start', { duration });
  }, []);

  const pauseMatch = useCallback(() => {
    socketService.emit('match:pause');
  }, []);

  const resumeMatch = useCallback(() => {
    socketService.emit('match:resume');
  }, []);

  const stopMatch = useCallback(() => {
    socketService.emit('match:stop');
  }, []);

  const resetMatch = useCallback(() => {
    socketService.emit('match:reset');
  }, []);

  const createPoi = useCallback((poiData) => {
    socketService.emit('poi:create', poiData);
  }, []);

  const updatePoi = useCallback((poiData) => {
    socketService.emit('poi:update', poiData);
  }, []);

  const deletePoi = useCallback((poiId) => {
    socketService.emit('poi:delete', poiId);
  }, []);

  const importPois = useCallback((jsonString) => {
    socketService.emit('pois:import', jsonString);
  }, []);

  const createSquad = useCallback((squadData) => {
    socketService.emit('squad:create', squadData);
  }, []);

  const deleteSquad = useCallback((squadId) => {
    socketService.emit('squad:delete', squadId);
  }, []);

  const generateToken = useCallback((note) => {
    socketService.emit('token:generate', { note });
  }, []);

  const revokeToken = useCallback((token) => {
    socketService.emit('token:revoke', token);
  }, []);

  const broadcastMessage = useCallback((message, target = 'all') => {
    socketService.emit('broadcast:message', { message, target });
  }, []);

  return {
    state,
    isConnected,
    error,
    startMatch,
    pauseMatch,
    resumeMatch,
    stopMatch,
    resetMatch,
    createPoi,
    updatePoi,
    deletePoi,
    importPois,
    createSquad,
    deleteSquad,
    generateToken,
    revokeToken,
    broadcastMessage,
  };
}
