import * as THREE from 'three';
import { ASSET_PATHS } from '../../shared/constants/AssetPaths';

// Types from VFX_SYSTEM_SPECS
export interface VFXConfig {
    texture: string;
    spawnRate: number;
    lifetime: number;
    sizeStart: number;
    sizeEnd: number;
    colorStart: number; // Hex
    colorEnd: number; // Hex
    velocity: number;
    gravity?: number;
    blendMode?: THREE.Blending;
    isBillboard?: boolean;
}

interface Particle {
    mesh: THREE.Object3D; // Sprite or Point
    life: number;
    maxLife: number;
    velocity: THREE.Vector3;
    config: VFXConfig;
}

export class VFXSystem {
    private scene: THREE.Scene;
    private particles: Particle[] = [];
    private textureLoader = new THREE.TextureLoader();
    private textures: Map<string, THREE.Texture> = new Map();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    // Preload common VFX textures
    async preload() {
        // Example: Preload Fire and Ice
        const urls = [
            ASSET_PATHS.VFX.IMPACTS.FIRE,
            ASSET_PATHS.VFX.IMPACTS.ICE,
            ASSET_PATHS.VFX.PROJECTILES.FIRE,
            // Add others as needed
        ];

        for (const url of urls) {
            this.textures.set(url, this.textureLoader.load(url));
        }
    }

    public spawnEffect(type: 'FIREBALL' | 'ICE_SHARD' | 'GENERIC', position: THREE.Vector3) {
        // Mapping types to Configs (simplified from Specs)
        let config: VFXConfig;

        switch (type) {
            case 'FIREBALL':
                config = {
                    texture: ASSET_PATHS.VFX.PROJECTILES.FIRE,
                    spawnRate: 1, // One-shot for now (or burst)
                    lifetime: 0.5,
                    sizeStart: 0.5,
                    sizeEnd: 0.1,
                    colorStart: 0xff6600,
                    colorEnd: 0xff0000,
                    velocity: 5,
                    blendMode: THREE.AdditiveBlending,
                    isBillboard: true
                };
                break;
            case 'ICE_SHARD':
                config = {
                    texture: ASSET_PATHS.VFX.PROJECTILES.ICE,
                    spawnRate: 1,
                    lifetime: 0.5,
                    sizeStart: 0.3,
                    sizeEnd: 0.05,
                    colorStart: 0x88ccff,
                    colorEnd: 0x4488ff,
                    velocity: 5,
                    blendMode: THREE.NormalBlending,
                    isBillboard: true
                };
                break;
            default:
                config = {
                    texture: ASSET_PATHS.VFX.IMPACTS.FIRE, // Fallback
                    spawnRate: 1,
                    lifetime: 0.5,
                    sizeStart: 0.2,
                    sizeEnd: 0.0,
                    colorStart: 0xffffff,
                    colorEnd: 0xffffff,
                    velocity: 2,
                    isBillboard: true
                };
        }

        this.createParticle(config, position);
    }

    private createParticle(config: VFXConfig, position: THREE.Vector3) {
        let texture = this.textures.get(config.texture);
        if (!texture) {
            texture = this.textureLoader.load(config.texture);
            this.textures.set(config.texture, texture);
        }

        const material = new THREE.SpriteMaterial({
            map: texture,
            color: config.colorStart,
            blending: config.blendMode || THREE.NormalBlending,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.setScalar(config.sizeStart);

        this.scene.add(sprite);

        // Random velocity direction for simple explosion/impact
        const dir = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize().multiplyScalar(config.velocity);

        this.particles.push({
            mesh: sprite,
            life: config.lifetime,
            maxLife: config.lifetime,
            velocity: dir,
            config: config
        });
    }

    public update(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            p.mesh.position.addScaledVector(p.velocity, dt);

            // Gravity
            if (p.config.gravity) {
                p.velocity.y += p.config.gravity * dt;
            }

            // Interpolate Size
            const progress = 1 - (p.life / p.maxLife);
            const size = THREE.MathUtils.lerp(p.config.sizeStart, p.config.sizeEnd, progress);
            p.mesh.scale.setScalar(size);

            // Interpolate Color (Basic Opacity fade for now to keep it simple)
            if (p.mesh instanceof THREE.Sprite) {
                p.mesh.material.opacity = 1 - progress; // Fade out
            }
        }
    }
}
