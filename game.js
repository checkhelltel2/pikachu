// Game State
const gameState = {
    level: 1,
    score: 0,
    time: 180,
    gridSize: { rows: 6, cols: 8 },
    tiles: [],
    selectedTiles: [],
    isPaused: false,
    isGameOver: false,
    timerInterval: null,
    powerups: {
        hint: 3,
        shuffle: 2,
        time: 2
    }
};

// Pikachu emoji sets for different levels
const emojiSets = [
    ['🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'],
    ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭', '🍈', '🍏', '🥥', '🍅'],
    ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥏', '🎯', '🏹', '🥊'],
    ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵'],
    ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🏵️', '💐', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🌴']
];

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const timerEl = document.getElementById('timer');
const highScoreEl = document.getElementById('highScore');
const hintBtn = document.getElementById('hintBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const timeBtn = document.getElementById('timeBtn');
const hintCountEl = document.getElementById('hintCount');
const shuffleCountEl = document.getElementById('shuffleCount');
const timeCountEl = document.getElementById('timeCount');
const newGameBtn = document.getElementById('newGameBtn');
const pauseBtn = document.getElementById('pauseBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalStats = document.getElementById('modalStats');
const modalBtn = document.getElementById('modalBtn');
const matchSound = document.getElementById('matchSound');

// Initialize Game
function initGame() {
    gameState.isGameOver = false;
    gameState.isPaused = false;
    loadHighScore();
    updatePowerupCounts();
    generateBoard();
    startTimer();
    updateUI();
}

// Generate Game Board
function generateBoard() {
    const { rows, cols } = gameState.gridSize;
    const totalTiles = rows * cols;
    const pairsNeeded = Math.floor(totalTiles / 2);
    
    // Select emojis based on level
    const emojiSet = emojiSets[Math.min(gameState.level - 1, emojiSets.length - 1)];
    const selectedEmojis = emojiSet.slice(0, Math.min(pairsNeeded, emojiSet.length));
    
    // Create pairs
    const tiles = [];
    selectedEmojis.forEach(emoji => {
        tiles.push({ emoji, matched: false });
        tiles.push({ emoji, matched: false });
    });
    
    // Shuffle tiles
    shuffleArray(tiles);
    gameState.tiles = tiles;
    
    // Set grid layout
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // Render tiles
    renderBoard();
}

// Render Board
function renderBoard() {
    gameBoard.innerHTML = '';
    gameState.tiles.forEach((tile, index) => {
        const tileEl = document.createElement('div');
        tileEl.className = 'tile';
        tileEl.dataset.index = index;
        
        if (tile.matched) {
            tileEl.classList.add('empty');
            tileEl.textContent = '';
        } else {
            tileEl.textContent = tile.emoji;
            tileEl.addEventListener('click', () => handleTileClick(index));
        }
        
        gameBoard.appendChild(tileEl);
    });
}

// Handle Tile Click
function handleTileClick(index) {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    const tile = gameState.tiles[index];
    if (tile.matched) return;
    
    const tileEl = gameBoard.children[index];
    
    // If already selected, deselect
    if (gameState.selectedTiles.includes(index)) {
        gameState.selectedTiles = gameState.selectedTiles.filter(i => i !== index);
        tileEl.classList.remove('selected');
        return;
    }
    
    // Select tile
    if (gameState.selectedTiles.length < 2) {
        gameState.selectedTiles.push(index);
        tileEl.classList.add('selected');
        
        // Check for match when 2 tiles selected
        if (gameState.selectedTiles.length === 2) {
            setTimeout(checkMatch, 300);
        }
    }
}

// Check if tiles match
function checkMatch() {
    const [index1, index2] = gameState.selectedTiles;
    const tile1 = gameState.tiles[index1];
    const tile2 = gameState.tiles[index2];
    
    if (canConnect(index1, index2) && tile1.emoji === tile2.emoji) {
        // Match found!
        tile1.matched = true;
        tile2.matched = true;
        
        const tileEl1 = gameBoard.children[index1];
        const tileEl2 = gameBoard.children[index2];
        
        tileEl1.classList.remove('selected');
        tileEl2.classList.remove('selected');
        tileEl1.classList.add('matched');
        tileEl2.classList.add('matched');
        
        // Update score
        gameState.score += 10 * gameState.level;
        updateUI();
        
        // Play sound
        playMatchSound();
        
        // Check win condition
        setTimeout(() => {
            tileEl1.classList.add('empty');
            tileEl2.classList.add('empty');
            tileEl1.textContent = '';
            tileEl2.textContent = '';
            
            if (checkWinCondition()) {
                levelUp();
            }
        }, 500);
    } else {
        // No match
        const tileEl1 = gameBoard.children[index1];
        const tileEl2 = gameBoard.children[index2];
        
        tileEl1.classList.add('wrong');
        tileEl2.classList.add('wrong');
        
        setTimeout(() => {
            tileEl1.classList.remove('selected', 'wrong');
            tileEl2.classList.remove('selected', 'wrong');
        }, 300);
    }
    
    gameState.selectedTiles = [];
}

// Pikachu pathfinding: Check if two tiles can be connected
function canConnect(index1, index2) {
    const { cols } = gameState.gridSize;
    const pos1 = { row: Math.floor(index1 / cols), col: index1 % cols };
    const pos2 = { row: Math.floor(index2 / cols), col: index2 % cols };
    
    // Try direct line
    if (hasDirectPath(pos1, pos2)) return true;
    
    // Try one corner
    if (hasOneCornerPath(pos1, pos2)) return true;
    
    // Try two corners
    if (hasTwoCornerPath(pos1, pos2)) return true;
    
    return false;
}

// Check direct horizontal or vertical path
function hasDirectPath(pos1, pos2) {
    if (pos1.row === pos2.row) {
        // Horizontal
        const minCol = Math.min(pos1.col, pos2.col);
        const maxCol = Math.max(pos1.col, pos2.col);
        for (let col = minCol + 1; col < maxCol; col++) {
            if (!isTileEmpty(pos1.row, col)) return false;
        }
        return true;
    } else if (pos1.col === pos2.col) {
        // Vertical
        const minRow = Math.min(pos1.row, pos2.row);
        const maxRow = Math.max(pos1.row, pos2.row);
        for (let row = minRow + 1; row < maxRow; row++) {
            if (!isTileEmpty(row, pos1.col)) return false;
        }
        return true;
    }
    return false;
}

// Check path with one corner
function hasOneCornerPath(pos1, pos2) {
    // Try corner at (pos1.row, pos2.col)
    const corner1 = { row: pos1.row, col: pos2.col };
    if (isTileEmpty(corner1.row, corner1.col) || (corner1.row === pos2.row && corner1.col === pos2.col)) {
        if (hasDirectPath(pos1, corner1) && hasDirectPath(corner1, pos2)) {
            return true;
        }
    }
    
    // Try corner at (pos2.row, pos1.col)
    const corner2 = { row: pos2.row, col: pos1.col };
    if (isTileEmpty(corner2.row, corner2.col) || (corner2.row === pos1.row && corner2.col === pos1.col)) {
        if (hasDirectPath(pos1, corner2) && hasDirectPath(corner2, pos2)) {
            return true;
        }
    }
    
    return false;
}

// Check path with two corners
function hasTwoCornerPath(pos1, pos2) {
    const { rows, cols } = gameState.gridSize;
    
    // Try horizontal scan
    for (let col = 0; col < cols; col++) {
        if (col === pos1.col || col === pos2.col) continue;
        const mid1 = { row: pos1.row, col };
        const mid2 = { row: pos2.row, col };
        if (isTileEmpty(mid1.row, mid1.col) && isTileEmpty(mid2.row, mid2.col)) {
            if (hasDirectPath(pos1, mid1) && hasDirectPath(mid1, mid2) && hasDirectPath(mid2, pos2)) {
                return true;
            }
        }
    }
    
    // Try vertical scan
    for (let row = 0; row < rows; row++) {
        if (row === pos1.row || row === pos2.row) continue;
        const mid1 = { row, col: pos1.col };
        const mid2 = { row, col: pos2.col };
        if (isTileEmpty(mid1.row, mid1.col) && isTileEmpty(mid2.row, mid2.col)) {
            if (hasDirectPath(pos1, mid1) && hasDirectPath(mid1, mid2) && hasDirectPath(mid2, pos2)) {
                return true;
            }
        }
    }
    
    return false;
}

// Check if a tile position is empty
function isTileEmpty(row, col) {
    const { cols } = gameState.gridSize;
    const index = row * cols + col;
    return index < 0 || index >= gameState.tiles.length || gameState.tiles[index].matched;
}

// Check win condition
function checkWinCondition() {
    return gameState.tiles.every(tile => tile.matched);
}

// Level up
function levelUp() {
    gameState.level++;
    gameState.time += 30; // Bonus time
    
    // Increase difficulty
    if (gameState.level % 2 === 0 && gameState.gridSize.cols < 10) {
        gameState.gridSize.cols += 2;
    }
    if (gameState.level % 3 === 0 && gameState.gridSize.rows < 8) {
        gameState.gridSize.rows += 1;
    }
    
    showModal(
        '🎉 Chúc Mừng! 🎉',
        `Bạn đã hoàn thành cấp độ ${gameState.level - 1}!`,
        `<p>Cấp độ mới: <strong>${gameState.level}</strong></p>
         <p>Điểm hiện tại: <strong>${gameState.score}</strong></p>
         <p>Thời gian thưởng: +30 giây</p>`
    );
}

// Timer
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused && !gameState.isGameOver) {
            gameState.time--;
            updateUI();
            
            if (gameState.time <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

// Game Over
function gameOver() {
    gameState.isGameOver = true;
    clearInterval(gameState.timerInterval);
    
    saveHighScore();
    
    showModal(
        '⏱️ Hết Giờ! ⏱️',
        'Trò chơi kết thúc!',
        `<p>Cấp độ đạt được: <strong>${gameState.level}</strong></p>
         <p>Tổng điểm: <strong>${gameState.score}</strong></p>
         <p>Điểm cao nhất: <strong>${getHighScore()}</strong></p>`
    );
}

// Powerups
function useHint() {
    if (gameState.powerups.hint <= 0 || gameState.isPaused || gameState.isGameOver) return;
    
    gameState.powerups.hint--;
    updatePowerupCounts();
    
    // Find a matching pair
    const availableTiles = gameState.tiles
        .map((tile, index) => ({ tile, index }))
        .filter(({ tile }) => !tile.matched);
    
    for (let i = 0; i < availableTiles.length; i++) {
        for (let j = i + 1; j < availableTiles.length; j++) {
            const tile1 = availableTiles[i];
            const tile2 = availableTiles[j];
            
            if (tile1.tile.emoji === tile2.tile.emoji && canConnect(tile1.index, tile2.index)) {
                // Highlight these tiles
                const tileEl1 = gameBoard.children[tile1.index];
                const tileEl2 = gameBoard.children[tile2.index];
                
                tileEl1.classList.add('hint');
                tileEl2.classList.add('hint');
                
                setTimeout(() => {
                    tileEl1.classList.remove('hint');
                    tileEl2.classList.remove('hint');
                }, 1000);
                
                return;
            }
        }
    }
}

function useShuffle() {
    if (gameState.powerups.shuffle <= 0 || gameState.isPaused || gameState.isGameOver) return;
    
    gameState.powerups.shuffle--;
    updatePowerupCounts();
    
    // Get unmatched tiles
    const unmatchedTiles = gameState.tiles.filter(tile => !tile.matched);
    shuffleArray(unmatchedTiles);
    
    // Redistribute
    let unmatchedIndex = 0;
    gameState.tiles = gameState.tiles.map(tile => {
        if (tile.matched) return tile;
        return unmatchedTiles[unmatchedIndex++];
    });
    
    gameState.selectedTiles = [];
    renderBoard();
}

function useTimeBonus() {
    if (gameState.powerups.time <= 0 || gameState.isPaused || gameState.isGameOver) return;
    
    gameState.powerups.time--;
    updatePowerupCounts();
    gameState.time += 30;
    updateUI();
}

// Toggle Pause
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseBtn.textContent = gameState.isPaused ? '▶️ Tiếp Tục' : '⏸️ Tạm Dừng';
    
    if (gameState.isPaused) {
        gameBoard.classList.add('paused');
    } else {
        gameBoard.classList.remove('paused');
    }
}

// Modal
function showModal(title, message, stats) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalStats.innerHTML = stats;
    modal.classList.add('show');
}

function hideModal() {
    modal.classList.remove('show');
    newGame();
}

// New Game
function newGame() {
    // Reset game state but keep level progression
    gameState.score = 0;
    gameState.time = 180;
    gameState.selectedTiles = [];
    gameState.powerups = { hint: 3, shuffle: 2, time: 2 };
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    initGame();
}

// Reset completely
function resetGame() {
    gameState.level = 1;
    gameState.gridSize = { rows: 6, cols: 8 };
    newGame();
}

// Update UI
function updateUI() {
    scoreEl.textContent = gameState.score;
    levelEl.textContent = gameState.level;
    timerEl.textContent = gameState.time;
    highScoreEl.textContent = getHighScore();
}

function updatePowerupCounts() {
    hintCountEl.textContent = gameState.powerups.hint;
    shuffleCountEl.textContent = gameState.powerups.shuffle;
    timeCountEl.textContent = gameState.powerups.time;
    
    hintBtn.disabled = gameState.powerups.hint <= 0;
    shuffleBtn.disabled = gameState.powerups.shuffle <= 0;
    timeBtn.disabled = gameState.powerups.time <= 0;
}

// High Score
function getHighScore() {
    return parseInt(localStorage.getItem('pikachuHighScore') || '0');
}

function saveHighScore() {
    const currentHigh = getHighScore();
    if (gameState.score > currentHigh) {
        localStorage.setItem('pikachuHighScore', gameState.score.toString());
    }
}

function loadHighScore() {
    highScoreEl.textContent = getHighScore();
}

// Utility Functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function playMatchSound() {
    try {
        matchSound.currentTime = 0;
        matchSound.play().catch(() => {});
    } catch (e) {}
}

// Event Listeners
hintBtn.addEventListener('click', useHint);
shuffleBtn.addEventListener('click', useShuffle);
timeBtn.addEventListener('click', useTimeBonus);
newGameBtn.addEventListener('click', resetGame);
pauseBtn.addEventListener('click', togglePause);
modalBtn.addEventListener('click', hideModal);

// Initialize on load
window.addEventListener('load', initGame);
