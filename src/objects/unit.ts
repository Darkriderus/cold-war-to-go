import Phaser from 'phaser';
import { GRID_SIZE } from '../helper/constants';

type IUnit = {
    speed: number;
    playerId: number;
}

export default class Unit extends Phaser.GameObjects.Sprite {
    public speed: number;
    public playerId: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        super(scene, x, y, texture);
        this.speed = unitInfo.speed;
        this.playerId = unitInfo.playerId;
        scene.add.existing(this);
    }

    get gridPosition() {
        return [this.x * GRID_SIZE, this.y * GRID_SIZE];
    }

    // Weitere Methoden für die Einheit
    // angreifen(ziel: Unit) {
    //     // Logik für den Angriff
    // }
}
