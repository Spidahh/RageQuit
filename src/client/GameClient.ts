import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Client, Room } from 'colyseus.js';
import { ASSET_PATHS } from '../shared/constants/AssetPaths';
import { GameUI } from './ui/GameUI';

export class GameClient {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer; // Type as WebGLRenderer common base for now, though we use WebGPU logic
    private room?: Room;
    private players = new Map<string, THREE.Object3D>();
    private ui: GameUI;

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
        const grid = new THREE.GridHelper(100, 100, 0x444444, 0x111111);
        this.scene.add(grid);

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
            const geometry = new THREE.CapsuleGeometry(0.5, 1.8, 4, 8);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(player.x, player.y + 0.9, player.z);
            mesh.castShadow = true;

            this.scene.add(mesh);
            this.players.set(sessionId, mesh);

            // Listen for updates
            player.onChange(() => {
                mesh.position.set(player.x, player.y + 0.9, player.z);
            });
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
            // TODO: Trigger VFX
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

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        // Mock HUD update for now (until we have real local player state)
        // Ideally this comes from this.room.state.players.get(this.room.sessionId)
        if (this.room && this.room.sessionId) {
            // const me = this.room.state.players.get(this.room.sessionId);
            // if (me) this.ui.updateHUD(me.health, me.maxHealth, ...);

            // Placeholder static update to prove connection
            this.ui.updateHUD(100, 100, 100, 100, 100, 100);
        }
    }

    private onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
