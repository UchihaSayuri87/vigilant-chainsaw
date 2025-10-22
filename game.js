// Game state
let gameState = {
    score: 0,
    timeLeft: 30,
    lives: 3,
    isPlaying: false,
    drops: [],
    bucketPosition: 50,
    gameInterval: null,
    dropInterval: null,
    timerInterval: null
};

// DOM elements
const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    endScreen: document.getElementById('end-screen'),
    gameArea: document.getElementById('game-area'),
    bucket: document.getElementById('bucket'),
    startButton: document.getElementById('start-button'),
    restartButton: document.getElementById('restart-button'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    livesDisplay: document.getElementById('lives'),
    finalScore: document.getElementById('final-score'),
    impactMessage: document.getElementById('impact-message')
};

// Initialize game
function initGame() {
    elements.startButton.addEventListener('click', startGame);
    elements.restartButton.addEventListener('click', resetGame);
    
    // Mouse movement for bucket
    elements.gameArea.addEventListener('mousemove', moveBucket);
    
    // Touch movement for bucket (mobile)
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = elements.gameArea.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        gameState.bucketPosition = Math.max(5, Math.min(95, percentage));
        elements.bucket.style.left = gameState.bucketPosition + '%';
    });
}

// Move bucket with mouse
function moveBucket(e) {
    if (!gameState.isPlaying) return;
    
    const rect = elements.gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    gameState.bucketPosition = Math.max(5, Math.min(95, percentage));
    elements.bucket.style.left = gameState.bucketPosition + '%';
}

// Start game
function startGame() {
    gameState = {
        score: 0,
        timeLeft: 30,
        lives: 3,
        isPlaying: true,
        drops: [],
        bucketPosition: 50,
        gameInterval: null,
        dropInterval: null,
        timerInterval: null
    };
    
    elements.startScreen.classList.add('hidden');
    elements.endScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    
    updateDisplay();
    
    // Start spawning drops
    gameState.dropInterval = setInterval(spawnDrop, 800);
    
    // Start timer
    gameState.timerInterval = setInterval(updateTimer, 1000);
    
    // Start game loop
    gameState.gameInterval = setInterval(gameLoop, 50);
}

// Spawn a drop
function spawnDrop() {
    if (!gameState.isPlaying) return;
    
    const drop = document.createElement('div');
    drop.className = 'drop';
    
    // 80% chance of water drop, 20% chance of pollution
    const isWater = Math.random() > 0.2;
    drop.textContent = isWater ? '💧' : '💀';
    drop.classList.add(isWater ? 'water-drop' : 'pollution-drop');
    
    // Random horizontal position
    const leftPosition = Math.random() * 90 + 5;
    drop.style.left = leftPosition + '%';
    drop.style.top = '-50px';
    
    // Random fall duration (2-4 seconds)
    const duration = Math.random() * 2 + 2;
    drop.style.animationDuration = duration + 's';
    
    // Store drop data
    drop.dataset.isWater = isWater;
    drop.dataset.leftPosition = leftPosition;
    drop.dataset.duration = duration;
    drop.dataset.startTime = Date.now();
    
    elements.gameArea.appendChild(drop);
    gameState.drops.push(drop);
}

// Game loop
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    const bucketRect = elements.bucket.getBoundingClientRect();
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    
    gameState.drops.forEach((drop, index) => {
        const dropRect = drop.getBoundingClientRect();
        
        // Check collision with bucket
        if (
            dropRect.bottom >= bucketRect.top &&
            dropRect.top <= bucketRect.bottom &&
            dropRect.right >= bucketRect.left &&
            dropRect.left <= bucketRect.right
        ) {
            // Collision detected
            const isWater = drop.dataset.isWater === 'true';
            
            if (isWater) {
                gameState.score += 10;
                createSplash(drop, '✨');
            } else {
                gameState.lives--;
                createSplash(drop, '💥');
                
                if (gameState.lives <= 0) {
                    endGame();
                }
            }
            
            drop.remove();
            gameState.drops.splice(index, 1);
            updateDisplay();
        }
        // Remove drops that have fallen off screen
        else if (dropRect.top > gameAreaRect.bottom) {
            drop.remove();
            gameState.drops.splice(index, 1);
        }
    });
}

// Create splash effect
function createSplash(drop, emoji) {
    const splash = document.createElement('div');
    splash.textContent = emoji;
    splash.style.position = 'absolute';
    splash.style.left = drop.style.left;
    splash.style.top = drop.style.top;
    splash.style.fontSize = '3em';
    splash.style.transition = 'all 0.5s';
    splash.style.pointerEvents = 'none';
    
    elements.gameArea.appendChild(splash);
    
    setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.transform = 'scale(2)';
    }, 10);
    
    setTimeout(() => splash.remove(), 500);
}

// Update timer
function updateTimer() {
    gameState.timeLeft--;
    updateDisplay();
    
    if (gameState.timeLeft <= 0) {
        endGame();
    }
}

// Update display
function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.timerDisplay.textContent = gameState.timeLeft;
    
    const hearts = '❤️'.repeat(Math.max(0, gameState.lives));
    const emptyHearts = '🖤'.repeat(Math.max(0, 3 - gameState.lives));
    elements.livesDisplay.textContent = hearts + emptyHearts;
}

// End game
function endGame() {
    gameState.isPlaying = false;
    
    // Clear intervals
    clearInterval(gameState.dropInterval);
    clearInterval(gameState.timerInterval);
    clearInterval(gameState.gameInterval);
    
    // Remove all drops
    gameState.drops.forEach(drop => drop.remove());
    gameState.drops = [];
    
    // Show end screen
    elements.gameScreen.classList.add('hidden');
    elements.endScreen.classList.remove('hidden');
    
    // Calculate impact
    const litersProvided = Math.floor(gameState.score / 10);
    const peopleHelped = Math.floor(litersProvided / 2);
    
    elements.finalScore.textContent = `You collected ${gameState.score} points!`;
    
    let impactText = '';
    if (litersProvided > 0) {
        impactText = `That's ${litersProvided} liters of clean water! `;
        if (peopleHelped > 0) {
            impactText += `You helped ${peopleHelped} ${peopleHelped === 1 ? 'person' : 'people'} today! 🎉`;
        }
    } else {
        impactText = 'Keep trying! Every drop makes a difference! 💪';
    }
    
    elements.impactMessage.textContent = impactText;
}

// Reset game
function resetGame() {
    elements.endScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
