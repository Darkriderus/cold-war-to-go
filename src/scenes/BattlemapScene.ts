import { PLAYER_COLOR, PLAYERS, SMALL_MAP_PIXELSIZE_HEIGHT, SMALL_MAP_PIXELSIZE_WIDTH, TerrainType, TOKEN_SIZE } from "../helper/constants"
import Unit from "../objects/unit"
// import unitList from "../../public/dummy/dummy_oob.json"
import unitList from "../../public/dummy/dummy_oob_v2.json"
import CombatLogic from "../logic/combat-logic"
import BattleUI from "./BattleUI"
import { Terrain } from "../objects/terrain"

// TODO/IDEAS
// FFT-Values with 10x Health
// Move with D&D, Buttons for Targets as if dragged
// Camera sliding 

const DBG_GAP_BETWEEN_UNITS = 50
const DBG_OFFSET = SMALL_MAP_PIXELSIZE_WIDTH * 0.05

class BattlemapScene extends Phaser.Scene {
    private deployZoneGraphics: Phaser.GameObjects.Graphics | undefined;

    public combatLogic: CombatLogic;
    public terrains: Terrain[] = []


    // ToDo - Move to config
    public mapConfig = {
        width: SMALL_MAP_PIXELSIZE_WIDTH,
        height: SMALL_MAP_PIXELSIZE_HEIGHT,
        mapTexture: 'bg',
        blueDeploy: {
            x1: SMALL_MAP_PIXELSIZE_WIDTH * 0.35, y1: SMALL_MAP_PIXELSIZE_HEIGHT * 0.0,
            x2: SMALL_MAP_PIXELSIZE_WIDTH * 0.95, y2: SMALL_MAP_PIXELSIZE_HEIGHT * 0.2,
        },
        redDeploy: {
            x1: SMALL_MAP_PIXELSIZE_WIDTH * 0.09, y1: SMALL_MAP_PIXELSIZE_HEIGHT * 0.65,
            x2: SMALL_MAP_PIXELSIZE_WIDTH * 0.5, y2: SMALL_MAP_PIXELSIZE_HEIGHT * 0.9,
        },
        terrain: [
            {
                scene: this,
                points: [
                    443, 485,
                    420, 523,
                    422, 549,
                    445, 553,
                    460, 538,
                    461, 504,
                    452, 492
                ],
                moveModifier: 0,
                blocksLOS: false,
                showTerrain: true,
                type: TerrainType.WATER,
                hitModifier: 1,
            },
            {
                scene: this,
                points: [
                    391, 739
                    , 391, 714
                    , 381, 672
                    , 379, 631
                    , 393, 590
                    , 393, 551
                    , 379, 533
                    , 388, 528
                    , 408, 574
                    , 396, 617
                    , 391, 642
                    , 398, 687
                    , 401, 732
                    , 390, 744
                ],
                moveModifier: 1.5,
                blocksLOS: false,
                showTerrain: true,
                type: TerrainType.ROAD,
                hitModifier: 1,
            },
            {
                scene: this,
                points: [
                    258, 615,
                    300, 624,
                    306, 608,
                    266, 600
                ],
                moveModifier: 0.5,
                blocksLOS: false,
                type: TerrainType.CITY,
                showTerrain: true,
                hitModifier: 0.5,
            },
            {
                scene: this,
                points: [
                    221, 620,
                    265, 592,
                    273, 569,
                    237, 558,
                    218, 546,
                    202, 554,
                    213, 581,
                    205, 606,
                    221, 619,
                ],
                moveModifier: 0.3,
                blocksLOS: true,
                showTerrain: true,
                type: TerrainType.WOODS,
                hitModifier: 0.8,
            }
        ],
    }

    constructor() {
        console.log("-- Battlemap Initializing.. --")

        super({ key: 'BattleMap', active: true });
        this.combatLogic = new CombatLogic();
        this.combatLogic.initialize(this);

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
        this.deployZoneGraphics?.fillStyle(PLAYER_COLOR.BLUE, 0.15);
        this.deployZoneGraphics?.fillRect(
            this.mapConfig.blueDeploy.x1,
            this.mapConfig.blueDeploy.y1,
            this.mapConfig.blueDeploy.x2 - this.mapConfig.blueDeploy.x1,
            this.mapConfig.blueDeploy.y2 - this.mapConfig.blueDeploy.y1);
        this.deployZoneGraphics?.fillStyle(PLAYER_COLOR.RED, 0.15);
        this.deployZoneGraphics?.fillRect(
            this.mapConfig.redDeploy.x1,
            this.mapConfig.redDeploy.y1,
            this.mapConfig.redDeploy.x2 - this.mapConfig.redDeploy.x1,
            this.mapConfig.redDeploy.y2 - this.mapConfig.redDeploy.y1);
    }

    deployUnits(playerTeam: PLAYERS) {
        const battleUiScene = this.scene.get('BattleUI') as BattleUI;

        unitList.units.filter(unit => unit.playerId === playerTeam).forEach((unitToLoad, idx) => {
            const leftEdge = playerTeam === PLAYERS.BLUE ? this.mapConfig.blueDeploy.x1 + DBG_OFFSET : this.mapConfig.redDeploy.x1 + DBG_OFFSET;
            const topEdge = playerTeam === PLAYERS.BLUE ? this.mapConfig.blueDeploy.y1 + DBG_OFFSET : this.mapConfig.redDeploy.y1 + DBG_OFFSET

            const unit = new Unit(this, (leftEdge + (idx * DBG_GAP_BETWEEN_UNITS)), topEdge, unitToLoad.texture, unitToLoad);
            unit.on('pointerdown', () => {
                this.deselectAll()
                unit.select()
                battleUiScene.showUnitInfo(unit);

                this.clearAllRangeCircles()
                unit.drawRangeCircle(unit);
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
            this.terrains.push(new Terrain(terrainElement));
        })
    }

    preload() {
        this.load.image('bg', 'public/sprites/Testmap.png');
        this.load.image('tank_red', 'public/sprites/units/tank_red.svg');
        this.load.image('tank_blue', 'public/sprites/units/tank_blue.svg');
        this.load.image('tank_grey', 'public/sprites/units/tank_grey.svg');

        this.load.image('apc_red', 'public/sprites/units/apc_red.svg');
        this.load.image('apc_blue', 'public/sprites/units/apc_blue.svg');
    }

    create() {
        const battleUiScene = this.scene.get('BattleUI') as BattleUI;

        this.add.image(this.mapConfig.width / 2, this.mapConfig.height / 2, 'bg').setDisplaySize(this.mapConfig.width, this.mapConfig.height);

        this.deployZoneGraphics = this.add.graphics();
        this.drawDeployZones();
        this.generateTerrain();
        this.terrains.push(new Terrain(this.mapConfig.terrain[0]));


        this.deployUnits(PLAYERS.BLUE);
        this.deployUnits(PLAYERS.RED);
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
            console.log(pointer.x + "," + pointer.y + ",");
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

            for (const terrain of this.terrains) {
                if (terrain.intersects(connectedUnit.ghost) && !terrain.canMoveInto(connectedUnit)) {
                    connectedUnit.moveGhost(connectedUnit.x, connectedUnit.y);
                    return;
                }
            }

            if (!connectedUnit.currentOrder) connectedUnit.currentOrder = {};
            connectedUnit.currentOrder.movementToX = connectedUnit.ghost.x;
            connectedUnit.currentOrder.movementToY = connectedUnit.ghost.y;
            connectedUnit.currentOrder.movementType = battleUiScene.selectedOrderType;

        });
    }
}

export default BattlemapScene