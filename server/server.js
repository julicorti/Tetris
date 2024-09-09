const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Inicializa socket.io

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A player connected', socket.id);

  // Evento para manejar cuando un jugador se desconecta
  socket.on('disconnect', () => {
    console.log('A player disconnected', socket.id);
  });

  // Evento para cuando un jugador despeja líneas
  socket.on('DataPlayer', (data) => {
    // Validar que el objeto 'data' y 'state' existan
    if (data && data.state && data.state[0] === "linesCleared") {
      const linesCleared = data.state[1];
      
      console.log(`Player ${socket.id} cleared ${linesCleared} lines`);

      // Emitir las líneas despejadas a todos los jugadores excepto al actual
      socket.broadcast.emit('LineIn', linesCleared);
    }
  });

  // Sincronizar estado del tablero (arena) entre jugadores
  socket.on('syncBoard', (boardState) => {
    // Enviar estado del tablero a otros jugadores
    socket.broadcast.emit('updateBoard', boardState);
  });

  // Iniciar juego entre jugadores
  socket.on('startGame', () => {
    // Lógica para iniciar el juego y notificar a todos los jugadores
    io.emit('gameStarted'); // Enviar evento a todos los jugadores conectados
  });
});

// Iniciar el servidor en el puerto 8080
server.listen(8080, () => {
  console.log('Server running on port 8080');
});
