import Phaser from 'phaser';

type IUnit = {
    speed: number;
    playerId: number;
}

export default class Unit extends Phaser.GameObjects.Sprite {
    public speed: number;
    public playerId: number;
    public selected: boolean = false;
    public baseTexture: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        super(scene, x, y, texture);
        this.speed = unitInfo.speed;
        this.playerId = unitInfo.playerId;
        this.baseTexture = texture;
        scene.add.existing(this);
    }

    select() {
        this.selected = true;
        this.setTexture('unit_selected');
    }

    deselect() {
        this.selected = false;
        this.setTexture(this.baseTexture);
    }
    // Weitere Methoden für die Einheit
    // angreifen(ziel: Unit) {
    //     // Logik für den Angriff
    // }
}
