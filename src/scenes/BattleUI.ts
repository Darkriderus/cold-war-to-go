import { LAYERS, SMALL_MAP_PIXELSIZE_HEIGHT } from "../helper/constants";
import BattlemapScene from "./BattlemapScene";

class BattleUI extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleUI', active: true });
    }

    preload() {
        this.load.image('move-icon', 'public/sprites/icons/move.svg');       
        this.load.image('shoot-icon', 'public/sprites/icons/shoot.svg');    
        this.load.image('next-turn-icon', 'public/sprites/icons/next-turn.svg');       
    }

    create() {
        const battlemapScene = this.scene.get('BattleMap') as BattlemapScene;

        this.add.rectangle(0, 0, 80, SMALL_MAP_PIXELSIZE_HEIGHT, 0x000000).setAlpha(0.5).setOrigin(0, 0).setDepth(LAYERS.UI);

        let moveButton = this.add.sprite(40, 50, 'move-icon')
            .setDepth(LAYERS.UI)
            .setDisplaySize(50, 50)
            .setInteractive()
            .on('pointerover', () => {
                moveButton.setTint(0xAAAAAA);
            })
            .on('pointerout', () => {
                moveButton.clearTint();
            })
            .on('pointerdown', () => {
                console.log('Button Clicked!');
            })

            
        let shootButton = this.add.sprite(40, 150, 'shoot-icon')
            .setDepth(LAYERS.UI)
            .setDisplaySize(50, 50)
            .setInteractive()
            .on('pointerover', () => {
                shootButton.setTint(0xAAAAAA);
            })
            .on('pointerout', () => {
                shootButton.clearTint();
            })
            .on('pointerdown', () => {
                console.log('Button Clicked!');
            })

        let nextTurnButton = this.add.sprite(40, SMALL_MAP_PIXELSIZE_HEIGHT - 50, 'next-turn-icon')
            .setDepth(LAYERS.UI)
            .setDisplaySize(50, 50)
            .setInteractive()
            .on('pointerover', () => {
                nextTurnButton.setTint(0xAAAAAA);
            })
            .on('pointerout', () => {
                nextTurnButton.clearTint();
            })
            .on('pointerdown', () => {
                battlemapScene.deselectAll();
                battlemapScene.clearDragLine();
                battlemapScene.clearMovementRange();
                battlemapScene.combatLogic.acceptOrders()
            })
        
    }
}

export default BattleUI

// const button = this.add.text(x, y, text, {
//     fontSize: '24px',
//     backgroundColor: '#00FF00',
//     padding: { x: 10, y: 5 },
// })
// .setOrigin(0,0)
// .setInteractive()
// .on('pointerdown', callback)
// .on('pointerover', () => button.setBackgroundColor('#00FF00'))
// .on('pointerout', () => button.setBackgroundColor('#00FF00'));

// return button;