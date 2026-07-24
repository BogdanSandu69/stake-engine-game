// Golden Dragon Deluxe - PIXI.js Frontend (FIXED v4)
// Stake Engine Slot Game - Simple Sprite Approach

const API_BASE = 'http://localhost:8000';
let sessionId = null;
let gameState = {
    balance: 1000,
    bet: 1.00,
    lastWin: 0,
    isSpinning: false,
    reels: [[], [], [], [], []],
};

let app = null;
let reelSprites = [];

const SYMBOLS = {
    cherry: { emoji: '🍒', color: 0xff0000 },
    lemon: { emoji: '🍋', color: 0xffff00 },
    orange: { emoji: '🍊', color: 0xff8800 },
    grapes: { emoji: '🍇', color: 0x8800ff },
    melon: { emoji: '🍈', color: 0x00ff00 },
    bell: { emoji: '🔔', color: 0xffdd00 },
    seven: { emoji: '7️⃣', color: 0xff00ff },
    diamond: { emoji: '💎', color: 0x00ffff },
    wild: { emoji: '⭐', color: 0xffd700 },
    scatter: { emoji: '✨', color: 0xff69b4 }
};

// Initialize Game
async function init() {
    try {
        console.log('🎰 Initializing game...');
        
        const container = document.getElementById('gameContainer');
        if (!container) {
            console.error('❌ gameContainer not found');
            return;
        }

        // Create canvas manually
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 400;
        canvas.style.border = '3px solid #ffd700';
        canvas.style.borderRadius = '10px';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        console.log('✅ Canvas created');

        // Initialize PIXI with manual canvas
        app = new PIXI.Application({
            canvas: canvas,
            width: 900,
            height: 400,
            backgroundColor: 0x0a0e27,
            antialias: true
        });

        console.log('✅ PIXI app created');

        // Create reels
        createReels();

        // Initialize game session
        await initGameSession();
        
        setupEventListeners();
        console.log('✅ Game initialized successfully');
    } catch (error) {
        console.error('❌ Init error:', error);
        showError('Failed to initialize: ' + error.message);
    }
}

// Create Reel Displays
function createReels() {
    const reelX = [80, 230, 380, 530, 680];
    const reelWidth = 120;
    const reelHeight = 320;
    
    for (let i = 0; i < 5; i++) {
        // Reel background
        const reelBg = new PIXI.Graphics();
        reelBg.beginFill(0x1a1a2e);
        reelBg.drawRect(0, 0, reelWidth, reelHeight);
        reelBg.endFill();
        reelBg.lineStyle(2, 0xe94560);
        reelBg.drawRect(0, 0, reelWidth, reelHeight);
        reelBg.x = reelX[i];
        reelBg.y = 40;
        app.stage.addChild(reelBg);

        // Create symbol containers for this reel
        const symbolContainers = [];
        for (let j = 0; j < 3; j++) {
            const symbolSprite = createSymbolSprite('cherry');
            symbolSprite.x = reelX[i] + reelWidth / 2;
            symbolSprite.y = 40 + j * 105 + 60;
            app.stage.addChild(symbolSprite);
            symbolContainers.push(symbolSprite);
        }

        reelSprites.push({
            reelBg,
            reelX: reelX[i],
            reelY: 40,
            symbolContainers: symbolContainers
        });
    }

    console.log('✅ Reels created');
    displayDefaultReels();
}

// Create Symbol Sprite - Simple and Direct
function createSymbolSprite(symbolName) {
    const container = new PIXI.Container();
    
    const symbol = SYMBOLS[symbolName] || SYMBOLS.cherry;
    
    // Background circle
    const circle = new PIXI.Graphics();
    circle.beginFill(symbol.color);
    circle.drawCircle(0, 0, 35);
    circle.endFill();
    circle.lineStyle(3, 0xffffff);
    circle.drawCircle(0, 0, 35);
    container.addChild(circle);

    // Emoji text - using BitmapText for better rendering
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial Black',
        fontSize: 50,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: 0x000000,
        strokeThickness: 2
    });
    
    const text = new PIXI.Text(symbol.emoji, textStyle);
    text.anchor.set(0.5, 0.5);
    text.x = 0;
    text.y = -2;
    container.addChild(text);

    return container;
}

// Display Default Reels
function displayDefaultReels() {
    const defaultSymbols = ['cherry', 'lemon', 'orange', 'grapes', 'melon'];
    
    for (let i = 0; i < 5; i++) {
        const reel = reelSprites[i];
        for (let j = 0; j < 3; j++) {
            const symbolName = defaultSymbols[i];
            
            // Clear old symbol
            reel.symbolContainers[j].removeChildren();
            
            // Create new symbol
            const newSymbol = SYMBOLS[symbolName] || SYMBOLS.cherry;
            
            // Background circle
            const circle = new PIXI.Graphics();
            circle.beginFill(newSymbol.color);
            circle.drawCircle(0, 0, 35);
            circle.endFill();
            circle.lineStyle(3, 0xffffff);
            circle.drawCircle(0, 0, 35);
            reel.symbolContainers[j].addChild(circle);

            // Emoji text
            const textStyle = new PIXI.TextStyle({
                fontFamily: 'Arial Black',
                fontSize: 50,
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: 0x000000,
                strokeThickness: 2
            });
            
            const text = new PIXI.Text(newSymbol.emoji, textStyle);
            text.anchor.set(0.5, 0.5);
            text.x = 0;
            text.y = -2;
            reel.symbolContainers[j].addChild(text);
        }
    }
    console.log('✅ Default reels displayed');
}

