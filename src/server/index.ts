import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { GameRoom } from './rooms/GameRoom.js';

const port = Number(process.env.PORT) || 2567;
const app = express();

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

// Create Colyseus server with WebSocket transport
const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
});

// Register GameRoom
gameServer.define('game_room', GameRoom);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve static client files (Production)
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from dist/client (relative to dist/server/index.js)
const clientDistPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientDistPath));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

httpServer.listen(port, () => {
    console.log(`✅ Colyseus Server listening on port ${port}`);
    console.log(`🎮 Game Room: ws://localhost:${port}`);
});

export { gameServer };
