import Phaser from 'phaser';
import { GRID_SIZE, LAYERS } from '../helper/constants';

type IUnit = {
    speed: number;
    playerId: number;
    name: string;
}

type Order = {
    targetX?: number;
    targetY?: number;
    targetUnit?: Unit;
}

export default class Unit extends Phaser.GameObjects.Sprite {
    public speed: number;
    public playerId: number;
    public selected: boolean = false;
    public baseTexture: string;
    public initialX: number;
    public initialY: number;

    public currentOrder: Order | null = null

    public ghost: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        super(scene, x, y, texture);
        this.speed = unitInfo.speed;
        this.playerId = unitInfo.playerId;
        this.baseTexture = texture;
        this.initialX = x;
        this.initialY = y;

        // this.setInteractive({ draggable: true })
        this.setDepth(LAYERS.UNITS)
        this.setTint(0x808080);
        scene.add.existing(this);

        this.ghost = scene.add.sprite(x, y, texture)
            .setAlpha(0.6)
            .setDepth(LAYERS.GHOSTS)
            .setInteractive({ draggable: true })
            .setOrigin(0, 0)
            .setDisplaySize(GRID_SIZE, GRID_SIZE);
    }

    select() {
        this.selected = true;
        this.clearTint();
    }

    deselect() {
        this.selected = false;
        this.setTint(0x808080);
    }
}
