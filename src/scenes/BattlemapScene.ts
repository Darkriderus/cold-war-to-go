const GRID_SIZE = 50

const DBG_UNIT_PER_SIDE = 10
const DBG_GAP_BETWEEN_UNITS = GRID_SIZE

const DBG_SCREEN_HEIGHT = 900

class BattlemapScene extends Phaser.Scene {
    public player1Units : Phaser.GameObjects.Sprite[] = []
    public player2Units : Phaser.GameObjects.Sprite[] = []

    constructor() {
        super();
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/deepblue.png');
        this.load.spritesheet('blocks', 'https://labs.phaser.io/assets/sprites/heartstar.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('unit_green', 'public/sprites/Unit_Green.png');
        this.load.image('unit_red', 'public/sprites/Unit_Red.png');
    }

    create() {
        this.add.image(600, 450, 'bg').setScale(1.5);

        for (let i = 0; i < DBG_UNIT_PER_SIDE; i++) {
            const x = DBG_GAP_BETWEEN_UNITS + (i * GRID_SIZE) + (i * DBG_GAP_BETWEEN_UNITS)
            const y  = GRID_SIZE
            const unit = this.add.sprite(x, y, 'unit_green', 1).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
            unit.setInteractive({ draggable: true });
            this.player1Units.push(unit)
        }

        for (let i = 0; i < DBG_UNIT_PER_SIDE; i++) {
            const x = DBG_GAP_BETWEEN_UNITS + (i * GRID_SIZE) + (i * DBG_GAP_BETWEEN_UNITS)
            const y  = DBG_SCREEN_HEIGHT - GRID_SIZE - GRID_SIZE
            const unit = this.add.sprite(x, y, 'unit_red', 1).setOrigin(0, 0).setDisplaySize(GRID_SIZE, GRID_SIZE);
            unit.setInteractive({ draggable: true });
            this.player2Units.push(unit)
        }


        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            //  This will snap our drag to a 64x64 grid
            dragX = Phaser.Math.Snap.To(dragX, GRID_SIZE);
            dragY = Phaser.Math.Snap.To(dragY, GRID_SIZE);

            gameObject.setPosition(dragX, dragY);

        });
    }
}

export default BattlemapScene