import { supabase } from './services/SupabaseClient';

console.log('RageQuit Client Initializing...');
console.log('Supabase initialized:', !!supabase);

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div>
    <h1>RageQuit</h1>
    <p>Client initialized.</p>
  </div>
`;
