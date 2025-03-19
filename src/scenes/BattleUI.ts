import { LAYERS, MoveType, SMALL_MAP_PIXELSIZE_HEIGHT } from "../helper/constants";
import BattlemapScene from "./BattlemapScene";

class BattleUI extends Phaser.Scene {
    readonly SELECTED_TINT = 0x00DD00;

    moveButton: Phaser.GameObjects.Sprite | undefined;
    shootButton: Phaser.GameObjects.Sprite | undefined;

    moveButtonSelected: boolean = true;
    shootButtonSelected: boolean = false;

    public selectedOrderType: MoveType = MoveType.MOVE

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

        this.moveButton = this.add.sprite(40, 50, 'move-icon')
            .setDepth(LAYERS.UI)
            .setDisplaySize(50, 50)
            .setInteractive()
            .on('pointerover', () => {
            })
            .on('pointerout', () => {
            })
            .on('pointerdown', () => {
                this.moveButtonSelected = true
                this.shootButtonSelected = false

                this.selectedOrderType = MoveType.MOVE
                
                this.moveButton?.setTint(this.SELECTED_TINT);
                this.shootButton?.clearTint();
            })
        if (this.moveButtonSelected) {
            this.moveButton?.setTint(this.SELECTED_TINT);
        }

        this.shootButton = this.add.sprite(40, 150, 'shoot-icon')
            .setDepth(LAYERS.UI)
            .setDisplaySize(50, 50)
            .setInteractive()
            .on('pointerover', () => {
            })
            .on('pointerout', () => {
            })
            .on('pointerdown', () => {
                this.moveButtonSelected = false
                this.shootButtonSelected = true

                this.selectedOrderType = MoveType.ATTACK

                this.shootButton?.setTint(this.SELECTED_TINT);
                this.moveButton?.clearTint();
            })
            if (this.shootButtonSelected) {
                this.shootButton.setTint(this.SELECTED_TINT);
            }

        let nextTurnButton = this.add.sprite(40, SMALL_MAP_PIXELSIZE_HEIGHT - 50, 'next-turn-icon')
            .setDepth(LAYERS.UI)
            .setDisplaySize(50, 50)
            .setInteractive()
            .on('pointerover', () => {
            })
            .on('pointerout', () => {
                nextTurnButton.clearTint();
            })
            .on('pointerdown', () => {
                battlemapScene.deselectAll();
                battlemapScene.clearAllRangeCircles();
                battlemapScene.combatLogic.acceptOrders()
            })
        
    }
}

export default BattleUI