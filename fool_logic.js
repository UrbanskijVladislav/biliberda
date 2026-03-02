// ЛОГІКА ГРИ В ДУРНЯ - ПОВНІ ПРАВИЛА

class FoolGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        this.table = [];
        this.trump = null;
        this.turn = 'player'; // 'player' або 'ai'
        this.attackingPlayer = 'player';
        this.initDeck();
    }
    
    initDeck() {
        const suits = ['♠', '♣', '♥', '♦'];
        const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const values = { '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
        
        let deck = [];
        suits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({ suit, rank, value: values[rank] });
            });
        });
        
        // Перемішуємо
        deck = deck.sort(() => Math.random() - 0.5);
        
        // Роздаємо карти
        this.playerHand = deck.slice(0, 6);
        this.aiHand = deck.slice(6, 12);
        this.deck = deck.slice(12);
        
        // Козир - остання карта в колоді
        this.trump = this.deck[this.deck.length - 1];
    }
    
    canDefend(attackCard, defendCard) {
        // Можна відбити картою тієї ж масті вищого рангу
        if (defendCard.suit === attackCard.suit && defendCard.value > attackCard.value) {
            return true;
        }
        
        // Або козирем, якщо атакуюча карта не козир
        if (defendCard.suit === this.trump.suit && attackCard.suit !== this.trump.suit) {
            return true;
        }
        
        // Або козирем вищого рангу, якщо атакуюча карта теж козир
        if (defendCard.suit === this.trump.suit && attackCard.suit === this.trump.suit && 
            defendCard.value > attackCard.value) {
            return true;
        }
        
        return false;
    }
    
    canAttackWith(card) {
        // Якщо стіл порожній, можна ходити будь-якою картою
        if (this.table.length === 0) {
            return true;
        }
        
        // Інакше можна підкидати тільки карти того ж рангу, що вже є на столі
        const ranksOnTable = new Set();
        this.table.forEach(pair => {
            ranksOnTable.add(pair.attack.rank);
            if (pair.defend) {
                ranksOnTable.add(pair.defend.rank);
            }
        });
        
        return ranksOnTable.has(card.rank);
    }
    
    getMaxAttackCards() {
        // Максимум можна підкинути стільки карт, скільки є у того, хто відбиває
        const defenderHand = this.attackingPlayer === 'player' ? this.aiHand : this.playerHand;
        return defenderHand.length;
    }
    
    playerAttack(cardIndex) {
        if (this.turn !== 'player' || this.attackingPlayer !== 'player') {
            return { success: false, message: 'Зараз не твій хід для атаки' };
        }
        
        const card = this.playerHand[cardIndex];
        
        if (!this.canAttackWith(card)) {
            return { success: false, message: 'Не можна ходити цією картою' };
        }
        
        if (this.table.length >= this.getMaxAttackCards()) {
            return { success: false, message: 'Не можна підкинути більше карт' };
        }
        
        // Додаємо карту на стіл
        this.table.push({ attack: card, defend: null });
        this.playerHand.splice(cardIndex, 1);
        
        // Тепер хід AI для відбиття
        this.turn = 'ai';
        
        return { success: true, message: `Ти поклав ${card.suit} ${card.rank}` };
    }
    
    playerDefend(cardIndex, tableIndex) {
        if (this.turn !== 'player' || this.attackingPlayer !== 'ai') {
            return { success: false, message: 'Зараз не твій хід для відбиття' };
        }
        
        const card = this.playerHand[cardIndex];
        const pair = this.table[tableIndex];
        
        if (pair.defend) {
            return { success: false, message: 'Ця карта вже відбита' };
        }
        
        if (!this.canDefend(pair.attack, card)) {
            return { success: false, message: 'Не можна відбити цією картою' };
        }
        
        // Відбиваємо
        pair.defend = card;
        this.playerHand.splice(cardIndex, 1);
        
        // Перевіряємо, чи всі карти відбиті
        const allDefended = this.table.every(p => p.defend !== null);
        
        if (allDefended) {
            // AI може підкинути ще
            this.turn = 'ai';
        }
        
        return { success: true, message: `Ти відбив ${card.suit} ${card.rank}` };
    }
    
    playerTake() {
        if (this.attackingPlayer !== 'ai') {
            return { success: false, message: 'Ти не можеш взяти зараз' };
        }
        
        // Гравець бере всі карти зі столу
        this.table.forEach(pair => {
            this.playerHand.push(pair.attack);
            if (pair.defend) {
                this.playerHand.push(pair.defend);
            }
        });
        
        this.table = [];
        
        // AI добирає карти
        this.drawCards('ai');
        
        // Тепер атакує AI
        this.attackingPlayer = 'ai';
        this.turn = 'ai';
        
        return { success: true, message: 'Ти взяв карти. Тепер ходить AI' };
    }
    
    playerPass() {
        if (this.attackingPlayer !== 'player') {
            return { success: false, message: 'Ти не можеш завершити хід зараз' };
        }
        
        // Перевіряємо, чи всі карти відбиті
        const allDefended = this.table.every(p => p.defend !== null);
        
        if (!allDefended) {
            return { success: false, message: 'Не всі карти відбиті' };
        }
        
        // Скидаємо карти зі столу
        this.table = [];
        
        // Обидва гравці добирають карти
        this.drawCards('player');
        this.drawCards('ai');
        
        // Тепер атакує AI
        this.attackingPlayer = 'ai';
        this.turn = 'ai';
        
        return { success: true, message: 'Бито! Тепер ходить AI' };
    }
    
    drawCards(player) {
        const hand = player === 'player' ? this.playerHand : this.aiHand;
        
        while (hand.length < 6 && this.deck.length > 0) {
            hand.push(this.deck.shift());
        }
    }
    
    aiTurn() {
        if (this.turn !== 'ai') return null;
        
        if (this.attackingPlayer === 'ai') {
            // AI атакує
            return this.aiAttack();
        } else {
            // AI відбиває
            return this.aiDefend();
        }
    }
    
    aiAttack() {
        // Якщо стіл порожній, ходимо найменшою картою
        if (this.table.length === 0) {
            this.aiHand.sort((a, b) => a.value - b.value);
            const card = this.aiHand.shift();
            this.table.push({ attack: card, defend: null });
            this.turn = 'player';
            return { action: 'attack', card, message: `AI поклав ${card.suit} ${card.rank}` };
        }
        
        // Інакше намагаємося підкинути
        const validCards = this.aiHand.filter(card => this.canAttackWith(card));
        
        if (validCards.length > 0 && this.table.length < this.getMaxAttackCards()) {
            const card = validCards[0];
            const index = this.aiHand.indexOf(card);
            this.aiHand.splice(index, 1);
            this.table.push({ attack: card, defend: null });
            this.turn = 'player';
            return { action: 'attack', card, message: `AI підкинув ${card.suit} ${card.rank}` };
        }
        
        // Якщо не можемо підкинути, завершуємо хід
        const allDefended = this.table.every(p => p.defend !== null);
        
        if (allDefended) {
            this.table = [];
            this.drawCards('ai');
            this.drawCards('player');
            this.attackingPlayer = 'player';
            this.turn = 'player';
            return { action: 'pass', message: 'AI завершив хід. Твоя черга атакувати' };
        }
        
        return null;
    }
    
    aiDefend() {
        // Шукаємо неприкриту карту
        const undefendedIndex = this.table.findIndex(p => !p.defend);
        
        if (undefendedIndex === -1) {
            // Всі карти відбиті, гравець може підкинути
            this.turn = 'player';
            return { action: 'wait', message: 'AI відбив всі карти. Можеш підкинути' };
        }
        
        const attackCard = this.table[undefendedIndex].attack;
        
        // Шукаємо карту для відбиття
        const defendCard = this.aiHand.find(card => this.canDefend(attackCard, card));
        
        if (defendCard) {
            // Відбиваємо
            this.table[undefendedIndex].defend = defendCard;
            const index = this.aiHand.indexOf(defendCard);
            this.aiHand.splice(index, 1);
            
            // Перевіряємо, чи всі відбиті
            const allDefended = this.table.every(p => p.defend !== null);
            
            if (allDefended) {
                this.turn = 'player';
                return { action: 'defend', card: defendCard, message: `AI відбив ${defendCard.suit} ${defendCard.rank}. Можеш підкинути` };
            } else {
                this.turn = 'player';
                return { action: 'defend', card: defendCard, message: `AI відбив ${defendCard.suit} ${defendCard.rank}` };
            }
        } else {
            // Не можемо відбити, беремо
            this.table.forEach(pair => {
                this.aiHand.push(pair.attack);
                if (pair.defend) {
                    this.aiHand.push(pair.defend);
                }
            });
            
            this.table = [];
            this.drawCards('player');
            this.attackingPlayer = 'player';
            this.turn = 'player';
            
            return { action: 'take', message: 'AI взяв карти. Твоя черга атакувати' };
        }
    }
    
    checkWinner() {
        if (this.playerHand.length === 0 && this.deck.length === 0) {
            return 'player';
        }
        
        if (this.aiHand.length === 0 && this.deck.length === 0) {
            return 'ai';
        }
        
        return null;
    }
}
