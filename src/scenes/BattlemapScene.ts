import { OrderType, PlayerColor, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH, Team, TOKEN_SIZE } from "../helper/constants"
import Unit from "../objects/unit"
// import unitList from "../../public/dummy/dummy_oob.json"
import unitList from "../../public/dummy/dummy_oob_v2.json"
import mapList from "../../public/data/maps.json"
import CombatLogic from "../logic/combat-logic"
import BattleUI from "./BattleUI"
import { Terrain } from "../objects/terrain"

// TODO/IDEAS
// Move with D&D, Buttons for Targets as if dragged
// Ghost as Point
// Icons as Class with Rectangle and Icon
// OOB with FFT-Values
// LOS Check
// Pathfinding

const DBG_GAP_BETWEEN_UNITS = 50
const DBG_OFFSET = SMALL_MAP_PIXELSIZE_WIDTH * 0.05

class BattlemapScene extends Phaser.Scene {
    private deployZoneGraphics: Phaser.GameObjects.Graphics | undefined;

    public combatLogic: CombatLogic;
    public terrains: Terrain[] = []

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private cameraSpeed: number = 10;

    public selectedOrderType: OrderType = OrderType.FASTMOVE

    // ToDo - Move to config
    public mapConfig = mapList.maps[0]



    constructor() {
        console.log("-- Battlemap Initializing.. --")

        super({ key: 'BattleMap', active: true });
        this.combatLogic = new CombatLogic();
        console.log("-- ..Done! --")
    }

    deselectAll() {
        this.combatLogic.allUnits.forEach(unit => {
            unit.deselect();
        })
    }
    clearAllRangeCircles() {
        this.combatLogic.allUnits.forEach(unit => {
            unit.clearRangeCircles();
        })
    }

    drawDeployZones() {
        this.deployZoneGraphics?.clear();
        this.deployZoneGraphics?.fillStyle(PlayerColor.BLUE, 0.15);
        this.deployZoneGraphics?.fillRect(
            this.mapConfig.blueDeploy.x1,
            this.mapConfig.blueDeploy.y1,
            this.mapConfig.blueDeploy.x2 - this.mapConfig.blueDeploy.x1,
            this.mapConfig.blueDeploy.y2 - this.mapConfig.blueDeploy.y1);
        this.deployZoneGraphics?.fillStyle(PlayerColor.RED, 0.15);
        this.deployZoneGraphics?.fillRect(
            this.mapConfig.redDeploy.x1,
            this.mapConfig.redDeploy.y1,
            this.mapConfig.redDeploy.x2 - this.mapConfig.redDeploy.x1,
            this.mapConfig.redDeploy.y2 - this.mapConfig.redDeploy.y1);
    }

    deployUnits(playerTeam: Team) {
        const battleUiScene = this.scene.get('BattleUI') as BattleUI;

        unitList.units.filter(unit => unit.playerId === playerTeam).forEach((unitToLoad, idx) => {
            const leftEdge = playerTeam === Team.BLUE ? this.mapConfig.blueDeploy.x1 + DBG_OFFSET : this.mapConfig.redDeploy.x1 + DBG_OFFSET;
            const topEdge = playerTeam === Team.BLUE ? this.mapConfig.blueDeploy.y1 + DBG_OFFSET : this.mapConfig.redDeploy.y1 + DBG_OFFSET

            const unit = new Unit(this, (leftEdge + (idx * DBG_GAP_BETWEEN_UNITS)), topEdge, unitToLoad.texture, unitToLoad);
            unit.on('pointerdown', () => {
                if (!unit.selected) {
                    this.deselectAll()
                    unit.select()
                    battleUiScene.showUnitInfo(unit);

                    this.clearAllRangeCircles()
                    unit.drawRangeCircle(unit);
                }
            });
            unit.ghost.on('pointerdown', () => {
                this.deselectAll()
                unit.select()
                battleUiScene.showUnitInfo(unit);

                this.clearAllRangeCircles()
                unit.drawRangeCircle(unit);
            });
            this.combatLogic.units[unitToLoad.playerId].push(unit)
        })
    }

    generateTerrain() {
        this.mapConfig.terrain.forEach((terrainElement) => {
            this.terrains.push(new Terrain(this, terrainElement));
        })
    }

