// FULL GAME LOGIC WITH RULES

// ========== CHESS GAME ==========
class SimpleChess {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.playerColor = Math.random() < 0.5 ? 'white' : 'black';
        this.aiColor = this.playerColor === 'white' ? 'black' : 'white';
        this.board = this.initBoard();
        this.selected = null;
        this.turn = 'white';
        this.moveHistory = [];
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
    
    isWhite(piece) {
        return ['♙','♖','♘','♗','♕','♔'].includes(piece);
    }
    
    getPieceType(piece) {
        const map = {
            '♙': 'pawn', '♟': 'pawn',
            '♖': 'rook', '♜': 'rook',
            '♘': 'knight', '♞': 'knight',
            '♗': 'bishop', '♝': 'bishop',
            '♕': 'queen', '♛': 'queen',
            '♔': 'king', '♚': 'king'
        };
        return map[piece];
    }
    
    isValidMove(fromR, fromC, toR, toC) {
        const piece = this.board[fromR][fromC];
        if (!piece) return false;
        
        const isWhitePiece = this.isWhite(piece);
        const target = this.board[toR][toC];
        
        // Can't capture own piece
        if (target && ((isWhitePiece && this.isWhite(target)) || (!isWhitePiece && !this.isWhite(target)))) {
            return false;
        }
        
        const type = this.getPieceType(piece);
        const dr = toR - fromR;
        const dc = toC - fromC;
        
        switch(type) {
            case 'pawn':
                const dir = isWhitePiece ? -1 : 1;
                if (dc === 0 && !target) {
                    if (dr === dir) return true;
                    if (dr === dir * 2 && fromR === (isWhitePiece ? 6 : 1) && !this.board[fromR + dir][fromC]) return true;
                }
                if (Math.abs(dc) === 1 && dr === dir && target) return true;
                return false;
                
            case 'rook':
                if (dr === 0 || dc === 0) return this.isPathClear(fromR, fromC, toR, toC);
                return false;
                
            case 'knight':
                return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
                
            case 'bishop':
                if (Math.abs(dr) === Math.abs(dc)) return this.isPathClear(fromR, fromC, toR, toC);
                return false;
                
            case 'queen':
                if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
                    return this.isPathClear(fromR, fromC, toR, toC);
                }
                return false;
                
            case 'king':
                return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
        }
        return false;
    }
    
    isPathClear(fromR, fromC, toR, toC) {
        const dr = Math.sign(toR - fromR);
        const dc = Math.sign(toC - fromC);
        let r = fromR + dr;
        let c = fromC + dc;
        
        while (r !== toR || c !== toC) {
            if (this.board[r][c]) return false;
            r += dr;
            c += dc;
        }
        return true;
    }
    
    move(fromR, fromC, toR, toC) {
        if (!this.isValidMove(fromR, fromC, toR, toC)) return false;
        
        const piece = this.board[fromR][fromC];
        this.board[toR][toC] = piece;
        this.board[fromR][fromC] = '';
        this.turn = this.turn === 'white' ? 'black' : 'white';
        this.moveHistory.push({fromR, fromC, toR, toC, piece});
        return true;
    }
    
    aiMove() {
        const moves = this.getAllValidMoves(this.aiColor);
        if (moves.length === 0) return null;
        
        // Simple AI based on difficulty
        let move;
        if (this.difficulty <= 200) {
            // Random
            move = moves[Math.floor(Math.random() * moves.length)];
        } else if (this.difficulty <= 600) {
            // Prefer captures
            const captures = moves.filter(m => this.board[m.toR][m.toC]);
            move = captures.length > 0 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Best move (simple evaluation)
            move = this.getBestMove(moves);
        }
        
        this.move(move.fromR, move.fromC, move.toR, move.toC);
        return move;
    }
    
    getAllValidMoves(color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (!piece) continue;
                if ((color === 'white' && !this.isWhite(piece)) || (color === 'black' && this.isWhite(piece))) continue;
                
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (this.isValidMove(r, c, tr, tc)) {
                            moves.push({fromR: r, fromC: c, toR: tr, toC: tc});
                        }
                    }
                }
            }
        }
        return moves;
    }
    
    getBestMove(moves) {
        let bestScore = -Infinity;
        let bestMove = moves[0];
        
        for (let move of moves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }
    
    evaluateMove(move) {
        const pieceValues = {pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100};
        let score = 0;
        
        const target = this.board[move.toR][move.toC];
        if (target) {
            score += pieceValues[this.getPieceType(target)] * 10;
        }
        
        // Center control
        const centerDist = Math.abs(move.toR - 3.5) + Math.abs(move.toC - 3.5);
        score += (7 - centerDist) * 0.1;
        
        return score;
    }
}

