import Unit from "../objects/unit"

export const GRID_SIZE = 25
export const TOKEN_SIZE = GRID_SIZE

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
    WOODS = "woods",
    OPEN = "open"
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
