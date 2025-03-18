import { GRID_SIZE, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH } from "../helper/constants"
import Unit from "../objects/unit"

const DBG_UNIT_PER_SIDE = 2
const DBG_GAP_BETWEEN_UNITS = GRID_SIZE


class BattlemapScene extends Phaser.Scene {
    public player1Units: Unit[] = []

    public draggedStartX: number = -1
    public draggedStartY: number = -1

    constructor() {
        super();
    }

    deselectAll(units: Unit[]) {
        units.forEach(unit => {
            unit.deselect();
        })
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/deepblue.png');
        this.load.image('unit_green', 'public/sprites/Unit_Green.png');
        this.load.image('unit_red', 'public/sprites/Unit_Red.png');
        this.load.image('unit_selected', 'public/sprites/Unit_Green.png');
    }

    create() {
        this.add.image(SMALL_MAP_PIXELSIZE_WIDTH / 2, SMALL_MAP_PIXELSIZE_HEIGHT / 2, 'bg').setDisplaySize(SMALL_MAP_PIXELSIZE_WIDTH, SMALL_MAP_PIXELSIZE_HEIGHT);

        for (let i = 0; i < DBG_UNIT_PER_SIDE; i++) {
            const x = DBG_GAP_BETWEEN_UNITS + (i * GRID_SIZE) + (i * DBG_GAP_BETWEEN_UNITS)
            const y = GRID_SIZE
            // Load Unit from Config
            const unit = new Unit(this, x, y, 'unit_red', { speed: 100, playerId: 1 }).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
            unit.setInteractive({ draggable: true });
            unit.on('pointerdown', () => {
                //Refactor Loop
                this.deselectAll(this.player1Units)
                unit.select()
            });
            this.player1Units.push(unit)
        }

        // SELECT LOGIC START
        {
            this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
                if (gameObjects.length === 0) {
                    this.deselectAll(this.player1Units)
                }
            });
        }
        // SELECT LOGIC END


        // DRAG LOGIC START - To be modularized
        {
            this.input.on('dragstart', (_pointer: Phaser.Input.Pointer, sprite: Unit) => {
                this.draggedStartX = sprite.x;
                this.draggedStartY = sprite.y;

                console.log("Start dragging - X: " + this.draggedStartX + " Y: " + this.draggedStartY);
            });

            this.input.on('drag', (_pointer: Phaser.Input.Pointer, sprite: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
                sprite.setPosition(dragX, dragY);
            });


            this.input.on('dragend', (_pointer: Phaser.Input.Pointer, sprite: Unit) => {
                let distance = Phaser.Math.Distance.Between(this.draggedStartX, this.draggedStartY, sprite.x, sprite.y);

                console.log("distance", distance, distance / GRID_SIZE);

                if (distance > sprite.speed) {
                    console.log("Zuweit!", distance, ">", sprite.speed);
                    sprite.setPosition(this.draggedStartX, this.draggedStartY);
                }

                this.draggedStartX = -1;
                this.draggedStartY = -1;
            });
        }
        // DRAG LOGIC END
    }
}

export default BattlemapScene