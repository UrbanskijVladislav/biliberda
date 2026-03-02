// Допоміжні функції для UI покеру з 5 гравцями

function renderPokerSeat(seatId, player, isCurrentPlayer, showCards, dealerPosition) {
    const seat = document.getElementById(`seat-${seatId}`);
    if (!seat) return;
    
    // Оновлюємо інформацію
    const nameEl = seat.querySelector('.player-name');
    const chipsEl = seat.querySelector('.player-chips');
    const cardsEl = seat.querySelector('.player-cards');
    const actionEl = seat.querySelector('.player-action');
    
    if (nameEl) nameEl.textContent = player.name;
    if (chipsEl) chipsEl.textContent = `${player.chips} 💰`;
    
    // Підсвічуємо поточного гравця
    if (isCurrentPlayer && !player.folded) {
        seat.classList.add('active-player');
    } else {
        seat.classList.remove('active-player');
    }
    
    // Показуємо дилера
    if (seatId === dealerPosition) {
        seat.classList.add('dealer');
    } else {
        seat.classList.remove('dealer');
    }
    
    // Показуємо folded
    if (player.folded) {
        seat.classList.add('folded');
    } else {
        seat.classList.remove('folded');
    }
    
    // Відображаємо ставку
    if (actionEl) {
        if (player.bet > 0) {
            actionEl.textContent = `${player.bet} 💰`;
            actionEl.style.display = 'block';
        } else {
            actionEl.style.display = 'none';
        }
    }
    
    // Відображаємо карти
    if (cardsEl) {
        cardsEl.innerHTML = '';
        
        if (player.folded) {
            // Не показуємо карти folded гравців
            return;
        }
        
        player.hand.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'poker-card-small';
            
            if (showCards) {
                const suitColor = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
                cardDiv.classList.add(suitColor);
                cardDiv.innerHTML = `
                    <div class="card-rank-small">${card.rank}</div>
                    <div class="card-suit-small">${card.suit}</div>
                `;
            } else {
                cardDiv.classList.add('card-back');
                cardDiv.textContent = '🂠';
            }
            
            cardsEl.appendChild(cardDiv);
        });
    }
}

function renderAllPokerSeats(pokerGame, showAllCards = false) {
    pokerGame.players.forEach((player, index) => {
        const isCurrentPlayer = index === pokerGame.currentPlayer;
        const showCards = player.isHuman || showAllCards || (pokerGame.stage === 'showdown');
        renderPokerSeat(index, player, isCurrentPlayer, showCards, pokerGame.dealerPosition);
    });
}