// Initialize Game Session
async function initGameSession() {
    try {
        const response = await fetch(`${API_BASE}/api/wallet/init`, { method: 'POST' });
        const data = await response.json();
        sessionId = data.session_id;
        gameState.balance = data.balance;
        updateUI();
        console.log('✅ Session initialized:', sessionId);
    } catch (error) {
        console.error('❌ Session init error:', error);
        showError('Failed to connect to backend: ' + error.message);
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
        // Animate reels spinning
        await animateSpin();

        // Call backend API
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

            // Display result
            displayResultReels(result.reels);

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

// Animate Spin
async function animateSpin() {
    return new Promise(resolve => {
        let frame = 0;
        const totalFrames = 30;
        
        const animate = () => {
            frame++;
            
            // Random symbols while spinning
            for (let i = 0; i < 5; i++) {
                const reel = reelSprites[i];
                for (let j = 0; j < 3; j++) {
                    const symbolNames = Object.keys(SYMBOLS);
                    const randomSymbol = symbolNames[Math.floor(Math.random() * symbolNames.length)];
                    
                    const newSymbol = SYMBOLS[randomSymbol];
                    
                    // Clear and redraw
                    reel.symbolContainers[j].removeChildren();
                    
                    const circle = new PIXI.Graphics();
                    circle.beginFill(newSymbol.color);
                    circle.drawCircle(0, 0, 35);
                    circle.endFill();
                    circle.lineStyle(3, 0xffffff);
                    circle.drawCircle(0, 0, 35);
                    reel.symbolContainers[j].addChild(circle);

                    const textStyle = new PIXI.TextStyle({
                        fontFamily: 'Arial Black',
                        fontSize: 50,
                        fill: 0xffffff,
                        fontWeight: 'bold',
                        stroke: 0x000000,
                        strokeThickness: 2
                    });
                    
                    const text = new PIXI.Text(newSymbol.emoji, textStyle);
                    text.anchor.set(0.5, 0.5);
                    text.x = 0;
                    text.y = -2;
                    reel.symbolContainers[j].addChild(text);
                }
            }

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };

        animate();
    });
}

// Display Result Reels
function displayResultReels(reels) {
    console.log('🎯 Displaying result reels:', reels);
    
    for (let i = 0; i < 5 && i < reels.length; i++) {
        const reel = reelSprites[i];
        const reelSymbols = reels[i];

        for (let j = 0; j < 3 && j < reelSymbols.length; j++) {
            const symbolName = reelSymbols[j];
            const newSymbol = SYMBOLS[symbolName] || SYMBOLS.cherry;
            
            // Clear and redraw
            reel.symbolContainers[j].removeChildren();
            
            const circle = new PIXI.Graphics();
            circle.beginFill(newSymbol.color);
            circle.drawCircle(0, 0, 35);
            circle.endFill();
            circle.lineStyle(3, 0xffffff);
            circle.drawCircle(0, 0, 35);
            reel.symbolContainers[j].addChild(circle);

            const textStyle = new PIXI.TextStyle({
                fontFamily: 'Arial Black',
                fontSize: 50,
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: 0x000000,
                strokeThickness: 2
            });
            
            const text = new PIXI.Text(newSymbol.emoji, textStyle);
            text.anchor.set(0.5, 0.5);
            text.x = 0;
            text.y = -2;
            reel.symbolContainers[j].addChild(text);
        }
    }
}

// Update UI
function updateUI() {
    document.getElementById('balanceDisplay').textContent = `$${gameState.balance.toFixed(2)}`;
    document.getElementById('betDisplay').textContent = `$${gameState.bet.toFixed(2)}`;
    document.getElementById('winDisplay').textContent = `$${gameState.lastWin.toFixed(2)}`;
    document.getElementById('betInput').value = gameState.bet.toFixed(2);
}

// Setup Event Listeners
function setupEventListeners() {
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
            const response = await fetch(`${API_BASE}/api/game/reset/${sessionId}`, { method: 'POST' });
            const data = await response.json();
            if (data.status === 'success') {
                gameState.balance = 1000;
                gameState.lastWin = 0;
                gameState.bet = 1.00;
                updateUI();
                displayDefaultReels();
                showSuccess('Game reset!');
            }
        } catch (error) {
            showError('Reset failed: ' + error.message);
        }
    });
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

// Start when ready
console.log('🎰 Script loaded, waiting for DOM...');
document.addEventListener('DOMContentLoaded', init);
