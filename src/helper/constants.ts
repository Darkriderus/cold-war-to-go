export const TOKEN_SIZE = 30

export const SMALL_MAP_PIXELSIZE_WIDTH = 1200
export const SMALL_MAP_PIXELSIZE_HEIGHT = 900

export const TICK_PER_ROUND = 15
export const MIN_SECS_PER_TICK = 1

export const enum LAYERS {
    BACKGROUND = 0,
    MOVEMENT_LINES = 5,
    UNITS = 10,
    GHOSTS = 20,
    LINES = 30,
    UI =  100
}

export const enum MoveType {
    MOVE,
    ATTACK
}

export enum TerrainType {
    WATER,
    ROAD,
    CITY,
    WOODS
}

export const enum PLAYERS {
    BLUE = 0,
    RED = 1
}

export const enum PLAYER_COLOR {
    BLUE = 0x0000FF,
    RED = 0xFF0000
}
