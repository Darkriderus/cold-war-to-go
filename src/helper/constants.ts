const GRID_SIZE = 30

const SMALL_MAP_PIXELSIZE_WIDTH = 1200
const SMALL_MAP_PIXELSIZE_HEIGHT = 900

const enum LAYERS {
    BACKGROUND = 0,
    MOVEMENT_LINES = 5,
    GHOSTS = 10,
    UNITS = 20,
    LINES = 30
}

export type COORD = {
    X: number,
    Y: number
}

export {
    GRID_SIZE,
    SMALL_MAP_PIXELSIZE_WIDTH,
    SMALL_MAP_PIXELSIZE_HEIGHT,
    LAYERS
}