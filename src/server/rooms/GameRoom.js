import { Room } from 'colyseus';
import { GameState, PlayerState } from '../schemas/GameState';
import { AbilityLoader } from '../systems/AbilityLoader';
import { GAME_CONSTANTS } from '../../shared/constants/GameConstants';
export class GameRoom extends Room {
    maxClients = GAME_CONSTANTS.MAX_PLAYERS_PER_ROOM;
    abilitiesLoaded = false;
    async onCreate(options) {
        this.setState(new GameState());
        // Set game mode from options
        if (options.gameMode) {
            this.state.gameMode = options.gameMode;
        }
        // Load abilities from database
        try {
            await AbilityLoader.loadAll();
            this.abilitiesLoaded = true;
            console.log('✅ Abilities loaded from database');
        }
        catch (error) {
            console.error('⚠️ Failed to load abilities, using fallback');
        }
        // Start server tick loop (60Hz)
        this.setSimulationInterval((deltaTime) => this.update(deltaTime), GAME_CONSTANTS.TICK_INTERVAL_MS);
        // Message handlers
        this.onMessage('move', (client, data) => this.handleMove(client, data));
        this.onMessage('ability', (client, data) => this.handleAbility(client, data));
        this.onMessage('stance_switch', (client, data) => this.handleStanceSwitch(client, data));
        this.onMessage('ready', (client) => this.handlePlayerReady(client));
        console.log(`✅ GameRoom created (${this.state.gameMode})`);
    }
    onJoin(client, options) {
        const player = new PlayerState();
        player.sessionId = client.sessionId;
        player.username = options.username || `Player_${client.sessionId.substring(0, 4)}`;
        // Set team for 5v5 mode
        if (this.state.gameMode === '5v5') {
            const crimsonCount = Array.from(this.state.players.values())
                .filter(p => p.teamSide === 'crimson').length;
            const cobaltCount = Array.from(this.state.players.values())
                .filter(p => p.teamSide === 'cobalt').length;
            player.teamSide = crimsonCount <= cobaltCount ? 'crimson' : 'cobalt';
            player.teamColor = player.teamSide === 'crimson' ? '#DC143C' : '#4169E1';
        }
        // Random spawn position
        player.x = (Math.random() - 0.5) * 20;
        player.z = (Math.random() - 0.5) * 20;
        this.state.players.set(client.sessionId, player);
        console.log(`🎮 ${player.username} joined (${this.clients.length}/${this.maxClients}) [${player.teamSide}]`);
    }
    onLeave(client, consented) {
        const player = this.state.players.get(client.sessionId);
        if (player) {
            console.log(`👋 ${player.username} left`);
            this.state.players.delete(client.sessionId);
        }
    }
    update(deltaTime) {
        // Update match time
        if (this.state.isMatchActive) {
            this.state.matchTime += deltaTime;
        }
        // Countdown logic
        if (this.state.isCountingDown) {
            this.state.countdownTime -= deltaTime;
            if (this.state.countdownTime <= 0) {
                this.state.isCountingDown = false;
                this.state.isMatchActive = true;
                this.broadcast('match_start');
                console.log('⚔️ Match started!');
            }
        }
        // Server-side game logic updates
        this.state.players.forEach((player) => {
            if (!player.isAlive) {
                // Handle respawn timer
                if (player.respawnTimerMs > 0) {
                    player.respawnTimerMs -= deltaTime;
                    if (player.respawnTimerMs <= 0) {
                        this.respawnPlayer(player);
                    }
                }
                return;
            }
            // HP regeneration (1 HP per second when alive and not in combat)
            if (player.hp < player.maxHp) {
                player.hp = Math.min(player.maxHp, player.hp + (1 * deltaTime / 1000));
            }
            // Mana regeneration
            if (player.mana < player.maxMana) {
                player.mana = Math.min(player.maxMana, player.mana + (GAME_CONSTANTS.MANA_REGEN * deltaTime / 1000));
            }
            // Stamina regeneration
            if (player.stamina < player.maxStamina) {
                player.stamina = Math.min(player.maxStamina, player.stamina + (GAME_CONSTANTS.STAMINA_REGEN_STATIONARY * deltaTime / 1000));
            }
            // Update cooldowns
            player.cooldowns.forEach((remaining, abilityId) => {
                const newValue = remaining - deltaTime;
                if (newValue <= 0) {
                    player.cooldowns.delete(abilityId);
                }
                else {
                    player.cooldowns.set(abilityId, newValue);
                }
            });
            // Update status effects
            for (let i = player.activeEffects.length - 1; i >= 0; i--) {
                const effect = player.activeEffects[i];
                if (!effect)
                    continue;
                effect.remainingMs -= deltaTime;
                if (effect.remainingMs <= 0) {
                    player.activeEffects.splice(i, 1);
                }
            }
        });
    }
    respawnPlayer(player) {
        player.isAlive = true;
        player.hp = player.maxHp;
        player.mana = player.maxMana;
        player.stamina = player.maxStamina;
        player.x = (Math.random() - 0.5) * 20;
        player.z = (Math.random() - 0.5) * 20;
        player.isStunned = false;
        player.isRooted = false;
        player.isAirborne = false;
        console.log(`🔄 ${player.username} respawned`);
    }
    handleMove(client, data) {
        const player = this.state.players.get(client.sessionId);
        if (player && player.isAlive && !player.isStunned && !player.isRooted) {
            player.x = data.x;
            player.y = data.y;
            player.z = data.z;
            if (data.rotationY !== undefined) {
                player.rotationY = data.rotationY;
            }
        }
    }
    handleAbility(client, data) {
        const player = this.state.players.get(client.sessionId);
        if (!player || !player.isAlive || player.isStunned)
            return;
        // Check if ability is on cooldown
        const cooldownRemaining = player.cooldowns.get(data.abilityId);
        if (cooldownRemaining && cooldownRemaining > 0) {
            client.send('ability_failed', { reason: 'cooldown', remainingMs: cooldownRemaining });
            return;
        }
        // Get ability data
        const ability = AbilityLoader.get(data.abilityId);
        if (!ability) {
            client.send('ability_failed', { reason: 'unknown_ability' });
            return;
        }
        // Check resources
        if (player.mana < ability.mana_cost) {
            client.send('ability_failed', { reason: 'insufficient_mana' });
            return;
        }
        if (player.stamina < ability.stamina_cost) {
            client.send('ability_failed', { reason: 'insufficient_stamina' });
            return;
        }
        // Consume resources
        player.mana -= ability.mana_cost;
        player.stamina -= ability.stamina_cost;
        // Start cooldown
        player.cooldowns.set(data.abilityId, ability.cooldown * 1000);
        // Broadcast ability cast to all players
        this.broadcast('ability_cast', {
            playerId: client.sessionId,
            abilityId: data.abilityId,
            targetId: data.targetId,
        });
        console.log(`⚔️ ${player.username} used ability: ${data.abilityId}`);
    }
    handleStanceSwitch(client, data) {
        const player = this.state.players.get(client.sessionId);
        if (player && player.isAlive) {
            player.stance = data.stance;
            console.log(`🔄 ${player.username} switched to ${data.stance}`);
        }
    }
    handlePlayerReady(client) {
        // Start countdown when all players ready (simplified for now)
        if (!this.state.isMatchActive && !this.state.isCountingDown) {
            this.state.isCountingDown = true;
            this.state.countdownTime = GAME_CONSTANTS.MATCH_START_COUNTDOWN_MS;
            this.broadcast('countdown_start', { durationMs: this.state.countdownTime });
            console.log('⏱️ Countdown started');
        }
    }
    onDispose() {
        console.log('❌ GameRoom disposed');
    }
}
