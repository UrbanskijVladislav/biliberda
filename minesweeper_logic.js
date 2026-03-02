// MINESWEEPER (САПЕР) GAME LOGIC

class MinesweeperGame {
    constructor(difficulty = 'easy') {
        this.difficulties = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 12, cols: 12, mines: 25 },
            hard: { rows: 16, cols: 16, mines: 50 }
        };
        
        this.setDifficulty(difficulty);
        this.initGame();
    }
    
    setDifficulty(difficulty) {
        const config = this.difficulties[difficulty];
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.difficulty = difficulty;
    }
    
    initGame() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.won = false;
        this.firstClick = true;
        this.revealedCount = 0;
        this.flagCount = 0;
        this.startTime = null;
        this.timer = 0;
        
        // Створюємо порожню дошку
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            this.revealed[row] = [];
            this.flagged[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = 0;
                this.revealed[row][col] = false;
                this.flagged[row][col] = false;
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Не ставимо міну на першу клітинку та навколо неї
            const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;
            
            if (this.board[row][col] !== -1 && !isExcluded) {
                this.board[row][col] = -1; // -1 означає міну
                minesPlaced++;
                
                // Оновлюємо числа навколо міни
                this.updateNumbers(row, col);
            }
        }
    }
    
    updateNumbers(mineRow, mineCol) {
        for (let row = mineRow - 1; row <= mineRow + 1; row++) {
            for (let col = mineCol - 1; col <= mineCol + 1; col++) {
                if (this.isValidCell(row, col) && this.board[row][col] !== -1) {
                    this.board[row][col]++;
                }
            }
        }
    }
    
    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    revealCell(row, col) {
        if (this.gameOver || !this.isValidCell(row, col)) {
            return { success: false, message: 'Неправильна клітинка' };
        }
        
        if (this.revealed[row][col] || this.flagged[row][col]) {
            return { success: false, message: 'Клітинка вже відкрита або позначена' };
        }
        
        // Перший клік - розміщуємо міни
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTime = Date.now();
        }
        
        // Якщо натиснули на міну
        if (this.board[row][col] === -1) {
            this.gameOver = true;
            this.revealAllMines();
            return { 
                success: true, 
                gameOver: true, 
                won: false,
                message: '💥 Бум! Ти натиснув на міну!' 
            };
        }
        
        // Відкриваємо клітинку
        this.revealCellRecursive(row, col);
        
        // Перевіряємо перемогу
        if (this.checkWin()) {
            this.gameOver = true;
            this.won = true;
            return { 
                success: true, 
                gameOver: true, 
                won: true,
                message: '🎉 Вітаю! Ти виграв!' 
            };
        }
        
        return { success: true, message: 'Клітинка відкрита' };
    }
    
    revealCellRecursive(row, col) {
        if (!this.isValidCell(row, col) || this.revealed[row][col] || this.flagged[row][col]) {
            return;
        }
        
        this.revealed[row][col] = true;
        this.revealedCount++;
        
        // Якщо клітинка порожня (0), відкриваємо сусідні
        if (this.board[row][col] === 0) {
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r !== row || c !== col) {
                        this.revealCellRecursive(r, c);
                    }
                }
            }
        }
    }
    
    toggleFlag(row, col) {
        if (this.gameOver || !this.isValidCell(row, col)) {
            return { success: false, message: 'Неправильна клітинка' };
        }
        
        if (this.revealed[row][col]) {
            return { success: false, message: 'Клітинка вже відкрита' };
        }
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.flagCount += this.flagged[row][col] ? 1 : -1;
        
        return { 
            success: true, 
            message: this.flagged[row][col] ? '🚩 Прапорець встановлено' : 'Прапорець знято',
            flagCount: this.flagCount
        };
    }
    
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === -1) {
                    this.revealed[row][col] = true;
                }
            }
        }
    }
    
    checkWin() {
        // Перемога якщо всі клітинки крім мін відкриті
        const totalCells = this.rows * this.cols;
        return this.revealedCount === totalCells - this.totalMines;
    }
    
    getCell(row, col) {
        if (!this.isValidCell(row, col)) return null;
        
        return {
            value: this.board[row][col],
            revealed: this.revealed[row][col],
            flagged: this.flagged[row][col]
        };
    }
    
    getRemainingMines() {
        return this.totalMines - this.flagCount;
    }
    
    getTimer() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}
