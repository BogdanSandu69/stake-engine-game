// Golden Dragon Deluxe - PIXI.js Frontend
// Stake Engine Slot Game

const API_BASE = 'http://localhost:8000';
let sessionId = null;
let gameState = {
    balance: 1000,
    bet: 1.00,
    lastWin: 0,
    isSpinning: false,
    reels: [[], [], [], [], []],
};

// PIXI Setup
let app;
let reelContainers = [];
const SYMBOL_NAMES = ['cherry', 'lemon', 'orange', 'grapes', 'melon', 'bell', 'seven', 'diamond', 'wild', 'scatter'];
const SYMBOL_COLORS = {
    cherry: 0xff0000,
    lemon: 0xffff00,
    orange: 0xff8800,
    grapes: 0x8800ff,
    melon: 0x00ff00,
    bell: 0xffdd00,
    seven: 0xff00ff,
    diamond: 0x00ffff,
    wild: 0xffd700,
    scatter: 0xff69b4
};

const SYMBOL_EMOJIS = {
    cherry: '🍒',
    lemon: '🍋',
    orange: '🍊',
    grapes: '🍇',
    melon: '🍈',
    bell: '🔔',
    seven: '7️⃣',
    diamond: '💎',
    wild: '⭐',
    scatter: '✨'
};

// Initialize PIXI App
async function initPixi() {
    try {
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.id = 'pixi-canvas';
        canvas.width = 900;
        canvas.height = 400;
        canvas.style.border = '3px solid #ffd700';
        canvas.style.borderRadius = '10px';

        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) {
            console.error('❌ gameContainer not found');
            return;
        }
        gameContainer.innerHTML = '';
        gameContainer.appendChild(canvas);

        // Initialize PIXI app with canvas
        app = new PIXI.Application({
            view: canvas,
            width: 900,
            height: 400,
            backgroundColor: 0x0a0e27,
            antialias: true,
            resolution: 1
        });

        console.log('✅ PIXI app initialized');
        createReels();
        await initGame();
    } catch (error) {
        console.error('❌ PIXI initialization error:', error);
        showError('Failed to initialize game: ' + error.message);
    }
}

// Create Reel Containers
function createReels() {
    const reelWidth = 120;
    const reelHeight = 300;
    const startX = 40;
    const startY = 50;
    const spacing = 150;

    for (let i = 0; i < 5; i++) {
        const container = new PIXI.Container();
        container.x = startX + i * spacing;
        container.y = startY;

        // Reel background
        const bg = new PIXI.Graphics();
        bg.beginFill(0x1a1a2e);
        bg.drawRect(0, 0, reelWidth, reelHeight);
        bg.endFill();
        bg.lineStyle(2, 0xe94560);
        bg.drawRect(0, 0, reelWidth, reelHeight);
        container.addChild(bg);

        // Symbols container with mask
        const symbolContainer = new PIXI.Container();
        symbolContainer.x = 0;
        symbolContainer.y = 0;

        // Add 3 initial symbols
        for (let j = 0; j < 3; j++) {
            const symbol = createSymbol('cherry', j);
            symbol.x = reelWidth / 2;
            symbol.y = j * 100 + 50;
            symbolContainer.addChild(symbol);
        }

        container.addChild(symbolContainer);

        // Add mask
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, reelWidth, reelHeight);
        mask.endFill();
        symbolContainer.mask = mask;

        app.stage.addChild(container);
        reelContainers.push({
            container,
            symbolContainer,
            bg,
            reelWidth,
            reelHeight,
            symbols: []
        });
    }

    console.log('✅ Reels created:', reelContainers.length);
}

// Create Symbol with PIXI Text
function createSymbol(symbolName, index = 0) {
    const container = new PIXI.Container();
    const size = 80;

    // Background circle
    const bg = new PIXI.Graphics();
    bg.beginFill(SYMBOL_COLORS[symbolName]);
    bg.drawCircle(0, 0, 35);
    bg.endFill();
    bg.lineStyle(2, 0xffffff);
    bg.drawCircle(0, 0, 35);
    container.addChild(bg);

    // Symbol text/emoji
    const text = new PIXI.Text(SYMBOL_EMOJIS[symbolName] || symbolName.charAt(0).toUpperCase(), {
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 0xffffff,
        fontWeight: 'bold',
        align: 'center'
    });
    text.anchor.set(0.5, 0.5);
    text.x = 0;
    text.y = 0;
    container.addChild(text);

    container.width = size;
    container.height = size;

    return container;
}

// Initialize Game Session
async function initGame() {
    try {
        const response = await fetch(`${API_BASE}/api/wallet/init`, { method: 'POST' });
        const data = await response.json();
        sessionId = data.session_id;
        gameState.balance = data.balance;
        updateUI();
        console.log('✅ Game initialized:', sessionId);
        
        // Display initial reels
        displayInitialReels();
    } catch (error) {
        console.error('❌ Game init error:', error);
        showError('Failed to initialize game: ' + error.message);
    }
}

// Display Initial Reels
function displayInitialReels() {
    const initialSymbols = ['cherry', 'lemon', 'orange', 'grapes', 'melon'];
    
    for (let i = 0; i < 5; i++) {
        const reel = reelContainers[i];
        reel.symbolContainer.removeChildren();

        for (let j = 0; j < 3; j++) {
            const symbol = createSymbol(initialSymbols[i], j);
            symbol.x = reel.reelWidth / 2;
            symbol.y = j * 100 + 50;
            reel.symbolContainer.addChild(symbol);
        }
    }
    
    console.log('✅ Initial reels displayed');
}

