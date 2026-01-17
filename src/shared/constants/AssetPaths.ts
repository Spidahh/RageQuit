// ============================================
// RAGEQUIT - Asset Path Constants
// ============================================
// CDN paths for all game assets (lowercase, Supabase Storage)

// Use process.env for Node.js or hardcoded fallback
const CDN_BASE = 'https://vgtyecaegcjhewkuusal.supabase.co/storage/v1/object/public/ragequit-assets';

export const ASSET_PATHS = {
    // Characters
    MODELS: {
        CHARACTERS: {
            PLAYER: `${CDN_BASE}/characters/player`,
            BOT: `${CDN_BASE}/characters/bot`,
        },
        WEAPONS: {
            SWORD: `${CDN_BASE}/weapons/meshes/sk_weapon_sword.fbx`,
            BOW: `${CDN_BASE}/weapons/meshes/sk_weapon_bow.fbx`,
            STAFF: `${CDN_BASE}/weapons/meshes/sk_weapon_staff.fbx`,
        },
    },

    // Animations (all lowercase)
    ANIMATIONS: {
        PLAYER: {
            IDLE: `${CDN_BASE}/characters/player/animations/a_idle_relaxed.fbx`,
            RUN: `${CDN_BASE}/characters/player/animations/a_run_forward.fbx`,
            JUMP: `${CDN_BASE}/characters/player/animations/a_jump.fbx`,
            CAST_FIRE: `${CDN_BASE}/characters/player/animations/a_cast_fire_01.fbx`,
            BOW_SHOOT: `${CDN_BASE}/characters/player/animations/a_bow_shoot_light.fbx`,
            HIT_LIGHT: `${CDN_BASE}/characters/player/animations/a_hit_react_light.fbx`,
            HIT_HEAVY: `${CDN_BASE}/characters/player/animations/a_hit_react_heavy.fbx`,
        },
        BOT: {
            IDLE: `${CDN_BASE}/characters/bot/animations/a_mutant_idle_01.fbx`,
            RUN: `${CDN_BASE}/characters/bot/animations/a_mutant_run.fbx`,
            ATTACK: `${CDN_BASE}/characters/bot/animations/a_mutant_attack.fbx`,
            DEATH: `${CDN_BASE}/characters/bot/animations/a_mutant_death.fbx`,
        },
    },

    // Audio
    AUDIO: {
        MUSIC: {
            MAIN_MENU: `${CDN_BASE}/audio/music/m_theme_mainmenu.ogg`,
            LOBBY: `${CDN_BASE}/audio/music/m_theme_lobby.ogg`,
            ARENA: `${CDN_BASE}/audio/music/m_theme_arena.ogg`,
        },
        SFX: {
            UI_CLICK: `${CDN_BASE}/audio/sfx_ui/s_ui_click_confirm.wav`,
            UI_HOVER: `${CDN_BASE}/audio/sfx_ui/s_ui_hover.ogg`,
        },
    },

    // UI Textures
    UI: {
        BACKGROUNDS: {
            MAIN_MENU: `${CDN_BASE}/ui/textures/backgrounds/t_bg_mainmenu.png`,
            LOBBY: `${CDN_BASE}/ui/textures/backgrounds/t_bg_lobby.png`,
            LOADING: `${CDN_BASE}/ui/textures/backgrounds/t_bg_loading_arena.png`,
            LOGO: `${CDN_BASE}/ui/textures/backgrounds/t_logo_main_full.png`,
        },
        ICONS: {
            ABILITIES: `${CDN_BASE}/ui/textures/icons/abilities`,
        },
        HUD: {
            HP_BAR: `${CDN_BASE}/ui/textures/hud/t_ui_bar_hp.png`,
            MANA_BAR: `${CDN_BASE}/ui/textures/hud/t_ui_bar_mana.png`,
            STAMINA_BAR: `${CDN_BASE}/ui/textures/hud/t_ui_bar_stamina.png`,
            CROSSHAIR: `${CDN_BASE}/ui/textures/hud/t_ui_crosshair_default.png`,
        },
    },

    // VFX (all PNG after TGA conversion)
    VFX: {
        IMPACTS: {
            FIRE: `${CDN_BASE}/vfx/p_impact_fire.png`,
            ICE: `${CDN_BASE}/vfx/p_impact_ice.png`,
            LIGHTNING: `${CDN_BASE}/vfx/p_impact_lightning.png`,
            DARK: `${CDN_BASE}/vfx/p_impact_dark.png`,
            NATURE: `${CDN_BASE}/vfx/p_impact_nature.png`,
        },
        PROJECTILES: {
            FIRE: `${CDN_BASE}/vfx/p_projectile_fire.png`,
            ICE: `${CDN_BASE}/vfx/p_projectile_ice.png`,
            LIGHTNING: `${CDN_BASE}/vfx/p_projectile_lightning.png`,
            DARK: `${CDN_BASE}/vfx/p_projectile_dark.png`,
            NATURE: `${CDN_BASE}/vfx/p_projectile_nature.png`,
        },
        DOT: {
            BLEED: `${CDN_BASE}/vfx/p_bleed_dot.png`,
            BURN: `${CDN_BASE}/vfx/p_fire_burn_dot.png`,
            POISON: `${CDN_BASE}/vfx/p_nature_poison_dot.png`,
        },
        MISC: {
            PARRY_SUCCESS: `${CDN_BASE}/vfx/p_parry_success.png`,
            STUN_EFFECT: `${CDN_BASE}/vfx/p_light_stun_effect.png`,
        },
    },

    // Maps
    MAPS: {
        GLADIATORS_ARENA: `${CDN_BASE}/maps/gladiators_arena/gladiators_arena.glb`,
    },
} as const;

// Helper function to get ability icon path
export function getAbilityIconPath(abilityId: string): string {
    return `${ASSET_PATHS.UI.ICONS.ABILITIES}/t_icon_ability_${abilityId.toLowerCase()}.png`;
}

// Helper to get player mesh path
export function getPlayerMeshPath(): string {
    return `${ASSET_PATHS.MODELS.CHARACTERS.PLAYER}/sk_player_character.fbx`;
}

// Helper to get bot mesh path
export function getBotMeshPath(): string {
    return `${ASSET_PATHS.MODELS.CHARACTERS.BOT}/sk_bot_mutant.fbx`;
}
