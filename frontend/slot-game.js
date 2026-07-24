// Golden Dragon Deluxe - Hybrid Canvas + PIXI Frontend
// Stake Engine Slot Game - Canvas 2D Rendering

const API_BASE = 'http://localhost:8000';
let sessionId = null;
let gameState = {
    balance: 1000,
    bet: 1.00,
    lastWin: 0,
    isSpinning: false,
    reels: [[], [], [], [], []],
};

let canvas = null;
let ctx = null;
let reelData = [];

const SYMBOLS = {
    cherry: { emoji: '🍒', color: '#ff0000' },
    lemon: { emoji: '🍋', color: '#ffff00' },
    orange: { emoji: '🍊', color: '#ff8800' },
    grapes: { emoji: '🍇', color: '#8800ff' },
    melon: { emoji: '🍈', color: '#00ff00' },
    bell: { emoji: '🔔', color: '#ffdd00' },
    seven: { emoji: '7️⃣', color: '#ff00ff' },
    diamond: { emoji: '💎', color: '#00ffff' },
    wild: { emoji: '⭐', color: '#ffd700' },
    scatter: { emoji: '✨', color: '#ff69b4 ' }
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

        // Create canvas
        canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 400;
        canvas.style.border = '3px solid #ffd700';
        canvas.style.borderRadius = '10px';
        canvas.style.display = 'block';
        canvas.style.cursor = 'pointer';
        container.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
        console.log('✅ Canvas created with 2D context');

        // Initialize reels
        initializeReels();

        // Initialize game session
        await initGameSession();
        
        setupEventListeners();
        
        // Draw initial state
        drawReels(gameState.reels);
        
        console.log('✅ Game initialized successfully');
    } catch (error) {
        console.error('❌ Init error:', error);
        showError('Failed to initialize: ' + error.message);
    }
}

// Initialize Reel Data Structure
function initializeReels() {
    reelData = [];
    const reelX = [80, 230, 380, 530, 680];
    
    for (let i = 0; i < 5; i++) {
        reelData.push({
            x: reelX[i],
            y: 40,
            width: 120,
            height: 320,
            symbols: ['cherry', 'lemon', 'orange']
        });
    }
    console.log('✅ Reels initialized');
}

// Draw All Reels
function drawReels(reels) {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each reel
    for (let i = 0; i < 5; i++) {
        const reel = reelData[i];
        
        // Reel background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(reel.x, reel.y, reel.width, reel.height);
        
        // Reel border
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.strokeRect(reel.x, reel.y, reel.width, reel.height);

        // Draw symbols
        if (reels && reels[i]) {
            for (let j = 0; j < 3; j++) {
                const symbolName = reels[i][j] || 'cherry';
                drawSymbol(
                    reel.x + reel.width / 2,
                    reel.y + 60 + j * 105,
                    symbolName
                );
            }
        }
    }
}

// Draw Single Symbol
function drawSymbol(x, y, symbolName) {
    const symbol = SYMBOLS[symbolName] || SYMBOLS.cherry;
    
    // Circle background
    ctx.fillStyle = symbol.color;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Circle border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Emoji text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol.emoji, x, y);
    
    console.log(`🎯 Drew symbol ${symbolName} at (${x}, ${y})`);
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
        // Animate spinning
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
            drawReels(result.reels);

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
        const totalFrames = 40;
        
        const animate = () => {
            frame++;
            
            // Clear canvas
            ctx.fillStyle = '#0a0e27';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw spinning reels with random symbols
            for (let i = 0; i < 5; i++) {
                const reel = reelData[i];
                
                // Reel background
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(reel.x, reel.y, reel.width, reel.height);
                
                // Reel border
                ctx.strokeStyle = '#e94560';
                ctx.lineWidth = 2;
                ctx.strokeRect(reel.x, reel.y, reel.width, reel.height);

                // Random symbols
                for (let j = 0; j < 3; j++) {
                    const symbolNames = Object.keys(SYMBOLS);
                    const randomSymbol = symbolNames[Math.floor(Math.random() * symbolNames.length)];
                    
                    drawSymbol(
                        reel.x + reel.width / 2,
                        reel.y + 60 + j * 105,
                        randomSymbol
                    );
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
                gameState.reels = [[], [], [], [], []];
                updateUI();
                drawReels([['cherry', 'lemon', 'orange'], ['grapes', 'melon', 'bell'], ['seven', 'diamond', 'wild'], ['scatter', 'cherry', 'lemon'], ['orange', 'grapes', 'melon']]);
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
