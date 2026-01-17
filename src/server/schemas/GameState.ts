import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

// Status effect schema for buffs, debuffs, DoT, CC
export class StatusEffect extends Schema {
    @type('string') effectType: string = ''; // bleed, burn, poison, stun, root, slow, etc.
    @type('number') remainingMs: number = 0;
    @type('number') tickDamage: number = 0; // For DoTs
    @type('number') stacks: number = 1;
    @type('string') sourcePlayerId: string = '';
}

export class PlayerState extends Schema {
    @type('string') sessionId: string = '';
    @type('string') username: string = 'Guest';
    @type('boolean') isBot: boolean = false;

    // Position
    @type('number') x: number = 0;
    @type('number') y: number = 1;
    @type('number') z: number = 0;
    @type('number') rotationY: number = 0;

    // Resources
    @type('number') hp: number = 100;
    @type('number') maxHp: number = 100;
    @type('number') mana: number = 100;
    @type('number') maxMana: number = 100;
    @type('number') stamina: number = 100;
    @type('number') maxStamina: number = 100;

    // Combat state
    @type('string') stance: string = 'melee'; // melee, bow, magic
    @type('boolean') isAlive: boolean = true;
    @type('boolean') isAirborne: boolean = false; // For knockup CC
    @type('boolean') isStunned: boolean = false;
    @type('boolean') isRooted: boolean = false;

    // Team (for 5v5)
    @type('string') teamSide: string = 'none'; // crimson, cobalt, none
    @type('string') teamColor: string = '#FFFFFF';

    // Stats
    @type('number') kills: number = 0;
    @type('number') deaths: number = 0;
    @type('number') assists: number = 0;
    @type('number') damageDealt: number = 0;

    // Respawn
    @type('number') respawnTimerMs: number = 0;

    // Active effects (DoTs, buffs, debuffs)
    @type([StatusEffect]) activeEffects = new ArraySchema<StatusEffect>();

    // Cooldowns - ability ID to remaining cooldown in ms
    @type({ map: 'number' }) cooldowns = new MapSchema<number>();
}

export class GameState extends Schema {
    @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
    @type('string') mapId: string = 'gladiators_arena';
    @type('string') gameMode: string = '5v5'; // 5v5, 1v1, ffa, training
    @type('number') matchTime: number = 0;
    @type('boolean') isMatchActive: boolean = false;
    @type('number') countdownTime: number = 5000; // 5s countdown before match start
    @type('boolean') isCountingDown: boolean = false;

    // Team scores (for 5v5)
    @type('number') crimsonScore: number = 0;
    @type('number') cobaltScore: number = 0;
}
