const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const AtomicStateWriter = require('./services/state_persistence');
const gameHandlers = require('./sockets/game_handlers');
const adminHandlers = require('./sockets/admin_handlers');
const apiRoutes = require('./routes/api');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// REST API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SQUADRON Server',
    version: '1.0.0',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Socket.io
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
});

// State persistence
const dbPath = process.env.DB_PATH || './data/db.json';
const stateWriter = new AtomicStateWriter(dbPath);

// Подключение обработчиков
gameHandlers(io, stateWriter);
adminHandlers(io, stateWriter);

// Логирование подключений
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`SQUADRON Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
