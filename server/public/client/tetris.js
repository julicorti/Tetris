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
      '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF830D',
      '#FFE138', '#3877FF', '#0a3a6d', '#00660e', '#630066', '#777777', '#f7916d',
    ];

    this.isRunning = true;
    this.speedInterval = null;
    
    // Guardar el valor inicial del dropInterval
    this.initialDropInterval = this.player.dropInterval;

    this._bindEvents();

    let lastTime = 0;
    this._update = (time = 0) => {
      if (!this.isRunning) return;
      const deltaTime = time - lastTime;
      lastTime = time;

      this.player.update(deltaTime);

      this.draw();
      requestAnimationFrame(this._update);
    };

    this.updateScore();
    this.startSpeedIncrement(); // Iniciar incremento de velocidad
  }

  gameOver() {
    this.isRunning = false; // Detener el juego cuando ocurre el "Game Over"

    // Mostrar la pantalla de "Game Over"
    const gameOverDiv = document.createElement('div');
    gameOverDiv.classList.add('game-over-screen');
    gameOverDiv.innerHTML = `
      <div class="game-over-message">Game Over</div>
      <button class="reset-button">Restart</button>
    `;
    this.player.reset( );  // Reiniciar el jugador

    this.element.appendChild(gameOverDiv);
   
    // Botón de reinicio
    const resetButton = gameOverDiv.querySelector('.reset-button');
    resetButton.addEventListener('click', () => {
      this.element.querySelector('.score').innerText = 10;
      this.player.score = 10
      this.player.lose = true;
      this.resetGame();
    });
  }

  resetGame() {
    this.isRunning = true;
    const gameOverScreen = this.element.querySelector('.game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.remove();
    }

    // Reiniciar el tablero y el jugador
    this.arena.clear();
    this.player.reset();
    this.updateScore();

    // Restaurar la velocidad inicial
    this.player.dropInterval = this.initialDropInterval;

    // Limpiar el intervalo anterior y reiniciar el incremento de velocidad
    if (this.speedInterval) {
      clearInterval(this.speedInterval);
    }
    this.startSpeedIncrement();

    requestAnimationFrame(this._update);
  }

  startSpeedIncrement() {
    // Asegurarse de que solo haya un intervalo activo
    if (this.speedInterval) {
      clearInterval(this.speedInterval);
    }

    this.speedInterval = setInterval(() => {
      if (this.player.dropInterval > 100) {
        this.player.dropInterval -= 50;
        console.log(`Nueva velocidad: ${this.player.dropInterval}`);
      }
    }, 10000); // Cada 10 segundos
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return; // Ignorar eventos si el juego no está corriendo
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
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgroundGrid();
    this.drawMatrix(this.arena.matrix, { x: 0, y: 0 });
    this.drawMatrix(this.player.matrix, this.player.pos);
  }

  drawBackgroundGrid() {
    const { width, height } = this.canvas;
    const cellSize = 1;
  
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.3)'; // Aumenta la opacidad de las líneas para hacerlas más blancas
    this.context.lineWidth = 0.05; // Mantén las líneas delgadas
  
    for (let x = 0; x < width; x += cellSize) {
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);
      this.context.stroke();
    }
  
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
                // Dibujar en tamaño normal
                this.context.fillRect((x + offset.x) * 1, (y + offset.y) * 1, 1, 1); // Usar la escala para dibujar directamente

                // Borde
                this.context.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Hacer el borde más claro
                this.context.lineWidth = 0.08; // Hacer el borde más fino
                this.context.strokeRect((x + offset.x) * 1, (y + offset.y) * 1, 1, 1);
            }
        });
    });
}


  run() {
    this.isRunning = true;
    requestAnimationFrame(this._update);
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
