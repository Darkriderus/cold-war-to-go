import Phaser from 'phaser';
import { LAYERS, MoveType, PLAYERS, TOKEN_SIZE } from '../helper/constants';

type IUnit = {
    movementPerTick: number;
    playerId: number;
    name: string;
    health: number;
    range: number;
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
    public maxHealth: number;
    public health: number;
    public range: number;
    
    public selected: boolean = false;
    public currentOrder: Order | null = null
    public ghost: Phaser.GameObjects.Sprite;
    public healthLabel: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        const colorSuffix = unitInfo.playerId === PLAYERS.BLUE ? '_blue' : '_red';
        super(scene, x, y, texture + colorSuffix);

        this.movementPerTick = unitInfo.movementPerTick;
        this.playerId = unitInfo.playerId;
        this.health = unitInfo.health;
        this.maxHealth = unitInfo.health;
        this.range = unitInfo.range;
        this.name = unitInfo.name;

        // this.setInteractive({ draggable: true })
        this.setDepth(LAYERS.UNITS)
            .setTint(0x808080)
            .setOrigin(0, 0)
            .setDisplaySize(TOKEN_SIZE, TOKEN_SIZE);
        scene.add.existing(this);

        this.ghost = scene.add.sprite(x, y, this.texture)
            .setAlpha(0.6)
            .setDepth(LAYERS.GHOSTS)
            .setInteractive({ draggable: true })
            .setOrigin(0, 0)
            .setDisplaySize(TOKEN_SIZE, TOKEN_SIZE);


        this.healthLabel = scene.add.text(x, y + (TOKEN_SIZE),`(${this.health}/${this.maxHealth})`)
            .setFontSize(12)
            .setDepth(LAYERS.UNITS)
            .setBackgroundColor("grey").setOrigin(0, 0);
    }

    shoot(target: Unit) {
        // [TODO] ROLLS TO HIT
        this.shootEffect()
        target.damage(1);
    }

    damage(damage: number) {
        this.health -= damage;
        
        if(this.health <= 0) {
            // this.destroy();
            this.health = 0
        }
        this.hitEffect()
        this.healthLabel.text = `(${this.health}/${this.maxHealth})`
    }

    hitEffect() {
        let flashTimes = 3;
        let delay = 100;

        for (let i = 0; i < flashTimes; i++) {
            this.scene.time.delayedCall(i * delay * 2, () => this.setVisible(false));
            this.scene.time.delayedCall(i * delay * 2 + delay, () => this.setVisible(true));
        }
    }

    shootEffect() {
        let flashTimes = 3;
        let delay = 100;

        for (let i = 0; i < flashTimes; i++) {
            this.scene.time.delayedCall(i * delay * 2, () => this.setVisible(false));
            this.scene.time.delayedCall(i * delay * 2 + delay, () => this.setVisible(true));
        }
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.healthLabel.x = x;
        this.healthLabel.y = y + (TOKEN_SIZE);
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
