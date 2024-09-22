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
    this.score = 10;
    this.linesCleared = 0; // Nuevo contador de líneas completadas

    this.gridSize = 30; // Tamaño de cada celda en la cuadrícula

    this.initCanvas(); // Inicializa el canvas
    this.reset();
  }

  initCanvas() {
    // Verifica si ya hay un canvas en el DOM, si no, clona y agrega el template
    if (!this.tetris.element.querySelector(".tetris")) {
      const template = document
        .getElementById("player-template")
        .content.cloneNode(true);
      this.tetris.element.appendChild(template); // Agrega el template al DOM
    }

    // Ahora intenta obtener el canvas
    this.canvas = this.tetris.element.querySelector(".player-board");
    if (this.canvas) {
      this.context = this.canvas.getContext("2d");
      this.canvas.width = this.arena.matrix[0].length * this.gridSize;
      this.canvas.height = this.arena.matrix.length * this.gridSize;
    } else {
      console.error("Canvas no encontrado.");
    }
  }

  createPiece(type) {
    // Creación de piezas
    if (type === "T") {
      return [
        [0, 0, 0,0],
        [1, 1, 1,0],
        [0, 1, 0,0],
        [0, 0, 0,0],
      ];
    } else if (type === "O") {
      return [
        [0, 0,0,0],
        [0, 2,2,0],
        [0, 2,2,0],
        [0, 0,0,0],
      ];
    } else if (type === "L") {
      return [
        [0, 3, 0,0],
        [0, 3, 0,0],
        [0, 3, 3,0],
        [0, 0, 0,0],
      ];
    } else if (type === "J") {
      return [
        [0, 4, 0,0],
        [0, 4, 0,0],
        [4, 4, 0,0],
        [0, 0, 0,0],
      ];
    } else if (type === "I") {
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    } else if (type === "S") {
      return [
        [0, 6, 6,0],
        [6, 6, 0,0],
        [0, 0, 0,0],
        [0, 0, 0,0],
      ];
    } else if (type === "Z") {
      return [
        [7, 7, 0,0],
        [0, 7, 7,0],
        [0, 0, 0,0],
        [0, 0, 0,0],
      ];
    } else if (type === "C") {
      return [
        [8, 8, 0,0],
        [8, 0, 0,0],
        [8, 8, 0,0],
        [0, 0, 0,0],
      ];
    } else if (type === "i") {
      return [
        [9, 9, 0, 0],
        [9, 9, 0, 0],
        [9, 9, 0, 0],
        [0, 0, 0, 0],
      ];
    } else if (type === "_") {
      return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [10, 10, 0, 0],
        [0, 0, 0, 0],
      ];
    } else if (type === "+") {
      return [
        [0, 12, 0, 0],
        [12, 12, 12, 0],
        [0, 12, 0, 0],
        [0, 0, 0, 0],
      ];
    }
  }

  drop() {
    this.pos.y++;
    this.dropCounter = 0;

    if (this.arena.collide(this)) {
      this.pos.y--;
      this.arena.merge(this);
      const lines = this.arena.sweep(); // Guardar el número de líneas eliminadas
      this.score += lines * 10; // Aumentar el puntaje según las líneas
      this.linesCleared += lines; // Actualizar el contador de líneas

      this.events.emit("score", this.score);
      this.events.emit("linesCleared", this.linesCleared); // Emitir el evento de líneas eliminadas
      // Verificar si hay Game Over
      if (this.pos.y === 0) {
        this.tetris.gameOver(); // Llamar a gameOver cuando el jugador pierde
        return;
      }
      this.reset();
      return;
    }
    this.events.emit("pos", this.pos);
  }
  dropFast() {
    while (!this.arena.collide(this)) {
      this.pos.y++;
    }
    this.pos.y--;
    this.arena.merge(this);

    const lines = this.arena.sweep();
    this.score += lines * 10;
    this.linesCleared += lines; // Actualizar el contador de líneas

    this.events.emit("score", this.score);
    this.events.emit("linesCleared", this.linesCleared); // Emitir el evento de líneas eliminadas

    this.reset();
    this.events.emit("pos", this.pos);
  }

  move(dir) {
    this.pos.x += dir;
    if (this.arena.collide(this)) {
      this.pos.x -= dir;
      return;
    }
    this.events.emit("pos", this.pos);
  }

  reset() {
    const pieces = "ILJOTSZCi_+";
    this.matrix = this.createPiece(pieces[(pieces.length * Math.random()) | 0]);
    this.pos.y = 0;
    this.pos.x =
      (((this.arena.matrix[0].length / 2) | 0) - this.matrix[0].length / 2) | 0;

    // Añadir una pequeña pausa antes de verificar la colisión
    setTimeout(() => {
      // Verificación inmediata de colisión (posible "game over")
      if (this.arena.collide(this)) {
        this.tetris.gameOver(); // Llamar a gameOver cuando el jugador pierde
        return;
      }

      this.events.emit("pos", this.pos);
      this.events.emit("matrix", this.matrix);
    }, 100); // Pausa de 100 ms
  }

  addGarbageLines(lines) {
    const width = this.matrix[0].length; // Ancho del tablero
    for (let i = 0; i < lines; i++) {
      const garbageLine = new Array(width).fill(0);
      // Agregar un hueco aleatorio
      const hole = Math.floor(Math.random() * width);
      garbageLine[hole] = 0;
      // Añadir la línea de basura al final del tablero
      this.matrix.pop(); // Eliminar la fila superior
      this.matrix.unshift(garbageLine); // Añadir la línea de basura abajo
    }
    this.events.emit("matrix", this.matrix); // Emitir el evento de actualización
  }

  showSavedPiece() {
    console.log(this.savedPiece);
    let nF = 0;
    let nC = 0;
    this.savedPiece.map((f) => {
      nF++;
      f.map((c) => {
        nC++;
        let e = (document.querySelector(
          `.fila${nF} .columna${nC}`
        ).style = `background: ${this.tetris.colors[c]};`);
        console.log();
      });
      nC = 0;
    });
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

      this.showSavedPiece();
      this.isPieceSaved = true;
    }
  }

  useSavedPiece() {
    if (this.isPieceSaved && this.savedPiece) {
      const temp = this.matrix;
      this.matrix = this.savedPiece;
      this.savedPiece = temp;
      this.pos.y = 0; // Resetea la posición vertical para que la pieza guardada aparezca en la parte superior
      this.pos.x = 5;
      this.isPieceSaved = false;
      this.showSavedPiece();
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
    this.events.emit("matrix", this.matrix);
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
      console.error("Contexto del canvas no disponible.");
    }
  }
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.context.strokeStyle = "#ddd"; // Color de las líneas de la cuadrícula
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
            this.context.fillStyle = "red"; // Cambia esto según el color de la pieza
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
