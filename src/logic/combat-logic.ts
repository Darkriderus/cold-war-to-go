import { PLAYERS } from "../helper/constants";
import Unit from "../objects/unit";

export default class CombatLogic {
    public units: Unit[][] = []

    initialize(): void {
        this.units[PLAYERS.BLUE] = []
        this.units[PLAYERS.RED] = []
    }

    acceptOrders(): void { 
        // [TODO] Save Orders and Move

        this.units[PLAYERS.BLUE].forEach(unit => {
            unit.ghost.x = unit.x;
            unit.ghost.y = unit.y;
        });

    }



}