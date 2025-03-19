import Phaser from 'phaser';
import { GRID_SIZE, LAYERS, PLAYERS } from '../helper/constants';

type IUnit = {
    movementPerTick: number;
    playerId: number;
    name: string;
}

enum MoveType {
    MOVE,
    ATTACK
}

type Order = {
    movementToX?: number;
    movementToY?: number;
    movementType?: MoveType;
    targetUnit?: Unit;
}

export default class Unit extends Phaser.GameObjects.Sprite {
    public movementPerTick: number;
    public playerId: number;
    public selected: boolean = false;
    public initialX: number;
    public initialY: number;

    public currentOrder: Order | null = null

    public ghost: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        const colorSuffix = unitInfo.playerId === PLAYERS.BLUE ? '_blue' : '_red';
        console.log(unitInfo.playerId)
        super(scene, x, y, texture + colorSuffix);

        console.log(texture + colorSuffix)
        this.movementPerTick = unitInfo.movementPerTick;
        this.playerId = unitInfo.playerId;

     

        this.initialX = x;
        this.initialY = y;

        // this.setInteractive({ draggable: true })
        this.setDepth(LAYERS.UNITS)
        this.setTint(0x808080);
        scene.add.existing(this);

        this.ghost = scene.add.sprite(x, y, this.texture)
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
