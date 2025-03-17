import { PLAYERS } from "../helper/constants";
import Unit from "../objects/unit";
import BattlemapScene from "../scenes/BattlemapScene";

export default class CombatLogic {
    public units: Unit[][] = []

    initialize(): void {
        this.units[PLAYERS.BLUE] = []
        this.units[PLAYERS.RED] = []
    }

    acceptOrders(battleMapScene: BattlemapScene): void { 
        // [TODO] Save Orders and Move
        console.log(this.units[PLAYERS.BLUE])
        this.units[PLAYERS.BLUE].forEach(unit => {
            unit.x = unit.ghost.x
            unit.y = unit.ghost.y
        });

        // for(let i = 0; i < 15; i++){
            // this.units[PLAYERS.BLUE].forEach(unit => {
                    // const moveX = unit.initialX - unit.x
                    // const moveY = unit.initialY - unit.y
                    // unit.x += moveX
                    // unit.y += moveY
            // });
        // }

    }



}