import { LAYERS, PLAYERS, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH, TOKEN_SIZE } from "../helper/constants"
import Unit from "../objects/unit"
import unitList from "../../public/dummy/dummy_oob.json"
import CombatLogic from "../logic/combat-logic"
import BattleUI from "./BattleUI"

// TODO/IDEAS
// FFT-Values with 10x Health
// Move with D&D, Buttons for Targets as if dragged

const DBG_GAP_BETWEEN_UNITS = 50
const DBG_OFFSET = SMALL_MAP_PIXELSIZE_WIDTH / 3

class BattlemapScene extends Phaser.Scene {
    private dragLineGraphics: Phaser.GameObjects.Graphics | undefined;
    private rangeCircleGraphics: Phaser.GameObjects.Graphics | undefined;


    public combatLogic: CombatLogic;

    constructor() {
        console.log("-- Batlemap Initializing.. --")

        super({ key: 'BattleMap', active: true });
        this.combatLogic = new CombatLogic();
        this.combatLogic.initialize(this);

        console.log("-- ..Done! --")

    }

    deselectAll() {
        this.combatLogic.allUnits.forEach(unit => {
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
        this.dragLineGraphics?.lineBetween(unit.ghost.x + (TOKEN_SIZE / 2), unit.ghost.y + (TOKEN_SIZE / 2), unit.x + (TOKEN_SIZE / 2), unit.y + (TOKEN_SIZE / 2));
    }

    clearRangeCircles() {
        if (!this.rangeCircleGraphics) this.rangeCircleGraphics = this.add.graphics();
        this.rangeCircleGraphics?.clear();
    }
    drawRangeCircle(unit: Unit) {
        if (!this.rangeCircleGraphics) this.rangeCircleGraphics = this.add.graphics();
        this.rangeCircleGraphics?.clear();
        this.rangeCircleGraphics?.lineStyle(3, 0xFFFFFF, 0.8);
        this.rangeCircleGraphics?.strokeCircle(unit.x + (TOKEN_SIZE / 2), unit.y + (TOKEN_SIZE / 2), unit.range);
    }

    preload() {
        this.load.image('bg', 'public/sprites/Testmap.png');
        this.load.image('tank_red', 'public/sprites/units/tank_red.svg');
        this.load.image('tank_blue', 'public/sprites/units/tank_blue.svg');
        this.load.image('tank_grey', 'public/sprites/units/tank_grey.svg');

        this.load.image('apc_red', 'public/sprites/units/apc_red.svg');
        this.load.image('apc_blue', 'public/sprites/units/apc_blue.svg');
    }

    create() {
        const battleUiScene = this.scene.get('BattleUI') as BattleUI;
    
        this.add.image(SMALL_MAP_PIXELSIZE_WIDTH / 2, SMALL_MAP_PIXELSIZE_HEIGHT / 2, 'bg').setDisplaySize(SMALL_MAP_PIXELSIZE_WIDTH, SMALL_MAP_PIXELSIZE_HEIGHT);

        unitList.units.forEach((unitToLoad, i: number) => {
            const x = DBG_OFFSET + DBG_GAP_BETWEEN_UNITS + (i * DBG_GAP_BETWEEN_UNITS) + (i * DBG_GAP_BETWEEN_UNITS)
            const y = unitToLoad.playerId === PLAYERS.BLUE ? DBG_GAP_BETWEEN_UNITS : 500
            const unit = new Unit(this, x, y, unitToLoad.texture, unitToLoad);
            unit.on('pointerdown', () => {
                this.deselectAll()
                unit.select()

                this.drawRangeCircle(unit);
                this.drawDragLine(unit)
            });
            unit.ghost.on('pointerdown', () => {
                this.deselectAll()
                unit.select()

                this.drawRangeCircle(unit);
                this.drawDragLine(unit)
            });
            this.combatLogic.units[unitToLoad.playerId].push(unit)
        })
        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
            if (gameObjects.length === 0) {
                this.deselectAll()
                this.clearDragLine()
                this.clearRangeCircles()
            } 
        });


        this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, _ghost: Unit) => {
        });
        this.input.on('drag', (_pointer: Phaser.Input.Pointer, sprite: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            const isUnit = this.combatLogic.allUnits.includes(sprite as Unit);        
            const connectedUnit = isUnit ? sprite as Unit : this.combatLogic.allUnits.filter(unit => unit.ghost === sprite)[0]

            const diffX = Math.abs(connectedUnit.x - dragX);
            const diffY = Math.abs(connectedUnit.y - dragY);

            if (diffX < TOKEN_SIZE && diffY < TOKEN_SIZE) {
                connectedUnit.setGhostVisible(false);
                connectedUnit.ghost.setPosition(connectedUnit.x, connectedUnit.y);
                this.clearDragLine()
            } else {
                connectedUnit.setGhostVisible(true);
                connectedUnit.ghost.setPosition(dragX, dragY);
                this.drawDragLine(connectedUnit)
            }

           
            
        });
        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, sprite: Unit) => {
            const isUnit = this.combatLogic.allUnits.includes(sprite as Unit);        
            const connectedUnit = isUnit ? sprite as Unit : this.combatLogic.allUnits.filter(unit => unit.ghost === sprite)[0]

            if (!connectedUnit.currentOrder) connectedUnit.currentOrder = {};
            connectedUnit.currentOrder.movementToX = connectedUnit.ghost.x;
            connectedUnit.currentOrder.movementToY = connectedUnit.ghost.y;
            connectedUnit.currentOrder.movementType = battleUiScene.selectedOrderType;

        });    
    }
}

export default BattlemapScene