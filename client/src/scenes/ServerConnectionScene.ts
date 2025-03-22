import { Network } from "../logic/network";

export default class ServerConnectionScene extends Phaser.Scene {
    serverLogs?: Phaser.GameObjects.Text
    serverText: string = '??'
    private network!: Network;
    private players: { [id: string]: Phaser.GameObjects.Sprite } = {};


    create() {
        this.serverLogs = this.add.text(0, 0, this.serverText, { fontFamily: 'monospace' });

        this.network = new Network((players) => this.updatePlayers(players));
    }
}