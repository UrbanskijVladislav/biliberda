// TEXAS HOLD'EM POKER LOGIC

class PokerGame {
    constructor() {
        this.suits = ['♠', '♥', '♦', '♣'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.rankValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        
        this.smallBlind = 10000;
        this.bigBlind = 20000;
        
        // 5 гравців: 0 - людина (внизу), 1-4 - AI
        this.players = [
            { id: 0, name: 'Ти', chips: 1000000, isHuman: true, folded: false, bet: 0, hand: [] },
            { id: 1, name: 'AI 1', chips: 1000000, isHuman: false, folded: false, bet: 0, hand: [] },
            { id: 2, name: 'AI 2', chips: 1000000, isHuman: false, folded: false, bet: 0, hand: [] },
            { id: 3, name: 'AI 3', chips: 1000000, isHuman: false, folded: false, bet: 0, hand: [] },
            { id: 4, name: 'AI 4', chips: 1000000, isHuman: false, folded: false, bet: 0, hand: [] }
        ];
        
        this.dealerPosition = 0;
        this.currentPlayer = 0;
        
        this.initRound();
    }
    
    initRound() {
        this.deck = this.createDeck();
        this.shuffleDeck();
        
        // Скидаємо стан гравців
        this.players.forEach(player => {
            player.hand = [];
            player.folded = false;
            player.bet = 0;
        });
        
        this.communityCards = [];
        this.stage = 'preflop';
        this.pot = 0;
        this.currentBet = this.bigBlind;
        this.roundOver = false;
        
        // Переміщуємо дилера
        this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
        
        // Блайнди
        const smallBlindPos = (this.dealerPosition + 1) % this.players.length;
        const bigBlindPos = (this.dealerPosition + 2) % this.players.length;
        
        this.players[smallBlindPos].chips -= this.smallBlind;
        this.players[smallBlindPos].bet = this.smallBlind;
        this.players[bigBlindPos].chips -= this.bigBlind;
        this.players[bigBlindPos].bet = this.bigBlind;
        this.pot = this.smallBlind + this.bigBlind;
        
        // Перший хід після big blind
        this.currentPlayer = (bigBlindPos + 1) % this.players.length;
        
        // Роздаємо карти
        this.dealCards();
    }
    
    createDeck() {
        const deck = [];
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                deck.push({ rank, suit });
            }
        }
        return deck;
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCards() {
        // Роздаємо по 2 карти кожному гравцю
        for (let i = 0; i < 2; i++) {
            this.players.forEach(player => {
                if (player.chips > 0) {
                    player.hand.push(this.deck.pop());
                }
            });
        }
    }
    
    getActivePlayers() {
        return this.players.filter(p => !p.folded && p.chips >= 0);
    }
    
    getCurrentPlayer() {
        return this.players[this.currentPlayer];
    }
    
    nextPlayer() {
        let count = 0;
        do {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
            count++;
            if (count > this.players.length) break;
        } while (this.players[this.currentPlayer].folded || this.players[this.currentPlayer].chips === 0);
    }
    
    isRoundComplete() {
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) return true;
        
