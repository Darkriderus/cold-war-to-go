export class Network {
    private socket: WebSocket;
    private playerId: string = "";

    constructor(private updatePlayers: (players: any) => void) {
        this.socket = new WebSocket("ws://localhost:3000");

        this.socket.onopen = () => {
            console.log("Connected to WebSocket server");
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "welcome") {
                this.playerId = data.id;
                this.updatePlayers(data.players);
            }

            if (data.type === "update") {
                this.updatePlayers(data.players);
            }
        };
    }

    sendMove(x: number, y: number) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: "move", id: this.playerId, x, y }));
        }
    }
}