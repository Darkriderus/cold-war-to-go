import { Layer, TerrainType } from "../helper/constants"
import Unit from "./unit"

type ITerrain = {
    blocksLOS: boolean,
    points: number[],
    terrainType: string,
}

export class Terrain extends Phaser.Geom.Polygon {
    graphics: Phaser.GameObjects.Graphics
    scene: Phaser.Scene
    blocksLOS: boolean
    terrainType: TerrainType

    constructor(scene: Phaser.Scene, terrainData: ITerrain) {
        super(terrainData.points)

        this.blocksLOS = terrainData.blocksLOS
        this.terrainType = terrainData.terrainType as TerrainType
        this.scene = scene
        this.graphics = this.scene.add.graphics();

        this.graphics.setDepth(Layer.UI);
        this.graphics.fillStyle(this.color, 0.4);
        this.graphics.fillPoints(this.points, true);
    }

    intersects(x: number, y: number) {
        return (Phaser.Geom.Polygon.Contains(this, x, y))
    }

    get color() {
        switch (this.terrainType) {
            case TerrainType.CITY: {
                return 0xFF0000
            }
            case TerrainType.ROAD: {
                return 0x333333
            }
            case TerrainType.WATER: {
                return 0xFF0000
            }
            case TerrainType.WOODS: {
                return 0xFF0000
            }
        }
    }

    getMoveModifier(unit: Unit) {
        switch (this.terrainType) {
            case TerrainType.CITY: {
                return 0.5
            }
            case TerrainType.ROAD: {
                return 1.5
            }
            case TerrainType.WATER: {
                return 0
            }
            case TerrainType.WOODS: {
                return 0.5
            }
        }
    }

    getHitModifier(unit: Unit) {
        switch (this.terrainType) {
            case TerrainType.CITY: {
                return 0.5
            }
            case TerrainType.ROAD: {
                return 1
            }
            case TerrainType.WATER: {
                return 1
            }
            case TerrainType.WOODS: {
                return 0.5
            }
        }
    }

    canMoveInto(unit: Unit) {
        switch (this.terrainType) {
            case TerrainType.CITY: {
                return true
            }
            case TerrainType.ROAD: {
                return true
            }
            case TerrainType.WATER: {
                return true
            }
            case TerrainType.WOODS: {
                return true
            }
        }
    }
}