// Game State
const gameState = {
    board: [],
    gridSize: { rows: 8, cols: 8 },
    selectedTiles: [],
    score: 0,
    level: 1,
    timeLeft: 300, // 5 minutes in seconds
    timerInterval: null,
    hintsLeft: 3,
    isPaused: false,
    difficulty: 'easy',
    settings: {
        sound: true,
        music: true,
        animation: true
    }
};

// Pikachu characters (using various emojis for variety)
const PIKACHU_CHARS = ['🐭', '🐹', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦄', '🐺', '🦊', '🐱'];

// Initialize game
function initGame() {
    showScreen('menu-screen');
}

// Start game with difficulty
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.score = 0;
    gameState.level = 1;
    gameState.hintsLeft = 3;
    
    // Set grid size based on difficulty
    switch(difficulty) {
        case 'easy':
            gameState.gridSize = { rows: 8, cols: 8 };
            gameState.timeLeft = 300; // 5 minutes
            break;
        case 'medium':
            gameState.gridSize = { rows: 10, cols: 10 };
            gameState.timeLeft = 420; // 7 minutes
            break;
        case 'hard':
            gameState.gridSize = { rows: 12, cols: 12 };
            gameState.timeLeft = 600; // 10 minutes
            break;
    }
    
    createBoard();
    showScreen('game-screen');
    updateUI();
    startTimer();
}

// Create game board
function createBoard() {
    const { rows, cols } = gameState.gridSize;
    const totalTiles = rows * cols;
    
    // Calculate how many pairs we need (leaving some empty spaces)
    const numPairs = Math.floor((totalTiles * 0.8) / 2);
    
    // Create pairs of characters
    const tiles = [];
    for (let i = 0; i < numPairs; i++) {
        const char = PIKACHU_CHARS[i % PIKACHU_CHARS.length];
        tiles.push(char, char);
    }
    
    // Fill remaining with empty tiles
    while (tiles.length < totalTiles) {
        tiles.push(null);
    }
    
    // Shuffle tiles
    shuffleArray(tiles);
    
    // Create 2D board
    gameState.board = [];
    for (let i = 0; i < rows; i++) {
        gameState.board[i] = [];
        for (let j = 0; j < cols; j++) {
            gameState.board[i][j] = tiles[i * cols + j];
        }
    }
    
    renderBoard();
}

// Render board to DOM
function renderBoard() {
    const boardElement = document.getElementById('game-board');
    const { rows, cols } = gameState.gridSize;
    
    // Set grid template
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // Calculate tile size based on viewport
    const maxWidth = Math.min(window.innerWidth - 100, 800);
    const maxHeight = Math.min(window.innerHeight - 300, 600);
    const tileSize = Math.min(maxWidth / cols, maxHeight / rows);
    boardElement.style.width = `${tileSize * cols + (cols - 1) * 5}px`;
    boardElement.style.height = `${tileSize * rows + (rows - 1) * 5}px`;
    
    // Clear board
    boardElement.innerHTML = '';
    
    // Create tiles
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = i;
            tile.dataset.col = j;
            
            const char = gameState.board[i][j];
            if (char) {
                tile.textContent = char;
                tile.addEventListener('click', () => handleTileClick(i, j));
            } else {
                tile.classList.add('empty');
            }
            
            boardElement.appendChild(tile);
        }
    }
}

// Handle tile click
function handleTileClick(row, col) {
    if (gameState.isPaused) return;
    
    const tile = gameState.board[row][col];
    if (!tile) return; // Empty tile
    
    const tileElement = getTileElement(row, col);
    
    // If already selected, deselect
    if (gameState.selectedTiles.some(t => t.row === row && t.col === col)) {
        gameState.selectedTiles = gameState.selectedTiles.filter(t => !(t.row === row && t.col === col));
        tileElement.classList.remove('selected');
        return;
    }
    
    // Add to selection
    gameState.selectedTiles.push({ row, col, char: tile });
    tileElement.classList.add('selected');
    
    // Check if we have 2 tiles selected
    if (gameState.selectedTiles.length === 2) {
        checkMatch();
    }
}

// Check if selected tiles match
function checkMatch() {
    const [tile1, tile2] = gameState.selectedTiles;
    
    // Check if same character
    if (tile1.char !== tile2.char) {
        // Not a match
        setTimeout(() => {
            clearSelection();
        }, 500);
        return;
    }
    
    // Check if path exists
    const path = findPath(tile1, tile2);
    if (path) {
        // Match found!
        handleMatch(tile1, tile2, path);
    } else {
        // No valid path
        setTimeout(() => {
            clearSelection();
        }, 500);
    }
}

