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

    lockUnits(playerId : PLAYERS) {
        this.units[playerId].forEach(unit => {
            unit.disableInteractive()
            unit.ghost.disableInteractive()
        });
    }

    unlockUnits(playerId : PLAYERS) {
        this.units[playerId].forEach(unit => {
            unit.setInteractive({ draggable: false });
            unit.ghost.setInteractive({ draggable: true });
        });
    }

    async acceptOrders() { 
        console.log(this.units[PLAYERS.BLUE])

        this.lockUnits(PLAYERS.BLUE)

        await this.calculateRound();
        
        this.unlockUnits(PLAYERS.BLUE)

    }

    calculateRound() { 
        return new Promise((resolve) => {
                let tick = 0
                this.battleMapScene!.time.addEvent({
                    delay: MIN_SECS_PER_TICK * 1000,
                    callback: () => {
                        this.handleTick();
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



    handleTick(): void {    
        this.units[PLAYERS.BLUE].forEach(unit => {
            if (unit.currentOrder === null) return
            const distanceLeft = Phaser.Math.Distance.Between(unit.x, unit.y, unit.currentOrder?.targetX!, unit.currentOrder?.targetY!);
            if (distanceLeft < unit.movementPerTick) {
                unit.x = unit.currentOrder?.targetX!;
                unit.y = unit.currentOrder?.targetY!;
            }
            else {
                const angle = Phaser.Math.Angle.Between(unit.x, unit.y, unit.currentOrder?.targetX!, unit.currentOrder?.targetY!);
                const newX = unit.x + Math.cos(angle) * unit.movementPerTick;
                const newY = unit.y + Math.sin(angle) * unit.movementPerTick;

                unit.x = newX
                unit.y = newY
            }
        })
        // const deltaX = dbgUnit.currentOrder?.targetX! - dbgUnit.x
        // const deltaY = dbgUnit.currentOrder?.targetY! - dbgUnit.y

        // console.log("-- MOVEMENT --")
        // console.log("POS OLD ", dbgUnit.x, dbgUnit.y)
        // console.log("POS NEW ", dbgUnit.currentOrder?.targetX, dbgUnit.currentOrder?.targetY)

        // dbgUnit.x += deltaX
        // dbgUnit.y += deltaY
    }



}