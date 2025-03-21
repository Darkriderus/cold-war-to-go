import Phaser from 'phaser';
import { Armor, GRID_SIZE, Gun, Layer, Missile, MovementType, Order, PlayerColor, Team, TOKEN_SIZE } from '../helper/constants';
import BattlemapScene from '../scenes/BattlemapScene';
import { coordToGrid, gridToCoord } from '../helper/mapHelper';

type IUnit = {
    points: number
    movement: number
    movementType: MovementType
    armor: Armor
    gun?: Gun
    missile?: Missile

    movementPerTick: number
    playerId: number
    name: string
    health: number
    range?: number
}

export class Ghost {
    scene: Phaser.Scene
    connectedUnit: Unit
    x: number
    y: number
    visible: boolean = false;

    graphics: Phaser.GameObjects.Graphics

    get gridX() {
        return coordToGrid(this.x, this.y).x
    }

    get gridY() {
        return coordToGrid(this.x, this.y).y
    }

    move(gridX: number, gridY: number) {
        this.x = gridToCoord(gridX, gridY).x;
        this.y = gridToCoord(gridX, gridY).y;

        this.graphics.clear();
        this.redraw()
        this.connectedUnit.redrawMoveLine()
    }

    redraw() {
        this.visible ? this.show() : this.hide();
    }

    hide() {
        this.visible = false
        this.graphics.clear();
    }

    show() {
        this.visible = true
        this.graphics.clear();

        this.graphics.setDepth(Layer.UI);
        this.graphics.lineStyle(2, this.connectedUnit.playerColor, 1);

        this.graphics.strokeRect(this.x, this.y, GRID_SIZE, GRID_SIZE);

    }

    constructor(scene: Phaser.Scene, connectedUnit: Unit, x: number, y: number) {
        this.scene = scene;
        this.connectedUnit = connectedUnit
        this.x = x;
        this.y = y
        this.graphics = this.scene.add.graphics();
    }
}



export default class Unit extends Phaser.GameObjects.Sprite {
    public points: number
    public movement: number
    public movementType: MovementType

    public armor: Armor;
    public gun?: Gun;


    public maxHealth: number;
    public health: number;
    public playerId: number;

    // LEGACY
    public movementPerTick: number;
    public range: number;

    public selected: boolean = false;
    public currentOrder: Order | null = null
    public ghost: Ghost;
    public healthLabel: Phaser.GameObjects.Text;

