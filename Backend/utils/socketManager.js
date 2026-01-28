const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';

let io;

/**
 * Initialize Socket.IO with CORS validation
 */
exports.init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    // Global middleware: Authenticate connection
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            logger.warn(`Socket connection attempt without token: ${socket.id}`);
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            logger.warn(`Socket authentication failed: ${socket.id} - ${err.message}`);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const { userId, role, entityId } = socket.user;
        logger.info(`Socket connected: ${socket.id} (User: ${userId}, Role: ${role})`);

        // Join Role-Based Rooms
        if (role === 'hospital' && entityId) {
            const room = `hospital-${entityId}`;
            socket.join(room);
            logger.info(`Socket ${socket.id} joined ${room}`);
        } else if (role === 'ambulance' && entityId) {
            const room = `ambulance-${entityId}`;
            socket.join(room);
            logger.info(`Socket ${socket.id} joined ${room}`);
        } else if (role === 'admin' || role === 'dispatcher') {
            socket.join('admin-global');
            logger.info(`Socket ${socket.id} joined admin-global`);
        }

        // Handle Client Events
        socket.on('ambulance:update-location', (data) => {
            // Only ambulances can send this
            if (role !== 'ambulance') return;

            // Broadcast to admin and relevant hospital (if in active trip)
            // This logic assumes client sends tripId or we track it.
            // For now, broadcast to admins:
            io.to('admin-global').emit('ambulance:location', {
                ambulanceId: entityId,
                ...data,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Get IO instance or Namespace
 */
exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};

/**
 * Utility to broadcast event to hospital
 */
exports.emitToHospital = (hospitalId, event, data) => {
    if (!io) return;
    io.to(`hospital-${hospitalId}`).emit(event, data);
};

/**
 * Utility to broadcast to all admins
 */
exports.emitToAdmins = (event, data) => {
    if (!io) return;
    io.to('admin-global').emit(event, data);
};
