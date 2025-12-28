const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite default port
        methods: ["GET", "POST"]
    }
});

// Game state
// games = { roomId: { players: [socketId], board: 'fen_string', turn: 'w' } }
const games = {};

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('create_game', (roomId) => {
        if (games[roomId]) {
            socket.emit('error', 'Room already exists');
            return;
        }
        games[roomId] = {
            players: [socket.id],
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Start position
            history: [] // Optional: track history
        };
        socket.join(roomId);
        socket.emit('game_created', { roomId, color: 'w' });
        console.log(`Game created: ${roomId} by ${socket.id}`);
    });

    socket.on('join_game', (roomId) => {
        const game = games[roomId];
        if (!game) {
            socket.emit('error', 'Room not found');
            return;
        }
        if (game.players.length >= 2) {
            socket.emit('error', 'Room is full');
            return;
        }
        
        game.players.push(socket.id);
        socket.join(roomId);
        socket.emit('game_joined', { roomId, color: 'b', fen: game.fen });
        io.to(roomId).emit('player_joined', { playerCount: game.players.length });
        
        // Notify white that black has joined (game start condition)
        if (game.players.length === 2) {
             io.to(roomId).emit('game_start', { fen: game.fen });
        }
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('move', ({ roomId, move, fen }) => {
        const game = games[roomId];
        if (!game) return;

        // In a real app, validate move with chess.js here on server side too
        // For now, we trust the client's validated move and just broadcast
        game.fen = fen; 
        game.history.push(move);
        
        socket.to(roomId).emit('move', { move, fen });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
        // Handle cleanup if needed
        // For simplicity, we might iterate games to find where this socket was
    });
});

server.listen(3001, () => {
    console.log('SERVER RUNNING on port 3001');
});
