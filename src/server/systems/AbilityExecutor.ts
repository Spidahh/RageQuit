import { PlayerState } from '../schemas/GameState.js';

export class AbilityExecutor {
    static execute(attacker: PlayerState, target: PlayerState, ability: any): void {
        console.log(`⚔️ Executing ${ability.id} from ${attacker.username} to ${target.username}`);

        // 1. Calculate Damage
        // For now, simple base damage from ability + mock attribute scaling
        let damage = ability.damage || 10;

        // Mock Attribute Scaling (e.g. Strength/Intelligence)
        // const scaling = ability.scaling || 0;
        // damage += attacker.stats.strength * scaling;

        // 2. Apply Mitigation (Armor/Resist) - To be implemented
        // damage -= target.stats.armor;

        // 3. Apply Damage
        target.hp = Math.max(0, target.hp - damage);
        target.damageDealt += damage; // Track stats

        console.log(`💥 Hit! ${damage} dmg. Target HP: ${target.hp}/${target.maxHp}`);

        // 4. Check Death
        if (target.hp <= 0) {
            target.isAlive = false;
            target.deaths += 1;
            attacker.kills += 1;
            target.respawnTimerMs = 5000; // 5s respawn
            console.log(`💀 ${target.username} verified dead. Respawn in 5s.`);
        }
    }
}
