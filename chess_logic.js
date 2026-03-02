// ШАХОВА ЛОГІКА - ПОВНІ ПРАВИЛА

class ChessGame {
    constructor(difficulty = 1000) {
        // Випадковий вибір кольору гравця (50/50)
        this.playerColor = Math.random() < 0.5 ? 'white' : 'black';
        this.aiColor = this.playerColor === 'white' ? 'black' : 'white';
        
        this.difficulty = difficulty; // ELO рейтинг: 200, 600, 1000, 2500
        
        this.board = this.initBoard();
        this.turn = 'white'; // Білі завжди ходять першими
        this.selected = null;
        this.enPassant = null;
        this.castling = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        
        // Таблиця цінності фігур
        this.pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };
    }
    
    initBoard() {
        return [
            ['♜','♞','♝','♛','♚','♝','♞','♜'],
            ['♟','♟','♟','♟','♟','♟','♟','♟'],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['♙','♙','♙','♙','♙','♙','♙','♙'],
            ['♖','♘','♗','♕','♔','♗','♘','♖']
        ];
    }
    
    isWhitePiece(piece) {
        return ['♙','♖','♘','♗','♕','♔'].includes(piece);
    }
    
    isBlackPiece(piece) {
        return ['♟','♜','♞','♝','♛','♚'].includes(piece);
    }
    
    getPieceType(piece) {
        const types = {
            '♙': 'pawn', '♟': 'pawn',
            '♖': 'rook', '♜': 'rook',
            '♘': 'knight', '♞': 'knight',
            '♗': 'bishop', '♝': 'bishop',
            '♕': 'queen', '♛': 'queen',
            '♔': 'king', '♚': 'king'
        };
        return types[piece] || null;
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const isWhite = this.isWhitePiece(piece);
        if ((this.turn === 'white' && !isWhite) || (this.turn === 'black' && isWhite)) {
            return false;
        }
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && ((isWhite && this.isWhitePiece(targetPiece)) || 
                           (!isWhite && this.isBlackPiece(targetPiece)))) {
            return false;
        }
        
        const type = this.getPieceType(piece);
        let valid = false;
        
        switch(type) {
            case 'pawn':
                valid = this.isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite);
                break;
            case 'rook':
                valid = this.isValidRookMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'knight':
                valid = this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'bishop':
                valid = this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'queen':
                valid = this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
                break;
            case 'king':
                valid = this.isValidKingMove(fromRow, fromCol, toRow, toCol);
                break;
        }
        
        if (!valid) return false;
        
        // Перевірка на шах після ходу
        const tempBoard = JSON.parse(JSON.stringify(this.board));
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = '';
        
        const inCheck = this.isKingInCheck(isWhite ? 'white' : 'black');
        
        this.board = tempBoard;
        
        return !inCheck;
    }
    
    isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite) {
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        // Рух вперед на 1
        if (colDiff === 0 && rowDiff === direction && !this.board[toRow][toCol]) {
            return true;
        }
        
        // Рух вперед на 2 з початкової позиції
        if (colDiff === 0 && fromRow === startRow && rowDiff === direction * 2 && 
            !this.board[toRow][toCol] && !this.board[fromRow + direction][fromCol]) {
            return true;
        }
        
        // Взяття по діагоналі
        if (colDiff === 1 && rowDiff === direction && this.board[toRow][toCol]) {
            return true;
        }
        
        return false;
    }
    
    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }
    
    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }
    
    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }
    
    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }
    
    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
        const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
        
        let row = fromRow + rowStep;
        let col = fromCol + colStep;
        
        while (row !== toRow || col !== toCol) {
            if (this.board[row][col]) return false;
            row += rowStep;
            col += colStep;
        }
        
        return true;
    }
    
    isKingInCheck(color) {
        let kingRow, kingCol;
        const kingPiece = color === 'white' ? '♔' : '♚';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === kingPiece) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
        }
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                const isPieceWhite = this.isWhitePiece(piece);
                if ((color === 'white' && isPieceWhite) || (color === 'black' && !isPieceWhite)) {
                    continue;
                }
                
                const tempTurn = this.turn;
                this.turn = color === 'white' ? 'black' : 'white';
                
                const type = this.getPieceType(piece);
                let canAttack = false;
                
                switch(type) {
                    case 'pawn':
                        const direction = isPieceWhite ? -1 : 1;
                        canAttack = Math.abs(kingCol - col) === 1 && (kingRow - row) === direction;
                        break;
                    case 'rook':
                        canAttack = this.isValidRookMove(row, col, kingRow, kingCol);
                        break;
                    case 'knight':
                        canAttack = this.isValidKnightMove(row, col, kingRow, kingCol);
                        break;
                    case 'bishop':
                        canAttack = this.isValidBishopMove(row, col, kingRow, kingCol);
                        break;
                    case 'queen':
                        canAttack = this.isValidQueenMove(row, col, kingRow, kingCol);
                        break;
                    case 'king':
                        canAttack = this.isValidKingMove(row, col, kingRow, kingCol);
                        break;
                }
                
                this.turn = tempTurn;
                
                if (canAttack) return true;
            }
        }
        
        return false;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol, promotionPiece = null) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        const piece = this.board[fromRow][fromCol];
        const pieceType = this.getPieceType(piece);
        const isWhite = this.isWhitePiece(piece);
        
        // Перевірка на перетворення пішака
        if (pieceType === 'pawn') {
            if ((isWhite && toRow === 0) || (!isWhite && toRow === 7)) {
                // Пішак досяг кінця дошки - потрібне перетворення
                if (!promotionPiece) {
                    // Повертаємо спеціальний статус для запиту перетворення
                    return { needsPromotion: true, fromRow, fromCol, toRow, toCol };
                }
                // Перетворюємо пішака
                this.board[toRow][toCol] = promotionPiece;
                this.board[fromRow][fromCol] = '';
                this.turn = this.turn === 'white' ? 'black' : 'white';
                return true;
            }
        }
        
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = '';
        this.turn = this.turn === 'white' ? 'black' : 'white';
        
        return true;
    }
    
    getAllValidMoves(color) {
        const moves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (!piece) continue;
                
                const isWhite = this.isWhitePiece(piece);
                if ((color === 'white' && !isWhite) || (color === 'black' && isWhite)) {
                    continue;
                }
                
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                            moves.push({ fromRow, fromCol, toRow, toCol });
                        }
                    }
                }
            }
        }
        
        return moves;
    }
    
    makeAIMove() {
        const moves = this.getAllValidMoves(this.aiColor);
        if (moves.length === 0) {
            // Немає ходів - мат або пат
            if (this.isKingInCheck(this.aiColor)) {
                return { gameOver: true, winner: this.playerColor, reason: 'checkmate' };
            } else {
                return { gameOver: true, winner: null, reason: 'stalemate' };
            }
        }
        
        let selectedMove;
        
        // Вибір стратегії залежно від складності
        if (this.difficulty === 200) {
            // 200 ELO - Новачок: випадкові ходи
            selectedMove = this.getRandomMove(moves);
        } else if (this.difficulty === 600) {
            // 600 ELO - Початківець: базова оцінка + іноді помилки
            selectedMove = Math.random() < 0.3 
                ? this.getRandomMove(moves) 
                : this.getBestMove(moves, 1);
        } else if (this.difficulty === 1000) {
            // 1000 ELO - Середній: хороша оцінка позиції
            selectedMove = this.getBestMove(moves, 2);
        } else if (this.difficulty === 2500) {
            // 2500 ELO - Гросмейстер: глибокий аналіз
            selectedMove = this.getBestMove(moves, 3);
        }
        
        const result = this.makeMove(selectedMove.fromRow, selectedMove.fromCol, 
                           selectedMove.toRow, selectedMove.toCol);
        
        // Якщо AI пішак досяг кінця, автоматично перетворюємо на ферзя
        if (result && result.needsPromotion) {
            const queenPiece = this.aiColor === 'white' ? '♕' : '♛';
            return this.makeMove(result.fromRow, result.fromCol, 
                               result.toRow, result.toCol, queenPiece);
        }
        
        // Перевіряємо, чи гравець може ходити
        const playerMoves = this.getAllValidMoves(this.playerColor);
        if (playerMoves.length === 0) {
            if (this.isKingInCheck(this.playerColor)) {
                return { gameOver: true, winner: this.aiColor, reason: 'checkmate' };
            } else {
                return { gameOver: true, winner: null, reason: 'stalemate' };
            }
        }
        
        return result;
    }
    
    getRandomMove(moves) {
        return moves[Math.floor(Math.random() * moves.length)];
    }
    
    getBestMove(moves, depth) {
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            // Симулюємо хід
            const originalBoard = JSON.parse(JSON.stringify(this.board));
            const originalTurn = this.turn;
            
            this.board[move.toRow][move.toCol] = this.board[move.fromRow][move.fromCol];
            this.board[move.fromRow][move.fromCol] = '';
            this.turn = this.turn === 'white' ? 'black' : 'white';
            
            // Оцінюємо позицію
            let score;
            if (depth > 1) {
                score = -this.minimax(depth - 1, -Infinity, Infinity, false);
            } else {
                score = this.evaluatePosition();
            }
            
            // Відновлюємо позицію
            this.board = originalBoard;
            this.turn = originalTurn;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluatePosition();
        }
        
        const color = isMaximizing ? this.aiColor : this.playerColor;
        const moves = this.getAllValidMoves(color);
        
        if (moves.length === 0) {
            if (this.isKingInCheck(color)) {
                return isMaximizing ? -100000 : 100000;
            }
            return 0; // Пат
        }
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                const originalBoard = JSON.parse(JSON.stringify(this.board));
                const originalTurn = this.turn;
                
                this.board[move.toRow][move.toCol] = this.board[move.fromRow][move.fromCol];
                this.board[move.fromRow][move.fromCol] = '';
                this.turn = this.turn === 'white' ? 'black' : 'white';
                
                const score = this.minimax(depth - 1, alpha, beta, false);
                
                this.board = originalBoard;
                this.turn = originalTurn;
                
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                const originalBoard = JSON.parse(JSON.stringify(this.board));
                const originalTurn = this.turn;
                
                this.board[move.toRow][move.toCol] = this.board[move.fromRow][move.fromCol];
                this.board[move.fromRow][move.fromCol] = '';
                this.turn = this.turn === 'white' ? 'black' : 'white';
                
                const score = this.minimax(depth - 1, alpha, beta, true);
                
                this.board = originalBoard;
                this.turn = originalTurn;
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return minScore;
        }
    }
    
    evaluatePosition() {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                const pieceType = this.getPieceType(piece);
                const pieceValue = this.pieceValues[pieceType];
                
                const isWhite = this.isWhitePiece(piece);
                const isAIPiece = (this.aiColor === 'white' && isWhite) || 
                                 (this.aiColor === 'black' && !isWhite);
                
                let value = pieceValue;
                
                // Позиційні бонуси
                if (pieceType === 'pawn') {
                    // Пішаки цінніші в центрі та при просуванні
                    const advancement = isWhite ? (7 - row) : row;
                    value += advancement * 10;
                    if (col >= 2 && col <= 5) value += 10; // Центральні пішаки
                } else if (pieceType === 'knight' || pieceType === 'bishop') {
                    // Коні та слони цінніші в центрі
                    if (row >= 2 && row <= 5 && col >= 2 && col <= 5) {
                        value += 30;
                    }
                } else if (pieceType === 'king') {
                    // Король безпечніший на краю в мідлгеймі
                    if (this.countPieces() > 10) {
                        if (col <= 2 || col >= 5) value += 20;
                    }
                }
                
                score += isAIPiece ? value : -value;
            }
        }
        
        // Бонус за мобільність (кількість можливих ходів)
        if (this.difficulty >= 1000) {
            const aiMoves = this.getAllValidMoves(this.aiColor).length;
            const playerMoves = this.getAllValidMoves(this.playerColor).length;
            score += (aiMoves - playerMoves) * 10;
        }
        
        return score;
    }
    
    countPieces() {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col]) count++;
            }
        }
        return count;
    }
    
    checkGameOver() {
        const moves = this.getAllValidMoves(this.turn);
        if (moves.length === 0) {
            if (this.isKingInCheck(this.turn)) {
                const winner = this.turn === 'white' ? 'black' : 'white';
                return { gameOver: true, winner, reason: 'checkmate' };
            } else {
                return { gameOver: true, winner: null, reason: 'stalemate' };
            }
        }
        return { gameOver: false };
    }
}
