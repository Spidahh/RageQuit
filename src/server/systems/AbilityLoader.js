import { supabase } from '../services/SupabaseService';
class AbilityLoaderClass {
    cache = new Map();
    loaded = false;
    async loadAll() {
        if (this.loaded)
            return;
        try {
            const { data, error } = await supabase
                .from('ability_database')
                .select('*');
            if (error)
                throw error;
            data?.forEach((ability) => {
                this.cache.set(ability.id, ability);
            });
            this.loaded = true;
            console.log(`✅ Loaded ${this.cache.size} abilities from database`);
        }
        catch (error) {
            console.error('❌ Failed to load abilities:', error);
            throw error;
        }
    }
    get(id) {
        return this.cache.get(id);
    }
    getAll() {
        return Array.from(this.cache.values());
    }
}
export const AbilityLoader = new AbilityLoaderClass();
