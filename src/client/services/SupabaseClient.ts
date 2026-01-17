import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vgtyecaegcjhewkuusal.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndHllY2FlZ2NqaGV3a3V1c2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDI1ODIsImV4cCI6MjA4MzkxODU4Mn0.fJWndS89ekpWp2CIPnF-MK4A-D-XrMhZA5oQULHcB60';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
export async function testConnection() {
    const { data, error } = await supabase.from('ability_database').select('count');
    if (error) {
        console.error('❌ Supabase connection failed:', error);
    } else {
        console.log('✅ Supabase connected successfully');
    }
}
