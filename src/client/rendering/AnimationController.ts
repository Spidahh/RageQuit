import * as THREE from 'three';
import { ASSET_PATHS } from '../../shared/constants/AssetPaths';

export class AnimationController {
    private mixer: THREE.AnimationMixer;
    private actions: Map<string, THREE.AnimationAction> = new Map();
    private activeAction: THREE.AnimationAction | null = null;
    private model: THREE.Object3D;

    constructor(model: THREE.Object3D) {
        this.model = model;
        this.mixer = new THREE.AnimationMixer(model);
    }

    // Pre-load all animations defined for the character type
    async loadAnimations(loader: any, type: 'PLAYER' | 'BOT') {
        const paths = type === 'PLAYER' ? ASSET_PATHS.ANIMATIONS.PLAYER : ASSET_PATHS.ANIMATIONS.BOT;

        // Map of logical names to file paths
        const animMap = Object.entries(paths);

        for (const [name, path] of animMap) {
            try {
                const clip = await this.loadClip(loader, path as string);
                if (clip) {
                    const action = this.mixer.clipAction(clip);
                    this.actions.set(name, action);
                }
            } catch (e) {
                console.warn(`⚠️ Failed to load animation: ${name} (${path})`, e);
            }
        }
    }

    private async loadClip(loader: any, url: string): Promise<THREE.AnimationClip | null> {
        // Note: FBXLoader returns a Group, we need to extract the animation clip
        const group = await loader.loadAsync(url);
        if (group.animations && group.animations.length > 0) {
            return group.animations[0];
        }
        return null;
    }

    play(name: string, fadeDuration: number = 0.2) {
        // Find the action, fallback to IDLE if not found, or warn
        let nextAction = this.actions.get(name);

        // Fallback logic
        if (!nextAction) {
            // Try finding 'IDLE' key loosely
            const idleKey = Array.from(this.actions.keys()).find(k => k.includes('IDLE'));
            if (idleKey) nextAction = this.actions.get(idleKey);
        }

        if (!nextAction) {
            // console.warn(`Animation action '${name}' not found`);
            return;
        }

        if (nextAction === this.activeAction) return;

        if (this.activeAction) {
            this.activeAction.fadeOut(fadeDuration);
        }

        nextAction.reset().fadeIn(fadeDuration).play();
        this.activeAction = nextAction;
    }

    update(dt: number) {
        this.mixer.update(dt);
    }
}
