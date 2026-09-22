import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.adminSocket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.adminSocket = io(`${SOCKET_URL}/admin`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    return new Promise((resolve, reject) => {
      this.adminSocket.on('connect', () => {
        console.log('Admin socket connected');
        resolve();
      });

      this.adminSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
    if (this.adminSocket) this.adminSocket.disconnect();
  }

  on(event, callback) {
    if (this.adminSocket) {
      this.adminSocket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.adminSocket) {
      this.adminSocket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.adminSocket) {
      this.adminSocket.emit(event, data);
    }
  }

  emitWithAck(event, data) {
    return new Promise((resolve) => {
      if (this.adminSocket) {
        this.adminSocket.emit(event, data, resolve);
      }
    });
  }
}

const socketService = new SocketService();
export default socketService;
