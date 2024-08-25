class Player {
  constructor(tetris) {
    this.DROP_SLOW = 1000;
    this.DROP_FAST = 50;

    this.events = new Events();

    this.tetris = tetris;
    this.arena = tetris.arena;

    this.dropCounter = 0;
    this.dropInterval = this.DROP_SLOW;

    this.pos = { x: 0, y: 0 };
    this.matrix = null;
    this.savedPiece = null;
    this.isPieceSaved = false;
    this.score = 0;

    this.gridSize = 30; // Tamaño de cada celda en la cuadrícula

    this.initCanvas(); // Inicializa el canvas
    this.reset();
  }

  initCanvas() {
    // Encuentra el canvas y su contexto
    this.canvas = this.tetris.element.querySelector('.tetris');
    if (this.canvas) {
      this.context = this.canvas.getContext('2d');
      this.canvas.width = this.arena.matrix[0].length * this.gridSize;
      this.canvas.height = this.arena.matrix.length * this.gridSize;
    } else {
      console.error('Canvas no encontrado.');
    }
  }

  createPiece(type) {
    if (type === 'T') {
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    } else if (type === 'O') {
      return [
        [2, 2],
        [2, 2],
      ];
    } else if (type === 'L') {
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
      ];
    } else if (type === 'J') {
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
      ];
    } else if (type === 'I') {
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    } else if (type === 'S') {
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    } else if (type === 'Z') {
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
    }
  }

  drop() {
    this.pos.y++;
    this.dropCounter = 0;
    if (this.arena.collide(this)) {
      this.pos.y--;
      this.arena.merge(this);
      this.reset();
      this.score += this.arena.sweep();
      this.events.emit('score', this.score);
      return;
    }
    this.events.emit('pos', this.pos);
  }

  dropFast() {
    while (!this.arena.collide(this)) {
      this.pos.y++;
    }
    this.pos.y--;
    this.arena.merge(this);
    this.reset();
    this.score += this.arena.sweep();
    this.events.emit('score', this.score);
    this.events.emit('pos', this.pos);
  }

  move(dir) {
    this.pos.x += dir;
    if (this.arena.collide(this)) {
      this.pos.x -= dir;
      return;
    }
    this.events.emit('pos', this.pos);
  }

  reset() {
    const pieces = 'ILJOTSZ';
    this.matrix = this.createPiece(pieces[(pieces.length * Math.random()) | 0]);
    this.pos.y = 0;
    this.pos.x =
      ((this.arena.matrix[0].length / 2) | 0) - (this.matrix[0].length / 2) | 0;
    if (this.arena.collide(this)) {
      this.arena.clear();
      this.score = 0;
      this.events.emit('score', this.score);
    }

    this.events.emit('pos', this.pos);
    this.events.emit('matrix', this.matrix);
  }

  savePiece() {
    if (!this.isPieceSaved) {
      if (this.savedPiece) {
        const temp = this.matrix;
        this.matrix = this.savedPiece;
        this.savedPiece = temp;
        this.pos.y = 0; // Resetea la posición vertical para que la pieza guardada aparezca en la parte superior
      } else {
        this.savedPiece = this.matrix;
        this.reset();
      }
      this.isPieceSaved = true;
    }
  }

  useSavedPiece() {
    if (this.isPieceSaved && this.savedPiece) {
      const temp = this.matrix;
      this.matrix = this.savedPiece;
      this.savedPiece = temp;
      this.pos.y = 0; // Resetea la posición vertical para que la pieza guardada aparezca en la parte superior
      this.isPieceSaved = false;
    }
  }

  rotate(dir) {
    const pos = this.pos.x;
    let offset = 1;
    this._rotateMatrix(this.matrix, dir);
    while (this.arena.collide(this)) {
      this.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > this.matrix[0].length) {
        this._rotateMatrix(this.matrix, -dir);
        this.pos.x = pos;
        return;
      }
    }
    this.events.emit('matrix', this.matrix);
  }

  _rotateMatrix(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }

    if (dir > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  draw() {
    if (this.context) {
      this.clearCanvas();
      this.drawGrid(); // Dibuja la cuadrícula
      this.drawMatrix(this.matrix, this.pos);
    } else {
      console.error('Contexto del canvas no disponible.');
    }
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.context.strokeStyle = '#ddd'; // Color de las líneas de la cuadrícula
    this.context.lineWidth = 0.5; // Ancho de las líneas de la cuadrícula

    // Dibuja las líneas verticales
    for (let x = 0; x <= width; x += this.gridSize) {
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);
      this.context.stroke();
    }

    // Dibuja las líneas horizontales
    for (let y = 0; y <= height; y += this.gridSize) {
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
      this.context.stroke();
    }
  }

  drawMatrix(matrix, offset) {
    if (this.context) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            this.context.fillStyle = 'red'; // Cambia esto según el color de la pieza
            this.context.fillRect(
              (offset.x + x) * this.gridSize,
              (offset.y + y) * this.gridSize,
              this.gridSize,
              this.gridSize
            );
          }
        });
      });
    }
  }

  update(deltaTime) {
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.drop();
    }
  }
}
