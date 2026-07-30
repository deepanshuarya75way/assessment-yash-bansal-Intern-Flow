import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/database.js';
import { initSocket } from './config/socket.js';
import { logger } from './middleware/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to Database and start server
const startServer = async () => {
    await testConnection();
    
    server.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
};

startServer();

// Graceful shutdown
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

export default app;
