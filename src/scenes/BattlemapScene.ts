import { GRID_SIZE, LAYERS, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH } from "../helper/constants"
import Unit from "../objects/unit"
import unitList from "../../public/dummy/dummy_oob.json"

const DBG_GAP_BETWEEN_UNITS = GRID_SIZE

class BattlemapScene extends Phaser.Scene {
    private movementRangeGraphics: Phaser.GameObjects.Graphics | undefined;
    private dragLineGraphics: Phaser.GameObjects.Graphics | undefined;

    public player1Units: Unit[] = []

    constructor() {
        super();
    }

    deselectAll(units: Unit[]) {
        units.forEach(unit => {
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
        this.movementRangeGraphics?.strokeCircle(unit.ghost.x + (GRID_SIZE / 2), unit.ghost.y + (GRID_SIZE / 2), unit.speed);
    }

    preload() {
        this.load.image('bg', 'public/sprites/Testmap.png');
        this.load.image('unit_red', 'public/sprites/Unit_Red.png');
        this.load.image('unit_selected', 'public/sprites/Unit_Green.png');
    }

    create() {
        this.add.image(SMALL_MAP_PIXELSIZE_WIDTH / 2, SMALL_MAP_PIXELSIZE_HEIGHT / 2, 'bg').setDisplaySize(SMALL_MAP_PIXELSIZE_WIDTH, SMALL_MAP_PIXELSIZE_HEIGHT);

        unitList.units.forEach((unitToLoad, i: number) => {
            const x = DBG_GAP_BETWEEN_UNITS + (i * GRID_SIZE) + (i * DBG_GAP_BETWEEN_UNITS)
            const y = GRID_SIZE

            const unit = new Unit(this, x, y, unitToLoad.texture, { speed: unitToLoad.speed, playerId: 1, name: unitToLoad.name }).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
            unit.on('pointerdown', () => {
                // [TODO]: Refactor Loop
                this.deselectAll(this.player1Units)
                unit.select()

                this.drawDragLine(unit)
                this.drawMovementRange(unit)
            });
            this.player1Units.push(unit)
        })

        // SELECT LOGIC START
        {
            this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
                if (gameObjects.length === 0) {
                    this.deselectAll(this.player1Units)
                    this.clearDragLine()
                    this.clearMovementRange()
                }
            });
        }
        // SELECT LOGIC END


        // DRAG LOGIC START - To be modularized
        {
            this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, _sprite: Unit) => {
            });

            this.input.on('drag', (_pointer: Phaser.Input.Pointer, sprite: Unit, dragX: number, dragY: number) => {
                sprite.setPosition(dragX, dragY);
                this.drawDragLine(sprite)
                this.drawMovementRange(sprite)
            });
            this.input.on('dragend', (_pointer: Phaser.Input.Pointer, sprite: Unit) => {
                let distance = Phaser.Math.Distance.Between(sprite.ghost.x, sprite.ghost.y, sprite.x, sprite.y);

                if (distance > sprite.speed) {
                    console.log("Too far!", distance, ">", sprite.speed);
                    sprite.setPosition(sprite.ghost.x, sprite.ghost.y);

                    this.clearDragLine()                    
                    this.drawMovementRange(sprite)
                }
            });
        }
        // DRAG LOGIC END
    }
}

export default BattlemapScene