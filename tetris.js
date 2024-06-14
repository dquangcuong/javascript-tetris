const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const modalScoreElement = document.getElementById('modal-score'); // Thêm modalScoreElement để lấy điểm số trong modal

const scale = 30; // Scale factor for the game board

// Adjust canvas size
canvas.width = 10 * scale; // Width of the canvas based on number of columns
canvas.height = 20 * scale; // Height of the canvas based on number of rows

// Adjust scale factor for context to match new dimensions
context.scale(scale, scale);

// function arenaSweep() {
//     outer: for (let y = arena.length - 1; y > 0; --y) {
//         for (let x = 0; x < arena[y].length; ++x) {
//             if (arena[y][x] === 0) {
//                 continue outer;
//             }
//         }

//         const row = arena.splice(y, 1)[0].fill(0);
//         arena.unshift(row);
//         ++y;

//         player.score += 10;
//     }
// }
function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += 10 * ++rowCount;
    }
}


function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerMove(dir) {
    if (!gameOver) { // Check if game over before allowing movement
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }
}

function isGameOver() {
    const playerMatrix = player.matrix;
    const playerPosY = player.pos.y;
    for (let y = 0; y < playerMatrix.length; ++y) {
        for (let x = 0; x < playerMatrix[y].length; ++x) {
            if (playerMatrix[y][x] !== 0 && (arena[y + playerPosY] && arena[y + playerPosY][x + player.pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// function playerReset() {
//     const pieces = 'ILJOTSZ';
//     player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
//     player.pos.y = 0;
//     player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

//     // Check if the new piece collides immediately after spawning
//     if (collide(arena, player)) {
//         // Game over logic
//         arena.forEach(row => row.fill(0)); // Clear the arena
//         player.score = 0;
//         updateScore();
//         showGameOverModal(); // Show game over modal
//         gameOver = true; // Set game over flag
//         // Optionally, you can reset the game here if needed
//         // Example: playerReset(); updateScore(); update();
//     }
// }
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    // Check if the new piece collides immediately after spawning
    if (collide(arena, player)) {
        // Game over logic
        arena.forEach(row => row.fill(0)); // Clear the arena
        // Do not reset player.score here
        showGameOverModal(); // Show game over modal
        gameOver = true; // Set game over flag
    }
}


function playerDrop() {
    if (!gameOver) { // Check if game over before allowing drop
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            updateScore();
            if (isGameOver()) {
                showGameOverModal(); // Show game over modal
                gameOver = true; // Set game over flag
                // Reset the game if needed
                // Example: playerReset(); updateScore(); update();
            }
        }
        dropCounter = 0;
    }
}

function playerRotate(dir) {
    if (!gameOver) { // Kiểm tra trước khi cho phép quay khối
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
let gameOver = false; // Flag to track game over state

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    if (isGameOver()) {
        showGameOverModal(); // Show game over modal
        gameOver = true; // Set game over flag
    } else {
        requestAnimationFrame(update);
    }
}

function updateScore() {
    scoreElement.innerText = 'Score: ' + player.score;
}

function showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const modalScore = document.getElementById('modal-score');
    modalScore.textContent = player.score; // Lấy điểm số từ player.score
    modal.style.display = 'block';
}


function restartGameFromModal() {
    const modal = document.getElementById('game-over-modal');
    modal.style.display = 'none';
    gameOver = false; // Reset game over flag
    player.score = 0; // Reset điểm số
    playerReset(); // Reset game
    updateScore(); // Cập nhật điểm số hiển thị
    update(); // Bắt đầu ván mới
}


const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(10, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

document.addEventListener('keydown', event => {
    if (!gameOver) { // Kiểm tra trước khi cho phép xử lý sự kiện phím
        if (event.keyCode === 37) {
            playerMove(-1); // Di chuyển sang trái khi nhấn mũi tên trái
        } else if (event.keyCode === 39) {
            playerMove(1); // Di chuyển sang phải khi nhấn mũi tên phải
        } else if (event.keyCode === 40) {
            playerDrop(); // Thả khối xuống khi nhấn mũi tên xuống
        } else if (event.keyCode === 38) {
            playerRotate(); // Quay khối rơi xuống khi nhấn mũi tên lên
        }
    }
});

playerReset();
updateScore();
update();
