import EasyStar from "easystarjs";
import mapGrid from "../../public/data/map1Grid.json"
import { Terrain, TERRAIN_INFO } from "./terrain";

export class BattleMap {
    easyStar: EasyStar.js
    movementGrid: number[][]
    scene: Phaser.Scene
    public terrains: Terrain[][] = []


    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.easyStar = new EasyStar.js();
        this.movementGrid = this.gridToMovementCost()
        this.easyStar.setGrid(this.movementGrid);
        this.easyStar.enableDiagonals();

        const allMovementSpeeds = [...new Set(this.movementGrid.flat())];
        this.easyStar.setAcceptableTiles(allMovementSpeeds);

        allMovementSpeeds.sort((a, b) => b - a).forEach((tile, index) => this.easyStar.setTileCost(tile, index + 1));
    }

    calculatePath(startX: number, startY: number, endX: number, endY: number) {
        return new Promise((resolve) => {
            this.easyStar.findPath(startX, startY, endX, endY, (path) => {
                if (path) {
                    resolve(path);
                } else {
                    resolve([])
                }
            });
            this.easyStar.calculate();
        })
    }

    generateTerrain() {
        for (let gridY = 0; gridY < mapGrid.length; gridY++) {
            this.terrains[gridY] = [];
            for (let gridX = 0; gridX < mapGrid[gridY].length; gridX++) {

                if (mapGrid[gridY] && mapGrid[gridY][gridX] !== undefined) {
                    this.terrains[gridY][gridX] = new Terrain(this.scene, {
                        gridCol: gridX,
                        gridRow: gridY,
                        terrainColor: mapGrid[gridY][gridX]
                    })
                }
            }
        }
    }

    gridToMovementCost() {
        return mapGrid.map(row => row.map(cell => (this.colorToMovementCost(cell) * 10)));
    }

    colorToMovementCost(color: number) {
        let returnedTerrain: number = -1
        Object.entries(TERRAIN_INFO).forEach(([_terrainType, terrain]) => {
            if (terrain.color - color == 0) {
                returnedTerrain = terrain.moveModifier
            }
        })
        return returnedTerrain
    }



}