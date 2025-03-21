import { OrderType, Team } from "../helper/constants"
import Unit from "../objects/unit"
// import unitList from "../../public/dummy/dummy_oob.json"
import unitList from "../../public/dummy/dummy_oob_v2.json"
import mapGrid from "../../public/data/map1Grid.json"
import CombatLogic from "../logic/combat-logic"
import BattleUI from "./BattleUI"
import { Terrain } from "../objects/terrain"
import { coordToGrid } from "../helper/mapHelper"
import { BattleMap } from "../objects/battleMap"

// TODO/IDEAS
// Fullscreen + Camerafix
// Type Cleanup
// LOS Check
// Pathfinding
// Icons as Class with Rectangle and Icon
// UI reden
// OOB with FFT-Values
// OSM Generation?
// Fog of War


class BattlemapScene extends Phaser.Scene {
    public combatLogic: CombatLogic;
    public map: BattleMap;
    public terrains: Terrain[][] = []

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private cameraSpeed: number = 30;

    public selectedOrderType: OrderType = OrderType.FASTMOVE

    constructor() {
        console.log("-- Battlemap Initializing.. --")

        super({ key: 'BattleMap', active: true });
        this.combatLogic = new CombatLogic();
        this.map = new BattleMap();
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

    deployUnits(playerTeam: Team) {
        const battleUiScene = this.scene.get('BattleUI') as BattleUI;

        unitList.units.filter(unit => unit.playerId === playerTeam).forEach((unitToLoad) => {
            const unit = new Unit(this, 20, 20, unitToLoad.texture, unitToLoad);
            unit.on('pointerdown', () => {
                if (!unit.selected) {
                    this.deselectAll()
                    unit.select()
                    battleUiScene.showUnitInfo(unit);

                    this.clearAllRangeCircles()
                    unit.drawRangeCircle(unit);
                }
            });
            this.combatLogic.units[unitToLoad.playerId].push(unit)
        })
    }

    generateTerrain() {
        for (let gridY = 0; gridY < mapGrid.length; gridY++) {
            this.terrains[gridY] = [];
            for (let gridX = 0; gridX < mapGrid[gridY].length; gridX++) {

                if (mapGrid[gridY] && mapGrid[gridY][gridX] !== undefined) {
                    this.terrains[gridY][gridX] = new Terrain(this, {
                        gridCol: gridX,
                        gridRow: gridY,
                        terrainColor: mapGrid[gridY][gridX]
                    })
                }
            }
        }
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
        this.generateTerrain();


        this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number) => {
            this.cameras.main.zoom += deltaY * -0.001;
            this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.5, 2);
        });

        this.cursors = this.input.keyboard?.createCursorKeys();

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
        this.input.on('drag', (_pointer: Phaser.Input.Pointer, connectedUnit: Unit, dragX: number, dragY: number) => {
            const grid = coordToGrid(dragX, dragY);

            connectedUnit.ghost.move(grid.x, grid.y);

            const terrain = this.terrains[grid.y][grid.x];
            console.log(grid, terrain.terrainType)
            if (!terrain.canMoveInto(connectedUnit)) {
                connectedUnit.ghost.hide()
            } else {
                connectedUnit.ghost.show();
            }

        });
        this.input.on('dragend', (_pointer: Phaser.Input.Pointer, connectedUnit: Unit) => {
            if (this.selectedOrderType === OrderType.ATTACK) {
                for (const enemyUnit of this.combatLogic.units[connectedUnit.playerId === Team.BLUE ? Team.RED : Team.BLUE]) {
                    if (enemyUnit.intersects(connectedUnit.ghost.x, connectedUnit.ghost.y)) {
                        connectedUnit.ghost.move(enemyUnit.gridX, enemyUnit.gridY);
                        connectedUnit.ghost.hide()

                        connectedUnit.currentOrder = {
                            movementToX: connectedUnit.gridX,
                            movementToY: connectedUnit.gridY,
                            orderType: this.selectedOrderType
                        }
                        console.log(`Unit ${connectedUnit.name} got order`, connectedUnit.currentOrder);
                        return;
                    }
                }
                connectedUnit.ghost.move(connectedUnit.gridX, connectedUnit.gridY);
                connectedUnit.ghost.hide()
            } else {
                const terrain = this.terrains[connectedUnit.ghost.gridY][connectedUnit.ghost.gridX];
                if (!terrain.canMoveInto(connectedUnit)) {
                    connectedUnit.ghost.move(connectedUnit.gridX, connectedUnit.gridY);
                    return;
                }

                connectedUnit.currentOrder = {
                    movementToX: connectedUnit.ghost.gridX,
                    movementToY: connectedUnit.ghost.gridY,
                    orderType: this.selectedOrderType
                }
                console.log(`Unit ${connectedUnit.name} got order`, connectedUnit.currentOrder);
            }
        });
    }

    update() {
        if (this.cursors?.left.isDown) {
            this.cameras.main.scrollX = this.cameras.main.scrollX - this.cameraSpeed;
        } else if (this.cursors?.right.isDown) {
            this.cameras.main.scrollX = this.cameras.main.scrollX + this.cameraSpeed;
        }
        if (this.cursors?.up.isDown) {
            this.cameras.main.scrollY = this.cameras.main.scrollY - this.cameraSpeed;
        } else if (this.cursors?.down.isDown) {
            this.cameras.main.scrollY = this.cameras.main.scrollY + this.cameraSpeed;
        }
    }
}

export default BattlemapScene