// Find path between two tiles
function findPath(tile1, tile2) {
    // Can connect with at most 3 line segments
    const visited = new Set();
    const queue = [{ 
        row: tile1.row, 
        col: tile1.col, 
        direction: null,
        turns: 0,
        path: [{ row: tile1.row, col: tile1.col }]
    }];
    
    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.row},${current.col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        // Check if we reached the target
        if (current.row === tile2.row && current.col === tile2.col) {
            return current.path;
        }
        
        // Try all 4 directions
        const directions = [
            { row: -1, col: 0, name: 'up' },
            { row: 1, col: 0, name: 'down' },
            { row: 0, col: -1, name: 'left' },
            { row: 0, col: 1, name: 'right' }
        ];
        
        for (const dir of directions) {
            const newRow = current.row + dir.row;
            const newCol = current.col + dir.col;
            
            // Check bounds (can go 1 step outside board)
            if (newRow < -1 || newRow > gameState.gridSize.rows || 
                newCol < -1 || newCol > gameState.gridSize.cols) {
                continue;
            }
            
            // Check if this is the target
            const isTarget = newRow === tile2.row && newCol === tile2.col;
            
            // Check if tile is empty or target
            const isEmpty = newRow < 0 || newRow >= gameState.gridSize.rows ||
                          newCol < 0 || newCol >= gameState.gridSize.cols ||
                          !gameState.board[newRow][newCol];
            
            if (!isEmpty && !isTarget) continue;
            
            // Calculate turns
            let newTurns = current.turns;
            if (current.direction && current.direction !== dir.name) {
                newTurns++;
            }
            
            // Max 3 turns allowed
            if (newTurns > 3) continue;
            
            queue.push({
                row: newRow,
                col: newCol,
                direction: dir.name,
                turns: newTurns,
                path: [...current.path, { row: newRow, col: newCol }]
            });
        }
    }
    
    return null;
}

// Handle successful match
function handleMatch(tile1, tile2, path) {
    // Draw path line
    drawPath(path);
    
    // Animate matched tiles
    const tile1Element = getTileElement(tile1.row, tile1.col);
    const tile2Element = getTileElement(tile2.row, tile2.col);
    
    tile1Element.classList.add('matched');
    tile2Element.classList.add('matched');
    
    // Create particle effect
    if (gameState.settings.animation) {
        createParticles(tile1Element);
        createParticles(tile2Element);
    }
    
    // Remove tiles from board
    setTimeout(() => {
        gameState.board[tile1.row][tile1.col] = null;
        gameState.board[tile2.row][tile2.col] = null;
        
        tile1Element.classList.add('empty');
        tile2Element.classList.add('empty');
        tile1Element.textContent = '';
        tile2Element.textContent = '';
        
        clearSelection();
        
        // Update score
        gameState.score += 100;
        updateUI();
        
        // Check if board is cleared
        if (isBoardCleared()) {
            setTimeout(() => {
                levelComplete();
            }, 500);
        }
    }, 500);
}

// Draw path line
function drawPath(path) {
    const canvas = document.getElementById('line-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (path.length < 2) return;
    
    // Get board position
    const boardElement = document.getElementById('game-board');
    const boardRect = boardElement.getBoundingClientRect();
    const { rows, cols } = gameState.gridSize;
    const tileWidth = boardRect.width / cols;
    const tileHeight = boardRect.height / rows;
    
    // Draw line
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const x = boardRect.left + (point.col + 0.5) * tileWidth;
        const y = boardRect.top + (point.row + 0.5) * tileHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Clear after animation
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 500);
}

// Clear selection
function clearSelection() {
    gameState.selectedTiles.forEach(tile => {
        const tileElement = getTileElement(tile.row, tile.col);
        if (tileElement) {
            tileElement.classList.remove('selected');
        }
    });
    gameState.selectedTiles = [];
}

// Get tile element
function getTileElement(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// Check if board is cleared
function isBoardCleared() {
    for (let i = 0; i < gameState.gridSize.rows; i++) {
        for (let j = 0; j < gameState.gridSize.cols; j++) {
            if (gameState.board[i][j]) {
                return false;
            }
        }
    }
    return true;
}

// Timer
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
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
    document.getElementById('score-display').textContent = gameState.score;
    document.getElementById('level-display').textContent = gameState.level;
    document.getElementById('hint-count').textContent = gameState.hintsLeft;
    
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Use hint
function useHint() {
    if (gameState.hintsLeft <= 0 || gameState.isPaused) return;
    
    // Find a valid pair
    const pair = findValidPair();
    if (!pair) {
        alert('Không tìm thấy cặp nào! Hãy xáo trộn.');
        return;
    }
    
    gameState.hintsLeft--;
    updateUI();
    
    // Highlight the pair
    const tile1Element = getTileElement(pair[0].row, pair[0].col);
    const tile2Element = getTileElement(pair[1].row, pair[1].col);
    
    tile1Element.classList.add('hint');
    tile2Element.classList.add('hint');
    
    setTimeout(() => {
        tile1Element.classList.remove('hint');
        tile2Element.classList.remove('hint');
    }, 3000);
}

// Find valid pair
function findValidPair() {
    const tiles = [];
    
    // Collect all tiles
    for (let i = 0; i < gameState.gridSize.rows; i++) {
        for (let j = 0; j < gameState.gridSize.cols; j++) {
            if (gameState.board[i][j]) {
                tiles.push({ row: i, col: j, char: gameState.board[i][j] });
            }
        }
    }
    
    // Try to find a matching pair
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i].char === tiles[j].char) {
                const path = findPath(tiles[i], tiles[j]);
                if (path) {
                    return [tiles[i], tiles[j]];
                }
            }
        }
    }
    
    return null;
}

