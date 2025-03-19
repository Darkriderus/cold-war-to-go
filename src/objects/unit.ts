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

    public hitGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        const colorSuffix = unitInfo.playerId === PLAYERS.BLUE ? '_blue' : '_red';
        super(scene, x, y, texture + colorSuffix);
        this.hitGraphics = this.scene.add.graphics();

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
            .setDisplaySize(TOKEN_SIZE, TOKEN_SIZE)
            .setInteractive({ draggable: true });
        scene.add.existing(this);

        this.ghost = scene.add.sprite(x, y, this.texture)
            .setAlpha(0)
            .setDepth(LAYERS.GHOSTS)
            .setInteractive({ draggable: true })
            .setOrigin(0, 0)
            .setDisplaySize(TOKEN_SIZE, TOKEN_SIZE);


        this.healthLabel = scene.add.text(x, y + (TOKEN_SIZE),`(${this.health}/${this.maxHealth})`)
            .setFontSize(12)
            .setDepth(LAYERS.UNITS)
            .setBackgroundColor("grey").setOrigin(0, 0);
    }

    decideTargetToShoot(targetsInRange: {unit:Unit, distance: number}[]) {
        // [TODO] Add logic
        if (targetsInRange.length === 0) return null
        return targetsInRange.sort((a, b) => a.distance - b.distance)[0]
    }

    shoot(target: Unit) {
        // [TODO] ROLLS TO HIT
        this.shootEffect(target)
        target.damage(1);
    }

    damage(damage: number) {
        this.health -= damage;
        
        if(this.health <= 0) {
            console.log(`!!!!!!!${this.name} died!`)
            // this.destroy();
            this.setTexture("tank_grey")
            this.ghost.setTexture("tank_grey").setVisible(false)
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

    shootEffect(target: Unit) {
        let flashTimes = 3;
        let delay = 100;

        new Promise<void>((resolve) => {
            let completedFlashes = 0;
            for (let i = 0; i < flashTimes; i++) {
                this.scene.time.delayedCall(i * delay * 2 , () => {
                    this.hitGraphics.lineStyle(4, this.playerId === PLAYERS.BLUE ? 0x0000FF : 0xFF0000, 1);
                    this.hitGraphics.setDepth(LAYERS.MOVEMENT_LINES);
                    this.hitGraphics.lineBetween(this.x + (TOKEN_SIZE / 2), this.y + (TOKEN_SIZE / 2), target.x + (TOKEN_SIZE / 2), target.y + (TOKEN_SIZE / 2));
                });
    
                this.scene.time.delayedCall(i * delay * 2 + delay, () => {
                    this.hitGraphics.clear();
                    completedFlashes++;
    
                    // Resolve when the last flash is completed
                    if (completedFlashes === flashTimes) {
                        resolve();
                    }
                });
            }
        })
    }

    setGhostVisible(visible: boolean) {
        this.ghost.setAlpha(visible? 0.6 : 0);

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
