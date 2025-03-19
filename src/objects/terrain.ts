import { LAYERS, TerrainType } from "../helper/constants"
import Unit from "./unit"

type ITerrain = {
    scene: Phaser.Scene,
    moveModifier: number,
    blocksLOS: boolean,
    points: number[],
    showTerrain: boolean,
    type: TerrainType
}

export class Terrain extends Phaser.Geom.Polygon {
    graphics: Phaser.GameObjects.Graphics
    scene: Phaser.Scene
    moveModifier: number
    blocksLOS: boolean
    showTerrain: boolean
    type: TerrainType

    constructor(terrainData: ITerrain) {
        super(terrainData.points) 

        this.moveModifier = terrainData.moveModifier
        this.blocksLOS = terrainData.blocksLOS
        this.showTerrain = terrainData.showTerrain
        this.type = terrainData.type
        this.scene = terrainData.scene
        this.graphics = this.scene.add.graphics();
        
        this.graphics.setDepth(LAYERS.UI);
        this.graphics.fillStyle(this.color, this.showTerrain ? 0.4 : 0);
        this.graphics.fillPoints(this.points, true);
    }

    intersects(sprite: Phaser.GameObjects.Sprite) {
        const spriteRect = sprite.getBounds();
        const rectPoints = [
            new Phaser.Geom.Point(spriteRect.x + spriteRect.width / 2, spriteRect.y + spriteRect.height / 2),
            new Phaser.Geom.Point(spriteRect.x, spriteRect.y), // Top-left
            new Phaser.Geom.Point(spriteRect.x + spriteRect.width, spriteRect.y), // Top-right
            new Phaser.Geom.Point(spriteRect.x, spriteRect.y + spriteRect.height), // Bottom-left
            new Phaser.Geom.Point(spriteRect.x + spriteRect.width, spriteRect.y + spriteRect.height) // Bottom-right
        ];

        for (const point of rectPoints) {
            if (Phaser.Geom.Polygon.Contains(this, point.x, point.y)) {
                return true
            } 
        }

        return false
    }

    get color() {
        if (this.moveModifier<=0 || this.blocksLOS) {
            return 0xFF0000
        }
        if (this.moveModifier < 1) {
            return 0x00FFFF
        }
        if (this.moveModifier >= 1) {
            return 0x00FF00
        } return 0xFFFFFF
    }

    canMoveInto(unit: Unit) {
        if (this.moveModifier <= 0) {   
            return false
        } else {
            return true
        }
    }
}