// Spin Function
async function spin() {
    if (gameState.isSpinning) return;
    if (gameState.balance < gameState.bet) {
        showError('Insufficient balance!');
        return;
    }

    gameState.isSpinning = true;
    document.getElementById('spinBtn').disabled = true;

    try {
        // Animate spinning reels
        await animateReels();

        // Call API
        const response = await fetch(`${API_BASE}/api/game/spin/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bet: gameState.bet })
        });

        const result = await response.json();
        console.log('📊 Spin result:', result);

        if (result.status === 'success') {
            gameState.balance = result.new_balance;
            gameState.lastWin = result.total_win;
            gameState.reels = result.reels;

            // Display result reels
            displayReels(result.reels);

            if (result.total_win > 0) {
                showSuccess(`🎉 WIN! +$${result.total_win.toFixed(2)}`);
            } else {
                showError('No win this time...');
            }
        } else {
            showError(result.error || 'Spin failed');
        }
    } catch (error) {
        console.error('❌ Spin error:', error);
        showError('Spin error: ' + error.message);
    }

    updateUI();
    gameState.isSpinning = false;
    document.getElementById('spinBtn').disabled = false;
}

// Animate Reels
async function animateReels() {
    const spinDuration = 0.6;
    const promises = [];

    for (let i = 0; i < reelContainers.length; i++) {
        const reel = reelContainers[i];
        const delay = i * 0.15;

        promises.push(
            new Promise(resolve => {
                setTimeout(() => {
                    if (typeof gsap !== 'undefined') {
                        gsap.to(reel.symbolContainer, {
                            y: -300,
                            duration: spinDuration,
                            ease: 'back.out',
                            onComplete: () => {
                                reel.symbolContainer.y = 0;
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                }, delay * 1000);
            })
        );
    }

    return Promise.all(promises);
}

// Display Reels Result
function displayReels(reels) {
    console.log('🎰 Displaying reels:', reels);
    
    for (let i = 0; i < 5 && i < reels.length; i++) {
        const reel = reelContainers[i];
        const reelSymbols = reels[i];

        // Clear old symbols
        reel.symbolContainer.removeChildren();

        // Add new symbols
        for (let j = 0; j < 3 && j < reelSymbols.length; j++) {
            const symbolName = reelSymbols[j];
            const symbol = createSymbol(symbolName, j);
            symbol.x = reel.reelWidth / 2;
            symbol.y = j * 100 + 50;
            reel.symbolContainer.addChild(symbol);
            console.log(`  Reel ${i}, Position ${j}: ${symbolName}`);
        }
    }
}

// Update UI
function updateUI() {
    const balanceEl = document.getElementById('balanceDisplay');
    const betEl = document.getElementById('betDisplay');
    const winEl = document.getElementById('winDisplay');

    if (balanceEl) balanceEl.textContent = `$${gameState.balance.toFixed(2)}`;
    if (betEl) betEl.textContent = `$${gameState.bet.toFixed(2)}`;
    if (winEl) winEl.textContent = `$${gameState.lastWin.toFixed(2)}`;
    
    const betInput = document.getElementById('betInput');
    if (betInput) betInput.value = gameState.bet.toFixed(2);
}

// Setup Event Listeners
function setupEventListeners() {
    const betInput = document.getElementById('betInput');
    if (betInput) {
        betInput.addEventListener('change', (e) => {
            let bet = parseFloat(e.target.value);
            if (isNaN(bet) || bet < 0.10) bet = 0.10;
            if (bet > 100) bet = 100;
            gameState.bet = bet;
            updateUI();
        });
    }

    const betDownBtn = document.getElementById('betDownBtn');
    if (betDownBtn) {
        betDownBtn.addEventListener('click', () => {
            gameState.bet = Math.max(0.10, gameState.bet - 0.10);
            updateUI();
        });
    }

    const betUpBtn = document.getElementById('betUpBtn');
    if (betUpBtn) {
        betUpBtn.addEventListener('click', () => {
            gameState.bet = Math.min(100, gameState.bet + 0.10);
            updateUI();
        });
    }

    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.addEventListener('click', spin);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_BASE}/api/game/reset/${sessionId}`, { method: 'POST' });
                const data = await response.json();
                if (data.status === 'success') {
                    gameState.balance = 1000;
                    gameState.lastWin = 0;
                    gameState.bet = 1.00;
                    updateUI();
                    displayInitialReels();
                    showSuccess('Game reset!');
                }
            } catch (error) {
                showError('Reset failed: ' + error.message);
            }
        });
    }
}

// Message Helpers
function showError(msg) {
    const el = document.getElementById('errorMsg');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 3000);
    }
}

function showSuccess(msg) {
    const el = document.getElementById('successMsg');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => el.style.display = 'none', 3000);
    }
}

// Start Game when DOM is ready
console.log('🎰 Script loaded, waiting for DOM...');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎰 DOM loaded, initializing game...');
        setupEventListeners();
        initPixi();
    });
} else {
    console.log('🎰 DOM already loaded, initializing game...');
    setupEventListeners();
    initPixi();
}
