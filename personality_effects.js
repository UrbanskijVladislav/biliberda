// Візуальні ефекти для особистостей
const PersonalityEffects = {
    normal: {
        colors: {
            primary: '#8b5cf6',
            secondary: '#3b82f6',
            glow: '#06b6d4'
        },
        particles: 'default',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textStyle: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            fontWeight: '400',
            textShadow: 'none',
            letterSpacing: 'normal'
        }
    },
    hacker: {
        colors: {
            primary: '#00ff41',
            secondary: '#00cc33',
            glow: '#00ff88'
        },
        particles: 'matrix',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        textStyle: {
            fontFamily: '"Courier New", monospace',
            fontSize: '0.95rem',
            fontWeight: '500',
            textShadow: '0 0 10px #00ff41',
            letterSpacing: '0.05em'
        }
    },
    scientist: {
        colors: {
            primary: '#60a5fa',
            secondary: '#3b82f6',
            glow: '#93c5fd'
        },
        particles: 'atoms',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        textStyle: {
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            fontWeight: '400',
            textShadow: 'none',
            letterSpacing: '0.02em'
        }
    },
    poet: {
        colors: {
            primary: '#f472b6',
            secondary: '#ec4899',
            glow: '#fbcfe8'
        },
        particles: 'hearts',
        background: 'linear-gradient(135deg, #831843 0%, #be185d 100%)',
        textStyle: {
            fontFamily: '"Brush Script MT", cursive',
            fontSize: '1.1rem',
            fontWeight: '400',
            textShadow: '0 0 5px rgba(244, 114, 182, 0.5)',
            letterSpacing: '0.03em',
            fontStyle: 'italic'
        }
    },
    gamer: {
        colors: {
            primary: '#f59e0b',
            secondary: '#ef4444',
            glow: '#fbbf24'
        },
        particles: 'fire',
        background: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)',
        textStyle: {
            fontFamily: '"Press Start 2P", "Courier New", monospace',
            fontSize: '0.85rem',
            fontWeight: '700',
            textShadow: '2px 2px 0px #000, 0 0 10px #f59e0b',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
        }
    },
    philosopher: {
        colors: {
            primary: '#a78bfa',
            secondary: '#8b5cf6',
            glow: '#c4b5fd'
        },
        particles: 'zen',
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
        textStyle: {
            fontFamily: '"Times New Roman", serif',
            fontSize: '1.05rem',
            fontWeight: '400',
            textShadow: 'none',
            letterSpacing: '0.03em',
            lineHeight: '1.8'
        }
    },
    comedian: {
        colors: {
            primary: '#fbbf24',
            secondary: '#f59e0b',
            glow: '#fde047'
        },
        particles: 'confetti',
        background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
        textStyle: {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '1.05rem',
            fontWeight: '600',
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
            letterSpacing: '0.02em'
        }
    },
    detective: {
        colors: {
            primary: '#64748b',
            secondary: '#475569',
            glow: '#94a3b8'
        },
        particles: 'smoke',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        textStyle: {
            fontFamily: '"Courier New", monospace',
            fontSize: '0.95rem',
            fontWeight: '400',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            letterSpacing: '0.05em'
        }
    },
    alien: {
        colors: {
            primary: '#10b981',
            secondary: '#059669',
            glow: '#6ee7b7'
        },
        particles: 'stars',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
        textStyle: {
            fontFamily: '"Arial", sans-serif',
            fontSize: '1rem',
            fontWeight: '500',
            textShadow: '0 0 8px #10b981',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
        }
    }
};

function applyPersonalityTheme(personality) {
    const theme = PersonalityEffects[personality] || PersonalityEffects.normal;
    const root = document.documentElement;
    
    // Змінюємо CSS змінні
    root.style.setProperty('--accent-primary', theme.colors.primary);
    root.style.setProperty('--accent-secondary', theme.colors.secondary);
    root.style.setProperty('--accent-glow', theme.colors.glow);
    
    // Змінюємо фон
    document.body.style.background = theme.background;
    
    // Додаємо анімацію переходу
    document.body.style.transition = 'background 0.5s ease';
    
    // Застосовуємо стиль тексту до повідомлень асистента
    applyTextStyle(theme.textStyle);
    
    // Створюємо ефект спалаху
    createFlashEffect(theme.colors.primary);
}

function applyTextStyle(textStyle) {
    // Створюємо або оновлюємо стиль для повідомлень асистента
    let styleEl = document.getElementById('personality-text-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'personality-text-style';
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
        .assistant-message .message-content {
            font-family: ${textStyle.fontFamily} !important;
            font-size: ${textStyle.fontSize} !important;
            font-weight: ${textStyle.fontWeight} !important;
            text-shadow: ${textStyle.textShadow} !important;
            letter-spacing: ${textStyle.letterSpacing} !important;
            ${textStyle.fontStyle ? `font-style: ${textStyle.fontStyle} !important;` : ''}
            ${textStyle.textTransform ? `text-transform: ${textStyle.textTransform} !important;` : ''}
            ${textStyle.lineHeight ? `line-height: ${textStyle.lineHeight} !important;` : ''}
            transition: all 0.3s ease;
        }
    `;
}

function createFlashEffect(color) {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${color};
        opacity: 0.3;
        pointer-events: none;
        z-index: 9999;
        animation: flashFade 0.5s ease-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 500);
}

// Додаємо CSS анімацію
const style = document.createElement('style');
style.textContent = `
    @keyframes flashFade {
        0% { opacity: 0.3; }
        100% { opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .personality-effect {
        animation: pulse 2s ease-in-out infinite;
    }
`;
document.head.appendChild(style);


// Застосування кольорів особистості до ігор
function applyPersonalityToGames(personality) {
    const theme = PersonalityEffects[personality] || PersonalityEffects.normal;
    const root = document.documentElement;
    
    // Конвертуємо hex в RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    const rgb = hexToRgb(theme.colors.primary);
    
    // Встановлюємо змінні для ігор
    root.style.setProperty('--game-accent', theme.colors.primary);
    root.style.setProperty('--game-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--game-secondary', theme.colors.secondary);
    root.style.setProperty('--game-glow', theme.colors.glow);
    
    console.log(`🎮 Кольори ігор оновлено для особистості: ${personality}`);
}

// Автоматично застосовуємо при зміні особистості
const originalApplyTheme = applyPersonalityTheme;
applyPersonalityTheme = function(personality) {
    originalApplyTheme(personality);
    applyPersonalityToGames(personality);
};
