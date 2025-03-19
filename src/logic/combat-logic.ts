import { MIN_SECS_PER_TICK, PLAYERS, TICK_PER_ROUND } from "../helper/constants";
import Unit from "../objects/unit";
import BattlemapScene from "../scenes/BattlemapScene";

export default class CombatLogic {
    public units: Unit[][] = []
    private battleMapScene?: BattlemapScene

    initialize(battleMapScene: BattlemapScene): void {
        this.units[PLAYERS.BLUE] = []
        this.units[PLAYERS.RED] = []
        this.battleMapScene = battleMapScene
    }

    get allUnits(): Unit[] {
        return this.units[PLAYERS.BLUE].concat(this.units[PLAYERS.RED])
    }


    lockUnits(playerId : PLAYERS) {
        this.units[playerId].forEach(unit => {
            unit.disableInteractive()
            unit.ghost.disableInteractive()
        });
    }

    unlockUnits(playerId : PLAYERS) {
        this.units[playerId].forEach(unit => {
                unit.setInteractive({ draggable: false });
                unit.ghost.setInteractive({ draggable: unit.alive });
        });
    }

    async acceptOrders() { 
        console.log("-- Order Accepted, Starting Round --")
        this.lockUnits(PLAYERS.BLUE)
        this.lockUnits(PLAYERS.RED)


        await this.calculateRound();
        
        this.unlockUnits(PLAYERS.BLUE)
        this.unlockUnits(PLAYERS.RED)

        console.log("-- Round Done! --")
    }

    calculateRound() { 
        return new Promise((resolve) => {
            let tick = 0
            this.battleMapScene!.time.addEvent({
                delay: MIN_SECS_PER_TICK * 1000,
                callback: () => {
                    this.handleTick(tick);
                    tick += 1
                    if (tick >= TICK_PER_ROUND) {
                        resolve(true)
                    }
                },
                callbackScope: this,
                repeat: TICK_PER_ROUND - 1
            });
        });
    }



    handleTick(tick: number): void {    
        console.log("-- Tick " + tick + " --")
        this.units.forEach((playerUnits, playerId) => {
            const enemyAliveUnits = this.units[playerId === PLAYERS.BLUE ? PLAYERS.RED : PLAYERS.BLUE].filter(unit => unit.health > 0);

            playerUnits.forEach(unit => {
                console.log(`[${unit.playerId === PLAYERS.BLUE ? 'Blue' : 'Red'}] unit ${unit.name}..`);
                if (unit.health <= 0) {
                    console.log("   >dead");
                    return
                }
                if (unit.currentOrder === null) {
                    console.log("   >no order");
                } else {
                    // MOVE
                    const distanceLeft = Phaser.Math.Distance.Between(unit.x, unit.y, unit.currentOrder?.movementToX!, unit.currentOrder?.movementToY!);
                    if (distanceLeft === 0) {
                        console.log("   >stop.");
                        return
                    }

                    const currentlyOccupiedTerrain = this.battleMapScene!.terrains.find(terrain => terrain.intersects(unit));
                    const terrainModifiedDistance = unit.movementPerTick * (currentlyOccupiedTerrain?.moveModifier || 1);

                    if (distanceLeft < terrainModifiedDistance) {
                        unit.move(unit.currentOrder?.movementToX!, unit.currentOrder?.movementToY!)
                        console.log("   >move (" + terrainModifiedDistance + ")+stop");
                    }
                    else {
                        const angle = Phaser.Math.Angle.Between(unit.x, unit.y, unit.currentOrder?.movementToX!, unit.currentOrder?.movementToY!);
                        const newX = unit.x + Math.cos(angle) * terrainModifiedDistance;
                        const newY = unit.y + Math.sin(angle) * terrainModifiedDistance;
        
                        unit.move(newX, newY)
                        console.log("   >move (" + terrainModifiedDistance + ")");
                    }
                }
        
                // SHOOT
                const targetsInRange = enemyAliveUnits.map(enemyUnit => {
                    const distance = Phaser.Math.Distance.Between(unit.center.x, unit.center.y, enemyUnit.center.x, enemyUnit.center.y);
                    return { unit: enemyUnit, distance }
                }).filter(target => target.distance <= unit.range);

                const targetToShoot = unit.decideTargetToShoot(targetsInRange);

                if (targetToShoot) {
                    unit.shoot(targetToShoot.unit);
                    console.log("   >shoot " + targetToShoot.unit.name);
                }
                unit.hitGraphics.clear();
            })
        })
        
    }



}