// ========== MINESWEEPER ==========
class SimpleMinesweeper {
    constructor(rows = 10, cols = 10, mines = 15) {
        this.rows = rows;
        this.cols = cols;
        this.mineCount = mines;
        this.board = [];
        this.revealed = [];
        this.flags = [];
        this.gameOver = false;
        this.won = false;
        this.init();
    }
    
    init() {
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = [];
            this.revealed[r] = [];
            this.flags[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.board[r][c] = 0;
                this.revealed[r][c] = false;
                this.flags[r][c] = false;
            }
        }
        
        let placed = 0;
        while (placed < this.mineCount) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            if (this.board[r][c] !== -1) {
                this.board[r][c] = -1;
                placed++;
            }
        }
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] === -1) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === -1) {
                            count++;
                        }
                    }
                }
                this.board[r][c] = count;
            }
        }
    }
    
    reveal(r, c) {
        if (this.gameOver || this.revealed[r][c] || this.flags[r][c]) return 'invalid';
        
        this.revealed[r][c] = true;
        
        if (this.board[r][c] === -1) {
            this.gameOver = true;
            this.revealAll();
            return 'lose';
        }
        
        if (this.board[r][c] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !this.revealed[nr][nc]) {
                        this.reveal(nr, nc);
                    }
                }
            }
        }
        
        if (this.checkWin()) {
            this.gameOver = true;
            this.won = true;
            return 'win';
        }
        
        return 'ok';
    }
    
    toggleFlag(r, c) {
        if (this.revealed[r][c] || this.gameOver) return;
        this.flags[r][c] = !this.flags[r][c];
    }
    
    checkWin() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c] !== -1 && !this.revealed[r][c]) return false;
            }
        }
        return true;
    }
    
    revealAll() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.revealed[r][c] = true;
            }
        }
    }
}

// ========== FOOL CARD GAME ==========
class SimpleFool {
    constructor() {
        this.deck = this.createDeck();
        this.playerHand = [];
        this.aiHand = [];
        this.table = [];
        this.trump = null;
        this.attacker = 'player';
        this.defending = false;
        this.init();
    }
    
