import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Client, Room } from 'colyseus.js';
import { ASSET_PATHS } from '../shared/constants/AssetPaths';
import { GameUI } from './ui/GameUI';
import { VFXSystem } from './rendering/VFXSystem';
import { SoundManager } from './audio/SoundManager'; // Verify import

export class GameClient {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer; // Type as WebGLRenderer common base for now, though we use WebGPU logic
    private room?: Room;
    private players = new Map<string, THREE.Object3D>();
    private ui: GameUI;
    private vfx!: VFXSystem;


    // Asset loaders
    private fbxLoader = new FBXLoader();
    private gltfLoader = new GLTFLoader();

    constructor(ui: GameUI) {
        this.ui = ui;
        // Resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    async init() {
        console.log('🚀 Initializing GameClient...');
        await this.setupThreeJS();
        await this.setupColyseus();
        this.setupInput();
        this.animate();
    }

    private async setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 100);

        // Camera
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvas) throw new Error('Game Canvas not found');

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 12, 12);
        this.camera.lookAt(0, 0, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({
                color: 0x222222,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid Helper
        // Grid Helper
        const grid = new THREE.GridHelper(100, 100, 0x444444, 0x111111);
        this.scene.add(grid);

        // Initialize VFX
        this.vfx = new VFXSystem(this.scene);
        await this.vfx.preload();

        // Audio Init
        await SoundManager.getInstance().preload();
        SoundManager.getInstance().playMusic(ASSET_PATHS.AUDIO.MUSIC.ARENA);

        // Renderer Initialization
        await this.initRenderer(canvas);
    }

    private async initRenderer(canvas: HTMLCanvasElement) {
        // Try WebGPU first (if available in this Three.js version and browser)
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    // Dynamic import for WebGPU
                    // @ts-ignore
                    const { WebGPURenderer } = await import('three/webgpu');
                    this.renderer = new WebGPURenderer({
                        canvas,
                        antialias: true
                    }) as any;

                    console.log('✅ WebGPU Renderer initialized');
                    return;
                }
            } catch (e) {
                console.warn('⚠️ WebGPU init failed, falling back to WebGL2', e);
            }
        }

        // WebGL2 Fallback
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        console.log('🟡 WebGL2 Renderer initialized');

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    private async setupColyseus() {
        console.log('🔌 Connecting to Colyseus...');
        // Use WSS for production, WS for local. Auto-detect logic or hardcode.
        // Easiest stable fix: Check protocol.
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname === 'localhost' ? 'localhost:2567' : window.location.host;
        const url = `${protocol}://${host}`;

        // For Railway, we need to be careful. The colyseus server is on the SAME URL as the client (since we serve static).
        // So window.location.host is correct.

        console.log('Connecting to:', url);
        const client = new Client(url);

        try {
            this.room = await client.joinOrCreate('game_room', {
                username: (window as any).currentUser || 'Player'
            });
            console.log('✅ Joined room:', this.room.name);
        } catch (e) {
            console.error('❌ Join error:', e);
            return;
        }

        // State Synchronization
        this.room.state.players.onAdd((player: any, sessionId: string) => {
            console.log('👤 Player joined:', sessionId);

            // Visual placeholder
            let mesh: THREE.Object3D;

            if (player.isBot) {
                // Bot (Blue Capsule)
                const geometry = new THREE.CapsuleGeometry(0.6, 2.0, 4, 8);
                const material = new THREE.MeshStandardMaterial({ color: 0x4169E1 }); // Cobalt
                mesh = new THREE.Mesh(geometry, material);
            } else {
                // Player (Red Capsule)
                const geometry = new THREE.CapsuleGeometry(0.5, 1.8, 4, 8);
                const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Crimson
                mesh = new THREE.Mesh(geometry, material);
            }

            mesh.position.set(player.x, player.y + 0.9, player.z);
            mesh.castShadow = true;

            this.scene.add(mesh);
            this.players.set(sessionId, mesh);

            // Listen for updates
            player.onChange(() => {
                // Interpolation Target
                if (!mesh.userData.targetPos) mesh.userData.targetPos = new THREE.Vector3();
                mesh.userData.targetPos.set(player.x, player.y + 0.9, player.z);

                // Update Rotation
                if (player.rotationY) mesh.rotation.y = player.rotationY;

                // Handle Death/Respawn Visibility
                if (player.isAlive) {
                    mesh.visible = true;
                } else {
                    mesh.visible = false;
                    // TODO: Play death particle/sound
                }

                // If this is ME, update HUD
                if (sessionId === this.room?.sessionId) {
                    this.ui.updateHUD(
                        player.hp, player.maxHp,
                        player.mana, player.maxMana,
                        player.stamina, player.maxStamina
                    );

                    if (!player.isAlive) {
                        console.log("💀 You are dead. Respawning...");
                        this.ui.showDeathScreen();
                    }
                }
            });

            // Initial Death Check
            mesh.visible = player.isAlive;

            // Initial HUD Update for ME
            if (sessionId === this.room?.sessionId) {
                this.ui.updateHUD(
                    player.hp, player.maxHp,
                    player.mana, player.maxMana,
                    player.stamina, player.maxStamina
                );
            }
        });

        this.room.state.players.onRemove((player: any, sessionId: string) => {
            console.log('👋 Player left:', sessionId);
            const mesh = this.players.get(sessionId);
            if (mesh) {
                this.scene.remove(mesh);
                this.players.delete(sessionId);
            }
        });

        // Handle ability effects (Visuals only for now)
        this.room.onMessage('ability_cast', (message: any) => {
            console.log('✨ Ability cast:', message);

            // message: { casterId, abilityId, x, z, ... }
            const pos = new THREE.Vector3(message.x, 1, message.z);

            let vfxType: 'FIREBALL' | 'ICE_SHARD' | 'GENERIC' = 'GENERIC';

            // Map Ability ID to VFX Type
            if (message.abilityId) {
                const id = message.abilityId.toUpperCase();
                if (id.includes('FIRE')) vfxType = 'FIREBALL';
                else if (id.includes('ICE') || id.includes('FROST')) vfxType = 'ICE_SHARD';
            }

            this.vfx.spawnEffect(vfxType, pos);

            // Play SFX (using generic click for now as placeholder, or ideally a dedicated cast sound)
            // TODO: Map Ability to SFX in AssetPaths
            // SoundManager.getInstance().playSFXOneShot(ASSET_PATHS.AUDIO.SFX.UI_CLICK); 
        });
    }

    private setupInput() {
        window.addEventListener('keydown', (e) => {
            if (!this.room) return;

            const speed = 0.5;
            let dx = 0;
            let dz = 0;

            switch (e.key.toLowerCase()) {
                case 'w': dz = -speed; break;
                case 's': dz = speed; break;
                case 'a': dx = -speed; break;
                case 'd': dx = speed; break;
            }

            if (dx !== 0 || dz !== 0) {
                // Simple prediction/client-move for test
                const myMesh = this.players.get(this.room.sessionId);
                if (myMesh) {
                    myMesh.position.x += dx;
                    myMesh.position.z += dz;

                    this.room.send('move', {
                        x: myMesh.position.x,
                        y: 0,
                        z: myMesh.position.z
                    });
                }
            }
        });
    }

    private animate() {
        requestAnimationFrame(this.animate.bind(this));

        const dt = 0.016; // Fixed step for now
        if (this.vfx) this.vfx.update(dt);

        // Interpolate other players
        this.players.forEach((mesh, id) => {
            if (id !== this.room?.sessionId && mesh.userData.targetPos) {
                mesh.position.lerp(mesh.userData.targetPos, 0.1);
            }
        });

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    private onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
