// ============================================
// RAGEQUIT - Shared Game Constants
// ============================================
// Central source of truth for all game values

export const GAME_CONSTANTS = {
    // Server tick rate
    TICK_RATE: 60, // Hz
    TICK_INTERVAL_MS: 1000 / 60, // ~16.67ms

    // Player resources
    MAX_HP: 100,
    MAX_MANA: 100,
    MAX_STAMINA: 100,

    // Regeneration rates (per second)
    HP_REGEN_OUT_OF_COMBAT: 5, // HP/s when not in combat
    HP_REGEN_COMBAT_TIMER: 5000, // 5s out of combat to start regen
    MANA_REGEN: 10, // Mana/s
    STAMINA_REGEN_MOVING: 5, // Stamina/s while moving
    STAMINA_REGEN_STATIONARY: 10, // Stamina/s while stationary

    // Movement
    MOVE_SPEED: 5, // Units/s
    SPRINT_SPEED_MULTIPLIER: 1.5,
    JUMP_STAMINA_COST: 10,
    DODGE_STAMINA_COST: 20,
    DODGE_COOLDOWN_MS: 1000,

    // Combat
    PARRY_WINDOW_MS: 300, // Parry active frames
    PARRY_STAMINA_COST: 20,
    PARRY_STAMINA_DAMAGE: 30, // Stamina damage to attacker on successful parry

    // Respawn
    RESPAWN_TIME_MS: 5000, // 5 seconds

    // Match settings
    MATCH_START_COUNTDOWN_MS: 5000, // 5 second countdown
    MAX_PLAYERS_PER_ROOM: 10,

    // Anti-cheat thresholds
    MAX_SPEED_TOLERANCE: 1.2, // 20% tolerance for position validation
    DESYNC_TELEPORT_THRESHOLD: 5, // Meters before forced teleport
    SUSPICIOUS_SPEED_THRESHOLD: 10, // Flag for anti-cheat review

    // Network
    RECONNECT_GRACE_PERIOD_MS: 10000, // 10s before disconnect is permanent
    LAG_COMPENSATION_MAX_MS: 200, // Max rewind for hitscan validation
} as const;

export const TEAM_COLORS = {
    crimson: '#DC143C',
    cobalt: '#4169E1',
    emerald: '#50C878',
    gold: '#FFD700',
    none: '#FFFFFF',
} as const;

export const STANCES = {
    MELEE: 'melee',
    BOW: 'bow',
    MAGIC: 'magic',
} as const;

export const GAME_MODES = {
    DUEL: '1v1',
    TEAM: '5v5',
    FREE_FOR_ALL: 'ffa',
    TRAINING: 'training',
} as const;