    public hitGraphics: Phaser.GameObjects.Graphics;
    public moveGraphics: Phaser.GameObjects.Graphics;
    public rangeGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, gridX: number, gridY: number, texture: string, unitInfo: IUnit) {
        const colorSuffix = unitInfo.playerId === Team.BLUE ? '_blue' : '_red';
        super(scene, gridToCoord(gridX, gridY).x, gridToCoord(gridX, gridY).x, texture + colorSuffix);
        this.hitGraphics = this.scene.add.graphics();
        this.moveGraphics = this.scene.add.graphics();
        this.rangeGraphics = this.scene.add.graphics();

        this.points = unitInfo.points;
        this.movement = unitInfo.movement;
        this.movementType = unitInfo.movementType;
        this.armor = unitInfo.armor;
        this.gun = unitInfo.gun;
        this.movementPerTick = unitInfo.movementPerTick;
        this.playerId = unitInfo.playerId;
        this.health = unitInfo.health;
        this.maxHealth = unitInfo.health;
        if (unitInfo.gun?.range) {
            this.range = unitInfo.gun.range
        }
        else {
            this.range = unitInfo.range || 10
        }
        this.name = unitInfo.name;

        this.setDepth(Layer.UNITS)
            .setOrigin(0, 0)
            .setDisplaySize(TOKEN_SIZE, TOKEN_SIZE)
            .setInteractive({ draggable: true });
        scene.add.existing(this);

        this.ghost = new Ghost(scene, this, this.center.x, this.center.y);

        this.healthLabel = scene.add.text(this.x, this.y + (TOKEN_SIZE), `(${this.health}/${this.maxHealth})`)
            .setFontSize(12)
            .setDepth(Layer.UNITS)
            .setBackgroundColor("grey").setOrigin(0, 0);
    }

    get movementInAbsolutePerTick() {
        console.log(this.movementPerTick * GRID_SIZE)
        return this.movementPerTick * GRID_SIZE
    }

    get gridX() {
        return coordToGrid(this.x, this.y).x
    }

    get gridY() {
        return coordToGrid(this.x, this.y).y
    }

    get center() {
        return { x: this.x + (TOKEN_SIZE / 2), y: this.y + (TOKEN_SIZE / 2) };
    }

    get playerColor() {
        return this.playerId === Team.BLUE ? PlayerColor.BLUE : PlayerColor.RED;
    }

    get playerTeam() {
        return this.playerId === Team.BLUE ? Team.BLUE : Team.RED;
    }

    get isAlive() {
        return this.health > 0;
    }

    get terrain() {
        const battlemapScene = this.scene.scene.get('BattleMap') as BattlemapScene
        return battlemapScene.terrains[this.gridY][this.gridX];

    }

    intersects(gridX: number, gridY: number) {
        return this.gridX === gridX && this.gridY === gridY
    }

    clearMoveLine() {
        this.moveGraphics.clear();
    }
    redrawMoveLine() {
        this.clearMoveLine()
        if (!this.isAlive) return
        this.moveGraphics.setDepth(Layer.MOVEMENT_LINES);
        this.moveGraphics.lineStyle(2, this.playerColor, 0.6);
        this.moveGraphics.lineBetween(this.ghost.x, this.ghost.y, this.center.x, this.center.y);
    }

    clearRangeCircles() {
        this.rangeGraphics.clear();
    }
    drawRangeCircle(unit: Unit) {
        this.rangeGraphics.clear();
        this.rangeGraphics.lineStyle(3, 0xFF0000, 0.8);
        this.rangeGraphics.strokeCircle(unit.x, unit.y, unit.range * GRID_SIZE);
    }


    decideTargetToShoot(targetsInRange: { unit: Unit, distance: number }[]) {
        // [TODO] Add logic
        if (targetsInRange.length === 0) return null
        return targetsInRange.sort((a, b) => a.distance - b.distance)[0]
    }

    shoot(target: Unit) {
        // [TODO] Hit Logic
        let chanceToHit = 0.8;
        if (target.terrain) {
            chanceToHit *= target.terrain.getHitModifier(target)
        }

        this.shootEffect(target)
        if (Math.random() < chanceToHit) {
            target.damage(1);
        }

    }

    damage(damage: number) {
        this.health -= damage;

        if (this.health <= 0) {
            console.log(`!!${this.name} died!`)
            // this.destroy();
            this.moveGraphics.clear();
            this.setTexture("tank_grey")
            this.ghost.hide()
            this.health = 0
        }
        this.hitEffect()
        this.healthLabel.text = `(${this.health}/${this.maxHealth})`
    }

    selectEffect() {
        let flashTimes = 3;
        let delay = 100;

        for (let i = 0; i < flashTimes; i++) {
            this.scene.time.delayedCall(i * delay * 2, () => this.setVisible(false));
            this.scene.time.delayedCall(i * delay * 2 + delay, () => this.setVisible(true));
        }
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
        const lineOffset = this.playerTeam === Team.BLUE ? 10 : -10

        new Promise<void>((resolve) => {
            let completedFlashes = 0;
            for (let i = 0; i < flashTimes; i++) {
                this.scene.time.delayedCall(i * delay * 2, () => {
                    this.hitGraphics.lineStyle(4, this.playerColor, 1);
                    this.hitGraphics.setDepth(Layer.MOVEMENT_LINES);
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
        visible ? this.ghost.show() : this.ghost.hide();
    }

    move(gridX: number, gridY: number) {
        this.x = gridToCoord(gridX, gridY).x;
        this.y = gridToCoord(gridX, gridY).y;
        this.healthLabel.x = this.x;
        this.healthLabel.y = this.y + (TOKEN_SIZE);

        this.redrawMoveLine()
    }

    select() {
        this.selected = true;
        this.selectEffect()
    }

    deselect() {
        this.selected = false;
    }
}
