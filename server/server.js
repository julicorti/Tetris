const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors")
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Inicializa socket.io

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));
io.on('connection', (socket) => {
  
  console.log('A player connected', socket.id);
 
  // Evento para manejar cuando un jugador se desconecta
  socket.on('disconnect', () => {
    console.log('A player disconnected', socket.id);
  });

  // Evento para cuando un jugador despeja líneas
  socket.on('DataPlayer', (data) => {
    if (data.type == "linesCleared") {
      const linesCleared = data.linesCleared;
      if (linesCleared > 0) {
        console.log(`Player ${socket.id} cleared ${linesCleared} lines`);
        socket.broadcast.emit('LineIn', linesCleared);
      }

      // Detectar "full clean" y enviar 6 líneas al oponente
      if (data.fullClean) {
        console.log(`Player ${socket.id} achieved a Full Clean! Sending 6 lines to the opponent.`);
        socket.broadcast.emit('receiveLines', 6);
      }
    }
  });

  // Sincronizar estado del tablero (arena) entre jugadores
  socket.on('syncBoard', (boardState) => {
    socket.broadcast.emit('updateBoard', boardState);
  });

  // Iniciar juego entre jugadores
  socket.on('startGame', () => {
    io.emit('gameStarted'); // Enviar evento a todos los jugadores conectados
  });
});

// Iniciar el servidor en el puerto 8080
server.listen(8080, () => {
  console.log('Server running on port 8080');
});