    preload() {
        this.load.image('map1', 'public/sprites/maps/Map1.png');
        this.load.image('tank_red', 'public/sprites/units/tank_red.svg');
        this.load.image('tank_blue', 'public/sprites/units/tank_blue.svg');
        this.load.image('tank_grey', 'public/sprites/units/tank_grey.svg');

        this.load.image('apc_red', 'public/sprites/units/apc_red.svg');
        this.load.image('apc_blue', 'public/sprites/units/apc_blue.svg');
    }

    create() {
        const battleUiScene = this.scene.get('BattleUI') as BattleUI;
        this.combatLogic.initialize(this, battleUiScene);

        this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number) => {
            this.cameras.main.zoom += deltaY * -0.001;
            this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.5, 2);
        });

        this.cursors = this.input.keyboard?.createCursorKeys();

        this.add.image(0, 0, 'map1').setOrigin(0, 0).setDisplaySize(this.mapConfig.width, this.mapConfig.height);

        this.deployZoneGraphics = this.add.graphics();
        this.drawDeployZones();
        this.generateTerrain();
        this.terrains.push(new Terrain(this, this.mapConfig.terrain[0]));


        this.deployUnits(Team.BLUE);
        this.deployUnits(Team.RED);
        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
            if (gameObjects.length === 0) {
                this.deselectAll()
                battleUiScene.showUnitInfo();
                this.combatLogic.allUnits.forEach(unit => {
                    unit.clearRangeCircles();
                })
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
                connectedUnit.moveGhost(connectedUnit.x, connectedUnit.y);
            } else {
                connectedUnit.setGhostVisible(true);
                connectedUnit.moveGhost(dragX, dragY);
            }

            for (const terrain of this.terrains) {
                if (terrain.intersects(connectedUnit.ghost) && !terrain.canMoveInto(connectedUnit)) {
                    connectedUnit.ghost.setAlpha(0.2);
                }
            }

        });
        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, sprite: Phaser.GameObjects.Sprite) => {
            const isUnit = this.combatLogic.allUnits.includes(sprite as Unit);
            const connectedUnit = isUnit ? sprite as Unit : this.combatLogic.allUnits.filter(unit => unit.ghost === sprite)[0]

            if (this.selectedOrderType === OrderType.ATTACK) {
                for (const enemyUnit of this.combatLogic.units[connectedUnit.playerId === Team.BLUE ? Team.RED : Team.BLUE]) {
                    if (enemyUnit.intersects(connectedUnit.ghost)) {
                        connectedUnit.moveGhost(enemyUnit.x, enemyUnit.y);
                        connectedUnit.ghost.setAlpha(0);

                        connectedUnit.currentOrder = {
                            movementToX: connectedUnit.x,
                            movementToY: connectedUnit.y,
                            orderType: this.selectedOrderType
                        }
                        console.log(`Unit ${connectedUnit.name} got order`, connectedUnit.currentOrder);
                        return;
                    }
                }
                connectedUnit.moveGhost(connectedUnit.x, connectedUnit.y);



            } else {
                for (const terrain of this.terrains) {
                    if (terrain.intersects(connectedUnit.ghost) && !terrain.canMoveInto(connectedUnit)) {
                        connectedUnit.moveGhost(connectedUnit.x, connectedUnit.y);
                        return;
                    }
                }

                connectedUnit.currentOrder = {
                    movementToX: connectedUnit.ghost.x,
                    movementToY: connectedUnit.ghost.y,
                    orderType: this.selectedOrderType
                }
                console.log(`Unit ${connectedUnit.name} got order`, connectedUnit.currentOrder);
            }





        });
    }

    update() {
        if (this.cursors?.left.isDown) {
            this.cameras.main.scrollX = Math.max(0, this.cameras.main.scrollX - this.cameraSpeed);
        } else if (this.cursors?.right.isDown) {
            this.cameras.main.scrollX = Math.min(SMALL_MAP_PIXELSIZE_WIDTH - 800, this.cameras.main.scrollX + this.cameraSpeed);
        }
        if (this.cursors?.up.isDown) {
            this.cameras.main.scrollY = Math.max(0, this.cameras.main.scrollY - this.cameraSpeed);
        } else if (this.cursors?.down.isDown) {
            this.cameras.main.scrollY = Math.min(SMALL_MAP_PIXELSIZE_HEIGHT - 600, this.cameras.main.scrollY + this.cameraSpeed);
        }
    }
}

export default BattlemapScene