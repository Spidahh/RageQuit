import { supabase } from '../services/SupabaseService';

interface AbilityData {
    id: string;
    name: string;
    type: 'melee' | 'bow' | 'magic' | 'utility';
    damage: number;
    mana_cost: number;
    stamina_cost: number;
    cooldown: number;
    effects: any[];
}

class AbilityLoaderClass {
    private cache: Map<string, AbilityData> = new Map();
    private loaded = false;

    async loadAll(): Promise<void> {
        if (this.loaded) return;

        try {
            const { data, error } = await supabase
                .from('ability_database')
                .select('*');

            if (error) throw error;

            data?.forEach((ability: AbilityData) => {
                this.cache.set(ability.id, ability);
            });

            this.loaded = true;
            console.log(`✅ Loaded ${this.cache.size} abilities from database`);
        } catch (error) {
            console.error('❌ Failed to load abilities:', error);
            throw error;
        }
    }

    get(id: string): AbilityData | undefined {
        return this.cache.get(id);
    }

    getAll(): AbilityData[] {
        return Array.from(this.cache.values());
    }
}

export const AbilityLoader = new AbilityLoaderClass();
