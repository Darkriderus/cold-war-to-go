import { GRID_SIZE } from "./constants";

export const gridToCoord = (gridX: number, gridY: number) => {
    return { x: gridX * GRID_SIZE, y: gridY * GRID_SIZE };
}

export const coordToGrid = (x: number, y: number) => {
    return { x: Math.round(x / GRID_SIZE), y: Math.round(y / GRID_SIZE) };
}
