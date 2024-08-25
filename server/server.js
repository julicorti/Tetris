const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io'); // Asegúrate de que socket.io esté instalado

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Inicializa socket.io

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A player connected');

  socket.on('disconnect', () => {
    console.log('A player disconnected');
  });

  // Agrega eventos aquí para manejar la comunicación entre jugadores
  // socket.on('event-name', (data) => { ... });
});

// Iniciar el servidor en el puerto 8080
server.listen(8080, () => {
  console.log('Server running on port 8080');
});