    createDeck() {
        const suits = ['♠','♥','♦','♣'];
        const ranks = ['6','7','8','9','10','J','Q','K','A'];
        const deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({rank, suit, card: rank + suit});
            }
        }
        return this.shuffle(deck);
    }
    
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    init() {
        for (let i = 0; i < 6; i++) {
            if (this.deck.length > 0) this.playerHand.push(this.deck.pop());
            if (this.deck.length > 0) this.aiHand.push(this.deck.pop());
        }
        if (this.deck.length > 0) {
            this.trump = this.deck[0];
        }
    }
    
    getRankValue(rank) {
        const values = {'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14};
        return values[rank];
    }
    
    canBeat(attackCard, defendCard) {
        if (!attackCard || !defendCard) return false;
        
        const isTrumpAttack = attackCard.suit === this.trump.suit;
        const isTrumpDefend = defendCard.suit === this.trump.suit;
        
        if (isTrumpDefend && !isTrumpAttack) return true;
        if (!isTrumpDefend && isTrumpAttack) return false;
        if (attackCard.suit !== defendCard.suit) return false;
        
        return this.getRankValue(defendCard.rank) > this.getRankValue(attackCard.rank);
    }
    
    canAttackWith(cardObj) {
        if (this.table.length === 0) return true;
        
        // Can only attack with cards that match ranks on table
        const tableRanks = this.table.map(c => c.rank);
        return tableRanks.includes(cardObj.rank);
    }
    
    playCard(cardStr, isPlayer = true) {
        const hand = isPlayer ? this.playerHand : this.aiHand;
        const idx = hand.findIndex(c => c.card === cardStr);
        if (idx === -1) return false;
        
        const cardObj = hand[idx];
        
        // Check if can attack with this card
        if (!this.defending && !this.canAttackWith(cardObj)) {
            return false;
        }
        
        hand.splice(idx, 1);
        this.table.push(cardObj);
        this.defending = !this.defending;
        return true;
    }
    
    aiDefend() {
        if (this.table.length === 0) return null;
        
        const attackCard = this.table[this.table.length - 1];
        const validCards = this.aiHand.filter(c => this.canBeat(attackCard, c));
        
        if (validCards.length === 0) return null;
        
        // Choose lowest valid card
        validCards.sort((a, b) => this.getRankValue(a.rank) - this.getRankValue(b.rank));
        const card = validCards[0];
        
        const idx = this.aiHand.findIndex(c => c.card === card.card);
        this.aiHand.splice(idx, 1);
        this.table.push(card);
        this.defending = false;
        return card;
    }
    
    aiAttack() {
        if (this.aiHand.length === 0) return null;
        
        let validCards = this.aiHand;
        if (this.table.length > 0) {
            const tableRanks = this.table.map(c => c.rank);
            validCards = this.aiHand.filter(c => tableRanks.includes(c.rank));
        }
        
        if (validCards.length === 0) return null;
        
        // Choose random valid card
        const card = validCards[Math.floor(Math.random() * validCards.length)];
        const idx = this.aiHand.findIndex(c => c.card === card.card);
        this.aiHand.splice(idx, 1);
        this.table.push(card);
        this.defending = true;
        return card;
    }
    
    takeCards(isPlayer = true) {
        const hand = isPlayer ? this.playerHand : this.aiHand;
        hand.push(...this.table);
        this.table = [];
        this.defending = false;
        this.attacker = isPlayer ? 'ai' : 'player';
    }
    
    clearTable() {
        this.table = [];
        this.defending = false;
    }
    
    drawCards() {
        // Attacker draws first
        const attackerHand = this.attacker === 'player' ? this.playerHand : this.aiHand;
        const defenderHand = this.attacker === 'player' ? this.aiHand : this.playerHand;
        
        while (attackerHand.length < 6 && this.deck.length > 0) {
            attackerHand.push(this.deck.pop());
        }
        while (defenderHand.length < 6 && this.deck.length > 0) {
            defenderHand.push(this.deck.pop());
        }
    }
    
    checkWin() {
        if (this.deck.length === 0) {
            if (this.playerHand.length === 0) return 'player';
            if (this.aiHand.length === 0) return 'ai';
        }
        return null;
    }
}

// ========== POKER ==========
class SimplePoker {
    constructor() {
        this.deck = [];
        this.players = [
            {name: 'ТИ', chips: 1000, hand: [], bet: 0, folded: false, position: 'bottom', isHuman: true},
            {name: 'AI 1', chips: 1000, hand: [], bet: 0, folded: false, position: 'left', isHuman: false},
            {name: 'AI 2', chips: 1000, hand: [], bet: 0, folded: false, position: 'top-left', isHuman: false},
            {name: 'AI 3', chips: 1000, hand: [], bet: 0, folded: false, position: 'top-right', isHuman: false},
            {name: 'AI 4', chips: 1000, hand: [], bet: 0, folded: false, position: 'right', isHuman: false}
        ];
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.dealerIndex = 0;
        this.currentPlayerIndex = 0;
        this.stage = 'preflop';
        this.smallBlind = 10;
        this.bigBlind = 20;
        this.roundBets = [];
        this.lastRaiseIndex = -1;
    }
    
