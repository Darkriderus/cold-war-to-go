const GRID_SIZE = 30

const SMALL_MAP_PIXELSIZE_WIDTH = 800
const SMALL_MAP_PIXELSIZE_HEIGHT = 600

const enum LAYERS {
    BACKGROUND = 0,
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