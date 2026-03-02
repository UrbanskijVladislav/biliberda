// БІЛЬЯРД (8-BALL POOL) - ПОКРАЩЕНА ВЕРСІЯ

class BilliardGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Розміри столу
        this.tableWidth = 800;
        this.tableHeight = 400;
        this.pocketRadius = 22;
        this.cushionWidth = 30;
        
        // Покращена фізика
        this.friction = 0.985; // Реалістичніше тертя
        this.rollingFriction = 0.992;
        this.minSpeed = 0.08;
        this.restitution = 0.92; // Пружність зіткнень
        this.spinFriction = 0.96;
        
        // Кулі
        this.balls = [];
        this.cueBall = null;
        
        // Кій
        this.cue = {
            angle: 0,
            power: 0,
            maxPower: 25,
            aiming: false,
            x: 0,
            y: 0,
            visible: true
        };
        
        // Гра
        this.playerTurn = true;
        this.playerBalls = null;
        this.aiBalls = null;
        this.gameStarted = false;
        this.ballsPocketed = [];
        this.foul = false;
        this.gameOver = false;
        this.winner = null;
        this.firstHit = false;
        
        this.initBalls();
        this.setupEventListeners();
    }

    
    initBalls() {
        this.balls = [];
        
        // Біла куля
        this.cueBall = {
            id: 0,
            x: this.tableWidth * 0.25,
            y: this.tableHeight / 2,
            vx: 0,
            vy: 0,
            spin: 0,
            radius: 11,
            mass: 1,
            color: '#ffffff',
            type: 'cue',
            pocketed: false
        };
        this.balls.push(this.cueBall);
        
        // Кольорові кулі
        const startX = this.tableWidth * 0.72;
        const startY = this.tableHeight / 2;
        const spacing = 22.5;
        
        const ballColors = [
            { id: 1, color: '#ffd700', type: 'solid' },
            { id: 2, color: '#1e88e5', type: 'solid' },
            { id: 3, color: '#e53935', type: 'solid' },
            { id: 4, color: '#8e24aa', type: 'solid' },
            { id: 5, color: '#fb8c00', type: 'solid' },
            { id: 6, color: '#43a047', type: 'solid' },
            { id: 7, color: '#6d4c41', type: 'solid' },
            { id: 8, color: '#000000', type: 'eight' },
            { id: 9, color: '#ffd700', type: 'striped' },
            { id: 10, color: '#1e88e5', type: 'striped' },
            { id: 11, color: '#e53935', type: 'striped' },
            { id: 12, color: '#8e24aa', type: 'striped' },
            { id: 13, color: '#fb8c00', type: 'striped' },
            { id: 14, color: '#43a047', type: 'striped' },
            { id: 15, color: '#6d4c41', type: 'striped' }
        ];
        
        let ballIndex = 0;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col <= row; col++) {
                if (ballIndex >= ballColors.length) break;
                
                const ball = ballColors[ballIndex];
                const x = startX + row * spacing;
                const y = startY + (col - row / 2) * spacing;
                
                this.balls.push({
                    id: ball.id,
                    x: x,
                    y: y,
                    vx: 0,
                    vy: 0,
                    spin: 0,
                    radius: 11,
                    mass: 1,
                    color: ball.color,
                    type: ball.type,
                    pocketed: false
                });
                
                ballIndex++;
            }
        }
        
        // Восьмірка в центр
        const eightBall = this.balls.find(b => b.id === 8);
        const centerBall = this.balls[5];
        if (eightBall && centerBall) {
            [eightBall.x, centerBall.x] = [centerBall.x, eightBall.x];
            [eightBall.y, centerBall.y] = [centerBall.y, eightBall.y];
        }
    }

    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    handleMouseDown(e) {
        if (!this.playerTurn || this.isAnyBallMoving() || this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        this.cue.aiming = true;
        this.cue.x = x;
        this.cue.y = y;
    }
    
    handleMouseMove(e) {
        if (!this.cue.aiming) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        const dx = x - this.cueBall.x;
        const dy = y - this.cueBall.y;
        this.cue.angle = Math.atan2(dy, dx);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.cue.power = Math.min(distance / 8, this.cue.maxPower);
    }
    
    handleMouseUp(e) {
        if (!this.cue.aiming) return;
        
        this.cue.aiming = false;
        
        if (this.cue.power > 1.5) {
            this.cueBall.vx = Math.cos(this.cue.angle) * this.cue.power;
            this.cueBall.vy = Math.sin(this.cue.angle) * this.cue.power;
            this.cueBall.spin = this.cue.power * 0.1;
            
            this.gameStarted = true;
            this.firstHit = false;
            this.cue.visible = false;
        }
        
        this.cue.power = 0;
    }

    
    update() {
        if (this.gameOver) return;
        
        this.balls.forEach(ball => {
            if (ball.pocketed) return;
            
            // Оновлюємо позицію
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Покращене тертя з обертанням
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (speed > 0) {
                ball.vx *= this.rollingFriction;
                ball.vy *= this.rollingFriction;
                ball.spin *= this.spinFriction;
            }
            
            if (Math.abs(ball.vx) < this.minSpeed) ball.vx = 0;
            if (Math.abs(ball.vy) < this.minSpeed) ball.vy = 0;
            if (Math.abs(ball.spin) < 0.01) ball.spin = 0;
            
            // Відбиття від бортів з реалістичною фізикою
            const margin = this.cushionWidth + ball.radius;
            if (ball.x < margin) {
                ball.x = margin;
                ball.vx = Math.abs(ball.vx) * this.restitution;
            }
            if (ball.x > this.tableWidth - margin) {
                ball.x = this.tableWidth - margin;
                ball.vx = -Math.abs(ball.vx) * this.restitution;
            }
            if (ball.y < margin) {
                ball.y = margin;
                ball.vy = Math.abs(ball.vy) * this.restitution;
            }
            if (ball.y > this.tableHeight - margin) {
                ball.y = this.tableHeight - margin;
                ball.vy = -Math.abs(ball.vy) * this.restitution;
            }
        });
        
        // Зіткнення
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.checkCollision(this.balls[i], this.balls[j]);
            }
        }
        
        this.checkPockets();
        
        if (!this.isAnyBallMoving() && this.gameStarted && !this.cue.aiming) {
            this.endTurn();
        }
    }

    
    checkCollision(ball1, ball2) {
        if (ball1.pocketed || ball2.pocketed) return;
        
        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = ball1.radius + ball2.radius;
        
        if (distance < minDist) {
            // Реалістична фізика зіткнення
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // Обертаємо координати
            const v1x = ball1.vx * cos + ball1.vy * sin;
            const v1y = ball1.vy * cos - ball1.vx * sin;
            const v2x = ball2.vx * cos + ball2.vy * sin;
            const v2y = ball2.vy * cos - ball2.vx * sin;
            
            // Пружне зіткнення з масою
            const m1 = ball1.mass;
            const m2 = ball2.mass;
            const v1xFinal = ((m1 - m2) * v1x + 2 * m2 * v2x) / (m1 + m2);
            const v2xFinal = ((m2 - m1) * v2x + 2 * m1 * v1x) / (m1 + m2);
            
            // Повертаємо назад з реституцією
            ball1.vx = (v1xFinal * cos - v1y * sin) * this.restitution;
            ball1.vy = (v1y * cos + v1xFinal * sin) * this.restitution;
            ball2.vx = (v2xFinal * cos - v2y * sin) * this.restitution;
            ball2.vy = (v2y * cos + v2xFinal * sin) * this.restitution;
            
            // Розсуваємо кулі
            const overlap = minDist - distance;
            const moveX = (overlap / 2 + 0.1) * cos;
            const moveY = (overlap / 2 + 0.1) * sin;
            
            ball1.x -= moveX;
            ball1.y -= moveY;
            ball2.x += moveX;
            ball2.y += moveY;
            
            if (!this.firstHit && ball1.type === 'cue') {
                this.firstHit = true;
            }
        }
    }

    
    checkPockets() {
        const pockets = [
            { x: this.cushionWidth, y: this.cushionWidth },
            { x: this.tableWidth / 2, y: this.cushionWidth - 5 },
            { x: this.tableWidth - this.cushionWidth, y: this.cushionWidth },
            { x: this.cushionWidth, y: this.tableHeight - this.cushionWidth },
            { x: this.tableWidth / 2, y: this.tableHeight - this.cushionWidth + 5 },
            { x: this.tableWidth - this.cushionWidth, y: this.tableHeight - this.cushionWidth }
        ];
        
        this.balls.forEach(ball => {
            if (ball.pocketed) return;
            
            pockets.forEach(pocket => {
                const dx = ball.x - pocket.x;
                const dy = ball.y - pocket.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.pocketRadius - ball.radius / 2) {
                    ball.pocketed = true;
                    ball.vx = 0;
                    ball.vy = 0;
                    ball.spin = 0;
                    this.ballsPocketed.push(ball);
                    
                    if (ball.type === 'cue') {
                        this.foul = true;
                    }
                    
                    if (ball.id === 8) {
                        this.checkEightBallWin();
                    }
                }
            });
        });
    }
    
    checkEightBallWin() {
        const playerBallsLeft = this.balls.filter(b => 
            !b.pocketed && b.type === this.playerBalls
        ).length;
        
        if (playerBallsLeft === 0) {
            this.gameOver = true;
            this.winner = 'player';
        } else {
            this.gameOver = true;
            this.winner = 'ai';
        }
    }
    
    endTurn() {
        if (this.foul) {
            this.cueBall.pocketed = false;
            this.cueBall.x = this.tableWidth * 0.25;
            this.cueBall.y = this.tableHeight / 2;
            this.cueBall.vx = 0;
            this.cueBall.vy = 0;
            this.cueBall.spin = 0;
            this.foul = false;
        }
        
        if (!this.playerBalls && this.ballsPocketed.length > 0) {
            const firstPocketed = this.ballsPocketed[0];
            if (firstPocketed.type === 'solid' || firstPocketed.type === 'striped') {
                this.playerBalls = firstPocketed.type;
                this.aiBalls = firstPocketed.type === 'solid' ? 'striped' : 'solid';
            }
        }
        
        this.ballsPocketed = [];
        this.playerTurn = !this.playerTurn;
        this.cue.visible = this.playerTurn;
        
        if (!this.playerTurn && !this.gameOver) {
            setTimeout(() => this.makeAIMove(), 1200);
        }
    }
    
    makeAIMove() {
        if (this.gameOver) return;
        
        let targetBall = null;
        let minDistance = Infinity;
        
        this.balls.forEach(ball => {
            if (ball.pocketed || ball.type === 'cue') return;
            if (this.aiBalls && ball.type !== this.aiBalls && ball.id !== 8) return;
            
            const dx = ball.x - this.cueBall.x;
            const dy = ball.y - this.cueBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                targetBall = ball;
            }
        });
        
        if (targetBall) {
            const dx = targetBall.x - this.cueBall.x;
            const dy = targetBall.y - this.cueBall.y;
            const angle = Math.atan2(dy, dx);
            
            const power = 10 + Math.random() * 6;
            this.cueBall.vx = Math.cos(angle) * power;
            this.cueBall.vy = Math.sin(angle) * power;
            this.cueBall.spin = power * 0.08;
            this.firstHit = false;
        }
    }
    
    isAnyBallMoving() {
        return this.balls.some(ball => 
            !ball.pocketed && (Math.abs(ball.vx) > this.minSpeed || Math.abs(ball.vy) > this.minSpeed)
        );
    }

    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон навколо столу
        this.ctx.fillStyle = '#0d0d0d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Тінь столу
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 15;
        
        // Дерев'яна рамка з текстурою
        this.drawWoodenFrame();
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        // Зелене сукно з текстурою
        const gradient = this.ctx.createRadialGradient(
            this.tableWidth / 2, this.tableHeight / 2, 0,
            this.tableWidth / 2, this.tableHeight / 2, this.tableWidth / 2
        );
        gradient.addColorStop(0, '#0d7a0d');
        gradient.addColorStop(0.7, '#0a6b0a');
        gradient.addColorStop(1, '#085808');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.cushionWidth, this.cushionWidth, 
            this.tableWidth - this.cushionWidth * 2, 
            this.tableHeight - this.cushionWidth * 2);
        
        // Текстура сукна
        this.drawClothTexture();
        
        // Лузи з 3D ефектом
        this.drawPockets();
        
        // Кулі з реалістичною графікою
        this.balls.forEach(ball => {
            if (!ball.pocketed) {
                this.drawBall(ball);
            }
        });
        
        // Кій
        if (this.cue.aiming && this.playerTurn && this.cue.visible) {
            this.drawCue();
        }
        
        // Інформація
        this.drawInfo();
    }

    
    drawWoodenFrame() {
        // Темний фон навколо столу
        this.ctx.fillStyle = '#1a2332';
        this.ctx.fillRect(0, 0, this.tableWidth, this.tableHeight);
        
        // Дерев'яна рамка з орнаментом (як у 8 Ball Pool)
        const frameWidth = this.cushionWidth;
        
        // Основа рамки - світле дерево
        const woodGradient = this.ctx.createLinearGradient(0, 0, 0, this.tableHeight);
        woodGradient.addColorStop(0, '#d4a574');
        woodGradient.addColorStop(0.5, '#c89858');
        woodGradient.addColorStop(1, '#b8884a');
        
        this.ctx.fillStyle = woodGradient;
        this.ctx.fillRect(0, 0, this.tableWidth, this.tableHeight);
        
        // Темні смуги на рамці
        this.ctx.fillStyle = '#8b6f47';
        // Верхня смуга
        this.ctx.fillRect(0, frameWidth * 0.3, this.tableWidth, 3);
        this.ctx.fillRect(0, frameWidth * 0.7, this.tableWidth, 3);
        // Нижня смуга
        this.ctx.fillRect(0, this.tableHeight - frameWidth * 0.7, this.tableWidth, 3);
        this.ctx.fillRect(0, this.tableHeight - frameWidth * 0.3, this.tableWidth, 3);
        // Ліва смуга
        this.ctx.fillRect(frameWidth * 0.3, 0, 3, this.tableHeight);
        this.ctx.fillRect(frameWidth * 0.7, 0, 3, this.tableHeight);
        // Права смуга
        this.ctx.fillRect(this.tableWidth - frameWidth * 0.7, 0, 3, this.tableHeight);
        this.ctx.fillRect(this.tableWidth - frameWidth * 0.3, 0, 3, this.tableHeight);
        
        // Орнаменти в кутах та по центру (ромби)
        this.drawOrnament(frameWidth / 2, frameWidth / 2);
        this.drawOrnament(this.tableWidth / 2, frameWidth / 2);
        this.drawOrnament(this.tableWidth - frameWidth / 2, frameWidth / 2);
        this.drawOrnament(frameWidth / 2, this.tableHeight - frameWidth / 2);
        this.drawOrnament(this.tableWidth / 2, this.tableHeight - frameWidth / 2);
        this.drawOrnament(this.tableWidth - frameWidth / 2, this.tableHeight - frameWidth / 2);
        
        // Зелені борти (cushions)
        this.ctx.fillStyle = '#2d5f3f';
        this.ctx.fillRect(frameWidth, frameWidth, 
            this.tableWidth - frameWidth * 2, 
            this.tableHeight - frameWidth * 2);
    }
    
    drawOrnament(x, y) {
        // Декоративний ромб
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Зовнішній ромб
        this.ctx.fillStyle = '#6d4c41';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -8);
        this.ctx.lineTo(8, 0);
        this.ctx.lineTo(0, 8);
        this.ctx.lineTo(-8, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Внутрішній ромб
        this.ctx.fillStyle = '#d4a574';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -5);
        this.ctx.lineTo(5, 0);
        this.ctx.lineTo(0, 5);
        this.ctx.lineTo(-5, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Центральна точка
        this.ctx.fillStyle = '#8b6f47';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawClothTexture() {
        // Тонка текстура сукна
        for (let i = 0; i < 300; i++) {
            const x = this.cushionWidth + Math.random() * (this.tableWidth - this.cushionWidth * 2);
            const y = this.cushionWidth + Math.random() * (this.tableHeight - this.cushionWidth * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.015})`;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPockets() {
        const pockets = [
            { x: this.cushionWidth, y: this.cushionWidth },
            { x: this.tableWidth / 2, y: this.cushionWidth - 5 },
            { x: this.tableWidth - this.cushionWidth, y: this.cushionWidth },
            { x: this.cushionWidth, y: this.tableHeight - this.cushionWidth },
            { x: this.tableWidth / 2, y: this.tableHeight - this.cushionWidth + 5 },
            { x: this.tableWidth - this.cushionWidth, y: this.tableHeight - this.cushionWidth }
        ];
        
        pockets.forEach((pocket, index) => {
            // Велика тінь навколо лузи
            const shadowGradient = this.ctx.createRadialGradient(
                pocket.x, pocket.y, 0,
                pocket.x, pocket.y, this.pocketRadius + 8
            );
            shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
            shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = shadowGradient;
            this.ctx.beginPath();
            this.ctx.arc(pocket.x, pocket.y, this.pocketRadius + 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Зовнішнє кільце лузи (металеве)
            const metalGradient = this.ctx.createRadialGradient(
                pocket.x, pocket.y, this.pocketRadius - 3,
                pocket.x, pocket.y, this.pocketRadius + 2
            );
            metalGradient.addColorStop(0, '#4a4a4a');
            metalGradient.addColorStop(0.5, '#2a2a2a');
            metalGradient.addColorStop(1, '#1a1a1a');
            
            this.ctx.fillStyle = metalGradient;
            this.ctx.beginPath();
            this.ctx.arc(pocket.x, pocket.y, this.pocketRadius + 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Внутрішня частина лузи (чорна діра)
            const pocketGradient = this.ctx.createRadialGradient(
                pocket.x, pocket.y, 0,
                pocket.x, pocket.y, this.pocketRadius
            );
            pocketGradient.addColorStop(0, '#0a0a0a');
            pocketGradient.addColorStop(0.7, '#050505');
            pocketGradient.addColorStop(1, '#000000');
            
            this.ctx.fillStyle = pocketGradient;
            this.ctx.beginPath();
            this.ctx.arc(pocket.x, pocket.y, this.pocketRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Відблиск на металі
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.arc(pocket.x - 2, pocket.y - 2, this.pocketRadius - 1, Math.PI, Math.PI * 1.5);
            this.ctx.stroke();
        });
    }

    
    drawBall(ball) {
        // Тінь кулі (реалістична)
        const shadowGradient = this.ctx.createRadialGradient(
            ball.x + 3, ball.y + 4, 0,
            ball.x + 3, ball.y + 4, ball.radius * 1.2
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
        shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = shadowGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(ball.x + 3, ball.y + 4, ball.radius * 1.1, ball.radius * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Основа кулі з градієнтом (3D ефект)
        const ballGradient = this.ctx.createRadialGradient(
            ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
            ball.x, ball.y, ball.radius * 1.2
        );
        
        if (ball.type === 'cue') {
            ballGradient.addColorStop(0, '#ffffff');
            ballGradient.addColorStop(0.4, '#f5f5f5');
            ballGradient.addColorStop(0.8, '#e0e0e0');
            ballGradient.addColorStop(1, '#bdbdbd');
        } else {
            const lightColor = this.lightenColor(ball.color, 40);
            const darkColor = this.darkenColor(ball.color, 30);
            ballGradient.addColorStop(0, lightColor);
            ballGradient.addColorStop(0.5, ball.color);
            ballGradient.addColorStop(1, darkColor);
        }
        
        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Смуги для striped куль
        if (ball.type === 'striped') {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.clip();
            
            const stripeGradient = this.ctx.createLinearGradient(
                ball.x - ball.radius, ball.y,
                ball.x + ball.radius, ball.y
            );
            stripeGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            stripeGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)');
            stripeGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
            stripeGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = stripeGradient;
            this.ctx.fillRect(ball.x - ball.radius * 0.6, ball.y - ball.radius,
                ball.radius * 1.2, ball.radius * 2);
            
            this.ctx.restore();
        }
        
        // Номер на кулі
        if (ball.id > 0) {
            // Біле коло для номера
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Номер
            this.ctx.fillStyle = ball.type === 'eight' ? '#000000' : ball.color;
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(ball.id, ball.x, ball.y);
        }
        
        // Відблиск (highlight)
        const highlightGradient = this.ctx.createRadialGradient(
            ball.x - ball.radius * 0.4, ball.y - ball.radius * 0.4, 0,
            ball.x - ball.radius * 0.4, ball.y - ball.radius * 0.4, ball.radius * 0.6
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Обводка
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    
    drawCue() {
        const cueLength = 180;
        const cueDistance = this.cueBall.radius + 25 + this.cue.power * 3;
        const cueX = this.cueBall.x - Math.cos(this.cue.angle) * cueDistance;
        const cueY = this.cueBall.y - Math.sin(this.cue.angle) * cueDistance;
        const endX = cueX - Math.cos(this.cue.angle) * cueLength;
        const endY = cueY - Math.sin(this.cue.angle) * cueLength;
        
        // Тінь кія
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(cueX + 2, cueY + 2);
        this.ctx.lineTo(endX + 2, endY + 2);
        this.ctx.stroke();
        
        // Кій з градієнтом
        const cueGradient = this.ctx.createLinearGradient(cueX, cueY, endX, endY);
        cueGradient.addColorStop(0, '#d4a574');
        cueGradient.addColorStop(0.3, '#8b6f47');
        cueGradient.addColorStop(0.7, '#6d5638');
        cueGradient.addColorStop(1, '#4a3f2e');
        
        this.ctx.strokeStyle = cueGradient;
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(cueX, cueY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Наконечник кія
        this.ctx.fillStyle = '#e8f4f8';
        this.ctx.beginPath();
        this.ctx.arc(cueX, cueY, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Лінія прицілювання
        if (this.cue.power > 2) {
            this.ctx.setLineDash([10, 10]);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(this.cue.power / 15, 0.6)})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.cueBall.x, this.cueBall.y);
            const aimLength = 150;
            this.ctx.lineTo(
                this.cueBall.x + Math.cos(this.cue.angle) * aimLength,
                this.cueBall.y + Math.sin(this.cue.angle) * aimLength
            );
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Індикатор сили з градієнтом
        const powerBarWidth = 250;
        const powerBarHeight = 25;
        const powerBarX = 15;
        const powerBarY = this.tableHeight - 45;
        
        // Фон індикатора
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(powerBarX - 5, powerBarY - 5, powerBarWidth + 10, powerBarHeight + 10);
        
        // Градієнт сили
        const powerGradient = this.ctx.createLinearGradient(
            powerBarX, powerBarY,
            powerBarX + powerBarWidth, powerBarY
        );
        powerGradient.addColorStop(0, '#4caf50');
        powerGradient.addColorStop(0.5, '#ffc107');
        powerGradient.addColorStop(1, '#f44336');
        
        const powerWidth = (this.cue.power / this.cue.maxPower) * powerBarWidth;
        this.ctx.fillStyle = powerGradient;
        this.ctx.fillRect(powerBarX, powerBarY, powerWidth, powerBarHeight);
        
        // Рамка
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(powerBarX, powerBarY, powerBarWidth, powerBarHeight);
        
        // Текст
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('СИЛА', powerBarX + powerBarWidth / 2, powerBarY - 12);
    }
    
    drawInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 4;
        
        const turn = this.playerTurn ? 'Твій хід' : 'Хід AI';
        this.ctx.fillText(turn, 15, 25);
        
        if (this.playerBalls) {
            const ballType = this.playerBalls === 'solid' ? 'Суцільні' : 'Смугасті';
            this.ctx.fillText(`Твої кулі: ${ballType}`, 15, 50);
        }
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        if (this.gameOver) {
            // Затемнення
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.tableWidth, this.tableHeight);
            
            // Повідомлення про перемогу
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 56px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            this.ctx.shadowBlur = 10;
            
            const message = this.winner === 'player' ? '🎉 Ти виграв!' : '😔 AI виграв!';
            this.ctx.fillText(message, this.tableWidth / 2, this.tableHeight / 2);
            
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText('Натисни "Нова гра"', this.tableWidth / 2, this.tableHeight / 2 + 50);
        }
    }
}
