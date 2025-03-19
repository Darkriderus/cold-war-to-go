import { LAYERS, MoveType, PLAYERS, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH } from "../helper/constants";
import Unit from "../objects/unit";
import BattlemapScene from "./BattlemapScene";

class BattleUI extends Phaser.Scene {
    readonly SELECTED_TINT = 0x00DD00;

    moveButton: Phaser.GameObjects.Sprite | undefined;
    shootButton: Phaser.GameObjects.Sprite | undefined;

    teamText: Phaser.GameObjects.Text | undefined;
    nameText: Phaser.GameObjects.Text | undefined;
    healthText: Phaser.GameObjects.Text | undefined;
    rangeText: Phaser.GameObjects.Text | undefined;

    moveButtonSelected: boolean = true;
    shootButtonSelected: boolean = false;

    public selectedOrderType: MoveType = MoveType.MOVE

    constructor() {
        super({ key: 'BattleUI', active: true });
    }

    showUnitInfo(unit?: Unit) {
        let labelColor = "white";
        if (unit) {
            labelColor = `${unit.playerTeam === PLAYERS.BLUE ? 'Blue' : 'Red'}`
            if (!unit.alive){
                labelColor = 'black'
            }
            console.log(unit.playerColor)
        }

        let teamLabel = 'Team: '
        if (unit){
            teamLabel = `${teamLabel}${unit.playerTeam === PLAYERS.BLUE ? 'Blue' : 'Red'}`
        }
        this.teamText?.setText(teamLabel).setColor(labelColor);

        let nameLabel = 'Name: '
        if (unit){
            nameLabel = `${nameLabel}${unit.name}`
        }
        this.nameText?.setText(nameLabel).setColor(labelColor);

        let healthLabel = 'Health: '
        if (unit){
            healthLabel = `${healthLabel}${unit.health} / ${unit.maxHealth}`
        }
        this.healthText?.setText(healthLabel).setColor(labelColor);

        let rangeLabel = 'Range: '
        if (unit){
            rangeLabel = `${rangeLabel}${unit.range}`
        }
        this.rangeText?.setText(rangeLabel).setColor(labelColor);

    }

    preload() {
        this.load.image('move-icon', 'public/sprites/icons/move.svg');       
        this.load.image('shoot-icon', 'public/sprites/icons/shoot.svg');    
        this.load.image('next-turn-icon', 'public/sprites/icons/next-turn.svg');       
    }

    create() {
        const battlemapScene = this.scene.get('BattleMap') as BattlemapScene;

        this.add.rectangle(0, 0, 80, SMALL_MAP_PIXELSIZE_HEIGHT, 0x000000)
            .setAlpha(0.6)
            .setOrigin(0, 0)
            .setDepth(LAYERS.UI);
        this.add.rectangle(0, SMALL_MAP_PIXELSIZE_HEIGHT - 100, SMALL_MAP_PIXELSIZE_WIDTH, 100, 0xFFFFFFF)
            .setAlpha(0.3)
            .setOrigin(0, 0)
            .setDepth(LAYERS.UI);

        this.teamText = this.add.text(100, SMALL_MAP_PIXELSIZE_HEIGHT - 90, 'Team:')
            .setColor('white')
            .setDepth(LAYERS.UI);
        this.nameText = this.add.text(100, SMALL_MAP_PIXELSIZE_HEIGHT - 70, 'Name:')
            .setColor('white')
            .setDepth(LAYERS.UI);
        this.healthText = this.add.text(100, SMALL_MAP_PIXELSIZE_HEIGHT - 50, 'Health:')
            .setColor('white')
            .setDepth(LAYERS.UI);
        this.rangeText = this.add.text(100, SMALL_MAP_PIXELSIZE_HEIGHT - 30, 'Range:')
            .setColor('white')
            .setDepth(LAYERS.UI);



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