import { supabase } from './services/SupabaseClient';
import { GameClient } from './GameClient';
import { GameUI } from './ui/GameUI';

console.log('🚀 RageQuit Client Booting...');

async function bootstrap() {
  const ui = new GameUI();

  // Check Auth / Connection
  const session = await supabase.auth.getSession();
  console.log('Auth Session:', session.data.session ? 'Active' : 'Guest');

  // Show Login Screen
  ui.showLogin(async (username) => {
    console.log(`⚔️ User joining as: ${username}`);

    // Save username to session/local storage if needed
    (window as any).currentUser = username;

    ui.hideLogin();

    // Initialize Game
    const game = new GameClient(ui);
    await game.init();

    // Show HUD
    ui.showHUD();
  });
}

bootstrap().catch(err => {
  console.error('🔥 Fatal Client Error:', err);
});
