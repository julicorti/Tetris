class Tetris {
  constructor(element) {
    this.element = element;
    this.canvas = element.querySelector('canvas');
    this.context = this.canvas.getContext('2d');
    this.context.scale(20, 20);

    this.arena = new Arena(12, 20);
    this.player = new Player(this);

    this.colors = [
      null,
      '#FF0D72',
      '#0DC2FF',
      '#0DFF72',
      '#F538FF',
      '#FF830D',
      '#FFE138',
      '#3877FF'
    ];

    this._bindEvents();

    let lastTime = 0;
    this._update = (time = 0) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      this.player.update(deltaTime);

      this.draw();
      requestAnimationFrame(this._update);
    };

    this.updateScore();
    this.startSpeedIncrement(); // Inicia el incremento de velocidad
  }
  gameOver() {
    // Mostrar la pantalla de "Game Over"
    const gameOverDiv = document.createElement('div');
    gameOverDiv.classList.add('game-over-screen');
    gameOverDiv.innerHTML = `
      <div class="game-over-message">Game Over</div>
      <button class="reset-button">Restart</button>
    `;
    
    this.element.appendChild(gameOverDiv);

    // Botón de reinicio
    const resetButton = gameOverDiv.querySelector('.reset-button');
    resetButton.addEventListener('click', () => {
      this.resetGame();
    });
  }
  resetGame() {
    // Eliminar la pantalla de "Game Over"
    const gameOverScreen = this.element.querySelector('.game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.remove();
    }

    // Reiniciar el juego
    this.arena.clear();
    this.player.reset();
    this.updateScore();
    this.startSpeedIncrement(); // Reiniciar el incremento de velocidad
  }
  startSpeedIncrement() {
    setInterval(() => {
      if (this.player.dropInterval > 100) { // Ajusta el valor según tu preferencia mínima
        this.player.dropInterval -= 50; // Incrementa la velocidad cada 10 segundos
        console.log(`Nueva velocidad: ${this.player.dropInterval}`);
      }
    }, 10000); // 10 segundos
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
          this.player.dropFast();
          break;
        case 'Shift':
          if (!this.player.isPieceSaved) {
            this.player.savePiece();
          } else {
            this.player.useSavedPiece();
          }
          break;
      }
    });
  }

  draw() {
    // Fondo del tablero
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibuja la cuadrícula ligera de fondo
    this.drawBackgroundGrid();  

    // Dibuja la arena (piezas ya colocadas) y las piezas activas
    this.drawMatrix(this.arena.matrix, {x: 0, y: 0});
    this.drawMatrix(this.player.matrix, this.player.pos);
  }

  drawBackgroundGrid() {
    const { width, height } = this.canvas;
    const cellSize = 1; // Tamaño de las celdas ajustado al escalado

    // Estilo de la cuadrícula del fondo
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Cuadrícula muy tenue
    this.context.lineWidth = 0.07; // Línea muy delgada para el fondo

    // Dibujar líneas verticales
    for (let x = 0; x < width; x += cellSize) {
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);
      this.context.stroke();
    }

    // Dibujar líneas horizontales
    for (let y = 0; y < height; y += cellSize) {
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
      this.context.stroke();
    }
  }

  drawMatrix(matrix, offset) {
    this.updateScore();
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          this.context.fillStyle = this.colors[value];
          this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
          
          // Dibuja los bordes de la cuadrícula alrededor de cada celda
          this.context.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Líneas semitransparentes
          this.context.lineWidth = 0.10; // Grosor del borde
          this.context.strokeRect(x + offset.x, y + offset.y, 1, 1); // Dibuja el borde de cada celda
        }
      });
    });
  }

  run() {
    this._update();
  }
  
  serialize() {
    return {
      arena: {
        matrix: this.arena.matrix
      },
      player: {
        matrix: this.player.matrix,
        pos: this.player.pos,
        score: this.player.score,
      }
    };
  }

  unserialize(state) {
    this.arena = Object.assign(state.arena);
    this.player = Object.assign(state.player);
    this.updateScore(this.player.score);
    this.draw();
  }

  updateScore() {
    this.element.querySelector('.score').innerText = this.player.score;
  }
}
