class BattlemapScene extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');
        this.load.image('bg', 'assets/skies/deepblue.png');
        this.load.spritesheet('blocks', 'assets/sprites/heartstar.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.add.image(400, 300, 'bg');

        this.add.text(16, 16, 'Snap to Grid on Drag').setFontSize(24).setShadow(1, 1);

        //  The blocks we can drag
        const block1 = this.add.sprite(64, 192, 'blocks', 1).setOrigin(0, 0);
        const block2 = this.add.sprite(64, 320, 'blocks', 1).setOrigin(0, 0);
        const block3 = this.add.sprite(64, 448, 'blocks', 1).setOrigin(0, 0);

        block1.setInteractive({ draggable: true });
        block2.setInteractive({ draggable: true });
        block3.setInteractive({ draggable: true });

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
            //  This will snap our drag to a 64x64 grid
            dragX = Phaser.Math.Snap.To(dragX, 64);
            dragY = Phaser.Math.Snap.To(dragY, 64);

            gameObject.setPosition(dragX, dragY);

        });
    }
}

export default BattlemapScene