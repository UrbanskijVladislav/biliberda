// Покерні фішки з різними номіналами (в тисячах)

function getChipBreakdown(amount) {
    const chips = [];
    
    // Номінали фішок (від найбільшого до найменшого) - всі в тисячах
    const denominations = [
        { value: 500000, color: 'purple', label: '500K' },
        { value: 100000, color: 'black', label: '100K' },
        { value: 50000, color: 'blue', label: '50K' },
        { value: 25000, color: 'green', label: '25K' },
        { value: 10000, color: 'orange', label: '10K' },
        { value: 5000, color: 'red', label: '5K' },
        { value: 1000, color: 'white', label: '1K' }
    ];
    
    let remaining = amount;
    
    for (const denom of denominations) {
        const count = Math.floor(remaining / denom.value);
        if (count > 0) {
            chips.push({
                ...denom,
                count: Math.min(count, 5) // Максимум 5 фішок одного номіналу для відображення
            });
            remaining -= count * denom.value;
        }
    }
    
    return chips;
}

function renderChips(amount, containerClass = '') {
    const chips = getChipBreakdown(amount);
    let html = `<div class="chip-stack ${containerClass}">`;
    
    chips.forEach(chip => {
        for (let i = 0; i < chip.count; i++) {
            html += `
                <div class="poker-chip chip-${chip.color}" style="--chip-index: ${i}">
                    <div class="chip-inner">
                        <div class="chip-value">${chip.label}</div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

function renderChipsCompact(amount) {
    const chips = getChipBreakdown(amount);
    let html = '<div class="chip-display-compact">';
    
    // Показуємо тільки найбільші номінали (максимум 3 типи)
    const topChips = chips.slice(0, 3);
    
    topChips.forEach(chip => {
        html += `
            <div class="chip-icon chip-${chip.color}">
                <span class="chip-count">${chip.count > 1 ? chip.count + 'x' : ''}</span>
            </div>
        `;
    });
    
    // Форматуємо суму в тисячах
    const formattedAmount = amount >= 1000 ? (amount / 1000).toFixed(0) + 'K' : amount;
    html += `<span class="chip-total">${formattedAmount}</span>`;
    html += '</div>';
    return html;
}
