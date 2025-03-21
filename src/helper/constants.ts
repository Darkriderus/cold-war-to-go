import Unit from "../objects/unit"

export const PIXEL_PER_KILOMETER = 100
export const TOKEN_SIZE = PIXEL_PER_KILOMETER / 4

export const SMALL_MAP_PIXELSIZE_WIDTH = 18 * PIXEL_PER_KILOMETER
export const SMALL_MAP_PIXELSIZE_HEIGHT = 9 * PIXEL_PER_KILOMETER

export const TICK_PER_ROUND = 5
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
    FASTMOVE = "fastmove",
    RETREAT = "retreat",
    ADVANCE = "advance",
    ATTACK = "attack",
}

export enum MoveType {
    MOVE,
    ATTACK
}

export enum TerrainType {
    WATER = "water",
    ROAD = "road",
    CITY = "city",
    WOODS = "woods"
}

export enum Team {
    BLUE = 0,
    RED = 1
}

export enum PlayerColor {
    BLUE = 0x0000FF,
    RED = 0xFF0000
}

export type Gun = {
    penetrationH?: number
    penetrationHe?: number
    penetrationAA?: number
    rateOfFire: number
    range: number
    antiInfantry: number
}

export type Missile = {
    penetrationH?: number
    penetrationHe?: number
    penetrationAA?: number
    rateOfFire: number
}

export type Armor = {
    front: number
    side: number
    hModifier: number
}

export type Order = {
    movementToX?: number;
    movementToY?: number;
    orderType?: OrderType;
    targetUnit?: Unit;
}

export enum MovementType {
    TRACKED,
    WHEELED,
    HALFTRACKED,
    TOWED,
    HELICOPTER,
    AIRMOBILE,
    LEGS
}
