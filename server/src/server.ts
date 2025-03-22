import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";

const server = http.createServer();
const wss = new WebSocketServer({ server });

const players: Record<string, { x: number; y: number }> = {};

wss.on("connection", (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    players[id] = { x: 400, y: 300 };

    ws.send(JSON.stringify({ type: "init", id, players }));

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === "move") {
            players[id].x = data.x;
            players[id].y = data.y;
            broadcast({ type: "update", id, x: data.x, y: data.y });
        }
    });

    ws.on("close", () => {
        delete players[id];
        broadcast({ type: "remove", id });
    });
});

function broadcast(data: object) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(3000, () => console.log("WebSocket Server running on port 3000"));
