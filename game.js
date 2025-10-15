// Game State
const gameState = {
    board: [],
    rows: 6,
    cols: 6,
    selectedCells: [],
    score: 0,
    level: 1,
    timeLeft: 300,
    timer: null,
    isPaused: false,
    isGameOver: false,
    highScore: 0,
    powerups: {
        hint: 3,
        shuffle: 2,
        time: 2
    },
    matchedPairs: 0,
    totalPairs: 0
};

// Pikachu icons (using various emojis)
const pikachuIcons = [
    '⚡', '🌟', '💫', '✨', '🔥', '💎',
    '🌈', '🎨', '🎭', '🎪', '🎯', '🎲',
    '🍀', '🌸', '🌺', '🌻', '🌹', '🌷',
    '🦄', '🐉', '🦋', '🐠', '🐙', '🦑'
];

// DOM Elements
const elements = {
    gameBoard: document.getElementById('gameBoard'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    timer: document.getElementById('timer'),
    highScore: document.getElementById('highScore'),
    hintBtn: document.getElementById('hintBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    timeBtn: document.getElementById('timeBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    hintCount: document.getElementById('hintCount'),
    shuffleCount: document.getElementById('shuffleCount'),
    timeCount: document.getElementById('timeCount'),
    menuOverlay: document.getElementById('menuOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    pauseOverlay: document.getElementById('pauseOverlay'),
    startBtn: document.getElementById('startBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    restartBtn: document.getElementById('restartBtn'),
    menuBtn: document.getElementById('menuBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    quitBtn: document.getElementById('quitBtn'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverMessage: document.getElementById('gameOverMessage'),
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    finalHighScore: document.getElementById('finalHighScore')
};

// Initialize game
function init() {
    loadHighScore();
    setupEventListeners();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.menuBtn.addEventListener('click', showMenu);
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.quitBtn.addEventListener('click', showMenu);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.hintBtn.addEventListener('click', useHint);
    elements.shuffleBtn.addEventListener('click', useShuffle);
    elements.timeBtn.addEventListener('click', useTimeBonus);

    // Difficulty selection
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const level = parseInt(btn.dataset.level);
            setDifficulty(level);
        });
    });

    // Select first difficulty by default
    difficultyBtns[0].click();
}

// Set difficulty
function setDifficulty(level) {
    gameState.level = level;
    switch(level) {
        case 1:
            gameState.rows = 6;
            gameState.cols = 6;
            gameState.timeLeft = 300;
            break;
        case 2:
            gameState.rows = 8;
            gameState.cols = 8;
            gameState.timeLeft = 400;
            break;
        case 3:
            gameState.rows = 10;
            gameState.cols = 10;
            gameState.timeLeft = 500;
            break;
    }
}

// Start game
function startGame() {
    elements.menuOverlay.classList.add('hidden');
    resetPowerups();
    initBoard();
    startTimer();
    updateUI();
}

// Initialize board
function initBoard() {
    gameState.board = [];
    gameState.selectedCells = [];
    gameState.matchedPairs = 0;
    gameState.isGameOver = false;
    
    const totalCells = gameState.rows * gameState.cols;
    const numPairs = Math.floor(totalCells / 2);
    gameState.totalPairs = numPairs;
    
    // Create pairs
    const icons = [];
    for (let i = 0; i < numPairs; i++) {
        const icon = pikachuIcons[i % pikachuIcons.length];
        icons.push(icon, icon);
    }
    
    // Shuffle icons
    shuffleArray(icons);
    
    // Create board
    let iconIndex = 0;
    for (let i = 0; i < gameState.rows; i++) {
        gameState.board[i] = [];
        for (let j = 0; j < gameState.cols; j++) {
            gameState.board[i][j] = {
                icon: icons[iconIndex++],
                matched: false,
                row: i,
                col: j
            };
        }
    }
    
    renderBoard();
}

// Render board
function renderBoard() {
    elements.gameBoard.innerHTML = '';
    elements.gameBoard.style.gridTemplateColumns = `repeat(${gameState.cols}, 1fr)`;
    
    for (let i = 0; i < gameState.rows; i++) {
        for (let j = 0; j < gameState.cols; j++) {
            const cell = gameState.board[i][j];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.row = i;
            cellDiv.dataset.col = j;
            
            if (cell.matched) {
                cellDiv.classList.add('matched');
            } else {
                cellDiv.textContent = cell.icon;
                cellDiv.addEventListener('click', () => handleCellClick(i, j));
            }
            
            elements.gameBoard.appendChild(cellDiv);
        }
    }
}

// Handle cell click
function handleCellClick(row, col) {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    const cell = gameState.board[row][col];
    if (cell.matched) return;
    
    const cellDiv = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    // If cell is already selected, deselect it
    if (gameState.selectedCells.some(c => c.row === row && c.col === col)) {
        gameState.selectedCells = gameState.selectedCells.filter(c => !(c.row === row && c.col === col));
        cellDiv.classList.remove('selected');
        return;
    }
    
    // Select cell
    gameState.selectedCells.push({row, col});
    cellDiv.classList.add('selected');
    
    // Check if two cells are selected
    if (gameState.selectedCells.length === 2) {
        const [cell1, cell2] = gameState.selectedCells;
        const icon1 = gameState.board[cell1.row][cell1.col].icon;
        const icon2 = gameState.board[cell2.row][cell2.col].icon;
        
        if (icon1 === icon2 && canConnect(cell1, cell2)) {
            // Match found
            setTimeout(() => matchCells(cell1, cell2), 300);
        } else {
            // No match
            setTimeout(() => {
                const cellDiv1 = document.querySelector(`[data-row="${cell1.row}"][data-col="${cell1.col}"]`);
                const cellDiv2 = document.querySelector(`[data-row="${cell2.row}"][data-col="${cell2.col}"]`);
                cellDiv1.classList.remove('selected');
                cellDiv2.classList.remove('selected');
                cellDiv1.classList.add('wrong');
                cellDiv2.classList.add('wrong');
                setTimeout(() => {
                    cellDiv1.classList.remove('wrong');
                    cellDiv2.classList.remove('wrong');
                }, 500);
                gameState.selectedCells = [];
            }, 300);
        }
    }
}

// Check if two cells can be connected
function canConnect(cell1, cell2) {
    // Try direct paths with max 3 turns
    return findPath(cell1, cell2) !== null;
}

// Find path between two cells (max 3 turns)
function findPath(start, end) {
    // Direct line
    if (hasDirectPath(start, end)) {
        return [start, end];
    }
    
    // One turn
    const oneTurnPath = findOneTurnPath(start, end);
    if (oneTurnPath) return oneTurnPath;
    
    // Two turns
    const twoTurnPath = findTwoTurnPath(start, end);
    if (twoTurnPath) return twoTurnPath;
    
    return null;
}

// Check direct path
function hasDirectPath(start, end) {
    if (start.row === end.row) {
        // Horizontal
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        for (let col = minCol + 1; col < maxCol; col++) {
            if (!gameState.board[start.row][col].matched) {
                return false;
            }
        }
        return true;
    } else if (start.col === end.col) {
        // Vertical
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        for (let row = minRow + 1; row < maxRow; row++) {
            if (!gameState.board[row][start.col].matched) {
                return false;
            }
        }
        return true;
    }
    return false;
}

// Find one turn path
function findOneTurnPath(start, end) {
    // Try corner at (start.row, end.col)
    const corner1 = {row: start.row, col: end.col};
    if (gameState.board[corner1.row][corner1.col].matched || (corner1.row === end.row && corner1.col === end.col)) {
        if (hasDirectPath(start, corner1) && hasDirectPath(corner1, end)) {
            return [start, corner1, end];
        }
    }
    
    // Try corner at (end.row, start.col)
    const corner2 = {row: end.row, col: start.col};
    if (gameState.board[corner2.row][corner2.col].matched || (corner2.row === start.row && corner2.col === start.col)) {
        if (hasDirectPath(start, corner2) && hasDirectPath(corner2, end)) {
            return [start, corner2, end];
        }
    }
    
    return null;
}

// Find two turn path
function findTwoTurnPath(start, end) {
    // Try intermediate points
    for (let row = 0; row < gameState.rows; row++) {
        for (let col = 0; col < gameState.cols; col++) {
            if (!gameState.board[row][col].matched) continue;
            
            const mid = {row, col};
            const path1 = findOneTurnPath(start, mid);
            const path2 = findOneTurnPath(mid, end);
            
            if (path1 && path2) {
                return [...path1, ...path2.slice(1)];
            }
        }
    }
    return null;
}

// Match cells
function matchCells(cell1, cell2) {
    gameState.board[cell1.row][cell1.col].matched = true;
    gameState.board[cell2.row][cell2.col].matched = true;
    gameState.matchedPairs++;
    gameState.score += 10 * gameState.level;
    
    const cellDiv1 = document.querySelector(`[data-row="${cell1.row}"][data-col="${cell1.col}"]`);
    const cellDiv2 = document.querySelector(`[data-row="${cell2.row}"][data-col="${cell2.col}"]`);
    cellDiv1.classList.remove('selected');
    cellDiv2.classList.remove('selected');
    cellDiv1.classList.add('matched');
    cellDiv2.classList.add('matched');
    
    gameState.selectedCells = [];
    updateUI();
    
    // Check if game won
    if (gameState.matchedPairs === gameState.totalPairs) {
        setTimeout(() => gameWon(), 500);
    }
}

// Timer
function startTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused && !gameState.isGameOver) {
            gameState.timeLeft--;
            updateUI();
            
            if (gameState.timeLeft <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

// Update UI
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.level.textContent = gameState.level;
    elements.timer.textContent = gameState.timeLeft;
    elements.highScore.textContent = gameState.highScore;
    elements.hintCount.textContent = gameState.powerups.hint;
    elements.shuffleCount.textContent = gameState.powerups.shuffle;
    elements.timeCount.textContent = gameState.powerups.time;
    
    // Update powerup buttons
    elements.hintBtn.disabled = gameState.powerups.hint <= 0;
    elements.shuffleBtn.disabled = gameState.powerups.shuffle <= 0;
    elements.timeBtn.disabled = gameState.powerups.time <= 0;
    
    // Timer color warning
    if (gameState.timeLeft < 30) {
        elements.timer.style.color = '#ff6b6b';
    } else {
        elements.timer.style.color = '#667eea';
    }
}

// Powerups
function useHint() {
    if (gameState.powerups.hint <= 0 || gameState.isPaused || gameState.isGameOver) return;
    
    gameState.powerups.hint--;
    
    // Find a matching pair
    const hint = findMatchingPair();
    if (hint) {
        const cellDiv1 = document.querySelector(`[data-row="${hint[0].row}"][data-col="${hint[0].col}"]`);
        const cellDiv2 = document.querySelector(`[data-row="${hint[1].row}"][data-col="${hint[1].col}"]`);
        
        cellDiv1.classList.add('hint');
        cellDiv2.classList.add('hint');
        
        setTimeout(() => {
            cellDiv1.classList.remove('hint');
            cellDiv2.classList.remove('hint');
        }, 2000);
    }
    
    updateUI();
}

function findMatchingPair() {
    for (let i = 0; i < gameState.rows; i++) {
        for (let j = 0; j < gameState.cols; j++) {
            if (gameState.board[i][j].matched) continue;
            
            for (let k = 0; k < gameState.rows; k++) {
                for (let l = 0; l < gameState.cols; l++) {
                    if (i === k && j === l) continue;
                    if (gameState.board[k][l].matched) continue;
                    
                    const cell1 = {row: i, col: j};
                    const cell2 = {row: k, col: l};
                    
                    if (gameState.board[i][j].icon === gameState.board[k][l].icon && canConnect(cell1, cell2)) {
                        return [cell1, cell2];
                    }
                }
            }
        }
    }
    return null;
}

function useShuffle() {
    if (gameState.powerups.shuffle <= 0 || gameState.isPaused || gameState.isGameOver) return;
    
    gameState.powerups.shuffle--;
    
    // Collect unmatched icons
    const unmatchedIcons = [];
    for (let i = 0; i < gameState.rows; i++) {
        for (let j = 0; j < gameState.cols; j++) {
            if (!gameState.board[i][j].matched) {
                unmatchedIcons.push(gameState.board[i][j].icon);
            }
        }
    }
    
    // Shuffle
    shuffleArray(unmatchedIcons);
    
    // Redistribute
    let iconIndex = 0;
    for (let i = 0; i < gameState.rows; i++) {
        for (let j = 0; j < gameState.cols; j++) {
            if (!gameState.board[i][j].matched) {
                gameState.board[i][j].icon = unmatchedIcons[iconIndex++];
            }
        }
    }
    
    renderBoard();
    updateUI();
}

function useTimeBonus() {
    if (gameState.powerups.time <= 0 || gameState.isPaused || gameState.isGameOver) return;
    
    gameState.powerups.time--;
    gameState.timeLeft += 30;
    updateUI();
}

function resetPowerups() {
    gameState.powerups.hint = 3;
    gameState.powerups.shuffle = 2;
    gameState.powerups.time = 2;
}

// Pause/Resume
function togglePause() {
    if (gameState.isGameOver) return;
    
    if (gameState.isPaused) {
        resumeGame();
    } else {
        gameState.isPaused = true;
        elements.pauseOverlay.classList.remove('hidden');
        elements.pauseBtn.textContent = '▶️';
    }
}

function resumeGame() {
    gameState.isPaused = false;
    elements.pauseOverlay.classList.add('hidden');
    elements.pauseBtn.textContent = '⏸️';
}

// Game Over
function gameOver() {
    gameState.isGameOver = true;
    clearInterval(gameState.timer);
    
    elements.gameOverTitle.textContent = '⏰ HẾT GIỜ! ⏰';
    elements.gameOverMessage.textContent = 'Bạn đã hết thời gian!';
    elements.nextLevelBtn.style.display = 'none';
    elements.finalScore.textContent = gameState.score;
    elements.finalLevel.textContent = gameState.level;
    elements.finalHighScore.textContent = gameState.highScore;
    
    updateHighScore();
    elements.gameOverOverlay.classList.remove('hidden');
}

function gameWon() {
    gameState.isGameOver = true;
    clearInterval(gameState.timer);
    
    // Bonus points for remaining time
    const timeBonus = gameState.timeLeft * 2;
    gameState.score += timeBonus;
    
    elements.gameOverTitle.textContent = '🎉 CHIẾN THẮNG! 🎉';
    elements.gameOverMessage.textContent = `Hoàn thành! +${timeBonus} điểm thưởng thời gian!`;
    elements.nextLevelBtn.style.display = 'inline-block';
    elements.finalScore.textContent = gameState.score;
    elements.finalLevel.textContent = gameState.level;
    elements.finalHighScore.textContent = gameState.highScore;
    
    updateHighScore();
    elements.gameOverOverlay.classList.remove('hidden');
}

// Navigation
function nextLevel() {
    elements.gameOverOverlay.classList.add('hidden');
    gameState.level++;
    setDifficulty(gameState.level);
    resetPowerups();
    initBoard();
    startTimer();
    updateUI();
}

function restartGame() {
    elements.gameOverOverlay.classList.add('hidden');
    gameState.score = 0;
    resetPowerups();
    initBoard();
    startTimer();
    updateUI();
}

function showMenu() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    elements.gameOverOverlay.classList.add('hidden');
    elements.pauseOverlay.classList.add('hidden');
    elements.menuOverlay.classList.remove('hidden');
    gameState.score = 0;
    gameState.level = 1;
    gameState.isPaused = false;
    gameState.isGameOver = false;
    setDifficulty(1);
}

// High Score
function loadHighScore() {
    const saved = localStorage.getItem('pikachuHighScore');
    if (saved) {
        gameState.highScore = parseInt(saved);
    }
}

function updateHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('pikachuHighScore', gameState.highScore);
    }
}

// Utility functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start
init();
