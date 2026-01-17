import { ASSET_PATHS } from '../../shared/constants/AssetPaths';

export class SoundManager {
    private static instance: SoundManager;
    private music: HTMLAudioElement | null = null;
    private sfxCache: Map<string, HTMLAudioElement> = new Map();
    private isMuted: boolean = false;
    private musicVolume: number = 0.3;
    private sfxVolume: number = 0.5;

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    /**
     * Preload critical SFX files
     */
    public async preload() {
        // Preload UI SFX
        await this.loadSFX('UI_CLICK', ASSET_PATHS.AUDIO.SFX.UI_CLICK);
        await this.loadSFX('UI_HOVER', ASSET_PATHS.AUDIO.SFX.UI_HOVER);

        // Preload Music (don't decode yet, just ready the object)
        // Music is usually streamed or loaded on demand
    }

    private async loadSFX(key: string, url: string): Promise<void> {
        return new Promise((resolve) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.oncanplaythrough = () => resolve();
            audio.onerror = () => {
                console.warn(`Failed to load SFX: ${url}`);
                resolve(); // Don't block
            };
            this.sfxCache.set(key, audio);
        });
    }

    public playMusic(url: string, loop: boolean = true) {
        if (this.isMuted) return;

        // Stop existing music
        if (this.music) {
            this.music.pause();
            this.music = null;
        }

        this.music = new Audio(url);
        this.music.loop = loop;
        this.music.volume = this.musicVolume;
        this.music.play().catch(e => console.warn("Audio play failed (user interaction required):", e));
    }

    public stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music = null;
        }
    }

    public playSFX(key: string) {
        if (this.isMuted) return;

        const audio = this.sfxCache.get(key);
        if (audio) {
            // Clone node to allow overlapping sounds of same type
            const clone = audio.cloneNode() as HTMLAudioElement;
            clone.volume = this.sfxVolume;
            clone.play().catch(() => { });
        } else {
            // Try to find if key matches a direct URL (optional fallback)
            console.warn(`SFX not found: ${key}`);
        }
    }

    // Specialized play method for URL directly (for rarely used sounds)
    public playSFXOneShot(url: string) {
        if (this.isMuted) return;
        const audio = new Audio(url);
        audio.volume = this.sfxVolume;
        audio.play().catch(() => { });
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.music) {
            this.music.muted = this.isMuted;
        }
    }
}
