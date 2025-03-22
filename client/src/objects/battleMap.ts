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

    checkLOS(startX: number, startY: number, endX: number, endY: number) {
        // Use Bresenham's Line Algorithm to iterate over the tiles the line crosses
        let dx = Math.abs(endX - startX);
        let dy = Math.abs(endY - startY);
        let sx = startX < endX ? 1 : -1;
        let sy = startY < endY ? 1 : -1;
        let err = dx - dy;
        const grid = this.terrains;

        let x = startX;
        let y = startY;

        // Flag to ignore the first tile
        let firstTile = true;

        while (true) {
            // If we have reached the endpoint, stop
            if (x === endX && y === endY) {
                break;
            }

            // Check if the current tile blocks LOS and it's not the first tile
            if (!firstTile && grid[y][x].blocksLOS()) {
                return false;
            }

            // Set firstTile to false after the first iteration
            firstTile = false;

            // Bresenham's Line Algorithm step
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        // If we reach here, all tiles in the line are clear
        return true;
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