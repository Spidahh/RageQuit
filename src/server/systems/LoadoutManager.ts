import { supabase } from '../services/SupabaseService';

interface Loadout {
    id: string;
    user_id: string;
    name: string;
    is_active: boolean;
    slot_q: string | null;
    slot_c: string | null;
    slot_1: string | null;
    slot_e: string | null;
    slot_f: string | null;
    slot_x: string | null;
    slot_t: string | null;
    slot_r: string;
    slot_2: string;
    slot_3: string;
    slot_4: string;
}

class LoadoutManagerClass {
    async getActiveLoadout(userId: string): Promise<Loadout | null> {
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

    async applyLoadout(player: any, userId: string): Promise<void> {
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

    async saveLoadout(userId: string, loadoutData: Partial<Loadout>): Promise<boolean> {
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