    createDeck() {
        const suits = ['♠','♥','♦','♣'];
        const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        const deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({rank, suit, card: rank + suit});
            }
        }
        return this.shuffle(deck);
    }
    
    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    deal() {
        this.deck = this.createDeck();
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        this.stage = 'preflop';
        this.roundBets = [];
        this.lastRaiseIndex = -1;
        
        // Reset players
        this.players.forEach(p => {
            p.hand = [];
            p.bet = 0;
            p.folded = p.chips <= 0;
        });
        
        // Deal 2 cards to each player
        for (let i = 0; i < 2; i++) {
            this.players.forEach(p => {
                if (this.deck.length > 0 && !p.folded) {
                    p.hand.push(this.deck.pop());
                }
            });
        }
        
        // Post blinds
        const sbIndex = (this.dealerIndex + 1) % this.players.length;
        const bbIndex = (this.dealerIndex + 2) % this.players.length;
        
        this.postBlind(sbIndex, this.smallBlind);
        this.postBlind(bbIndex, this.bigBlind);
        
        this.currentPlayerIndex = (this.dealerIndex + 3) % this.players.length;
        this.lastRaiseIndex = bbIndex;
    }
    
    postBlind(playerIndex, amount) {
        const player = this.players[playerIndex];
        const actualAmount = Math.min(amount, player.chips);
        player.chips -= actualAmount;
        player.bet += actualAmount;
        this.pot += actualAmount;
        this.currentBet = Math.max(this.currentBet, player.bet);
    }
    
    getActivePlayers() {
        return this.players.filter(p => !p.folded && p.chips > 0);
    }
    
    isRoundComplete() {
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) return true;
        
        // All players must have acted at least once
        let allActed = true;
        let allMatched = true;
        
        for (let player of this.players) {
            if (player.folded || player.chips === 0) continue;
            
            // Check if player has matched current bet or is all-in
            if (player.bet < this.currentBet && player.chips > 0) {
                allMatched = false;
                break;
            }
        }
        
        return allMatched;
    }
    
    nextStage() {
        // Reset bets for new round
        this.players.forEach(p => p.bet = 0);
        this.currentBet = 0;
        this.lastRaiseIndex = -1;
        
        if (this.stage === 'preflop') {
            this.flop();
        } else if (this.stage === 'flop') {
            this.turn();
        } else if (this.stage === 'turn') {
            this.river();
        } else if (this.stage === 'river') {
            this.showdown();
            return;
        }
        
        // Set current player to first active after dealer
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
        while (this.players[this.currentPlayerIndex].folded || this.players[this.currentPlayerIndex].chips === 0) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            // Safety check to prevent infinite loop
            if (this.currentPlayerIndex === this.dealerIndex) break;
        }
    }
    
    flop() {
        this.deck.pop(); // Burn card
        for (let i = 0; i < 3; i++) {
            if (this.deck.length > 0) {
                this.communityCards.push(this.deck.pop());
            }
        }
        this.stage = 'flop';
    }
    
    turn() {
        this.deck.pop();
        if (this.deck.length > 0) {
            this.communityCards.push(this.deck.pop());
        }
        this.stage = 'turn';
    }
    
    river() {
        this.deck.pop();
        if (this.deck.length > 0) {
            this.communityCards.push(this.deck.pop());
        }
        this.stage = 'river';
    }
    
    showdown() {
        this.stage = 'showdown';
        const activePlayers = this.players.filter(p => !p.folded);
        
        if (activePlayers.length === 1) {
            activePlayers[0].chips += this.pot;
            return activePlayers[0];
        }
        
        // Simple winner determination (highest card for now)
        let winner = activePlayers[0];
        for (let player of activePlayers) {
            if (this.getHandValue(player.hand) > this.getHandValue(winner.hand)) {
                winner = player;
            }
        }
        
        winner.chips += this.pot;
        return winner;
    }
    
    getHandValue(hand) {
        const values = {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14};
        return hand.reduce((sum, card) => sum + values[card.rank], 0);
    }
    
    playerAction(action, amount = 0) {
        const player = this.players[0];
        
        if (action === 'fold') {
            player.folded = true;
            return true;
        } else if (action === 'check') {
            if (player.bet === this.currentBet) {
                return true;
            }
            return false;
        } else if (action === 'call') {
            const callAmount = this.currentBet - player.bet;
            const actualAmount = Math.min(callAmount, player.chips);
            player.chips -= actualAmount;
            player.bet += actualAmount;
            this.pot += actualAmount;
            return true;
        } else if (action === 'raise') {
            const totalAmount = this.currentBet - player.bet + amount;
            if (totalAmount > player.chips) return false;
            player.chips -= totalAmount;
            player.bet += totalAmount;
            this.pot += totalAmount;
            this.currentBet = player.bet;
            this.lastRaiseIndex = 0;
            return true;
        }
        
        return false;
    }
    
    aiAction(playerIndex) {
        const player = this.players[playerIndex];
        if (player.folded || player.chips === 0) return {action: 'skip'};
        
        const callAmount = this.currentBet - player.bet;
        const handStrength = this.getHandValue(player.hand) / 28; // Normalize 0-1
        const random = Math.random();
        const potOdds = callAmount > 0 ? callAmount / (this.pot + callAmount) : 0;
        
        // Decision making based on hand strength and pot odds
        if (callAmount === 0) {
            // Can check or bet
            if (handStrength > 0.65 && random < 0.4 && player.chips > this.bigBlind) {
                // Strong hand, bet
                const betAmount = Math.min(
                    Math.floor(this.pot * (0.3 + random * 0.4)),
                    player.chips,
                    Math.floor(player.chips * 0.3)
                );
                if (betAmount >= this.bigBlind) {
                    player.chips -= betAmount;
                    player.bet += betAmount;
                    this.pot += betAmount;
                    this.currentBet = player.bet;
                    this.lastRaiseIndex = playerIndex;
                    return {action: 'bet', amount: betAmount};
                }
            }
            return {action: 'check'};
        } else {
            // Must call, raise or fold
            if (handStrength < 0.25 || (handStrength < 0.45 && potOdds > 0.3)) {
                player.folded = true;
                return {action: 'fold'};
            } else if (handStrength > 0.75 && random < 0.35 && player.chips > callAmount + this.bigBlind) {
                // Strong hand, raise
                const raiseAmount = Math.min(
                    Math.floor(this.pot * (0.4 + random * 0.3)),
                    player.chips - callAmount,
                    Math.floor((player.chips - callAmount) * 0.4)
                );
                if (raiseAmount >= this.bigBlind) {
                    const totalAmount = callAmount + raiseAmount;
                    player.chips -= totalAmount;
                    player.bet += totalAmount;
                    this.pot += totalAmount;
                    this.currentBet = player.bet;
                    this.lastRaiseIndex = playerIndex;
                    return {action: 'raise', amount: totalAmount};
                }
            }
            
            // Call
            const actualAmount = Math.min(callAmount, player.chips);
            player.chips -= actualAmount;
            player.bet += actualAmount;
            this.pot += actualAmount;
            return {action: 'call', amount: actualAmount};
        }
    }
    
    nextPlayer() {
        const startIndex = this.currentPlayerIndex;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            // Prevent infinite loop
            if (this.currentPlayerIndex === startIndex) break;
        } while (this.players[this.currentPlayerIndex].folded || this.players[this.currentPlayerIndex].chips === 0);
    }
}
