var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';
// Status effect schema for buffs, debuffs, DoT, CC
export class StatusEffect extends Schema {
    effectType = ''; // bleed, burn, poison, stun, root, slow, etc.
    remainingMs = 0;
    tickDamage = 0; // For DoTs
    stacks = 1;
    sourcePlayerId = '';
}
__decorate([
    type('string'),
    __metadata("design:type", String)
], StatusEffect.prototype, "effectType", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], StatusEffect.prototype, "remainingMs", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], StatusEffect.prototype, "tickDamage", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], StatusEffect.prototype, "stacks", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], StatusEffect.prototype, "sourcePlayerId", void 0);
export class PlayerState extends Schema {
    sessionId = '';
    username = 'Guest';
    // Position
    x = 0;
    y = 1;
    z = 0;
    rotationY = 0;
    // Resources
    hp = 100;
    maxHp = 100;
    mana = 100;
    maxMana = 100;
    stamina = 100;
    maxStamina = 100;
    // Combat state
    stance = 'melee'; // melee, bow, magic
    isAlive = true;
    isAirborne = false; // For knockup CC
    isStunned = false;
    isRooted = false;
    // Team (for 5v5)
    teamSide = 'none'; // crimson, cobalt, none
    teamColor = '#FFFFFF';
    // Stats
    kills = 0;
    deaths = 0;
    assists = 0;
    damageDealt = 0;
    // Respawn
    respawnTimerMs = 0;
    // Active effects (DoTs, buffs, debuffs)
    activeEffects = new ArraySchema();
    // Cooldowns - ability ID to remaining cooldown in ms
    cooldowns = new MapSchema();
}
__decorate([
    type('string'),
    __metadata("design:type", String)
], PlayerState.prototype, "sessionId", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], PlayerState.prototype, "username", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "x", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "y", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "z", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "rotationY", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "hp", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "maxHp", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "mana", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "maxMana", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "stamina", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "maxStamina", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], PlayerState.prototype, "stance", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], PlayerState.prototype, "isAlive", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], PlayerState.prototype, "isAirborne", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], PlayerState.prototype, "isStunned", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], PlayerState.prototype, "isRooted", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], PlayerState.prototype, "teamSide", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], PlayerState.prototype, "teamColor", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "kills", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "deaths", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "assists", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "damageDealt", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], PlayerState.prototype, "respawnTimerMs", void 0);
__decorate([
    type([StatusEffect]),
    __metadata("design:type", Object)
], PlayerState.prototype, "activeEffects", void 0);
__decorate([
    type({ map: 'number' }),
    __metadata("design:type", Object)
], PlayerState.prototype, "cooldowns", void 0);
export class GameState extends Schema {
    players = new MapSchema();
    mapId = 'gladiators_arena';
    gameMode = '5v5'; // 5v5, 1v1, ffa, training
    matchTime = 0;
    isMatchActive = false;
    countdownTime = 5000; // 5s countdown before match start
    isCountingDown = false;
    // Team scores (for 5v5)
    crimsonScore = 0;
    cobaltScore = 0;
}
__decorate([
    type({ map: PlayerState }),
    __metadata("design:type", Object)
], GameState.prototype, "players", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], GameState.prototype, "mapId", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], GameState.prototype, "gameMode", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "matchTime", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], GameState.prototype, "isMatchActive", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "countdownTime", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], GameState.prototype, "isCountingDown", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "crimsonScore", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "cobaltScore", void 0);