        // Перевіряємо чи всі зрівняли ставки
        const maxBet = Math.max(...this.players.map(p => p.bet));
        return activePlayers.every(p => p.bet === maxBet || p.chips === 0);
    }
    
    playerAction(action, amount = 0) {
        const player = this.players[0]; // Людина завжди гравець 0
        
        if (this.roundOver || player.folded || this.currentPlayer !== 0) {
            return { success: false, message: 'Зараз не твій хід' };
        }
        
        switch (action) {
            case 'fold':
                player.folded = true;
                this.nextPlayer();
                
                if (this.getActivePlayers().length === 1) {
                    return { 
                        success: true, 
                        message: '😔 Ти скинув карти',
                        gameOver: true,
                        needsShowdown: false
                    };
                }
                
                return { success: true, message: '😔 Ти скинув карти' };
                
            case 'check':
                if (player.bet < this.currentBet) {
                    return { success: false, message: 'Не можна чекати, потрібно зрівняти ставку' };
                }
                this.nextPlayer();
                return { success: true, message: '✓ Чек' };
                
            case 'call':
                const callAmount = this.currentBet - player.bet;
                if (callAmount > player.chips) {
                    return { success: false, message: 'Недостатньо фішок' };
                }
                player.chips -= callAmount;
                player.bet += callAmount;
                this.pot += callAmount;
                this.nextPlayer();
                return { success: true, message: `✓ Колл ${callAmount}` };
                
            case 'raise':
                const raiseAmount = amount;
                const totalNeeded = (this.currentBet - player.bet) + raiseAmount;
                
                if (totalNeeded > player.chips) {
                    return { success: false, message: 'Недостатньо фішок' };
                }
                
                if (raiseAmount < this.bigBlind) {
                    return { success: false, message: `Мінімальний рейз: ${this.bigBlind}` };
                }
                
                player.chips -= totalNeeded;
                player.bet += totalNeeded;
                this.pot += totalNeeded;
                this.currentBet = player.bet;
                this.nextPlayer();
                
                return { success: true, message: `🔥 Рейз до ${player.bet}` };
                
            case 'allin':
                const allinAmount = player.chips;
                player.bet += allinAmount;
                this.pot += allinAmount;
                player.chips = 0;
                if (player.bet > this.currentBet) {
                    this.currentBet = player.bet;
                }
                this.nextPlayer();
                return { success: true, message: '🚀 ALL-IN!' };
                
            default:
                return { success: false, message: 'Невідома дія' };
        }
    }
    
    aiTurn() {
        const player = this.players[this.currentPlayer];
        
        if (this.roundOver || player.folded || player.isHuman) {
            return { success: false, message: 'Не хід AI' };
        }
        
        // Покращена AI логіка
        const handStrength = this.evaluateHandStrength(player.hand, this.communityCards);
        const callAmount = this.currentBet - player.bet;
        const potOdds = callAmount > 0 ? callAmount / (this.pot + callAmount) : 0;
        
        // Агресивність залежить від сили руки
        const aggression = handStrength * Math.random();
        
        // Якщо AI може чекати
        if (callAmount === 0) {
            // Рейз з хорошою рукою (більш агресивно)
            if (handStrength > 0.6 && Math.random() > 0.4) {
                const raiseMultiplier = handStrength > 0.8 ? 3 : 2;
                const raiseAmount = this.bigBlind * raiseMultiplier;
                
                if (raiseAmount <= player.chips) {
                    player.chips -= raiseAmount;
                    player.bet += raiseAmount;
                    this.pot += raiseAmount;
                    this.currentBet = player.bet;
                    this.nextPlayer();
                    return { 
                        success: true, 
                        action: 'raise', 
                        player: player.name, 
                        amount: raiseAmount, 
                        message: `🤖 ${player.name} робить рейз до ${player.bet}` 
                    };
                }
            }
            
            // Блеф іноді
            if (Math.random() > 0.85 && player.chips >= this.bigBlind * 2) {
                const bluffAmount = this.bigBlind * 2;
                player.chips -= bluffAmount;
                player.bet += bluffAmount;
                this.pot += bluffAmount;
                this.currentBet = player.bet;
                this.nextPlayer();
                return { 
                    success: true, 
                    action: 'bluff', 
                    player: player.name, 
                    message: `🤖 ${player.name} робить рейз до ${player.bet} (блеф?)` 
                };
            }
            
            this.nextPlayer();
            return { success: true, action: 'check', player: player.name, message: `🤖 ${player.name} робить чек` };
        }
        
        // Вирішуємо чи коллити/рейзити/фолдити
        
        // Fold з поганою рукою
        if (handStrength < 0.25 || (handStrength < potOdds * 1.5 && Math.random() > 0.4)) {
            player.folded = true;
            this.nextPlayer();
            
            if (this.getActivePlayers().length === 1) {
                return { 
                    success: true, 
                    action: 'fold',
                    player: player.name,
                    message: `🤖 ${player.name} скидає карти`,
                    gameOver: true,
                    needsShowdown: false
                };
            }
            
            return { success: true, action: 'fold', player: player.name, message: `🤖 ${player.name} скидає карти` };
        }
        
        // All-in якщо дуже хороша рука або мало фішок
        if ((handStrength > 0.85 && Math.random() > 0.7) || (player.chips <= callAmount * 2 && handStrength > 0.5)) {
            const allinAmount = player.chips;
            player.bet += allinAmount;
            this.pot += allinAmount;
            player.chips = 0;
            if (player.bet > this.currentBet) {
                this.currentBet = player.bet;
            }
            this.nextPlayer();
            return { success: true, action: 'allin', player: player.name, message: `🤖 ${player.name} йде ALL-IN! 🚀` };
        }
        
        // Raise з хорошою рукою
        if (handStrength > 0.65 && aggression > 0.5 && player.chips > callAmount * 3) {
            const raiseMultiplier = handStrength > 0.8 ? 4 : 3;
            const raiseAmount = Math.min(this.bigBlind * raiseMultiplier, player.chips - callAmount);
            
            if (raiseAmount >= this.bigBlind) {
                player.chips -= (callAmount + raiseAmount);
                player.bet += (callAmount + raiseAmount);
                this.pot += (callAmount + raiseAmount);
                this.currentBet = player.bet;
                this.nextPlayer();
                return { 
                    success: true, 
                    action: 'raise', 
                    player: player.name, 
                    amount: raiseAmount, 
                    message: `🤖 ${player.name} робить рейз до ${player.bet}` 
                };
            }
        }
        
        // Call
        if (callAmount > player.chips) {
            // All-in якщо недостатньо фішок
            const allinAmount = player.chips;
            player.bet += allinAmount;
            this.pot += allinAmount;
            player.chips = 0;
            this.nextPlayer();
            return { success: true, action: 'allin', player: player.name, message: `🤖 ${player.name} йде ALL-IN!` };
        }
        
        player.chips -= callAmount;
        player.bet += callAmount;
        this.pot += callAmount;
        this.nextPlayer();
        
        return { success: true, action: 'call', player: player.name, message: `🤖 ${player.name} коллить ${callAmount}` };
    }
    
    evaluateHandStrength(hand, community) {
        // Проста оцінка сили руки (0-1)
        const allCards = [...hand, ...community];
        if (allCards.length < 2) return 0.5;
        
        const handRank = this.evaluateHand(allCards);
        
        // Нормалізуємо від 0 до 1
        const maxRank = 9; // Роял флеш
        return handRank.rank / maxRank;
    }
    
    nextStage() {
        // Скидаємо ставки для нового раунду
        this.players.forEach(p => p.bet = 0);
        this.currentBet = 0;
        this.currentPlayer = (this.dealerPosition + 1) % this.players.length;
        
        // Пропускаємо folded гравців
        while (this.players[this.currentPlayer].folded || this.players[this.currentPlayer].chips === 0) {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        }
        
        switch (this.stage) {
            case 'preflop':
                this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
                this.stage = 'flop';
                return { success: true, message: '🎴 Флоп!' };
                
            case 'flop':
                this.communityCards.push(this.deck.pop());
                this.stage = 'turn';
                return { success: true, message: '🎴 Терн!' };
                
            case 'turn':
                this.communityCards.push(this.deck.pop());
                this.stage = 'river';
                return { success: true, message: '🎴 Рівер!' };
                
            case 'river':
                this.stage = 'showdown';
                return this.showdown();
                
            default:
                return { success: false, message: 'Невідомий етап' };
        }
    }
    
    showdown() {
        const activePlayers = this.getActivePlayers();
        
        // Оцінюємо руки всіх активних гравців
        const results = activePlayers.map(player => ({
            player: player,
            handRank: this.evaluateHand([...player.hand, ...this.communityCards])
        }));
        
        // Сортуємо за силою руки
        results.sort((a, b) => {
            if (a.handRank.rank !== b.handRank.rank) {
                return b.handRank.rank - a.handRank.rank;
            }
            return this.compareKickersValue(a.handRank.kickers, b.handRank.kickers);
        });
        
        const winner = results[0].player;
        winner.chips += this.pot;
        
        this.roundOver = true;
        
        return {
            success: true,
            gameOver: true,
            needsShowdown: true,
            winner: winner,
            results: results,
            message: winner.isHuman ? '🎉 Ти виграв!' : `🤖 ${winner.name} виграв!`
        };
    }
    
    compareKickersValue(kickers1, kickers2) {
        for (let i = 0; i < Math.min(kickers1.length, kickers2.length); i++) {
            if (kickers1[i] > kickers2[i]) return 1;
            if (kickers2[i] > kickers1[i]) return -1;
        }
        return 0;
    }
    
    evaluateHand(cards) {
        if (cards.length < 5) {
            return { rank: 0, name: 'Недостатньо карт', kickers: [] };
        }
        
        // Сортуємо карти за рангом
        const sorted = cards.sort((a, b) => this.rankValues[b.rank] - this.rankValues[a.rank]);
        
        // Перевіряємо комбінації від найсильнішої до найслабшої
        const flush = this.isFlush(sorted);
        const straight = this.isStraight(sorted);
        
        if (flush && straight && sorted[0].rank === 'A') {
            return { rank: 9, name: 'Роял Флеш', kickers: [] };
        }
        
        if (flush && straight) {
            return { rank: 8, name: 'Стріт Флеш', kickers: [this.rankValues[sorted[0].rank]] };
        }
        
        const groups = this.groupByRank(sorted);
        const groupSizes = Object.values(groups).map(g => g.length).sort((a, b) => b - a);
        
        if (groupSizes[0] === 4) {
            const fourKind = Object.keys(groups).find(r => groups[r].length === 4);
            return { rank: 7, name: 'Каре', kickers: [this.rankValues[fourKind]] };
        }
        
        if (groupSizes[0] === 3 && groupSizes[1] === 2) {
            return { rank: 6, name: 'Фул Хаус', kickers: [] };
        }
        
        if (flush) {
            return { rank: 5, name: 'Флеш', kickers: sorted.slice(0, 5).map(c => this.rankValues[c.rank]) };
        }
        
        if (straight) {
            return { rank: 4, name: 'Стріт', kickers: [this.rankValues[sorted[0].rank]] };
        }
        
        if (groupSizes[0] === 3) {
            const threeKind = Object.keys(groups).find(r => groups[r].length === 3);
            return { rank: 3, name: 'Трійка', kickers: [this.rankValues[threeKind]] };
        }
        
        if (groupSizes[0] === 2 && groupSizes[1] === 2) {
            return { rank: 2, name: 'Дві пари', kickers: [] };
        }
        
        if (groupSizes[0] === 2) {
            const pair = Object.keys(groups).find(r => groups[r].length === 2);
            return { rank: 1, name: 'Пара', kickers: [this.rankValues[pair]] };
        }
        
        return { 
            rank: 0, 
            name: 'Старша карта', 
            kickers: sorted.slice(0, 5).map(c => this.rankValues[c.rank]) 
        };
    }
    
    isFlush(cards) {
        const suits = {};
        for (const card of cards) {
            suits[card.suit] = (suits[card.suit] || 0) + 1;
            if (suits[card.suit] >= 5) return true;
        }
        return false;
    }
    
    isStraight(cards) {
        const values = [...new Set(cards.map(c => this.rankValues[c.rank]))].sort((a, b) => b - a);
        
        for (let i = 0; i <= values.length - 5; i++) {
            let isStraight = true;
            for (let j = 0; j < 4; j++) {
                if (values[i + j] - values[i + j + 1] !== 1) {
                    isStraight = false;
                    break;
                }
            }
            if (isStraight) return true;
        }
        
        // Перевірка на A-2-3-4-5
        if (values.includes(14) && values.includes(2) && values.includes(3) && 
            values.includes(4) && values.includes(5)) {
            return true;
        }
        
        return false;
    }
    
    groupByRank(cards) {
        const groups = {};
        for (const card of cards) {
            if (!groups[card.rank]) {
                groups[card.rank] = [];
            }
            groups[card.rank].push(card);
        }
        return groups;
    }
    
    compareKickers(kickers1, kickers2) {
        for (let i = 0; i < Math.min(kickers1.length, kickers2.length); i++) {
            if (kickers1[i] > kickers2[i]) return 'player';
            if (kickers2[i] > kickers1[i]) return 'ai';
        }
        return 'tie';
    }
    
    canContinue() {
        return this.players.filter(p => p.chips > 0).length >= 2;
    }
}
