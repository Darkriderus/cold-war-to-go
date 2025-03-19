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
        console.log("-- Order Accepted, Starting Round --")
        this.lockUnits(PLAYERS.BLUE)

        await this.calculateRound();
        
        this.unlockUnits(PLAYERS.BLUE)
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
        this.units[PLAYERS.BLUE].forEach(unit => {
            if (unit.currentOrder === null) return
            const distanceLeft = Phaser.Math.Distance.Between(unit.x, unit.y, unit.currentOrder?.movementToX!, unit.currentOrder?.movementToY!);
            if (distanceLeft < unit.movementPerTick) {
                unit.x = unit.currentOrder?.movementToX!;
                unit.y = unit.currentOrder?.movementToY!;
            }
            else {
                const angle = Phaser.Math.Angle.Between(unit.x, unit.y, unit.currentOrder?.movementToX!, unit.currentOrder?.movementToY!);
                const newX = unit.x + Math.cos(angle) * unit.movementPerTick;
                const newY = unit.y + Math.sin(angle) * unit.movementPerTick;

                unit.move(newX, newY)
            }
        })
    }



}