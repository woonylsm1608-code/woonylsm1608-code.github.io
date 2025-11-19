const BOARD_SIZE = 5;
const WIN_LEN = 4;
let maxDepth = 4;
let board = Array(25).fill(" ");
let gameOver = false;

function $(id) { return document.getElementById(id); }

// 게임 시작
window.onload = () => {
    createBoardUI();
    updateBoardUI();
};

// UI 보드 생성
function createBoardUI() {
    const boardDiv = $("board");
    boardDiv.innerHTML = "";

    for (let i = 0; i < 25; i++) {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => playerMove(i);
        cell.id = "cell-" + i;
        boardDiv.appendChild(cell);
    }
}

// UI 업데이트
function updateBoardUI() {
    for (let i = 0; i < 25; i++) {
        $("cell-" + i).innerText = board[i];
    }
}

// 승리 체크
function checkWin(player) {
    const N = BOARD_SIZE;

    // 가로
    for (let r = 0; r < N; r++) {
        for (let c = 0; c <= N - WIN_LEN; c++) {
            if ([0,1,2,3].every(i => board[r*N + (c+i)] === player))
                return true;
        }
    }

    // 세로
    for (let c = 0; c < N; c++) {
        for (let r = 0; r <= N - WIN_LEN; r++) {
            if ([0,1,2,3].every(i => board[(r+i)*N + c] === player))
                return true;
        }
    }

    // 대각 ↘
    for (let r = 0; r <= N - WIN_LEN; r++) {
        for (let c = 0; c <= N - WIN_LEN; c++) {
            if ([0,1,2,3].every(i => board[(r+i)*N + (c+i)] === player))
                return true;
        }
    }

    // 대각 ↙
    for (let r = 0; r <= N - WIN_LEN; r++) {
        for (let c = WIN_LEN - 1; c < N; c++) {
            if ([0,1,2,3].every(i => board[(r+i)*N + (c-i)] === player))
                return true;
        }
    }

    return false;
}

function emptyCells() {
    return board.map((v, i) => v === " " ? i : null).filter(v => v !== null);
}

function isGameOver() {
    return checkWin("X") || checkWin("O") || emptyCells().length === 0;
}

// Minimax 알고리즘 (JS 버전)
function minimax(depth, isMax, maxDepthLimit) {

    if (checkWin("X")) return 100 - depth;
    if (checkWin("O")) return depth - 100;
    if (emptyCells().length === 0) return 0;
    if (depth >= maxDepthLimit) return 0;

    let best = isMax ? -9999 : 9999;
    let player = isMax ? "X" : "O";

    for (let cell of emptyCells()) {
        board[cell] = player;
        let score = minimax(depth + 1, !isMax, maxDepthLimit);
        board[cell] = " ";

        if (isMax) best = Math.max(best, score);
        else best = Math.min(best, score);
    }

    return best;
}

// AI 최적 수 선택
function bestMove() {
    let bestScore = -9999;
    let move = null;

    for (let cell of emptyCells()) {
        board[cell] = "X";
        let score = minimax(0, false, maxDepth);
        board[cell] = " ";

        if (score > bestScore) {
            bestScore = score;
            move = cell;
        }
    }

    return move;
}

// 플레이어 클릭
function playerMove(i) {
    if (gameOver || board[i] !== " ") return;

    board[i] = "O";
    updateBoardUI();

    if (checkWin("O")) {
        $("status").innerText = "당신이 승리했습니다!";
        gameOver = true;
        return;
    }

    if (emptyCells().length === 0) {
        $("status").innerText = "무승부!";
        gameOver = true;
        return;
    }

    $("status").innerText = "AI 생각 중...";
    setTimeout(aiMove, 300);
}

// AI 이동
function aiMove() {
    maxDepth = parseInt($("level").value);
    const move = bestMove();
    board[move] = "X";
    updateBoardUI();

    if (checkWin("X")) {
        $("status").innerText = "AI 승리!";
        gameOver = true;
        return;
    }

    if (emptyCells().length === 0) {
        $("status").innerText = "무승부!";
        gameOver = true;
        return;
    }

    $("status").innerText = "";
}

// 게임 다시 시작
function restartGame() {
    board = Array(25).fill(" ");
    gameOver = false;
    $("status").innerText = "";
    createBoardUI();
    updateBoardUI();
}
