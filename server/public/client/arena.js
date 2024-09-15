class Arena {
  constructor(w, h) {
      const matrix = [];
      while (h--) {
          matrix.push(new Array(w).fill(0));
      }
      this.matrix = matrix;
      this.events = new Events();
      this.garbageColor = 'rgba(255, 0, 0, 0.5)'; // Color por defecto para las líneas de basura

  }
  setGarbageColor(color) {
    this.garbageColor = color;
  }
  clear() {
      this.matrix.forEach(row => row.fill(0));
      this.events.emit('matrix', this.matrix);
  }

  collide(player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (this.matrix[y + o.y] &&
                    this.matrix[y + o.y][x + o.x]) !== 0) {
                // Verifica si la colisión ocurre en la parte superior del tablero (posición y <= 0)
                if (o.y <= 0) {
                    player.tetris.gameOver(); // Llama al método gameOver en Tetris
                }
                return true;
            }
        }
    }
    return false;
}


  merge(player) {
      player.matrix.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  this.matrix[y + player.pos.y][x + player.pos.x] = value;
              }
          });
      });
      this.events.emit('matrix', this.matrix);
  }

  sweep() {
      let rowCount = 1;
      let linesCleared = 0;
      for (let y = this.matrix.length - 1; y > 0; --y) {
          if (this.matrix[y].every(cell => cell !== 0)) {
              this.matrix.splice(y, 1);
              this.matrix.unshift(new Array(this.matrix[0].length).fill(0));
              ++y;
              linesCleared++;
              rowCount *= 2;
          }
      }
      this.events.emit('linesCleared', linesCleared)
      this.events.emit('matrix', this.matrix);
      return linesCleared;
  }
}