// Shuffle tiles
function shuffleTiles() {
    if (gameState.isPaused) return;
    
    // Collect all non-empty tiles
    const tiles = [];
    for (let i = 0; i < gameState.gridSize.rows; i++) {
        for (let j = 0; j < gameState.gridSize.cols; j++) {
            if (gameState.board[i][j]) {
                tiles.push(gameState.board[i][j]);
            }
        }
    }
    
    // Shuffle
    shuffleArray(tiles);
    
    // Place back
    let tileIndex = 0;
    for (let i = 0; i < gameState.gridSize.rows; i++) {
        for (let j = 0; j < gameState.gridSize.cols; j++) {
            if (gameState.board[i][j] || tileIndex < tiles.length) {
                gameState.board[i][j] = tiles[tileIndex] || null;
                if (tiles[tileIndex]) tileIndex++;
            }
        }
    }
    
    renderBoard();
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Pause game
function pauseGame() {
    gameState.isPaused = true;
    showScreen('pause-screen');
}

// Resume game
function resumeGame() {
    gameState.isPaused = false;
    showScreen('game-screen');
}

// Restart game
function restartGame() {
    clearInterval(gameState.timerInterval);
    startGame(gameState.difficulty);
}

// Quit to menu
function quitToMenu() {
    clearInterval(gameState.timerInterval);
    clearSelection();
    showScreen('menu-screen');
}

// Quit game
function quitGame() {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
        quitToMenu();
    }
}

// Game over
function gameOver() {
    clearInterval(gameState.timerInterval);
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-level').textContent = gameState.level;
    showScreen('gameover-screen');
}

// Level complete
function levelComplete() {
    clearInterval(gameState.timerInterval);
    
    // Bonus for remaining time
    const timeBonus = gameState.timeLeft * 10;
    gameState.score += timeBonus;
    
    document.getElementById('victory-score').textContent = gameState.score;
    document.getElementById('victory-level').textContent = gameState.level;
    
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('victory-time').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    showScreen('victory-screen');
}

// Next level
function nextLevel() {
    gameState.level++;
    
    // Increase difficulty
    switch(gameState.difficulty) {
        case 'easy':
            if (gameState.gridSize.rows < 10) {
                gameState.gridSize.rows++;
                gameState.gridSize.cols++;
            }
            break;
        case 'medium':
            if (gameState.gridSize.rows < 12) {
                gameState.gridSize.rows++;
                gameState.gridSize.cols++;
            }
            break;
        case 'hard':
            if (gameState.gridSize.rows < 14) {
                gameState.gridSize.rows++;
                gameState.gridSize.cols++;
            }
            break;
    }
    
    // Add time bonus
    gameState.timeLeft += 60;
    gameState.hintsLeft = Math.min(gameState.hintsLeft + 1, 5);
    
    createBoard();
    showScreen('game-screen');
    updateUI();
    startTimer();
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Settings
function showSettings() {
    document.getElementById('sound-toggle').checked = gameState.settings.sound;
    document.getElementById('music-toggle').checked = gameState.settings.music;
    document.getElementById('animation-toggle').checked = gameState.settings.animation;
    showScreen('settings-screen');
}

function closeSettings() {
    showScreen('menu-screen');
}

function toggleSound() {
    gameState.settings.sound = document.getElementById('sound-toggle').checked;
}

function toggleMusic() {
    gameState.settings.music = document.getElementById('music-toggle').checked;
}

function toggleAnimation() {
    gameState.settings.animation = document.getElementById('animation-toggle').checked;
}

// Instructions
function showInstructions() {
    showScreen('instructions-screen');
}

function closeInstructions() {
    showScreen('menu-screen');
}

// Particle effects
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const particles = ['⭐', '✨', '💫', '🌟'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.fontSize = '2rem';
        
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 50;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;
        
        particle.style.setProperty('--target-x', targetX + 'px');
        particle.style.setProperty('--target-y', targetY + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (document.getElementById('game-screen').classList.contains('active')) {
        renderBoard();
    }
});

// Initialize on load
window.addEventListener('load', initGame);
