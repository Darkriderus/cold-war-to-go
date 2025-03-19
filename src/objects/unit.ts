import Phaser from 'phaser';
import { LAYERS, MoveType, PLAYER_COLOR, PLAYERS, TOKEN_SIZE } from '../helper/constants';
import BattlemapScene from '../scenes/BattlemapScene';

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
    public moveGraphics: Phaser.GameObjects.Graphics;
    public rangeGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, unitInfo: IUnit) {
        const colorSuffix = unitInfo.playerId === PLAYERS.BLUE ? '_blue' : '_red';
        super(scene, x, y, texture + colorSuffix);
        this.hitGraphics = this.scene.add.graphics();
        this.moveGraphics = this.scene.add.graphics();
        this.rangeGraphics = this.scene.add.graphics();


        this.movementPerTick = unitInfo.movementPerTick;
        this.playerId = unitInfo.playerId;
        this.health = unitInfo.health;
        this.maxHealth = unitInfo.health;
        this.range = unitInfo.range;
        this.name = unitInfo.name;

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

    get center() {
        return { x: this.x + (TOKEN_SIZE / 2), y: this.y + (TOKEN_SIZE / 2) };
    }

    get ghostCenter() {
        return { x: this.ghost.x + (TOKEN_SIZE / 2), y: this.ghost.y + (TOKEN_SIZE / 2) };
    }

    get playerColor() {
        return this.playerId === PLAYERS.BLUE ? PLAYER_COLOR.BLUE : PLAYER_COLOR.RED;
    }

    get playerTeam() {
        return this.playerId === PLAYERS.BLUE ? PLAYERS.BLUE : PLAYERS.RED;
    }

    get alive() {
        return this.health > 0;
    }

    get terrain() {
        const battlemapScene = this.scene.scene.get('BattleMap') as BattlemapScene
        return battlemapScene.terrains.find(terrain => terrain.intersects(this));

    }

    clearMoveLine() {
        this.moveGraphics.clear();
    }
    redrawMoveLine() {  
        this.clearMoveLine()
        if (!this.alive) return
        this.moveGraphics.setDepth(LAYERS.MOVEMENT_LINES);
        this.moveGraphics.lineStyle(2, this.playerColor, 0.6);
        this.moveGraphics.lineBetween(this.ghostCenter.x, this.ghostCenter.y, this.center.x, this.center.y);
    }

    clearRangeCircles() {
        this.rangeGraphics.clear();
    }
    drawRangeCircle(unit: Unit) {
        this.rangeGraphics.clear();
        this.rangeGraphics.lineStyle(3, 0xFFFFFF, 0.8);
        this.rangeGraphics.strokeCircle(unit.x + (TOKEN_SIZE / 2), unit.y + (TOKEN_SIZE / 2), unit.range);
    }

    moveGhost(x: number, y: number) {
        this.ghost.x = x;
        this.ghost.y = y;

        this.redrawMoveLine()
    }

    decideTargetToShoot(targetsInRange: {unit:Unit, distance: number}[]) {
        // [TODO] Add logic
        if (targetsInRange.length === 0) return null
        return targetsInRange.sort((a, b) => a.distance - b.distance)[0]
    }

    shoot(target: Unit) {
        // [TODO] Hit Logic
        let chanceToHit = 0.8;
        if (target.terrain){
            chanceToHit *= target.terrain.moveModifier
        }

        this.shootEffect(target)
        if (Math.random() < chanceToHit) {
            target.damage(1);
        }

    }

    damage(damage: number) {
        this.health -= damage;
        
        if(this.health <= 0) {
            console.log(`!!${this.name} died!`)
            // this.destroy();
            this.moveGraphics.clear();
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
        const flashTimes = 3;
        const delay = 100;
        const lineOffset = this.playerTeam === PLAYERS.BLUE ? 10 : -10

        new Promise<void>((resolve) => {
            let completedFlashes = 0;
            for (let i = 0; i < flashTimes; i++) {
                this.scene.time.delayedCall(i * delay * 2 , () => {
                    this.hitGraphics.lineStyle(4, this.playerColor, 1);
                    this.hitGraphics.setDepth(LAYERS.MOVEMENT_LINES);
                    this.hitGraphics.lineBetween(this.center.x, this.center.y, target.center.x + lineOffset, target.center.y);
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

        this.redrawMoveLine()
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
