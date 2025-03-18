import { GRID_SIZE, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH } from "../helper/constants"
import Unit from "../objects/unit"

const DBG_UNIT_PER_SIDE = 2
const DBG_GAP_BETWEEN_UNITS = GRID_SIZE


class BattlemapScene extends Phaser.Scene {
    public player1Units: Phaser.GameObjects.Sprite[] = []

    constructor() {
        super();
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/deepblue.png');
        this.load.image('unit_green', 'public/sprites/Unit_Green.png');
        this.load.image('unit_red', 'public/sprites/Unit_Red.png');
    }

    create() {
        this.add.image(SMALL_MAP_PIXELSIZE_WIDTH / 2, SMALL_MAP_PIXELSIZE_HEIGHT / 2, 'bg').setDisplaySize(SMALL_MAP_PIXELSIZE_WIDTH, SMALL_MAP_PIXELSIZE_HEIGHT);

        for (let i = 0; i < DBG_UNIT_PER_SIDE; i++) {
            const x = DBG_GAP_BETWEEN_UNITS + (i * GRID_SIZE) + (i * DBG_GAP_BETWEEN_UNITS)
            const y = GRID_SIZE
            const unit = new Unit(this, x, y, 'unit_green', { speed: 100, playerId: 1 }).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
            unit.setInteractive({ draggable: true });
            this.player1Units.push(unit)
        }

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, sprite: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            dragX = Phaser.Math.Snap.To(dragX, GRID_SIZE);
            dragY = Phaser.Math.Snap.To(dragY, GRID_SIZE);

            sprite.setPosition(dragX, dragY);

        });
    }
}

export default BattlemapScene