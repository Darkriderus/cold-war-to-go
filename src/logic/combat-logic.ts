import path from "path";
import { TICK_INTERVAL, Team, TICK_PER_ROUND } from "../helper/constants";
import { coordToGrid, gridToCoord } from "../helper/mapHelper";
import Unit from "../objects/unit";
import BattlemapScene from "../scenes/BattlemapScene";
import BattleUI from "../scenes/BattleUI";

export default class CombatLogic {
    public units: Unit[][] = []
    private battleMapScene?: BattlemapScene
    private battleUI?: BattleUI

    initialize(battleMapScene: BattlemapScene, battleUI: BattleUI): void {
        this.units[Team.BLUE] = []
        this.units[Team.RED] = []
        this.battleMapScene = battleMapScene
        this.battleUI = battleUI

    }

    get allUnits(): Unit[] {
        return this.units[Team.BLUE].concat(this.units[Team.RED])
    }


    lockUnits(playerId: Team) {
        this.units[playerId].forEach(unit => {
            unit.disableInteractive()
        });
    }

    unlockUnits(playerId: Team) {
        this.units[playerId].forEach(unit => {
            unit.setInteractive({ draggable: false });
        });
    }

    async acceptOrders() {
        console.log("-- Order Accepted, Starting Round --")
        this.lockUnits(Team.BLUE)
        this.lockUnits(Team.RED)

        await this.calculateRound();

        this.unlockUnits(Team.BLUE)
        this.unlockUnits(Team.RED)

        console.log("-- Round Done! --")
    }

    async calculateRound() {
        return new Promise((resolve) => {
            let tick = 0
            this.battleMapScene!.time.addEvent({
                delay: TICK_INTERVAL * 1000,
                callback: () => {
                    this.handleTick(tick);
                    tick += 1
                    if (tick >= TICK_PER_ROUND) {
                        this.battleUI!.enableNextTurnButton();
                        resolve(true)
                    }
                },
                callbackScope: this,
                repeat: TICK_PER_ROUND - 1
            });
        });
    }

    async handleTick(tick: number) {
        console.log("-- Tick " + tick + " --")
        for (const playerId of [Team.BLUE, Team.RED]) {
            const enemyAliveUnits = this.units[playerId === Team.BLUE ? Team.RED : Team.BLUE].filter(unit => unit.health > 0);
            const playerUnits = this.units[playerId];
            for (const unit of playerUnits) {
                console.log("-------------");
                console.log(`[${unit.playerId === Team.BLUE ? 'Blue' : 'Red'}] unit ${unit.name}..`);
                if (unit.health <= 0) {
                    console.log("   >dead");
                    return
                }
                if (unit.currentOrder === null) {
                    console.log("   >no order");
                } else {
                    // MOVE
                    if (unit.gridX === unit.currentOrder.movementToX! && unit.gridY === unit.currentOrder.movementToY!) {
                        console.log("   >stop.");
                    }

                    // TODO inefficient!!!
                    let pathToTarget = await this.battleMapScene!.map.calculatePath(unit.gridX, unit.gridY, unit.currentOrder.movementToX!, unit.currentOrder.movementToY!) as any[];
                    pathToTarget.shift();
                    console.log(pathToTarget.length)
                    // TODO Wrong - missing modifier
                    if (pathToTarget.length <= unit.movementPerTick) {
                        unit.move(unit.currentOrder.movementToX!, unit.currentOrder.movementToY!);
                        console.log("   >move (" + pathToTarget.length + ")+stop");
                    } else {
                        console.log(pathToTarget[unit.movementPerTick])
                        unit.move(pathToTarget[unit.movementPerTick].x, pathToTarget[unit.movementPerTick].y);
                    }

                    // const orderCoord = gridToCoord(unit!.currentOrder!.movementToX!, unit.currentOrder.movementToY!);
                    // const distanceLeft = Phaser.Math.Distance.Between(unit.x, unit.y, orderCoord.x, orderCoord.y);
                    // if (distanceLeft === 0) {
                    //     console.log("   >stop.");
                    // }

                    // const currentlyOccupiedTerrain = unit.terrain
                    // const terrainModifiedDistance = unit.movementInAbsolutePerTick * (currentlyOccupiedTerrain?.getMoveModifier(unit) || 1);

                    // console.log("   >" + currentlyOccupiedTerrain.terrainType)

                    // if (distanceLeft < terrainModifiedDistance) {
                    //     unit.move(unit.currentOrder?.movementToX!, unit.currentOrder?.movementToY!)
                    //     console.log("   >move (" + terrainModifiedDistance + ")+stop");
                    // }
                    // else {
                    //     const angle = Phaser.Math.Angle.Between(unit.x, unit.y, orderCoord.x, orderCoord.y);
                    //     const newX = unit.x + Math.cos(angle) * terrainModifiedDistance;
                    //     const newY = unit.y + Math.sin(angle) * terrainModifiedDistance;
                    //     const grid = coordToGrid(newX, newY);

                    //     unit.move(grid.x, grid.y)
                    //     console.log("   >move (" + terrainModifiedDistance + ")");
                    // }
                }

                // SHOOT
                const targetsInRange = enemyAliveUnits.map(enemyUnit => {
                    const distance = Phaser.Math.Distance.Between(unit.center.x, unit.center.y, enemyUnit.center.x, enemyUnit.center.y);
                    return { unit: enemyUnit, distance }
                }).filter(target => target.distance <= unit.range);
                console.log("   >targets in range: " + targetsInRange.length);

                const targetToShoot = unit.decideTargetToShoot(targetsInRange);

                if (targetToShoot) {
                    unit.shoot(targetToShoot.unit);
                    console.log("   >shoot " + targetToShoot.unit.name);
                }
                unit.hitGraphics.clear();
            }
        }

    }
}