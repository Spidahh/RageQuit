import { supabase } from '../services/SupabaseService';
class LoadoutManagerClass {
    async getActiveLoadout(userId) {
        const { data, error } = await supabase
            .from('loadouts')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();
        if (error) {
            console.error('Failed to fetch loadout:', error);
            return null;
        }
        return data;
    }
    async applyLoadout(player, userId) {
        const loadout = await this.getActiveLoadout(userId);
        if (!loadout) {
            console.log(`No active loadout for user ${userId}, using defaults`);
            player.loadout = ['heal_self', 'transmute_stam_hp', 'transmute_hp_mana', 'transmute_mana_stam'];
            return;
        }
        // Build loadout array from database columns
        player.loadout = [
            loadout.slot_q,
            loadout.slot_c,
            loadout.slot_1,
            loadout.slot_e,
            loadout.slot_f,
            loadout.slot_x,
            loadout.slot_t,
            loadout.slot_r,
            loadout.slot_2,
            loadout.slot_3,
            loadout.slot_4
        ].filter(Boolean); // Remove null slots
        console.log(`✅ Applied loadout "${loadout.name}" for user ${userId}`);
    }
    async saveLoadout(userId, loadoutData) {
        const { error } = await supabase
            .from('loadouts')
            .upsert({
            user_id: userId,
            ...loadoutData
        });
        if (error) {
            console.error('Failed to save loadout:', error);
            return false;
        }
        return true;
    }
}
export const LoadoutManager = new LoadoutManagerClass();
