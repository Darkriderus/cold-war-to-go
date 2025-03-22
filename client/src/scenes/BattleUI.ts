import { Layer, OrderType, Team } from "../helper/constants";
import Unit from "../objects/unit";
import BattlemapScene from "./BattlemapScene";

type OrderButton = {
    orderType: OrderType,
    button: Phaser.GameObjects.Text
}
class BattleUI extends Phaser.Scene {
    readonly SELECTED_TINT = "#00DD00";
    readonly DESELECTED_TINT = "#DDDDDD";

    readonly TURN_INACTIVE_TINT = "#000088";
    readonly TURN_ACTIVE_TINT = "#333333";


    orderButtons: OrderButton[] = []
    nextTurnButton: Phaser.GameObjects.Text | undefined


    // moveButton: Phaser.GameObjects.Text | undefined;
    // shootButton: Phaser.GameObjects.Sprite | undefined;

    teamText: Phaser.GameObjects.Text | undefined;
    nameText: Phaser.GameObjects.Text | undefined;
    healthText: Phaser.GameObjects.Text | undefined;
    rangeText: Phaser.GameObjects.Text | undefined;

    moveButtonSelected: boolean = true;
    shootButtonSelected: boolean = false;

    battlemapScene?: BattlemapScene


    constructor() {
        super({ key: 'BattleUI', active: true });
    }

    showUnitInfo(unit?: Unit) {
        let labelColor = "white";
        if (unit) {
            labelColor = `${unit.playerTeam === Team.BLUE ? 'Blue' : 'Red'}`
            if (!unit.isAlive) {
                labelColor = 'black'
            }
        }

        let teamLabel = 'Team: '
        if (unit) {
            teamLabel = `${teamLabel}${unit.playerTeam === Team.BLUE ? 'Blue' : 'Red'}`
        }
        this.teamText?.setText(teamLabel).setColor(labelColor);

        let nameLabel = 'Name: '
        if (unit) {
            nameLabel = `${nameLabel}${unit.name}`
        }
        this.nameText?.setText(nameLabel).setColor(labelColor);

        let healthLabel = 'Health: '
        if (unit) {
            healthLabel = `${healthLabel}${unit.health} / ${unit.maxHealth}`
        }
        this.healthText?.setText(healthLabel).setColor(labelColor);

        let rangeLabel = 'Range: '
        if (unit) {
            rangeLabel = `${rangeLabel}${unit.range}`
        }
        this.rangeText?.setText(rangeLabel).setColor(labelColor);

    }

    preload() {
        this.load.image('move-icon', 'public/sprites/icons/move.svg');
        this.load.image('shoot-icon', 'public/sprites/icons/shoot.svg');
        this.load.image('next-turn-icon', 'public/sprites/icons/next-turn.svg');
    }

    deselectAllButtons() {
        this.orderButtons.forEach(button => {
            button.button.setActive(false);
            button.button.setBackgroundColor(this.DESELECTED_TINT);
        })
    }

    selectButton(button: OrderButton) {
        this.deselectAllButtons();
        button.button.setActive(true);
        button.button.setBackgroundColor(this.SELECTED_TINT);
        this.battlemapScene!.selectedOrderType = button.orderType
    }

    enableNextTurnButton() {
        this.nextTurnButton!.setBackgroundColor(this.TURN_INACTIVE_TINT);
        this.nextTurnButton!.setActive(true);
        this.nextTurnButton!.setAlpha(1);
        this.nextTurnButton!.setInteractive();
    }

    disableNextTurnButton() {
        this.nextTurnButton!.setBackgroundColor(this.TURN_ACTIVE_TINT);
        this.nextTurnButton!.setActive(false);
        this.nextTurnButton!.setAlpha(0.5);
        this.nextTurnButton!.disableInteractive();
    }

    create() {
        const gameWidth = this.game.config.width as number;
        const gameHeight = this.game.config.height as number;

        this.battlemapScene = this.scene.get('BattleMap') as BattlemapScene;

        this.add.rectangle(0, gameHeight - 100, gameWidth, 100, 0x333333)
            .setAlpha(0.5)
            .setOrigin(0, 0)
            .setDepth(Layer.UI);

        this.teamText = this.add.text(100, gameHeight - 90, 'Team:')
            .setColor('white')
            .setDepth(Layer.UI);
        this.nameText = this.add.text(100, gameHeight - 70, 'Name:')
            .setColor('white')
            .setDepth(Layer.UI);
        this.healthText = this.add.text(100, gameHeight - 50, 'Health:')
            .setColor('white')
            .setDepth(Layer.UI);
        this.rangeText = this.add.text(100, gameHeight - 30, 'Range:')
            .setColor('white')
            .setDepth(Layer.UI);


        Object.values(OrderType).forEach((order, idx) => {
            const x = (gameWidth * 0.4) + (idx * 120);
            const y = gameHeight - 70

            const button = {
                orderType: order as OrderType,
                button: this.add.text(x, y, order.toUpperCase(), {
                    stroke: "#000000",
                    strokeThickness: 4,
                    backgroundColor: this.DESELECTED_TINT,
                    color: "white",
                    padding: { left: 10, right: 10, top: 5, bottom: 5 },
                })
                    .setDepth(Layer.UI)
                    .setInteractive()
                    .on('pointerover', () => {
                    })
                    .on('pointerout', () => {
                    })
                    .on('pointerdown', () => {
                        this.deselectAllButtons()
                        this.selectButton(button)
                        console.log(this.battlemapScene!.selectedOrderType)
                    })
            }
            this.orderButtons.push(button)
        })

        this.nextTurnButton = this.add.text((gameWidth - 150), gameHeight - 70, "Next Turn", {
            stroke: "#000000",
            strokeThickness: 4,
            backgroundColor: this.TURN_INACTIVE_TINT,
            color: "white",
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        })
            .setDepth(Layer.UI)
            .setInteractive()
            .on('pointerover', () => {
            })
            .on('pointerout', () => {
                this.nextTurnButton!.clearTint();
            })
            .on('pointerdown', () => {
                this.battlemapScene!.deselectAll();
                this.battlemapScene!.clearAllRangeCircles();
                this.nextTurnButton!.setBackgroundColor(this.TURN_ACTIVE_TINT);
                this.disableNextTurnButton()
                this.battlemapScene!.combatLogic.acceptOrders()
            })

        this.selectButton(this.orderButtons.find(btn => (btn.orderType) == (this.battlemapScene!.selectedOrderType))!)
    }
}

export default BattleUI