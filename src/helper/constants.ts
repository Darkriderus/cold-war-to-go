export const PIXEL_PER_KILOMETER = 100
export const TOKEN_SIZE = PIXEL_PER_KILOMETER / 4

export const SMALL_MAP_PIXELSIZE_WIDTH = 1200
export const SMALL_MAP_PIXELSIZE_HEIGHT = 900

export const TICK_PER_ROUND = 15
export const TICK_INTERVAL = 1


export enum Layer {
    BACKGROUND = 0,
    MOVEMENT_LINES = 5,
    UNITS = 10,
    GHOSTS = 20,
    LINES = 30,
    UI = 100
}

export enum OrderType {
    MOVE,
    RETREAT,
    ADVANCE,
    ATTACK,
    DEFEND
}

export enum MoveType {
    MOVE,
    ATTACK
}

export enum TerrainType {
    WATER,
    ROAD,
    CITY,
    WOODS
}

export enum Team {
    BLUE = 0,
    RED = 1
}

export enum PlayerColor {
    BLUE = 0x0000FF,
    RED = 0xFF0000
}
