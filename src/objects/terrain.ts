import { GRID_SIZE, Layer, TerrainType } from "../helper/constants"
import Unit from "./unit"

export const TERRAIN_INFO = {
    [TerrainType.CITY]: {
        color: 0x7f7f7f,
        blocksLOS: true,
        hitModifier: 0.5,
        moveModifier: 0.5
    },
    [TerrainType.ROAD]: {
        color: 0xd9b382,
        blocksLOS: false,
        hitModifier: 1,
        moveModifier: 1.5
    },
    [TerrainType.WATER]: {
        color: 0x2060d6,
        blocksLOS: false,
        hitModifier: 1,
        moveModifier: 0
    },
    [TerrainType.WOODS]: {
        color: 0x228B22,
        blocksLOS: true,
        hitModifier: 0.5,
        moveModifier: 0.5
    },
    [TerrainType.OPEN]: {
        color: 0xFFFFFF,
        blocksLOS: false,
        hitModifier: 1,
        moveModifier: 1
    },
}


type ITerrain = {
    terrainColor: number,
    gridRow: number,
    gridCol: number
}


export class Terrain extends Phaser.GameObjects.Rectangle {
    graphics: Phaser.GameObjects.Graphics
    scene: Phaser.Scene
    terrainType: TerrainType

    constructor(scene: Phaser.Scene, terrainData: ITerrain) {
        super(scene, terrainData.gridCol * GRID_SIZE, terrainData.gridRow * GRID_SIZE, GRID_SIZE, GRID_SIZE, terrainData.terrainColor);
        this.scene = scene
        this.graphics = this.scene.add.graphics();
        this.terrainType = this.colorToTerrain(terrainData.terrainColor)!

        this.graphics.setDepth(Layer.BACKGROUND);
        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillRect(this.x, this.y, GRID_SIZE, GRID_SIZE);
    }

    colorToTerrain(color: number) {
        let returnedTerrain: TerrainType = TerrainType.OPEN
        Object.entries(TERRAIN_INFO).forEach(([terrainType, terrain]) => {
            if (terrain.color - color == 0) {
                returnedTerrain = terrainType as TerrainType;
            }
        })
        return returnedTerrain
    }
    get color() {
        return TERRAIN_INFO[this.terrainType].color
    }

    getMoveModifier(_unit: Unit) {
        return TERRAIN_INFO[this.terrainType].moveModifier
    }

    getHitModifier(_unit: Unit) {
        return TERRAIN_INFO[this.terrainType].hitModifier
    }

    blocksLOS() {
        return TERRAIN_INFO[this.terrainType].blocksLOS
    }

    canMoveInto(_unit: Unit) {
        return TERRAIN_INFO[this.terrainType].moveModifier > 0
    }
}