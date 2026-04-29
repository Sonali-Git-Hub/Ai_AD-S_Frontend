import { io } from 'socket.io-client';
import { API } from '../types';

let socket;

export const initSocket = (token) => {
    if (socket) return socket;

    // Remove /api suffix for socket connection
    const socketUrl = API.endsWith('/api') ? API.slice(0, -4) : API;
    
    console.log('[Socket] Initializing connection to:', socketUrl);

    socket = io(socketUrl, {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('[Socket] Connected to server:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
    });

    return socket;
};

export const getIO = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
