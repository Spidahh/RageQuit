import { ASSET_PATHS } from '../../shared/constants/AssetPaths';

export class GameUI {
    private container: HTMLElement;
    private hudContainer: HTMLElement | null = null;
    private loginContainer: HTMLElement | null = null;

    // HUD Elements
    private hpBar: HTMLElement | null = null;
    private manaBar: HTMLElement | null = null;
    private staminaBar: HTMLElement | null = null;

    constructor() {
        this.container = document.getElementById('app')!;
        if (!this.container) throw new Error('Root #app element not found');

        // Clear existing content (e.g. "Client initialized" text)
        this.container.innerHTML = '';

        this.createStyles();
    }

    public showLogin(onJoin: (username: string) => void) {
        this.loginContainer = document.createElement('div');
        this.loginContainer.id = 'login-overlay';
        this.loginContainer.innerHTML = `
            <div class="login-box">
                <img src="${ASSET_PATHS.UI.BACKGROUNDS.LOGO}" alt="RageQuit Logo" class="logo" />
                <h2>ENTER THE ARENA</h2>
                <input type="text" id="username-input" placeholder="Warrior Name" maxlength="12" />
                <button id="join-btn">FIGHT</button>
            </div>
        `;
        this.container.appendChild(this.loginContainer);

        const btn = document.getElementById('join-btn');
        const input = document.getElementById('username-input') as HTMLInputElement;

        const handleJoin = () => {
            const name = input.value.trim() || 'Anon_Warrior';
            onJoin(name);
        };

        btn?.addEventListener('click', handleJoin);
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleJoin();
        });
    }

    public hideLogin() {
        if (this.loginContainer) {
            this.loginContainer.remove();
            this.loginContainer = null;
        }
    }

    public showHUD() {
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'game-hud';
        this.hudContainer.innerHTML = `
            <div class="status-bars">
                <div class="bar-container hp">
                    <div class="bar-fill" id="hp-fill" style="width: 100%;"></div>
                    <img src="${ASSET_PATHS.UI.HUD.HP_BAR}" class="bar-frame" />
                </div>
                <div class="bar-container mana">
                    <div class="bar-fill" id="mana-fill" style="width: 100%;"></div>
                    <img src="${ASSET_PATHS.UI.HUD.MANA_BAR}" class="bar-frame" />
                </div>
                <div class="bar-container stamina">
                    <div class="bar-fill" id="stamina-fill" style="width: 100%;"></div>
                    <img src="${ASSET_PATHS.UI.HUD.STAMINA_BAR}" class="bar-frame" />
                </div>
            </div>
            <div class="crosshair">
                <img src="${ASSET_PATHS.UI.HUD.CROSSHAIR}" />
            </div>
        `;
        this.container.appendChild(this.hudContainer);

        this.hpBar = document.getElementById('hp-fill');
        this.manaBar = document.getElementById('mana-fill');
        this.staminaBar = document.getElementById('stamina-fill');
    }

    public updateHUD(hp: number, maxHp: number, mana: number, maxMana: number, stamina: number, maxStamina: number) {
        if (this.hpBar) this.hpBar.style.width = `${(hp / maxHp) * 100}%`;
        if (this.manaBar) this.manaBar.style.width = `${(mana / maxMana) * 100}%`;
        if (this.staminaBar) this.staminaBar.style.width = `${(stamina / maxStamina) * 100}%`;
    }

    private createStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            #login-overlay {
                position: absolute;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background: url('${ASSET_PATHS.UI.BACKGROUNDS.MAIN_MENU}') no-repeat center center/cover;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .login-box {
                background: rgba(0, 0, 0, 0.85);
                padding: 2rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                border: 2px solid #555;
                box-shadow: 0 0 20px rgba(0,0,0,0.8);
            }
            .logo {
                max-width: 300px;
                margin-bottom: 2rem;
            }
            h2 {
                color: #fff;
                font-family: 'Courier New', Courier, monospace;
                margin-bottom: 1rem;
            }
            input {
                background: #111;
                border: 1px solid #333;
                color: #fff;
                padding: 10px;
                font-size: 1.2rem;
                width: 100%;
                margin-bottom: 1rem;
                text-align: center;
            }
            button {
                background: #8b0000;
                color: #fff;
                border: none;
                padding: 10px 30px;
                font-size: 1.2rem;
                cursor: pointer;
                border: 1px solid #ff4444;
                transition: all 0.2s;
            }
            button:hover {
                background: #bd0000;
                transform: scale(1.05);
            }

            /* HUD */
            #game-hud {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                pointer-events: none;
                z-index: 100;
            }
            .status-bars {
                position: absolute;
                top: 20px;
                left: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .bar-container {
                position: relative;
                width: 300px;
                height: 20px;
                background: #111;
                border: 1px solid #333;
            }
            .bar-fill {
                height: 100%;
                transition: width 0.1s linear;
            }
            .hp .bar-fill { background: #b00; }
            .mana .bar-fill { background: #00b; }
            .stamina .bar-fill { background: #0b0; }
            
            .bar-frame {
                position: absolute;
                top: -2px; left: -2px;
                width: calc(100% + 4px);
                height: calc(100% + 4px);
                pointer-events: none;
            }

            .crosshair {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
}
