import Phaser from 'phaser';
import { GRID_SIZE, LAYERS } from '../helper/constants';

type IUnit = {
    speed: number;
    playerId: number;
    name: string;
}

export default class Unit extends Phaser.GameObjects.Sprite {
    public speed: number;
    public playerId: number;
    public selected: boolean = false;
    public baseTexture: string;
    public initialX: number;
    public initialY: number;

    public ghost: Phaser.GameObjects.Sprite;
    // public label : Phaser.GameObjects.Text

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        super(scene, x, y, texture);
        this.initialX = x;
        this.initialY = y;
        this.speed = unitInfo.speed;
        this.playerId = unitInfo.playerId;
        this.baseTexture = texture;

        this.setInteractive({ draggable: true })
        this.setDepth(LAYERS.UNITS)
        scene.add.existing(this);

        // this.label = scene.add.text(x, y, unitInfo.name, { color: '#000' }).setDepth(LAYERS.UNITS);

        this.ghost = scene.add.sprite(x, y, texture).setAlpha(0.4).setDepth(LAYERS.GHOSTS).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
        // [TODO]: Add Labels - Texts etc
    }

    select() {
        this.selected = true;
        // [TODO]: Overlay Tint
        this.setTexture('unit_selected');
    }

    deselect() {
        this.selected = false;
        this.setTexture(this.baseTexture);
    }
}
