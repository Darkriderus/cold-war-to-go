import { GRID_SIZE, LAYERS, PLAYERS, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH } from "../helper/constants"
import Unit from "../objects/unit"
import unitList from "../../public/dummy/dummy_oob.json"
import CombatLogic from "../logic/combat-logic"

// TODO/IDEAS
// FFT-Values with 10x Health

const DBG_GAP_BETWEEN_UNITS = 50
const DBG_OFFSET = SMALL_MAP_PIXELSIZE_WIDTH / 3

class BattlemapScene extends Phaser.Scene {
    private movementRangeGraphics: Phaser.GameObjects.Graphics | undefined;
    private dragLineGraphics: Phaser.GameObjects.Graphics | undefined;

    public combatLogic: CombatLogic;

    constructor() {
        super({ key: 'BattleMap', active: true });

        this.combatLogic = new CombatLogic();
        this.combatLogic.initialize(this);
    }

    deselectAll() {
        this.combatLogic.units[PLAYERS.BLUE].forEach(unit => {
            unit.deselect();
        })   
    }

    clearDragLine() {
        if (!this.dragLineGraphics) this.dragLineGraphics = this.add.graphics();
        this.dragLineGraphics?.clear();
    }
    drawDragLine(unit: Unit) {
        if (!this.dragLineGraphics) this.dragLineGraphics = this.add.graphics();
        this.dragLineGraphics?.clear();
        this.dragLineGraphics?.setDepth(LAYERS.MOVEMENT_LINES);
        this.dragLineGraphics?.lineStyle(2, 0xFFFFFFF, 0.4);
        this.dragLineGraphics?.lineBetween(unit.ghost.x + (GRID_SIZE / 2), unit.ghost.y + (GRID_SIZE / 2), unit.x + (GRID_SIZE / 2), unit.y + (GRID_SIZE / 2));
    }

    clearMovementRange() {
        if (!this.movementRangeGraphics) this.movementRangeGraphics = this.add.graphics();
        this.movementRangeGraphics?.clear();
    }
    drawMovementRange(unit: Unit) {
        if (!this.movementRangeGraphics) this.movementRangeGraphics = this.add.graphics();
        this.movementRangeGraphics?.clear();
        this.movementRangeGraphics?.lineStyle(3, 0xFFFFFF, 0.8);
        this.movementRangeGraphics?.strokeCircle(unit.ghost.x + (GRID_SIZE / 2), unit.ghost.y + (GRID_SIZE / 2), unit.movementPerTick);
    }

    preload() {
        this.load.image('bg', 'public/sprites/Testmap.png');
        this.load.image('tank_red', 'public/sprites/units/tank_red.svg');
        this.load.image('tank_blue', 'public/sprites/units/tank_blue.svg');
        this.load.image('apc_red', 'public/sprites/units/apc_red.svg');
        this.load.image('apc_blue', 'public/sprites/units/apc_blue.svg');
    }

    create() {
        this.add.image(SMALL_MAP_PIXELSIZE_WIDTH / 2, SMALL_MAP_PIXELSIZE_HEIGHT / 2, 'bg').setDisplaySize(SMALL_MAP_PIXELSIZE_WIDTH, SMALL_MAP_PIXELSIZE_HEIGHT);

        unitList.units.forEach((unitToLoad, i: number) => {
            const x = DBG_OFFSET + DBG_GAP_BETWEEN_UNITS + (i * DBG_GAP_BETWEEN_UNITS) + (i * DBG_GAP_BETWEEN_UNITS)
            const y = unitToLoad.playerId === PLAYERS.BLUE ? DBG_GAP_BETWEEN_UNITS : SMALL_MAP_PIXELSIZE_HEIGHT - DBG_GAP_BETWEEN_UNITS
            const unit = new Unit(this, x, y, unitToLoad.texture, { movementPerTick: unitToLoad.movementPerTick, playerId: unitToLoad.playerId, name: unitToLoad.name }).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
            unit.ghost.on('pointerdown', () => {
                this.deselectAll()
                unit.select()

                this.drawDragLine(unit)
            });
            this.combatLogic.units[PLAYERS.BLUE].push(unit)
        })
        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
            if (gameObjects.length === 0) {
                this.deselectAll()
                this.clearDragLine()
                this.clearMovementRange()
            } 
        });


        // DRAG LOGIC START - To be modularized
        {
            this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, _ghost: Unit) => {
            });

            this.input.on('drag', (_pointer: Phaser.Input.Pointer, ghost: Unit, dragX: number, dragY: number) => {
                const connectedUnit = this.combatLogic.units[PLAYERS.BLUE].filter(unit => unit.ghost === ghost)[0]

                ghost.setPosition(dragX, dragY);
                this.drawDragLine(connectedUnit)
            });
            this.input.on('dragend', (_pointer: Phaser.Input.Pointer, ghost: Unit) => {
                const connectedUnit = this.combatLogic.units[PLAYERS.BLUE].filter(unit => unit.ghost === ghost)[0]

                if (!connectedUnit.currentOrder) connectedUnit.currentOrder = {};
                connectedUnit.currentOrder.movementToX = ghost.x;
                connectedUnit.currentOrder.movementToY = ghost.y;
            });    
        }
        // DRAG LOGIC END
    }
}

export default BattlemapScene