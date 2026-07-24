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
let symbolSprites = [];
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

// Initialize PIXI App
async function initPixi() {
    app = new PIXI.Application({
        width: 900,
        height: 400,
        backgroundColor: 0x0a0e27,
        antialias: true
    });

    document.getElementById('gameCanvas').parentNode.insertBefore(app.view, document.getElementById('gameCanvas'));
    document.getElementById('gameCanvas').style.display = 'none';

    createReels();
    await initGame();
}

// Create Reel Containers
function createReels() {
    const reelWidth = 140;
    const reelHeight = 300;
    const startX = 50;
    const startY = 50;
    const spacing = 160;

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

        // Symbols in reel
        const symbolContainer = new PIXI.Container();
        symbolContainer.x = 0;
        symbolContainer.y = 0;
        symbolContainer.mask = bg;

        for (let j = 0; j < 3; j++) {
            const symbol = createSymbol('cherry');
            symbol.y = j * 100;
            symbolContainer.addChild(symbol);
        }

        container.addChild(symbolContainer);
        app.stage.addChild(container);
        reelContainers.push({
            container,
            symbolContainer,
            symbols: []
        });
    }
}

// Create Symbol Sprite
function createSymbol(symbolName) {
    const graphics = new PIXI.Graphics();
    const color = SYMBOL_COLORS[symbolName] || 0xffd700;

    // Draw circle
    graphics.beginFill(color);
    graphics.drawCircle(0, 0, 45);
    graphics.endFill();

    // Add border
    graphics.lineStyle(3, 0xffffff);
    graphics.drawCircle(0, 0, 45);

    // Add text
    const text = new PIXI.Text(symbolName.charAt(0).toUpperCase(), {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    graphics.addChild(text);

    graphics.width = 90;
    graphics.height = 90;

    return graphics;
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
    } catch (error) {
        showError('Failed to initialize game: ' + error.message);
    }
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

        if (result.status === 'success') {
            gameState.balance = result.new_balance;
            gameState.lastWin = result.total_win;
            gameState.reels = result.reels;

            // Display result
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
        showError('Spin error: ' + error.message);
    }

    updateUI();
    gameState.isSpinning = false;
    document.getElementById('spinBtn').disabled = false;
}

// Animate Reels
async function animateReels() {
    const spinDuration = 0.5; // seconds
    const promises = [];

    for (let i = 0; i < reelContainers.length; i++) {
        const reel = reelContainers[i];
        const delay = i * 0.1; // Stagger reels

        promises.push(
            new Promise(resolve => {
                setTimeout(() => {
                    gsap.to(reel.symbolContainer, {
                        y: 300,
                        duration: spinDuration,
                        ease: 'back.out',
                        onComplete: resolve
                    });
                }, delay * 1000);
            })
        );
    }

    return Promise.all(promises);
}

// Display Reels Result
function displayReels(reels) {
    for (let i = 0; i < 5; i++) {
        const reel = reelContainers[i];
        const reelSymbols = reels[i];

        // Clear old symbols
        reel.symbolContainer.removeChildren();

        // Add new symbols
        for (let j = 0; j < 3; j++) {
            const symbol = createSymbol(reelSymbols[j]);
            symbol.y = j * 100;
            reel.symbolContainer.addChild(symbol);
        }

        // Reset position
        reel.symbolContainer.y = 0;
    }
}

// Update UI
function updateUI() {
    document.getElementById('balanceDisplay').textContent = `$${gameState.balance.toFixed(2)}`;
    document.getElementById('betDisplay').textContent = `$${gameState.bet.toFixed(2)}`;
    document.getElementById('winDisplay').textContent = `$${gameState.lastWin.toFixed(2)}`;
    document.getElementById('betInput').value = gameState.bet.toFixed(2);
}

// Bet Controls
document.getElementById('betInput').addEventListener('change', (e) => {
    let bet = parseFloat(e.target.value);
    if (isNaN(bet) || bet < 0.10) bet = 0.10;
    if (bet > 100) bet = 100;
    gameState.bet = bet;
    updateUI();
});

document.getElementById('betDownBtn').addEventListener('click', () => {
    gameState.bet = Math.max(0.10, gameState.bet - 0.10);
    updateUI();
});

document.getElementById('betUpBtn').addEventListener('click', () => {
    gameState.bet = Math.min(100, gameState.bet + 0.10);
    updateUI();
});

document.getElementById('spinBtn').addEventListener('click', spin);

document.getElementById('resetBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_BASE}/api/game/reset/${sessionId}`, { method: 'POST' });
        gameState.balance = 1000;
        gameState.lastWin = 0;
        gameState.bet = 1.00;
        updateUI();
        showSuccess('Game reset!');
    } catch (error) {
        showError('Reset failed: ' + error.message);
    }
});

// Message Helpers
function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

function showSuccess(msg) {
    const el = document.getElementById('successMsg');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

// Start Game
document.addEventListener('DOMContentLoaded', initPixi);
