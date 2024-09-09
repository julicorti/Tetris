class ConnectionManager {
  constructor(tetrisManager) {
    this.conn = null;
    this.peers = new Map();
    this.tetrisManager = tetrisManager;
    this.localTetris = [...tetrisManager.instances][0];
  }

  connect(address) {
    this.conn = io(address);  // Usar socket.io en lugar de WebSocket

    this.conn.on('connect', () => {
      console.log('Connection established');
      this.initSession();
      this.watchEvents();
    });

    this.conn.on('message', (event) => {
      console.log('Received message: ', event);
      this.receive(event);
    });

    this.conn.on("LineIn", (e)=>{
      console.log("JODER, ME ESTAN ATACANDO!", e)
 this.addLineToPlayer()
    })
  }
  addLineToPlayer() {
    const player = this.localTetris.player;
    const arena = player.arena;
  
    // Añade una nueva línea al final de la arena
    const newLine = Array(arena.matrix[0].length).fill(1);  // Llena la nueva fila con bloques (puedes personalizar el valor)
  
    // Elimina la fila superior y desplaza todas las filas hacia arriba
    arena.matrix.pop();  // Elimina la fila superior
    arena.matrix.unshift(newLine);  // Añade la nueva fila en la parte inferior
  
    // Emitir el cambio para que el jugador se actualice visualmente
    player.pos.y = Math.max(player.pos.y - 1, 0); // Asegúrate de que la posición Y se ajuste para evitar que la pieza salga del tablero
    player.events.emit('pos', player.pos);
    player.events.emit('matrix', player.matrix);
  
    player.draw();  // Redibuja el jugador con la nueva línea
  }
  
  initSession() {
    const sessionId = window.location.hash.split('#')[1];
    const state = this.localTetris.serialize();
    if (sessionId) {
      this.send({
        type: 'join-session',
        id: sessionId,
        state,
      });
    } else {
      this.send({
        type: 'create-session',
        state,
      });
    }
  }

  watchEvents() {
    const local = this.localTetris;
    const player = local.player;

    const playerEventNames = ['pos', 'matrix', 'score','linesCleared'];
    playerEventNames.forEach(prop => {
      player.events.listen(prop, value => {
        this.conn.emit("DataPlayer",{
          type: 'state-update',
          fragment: 'player',
          state: [prop, value]
        });
      });
    });

    const arenaEventNames = ['matrix'];
    const arena = local.arena;
    arenaEventNames.forEach(prop => {
      arena.events.listen(prop, value => {
        this.send({
          type: 'state-update',
          fragment: 'arena',
          state: [prop, value]
        });
      });
    });
  }

  updateManager(peers) {
    const me = peers.you;
    const clients = peers.clients.filter(client => me !== client.id);
    clients.forEach(client => {
      if (!this.peers.has(client.id)) {
        const tetris = this.tetrisManager.createPlayer();
        tetris.unserialize(client.state);
        this.peers.set(client.id, tetris);
      }
    });

    [...this.peers.entries()].forEach(([id, tetris]) => {
      if (!clients.some(client => client.id === id)) {
        this.tetrisManager.removePlayer(tetris);
        this.peers.delete(id);
      }
    });

    const sorted = peers.clients.map(client => {
      return this.peers.get(client.id) || this.localTetris;
    });
    this.tetrisManager.sortPlayers(sorted);
  }

  updatePeer(id, fragment, [prop, value]) {
    if (!this.peers.has(id)) {
      console.error('Client does not exist', id);
      return;
    }

    const tetris = this.peers.get(id);
    tetris[fragment][prop] = value;

    if (prop === 'score') {
      tetris.updateScore(value);
    } else {
      tetris.draw();
    }
  }

  receive(data) {
    if (data.type === 'session-created') {
      window.location.hash = data.id;
    } else if (data.type === 'session-broadcast') {
      this.updateManager(data.peers);
    } else if (data.type === 'state-update') {
      this.updatePeer(data.clientId, data.fragment, data.state);
    }
  }

  send(data) {
/*     console.log(`Sending message: ${JSON.stringify(data)}`); */
    this.conn.emit('message', data);  // Usar emit en lugar de send
  }
}
