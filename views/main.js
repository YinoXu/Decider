const canvas = document.querySelector('canvas');
const btnSpin = document.querySelector('#btnSpin');
const colorResult = document.querySelector('#colorResult');
const ctx = canvas.getContext('2d');

const WIDTH = window.innerWidth > 500 ? 500 : window.innerWidth;
const HEIGHT = WIDTH;
const RADIUS = WIDTH / 2 - 30;
const FPS = 30;
const COLORS = [
  'blue',
  'red',
  'green',
  'yellow',
  'orange',
  'purple',
  'pink',
  'brown',
  'gray',
  'wheat',
];

let now;
let then = Date.now();
let interval = 1000 / FPS;
let delta;
let rotate = 0;
let deceleration = 0;
let isRotating = false;
let resultIndex = -1;

class Wheel {
  constructor(x, y, radius, background, border, rotate = 0) {
    this.x = x;
    this.y = y;
    this.rotate = rotate;
    this.radius = radius;
    this.border = border;
    this.background = background;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + this.border, 0, Math.PI * 2, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();

    ctx.rotate(-Math.PI / 10);
    COLORS.forEach((color, index) => {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.arc(
        this.x,
        this.y,
        this.radius,
        ((2 * Math.PI) / COLORS.length) * index,
        ((2 * Math.PI) / COLORS.length) * (index + 1),
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    });
  }

  update() {
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.rotate(this.rotate);
    this.draw();
    ctx.restore();
  }
}

class Arrow {
  constructor() {
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
  }
  draw() {
    ctx.translate(RADIUS - 2, 0);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + 24, this.y - 12);
    ctx.lineTo(this.x + 24, this.y + 12);
    ctx.lineTo(this.x, this.y);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

const run = () => {
  if (resultIndex !== -1 && !isRotating) {
    colorResult.textContent = COLORS[resultIndex] + ' 😍';
    document.body.style.backgroundColor = COLORS[resultIndex];
    window.cancelAnimationFrame(run);
    return;
  } else {
    colorResult.textContent = '...🤔';
  }

  window.requestAnimationFrame(run);
  now = Date.now();
  delta = now - then;
  if (delta > interval) {
    then = now - (delta % interval);

    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const wheel = new Wheel(0, 0, RADIUS, 'black', 10, rotate);
    const arrow = new Arrow();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    wheel.update();
    arrow.draw();
    if (deceleration > 0) {
      rotate += deceleration;
      deceleration -= 0.01;
    } else {
      isRotating = false;
    }
  }
};

(() => {
  run();
  btnSpin.addEventListener('click', () => {
    window.requestAnimationFrame(run);
    const index = Math.round(Math.random() * (COLORS.length - 1));
    rotate = ((2 * Math.PI) / COLORS.length) * -index;
    resultIndex = index;
    if (!isRotating) {
      btnSpin.textContent = 'STOP';
      isRotating = true;
      deceleration = 2;
    } else {
      btnSpin.textContent = 'SPIN';
      deceleration = 0;
      isRotating = false;
    }
  });
})();


