import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { GameRoom } from './rooms/GameRoom';
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
httpServer.listen(port, () => {
    console.log(`✅ Colyseus Server listening on port ${port}`);
    console.log(`🎮 Game Room: ws://localhost:${port}`);
});
export { gameServer };
