// Simplified lava lamp animation (metaballs)
const canvas = document.getElementById('lavaCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

// Enable image smoothing for anti-aliasing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Ball constructor
function Ball() {
    const min = 15.0;
    const max = 25.0;
    this.vel = {
        x: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.6),
        y: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5)
    };
    this.pos = {
        x: width * 0.4 + Math.random() * (width * 0.5),
        y: height * 0.2 + Math.random() * (height * 0.6)
    };
    this.size = min + Math.random() * (max - min);
}

Ball.prototype.move = function () {
    const sidebarWidth = 300;
    const leftBound = sidebarWidth * (width / window.innerWidth);

    if (this.pos.x < leftBound) {
        this.pos.x = leftBound;
        this.vel.x = Math.abs(this.vel.x);
    }

    if (this.pos.x > width) {
        this.pos.x = width;
        this.vel.x = -Math.abs(this.vel.x);
    }

    if (this.pos.y < 0) {
        this.pos.y = 0;
        this.vel.y = Math.abs(this.vel.y);
    }
    if (this.pos.y > height) {
        this.pos.y = height;
        this.vel.y = -Math.abs(this.vel.y);
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
};

// Create balls - fewer for better performance
const numBalls = 3;
const balls = [];
for (let i = 0; i < numBalls; i++) {
    balls.push(new Ball());
}

// Create gradient
const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.min(width, height)
);
gradient.addColorStop(0, '#ff6b9d');
gradient.addColorStop(1, '#ff008d');

function render() {
    ctx.clearRect(0, 0, width, height);

    balls.forEach(ball => ball.move());

    ctx.fillStyle = gradient;
    ctx.beginPath();

    const step = 4;
    for (let i = 0; i < width; i += step) {
        for (let j = 0; j < height; j += step) {
            let sum = 0;
            balls.forEach(ball => {
                const dx = i - ball.pos.x;
                const dy = j - ball.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                sum += (ball.size * 10000) / (dist * dist);
            });

            if (sum > 20) {
                ctx.fillRect(i, j, step, step);
            }
        }
    }

    requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

render();
