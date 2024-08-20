const express = require('express');
const path = require('path');

const app = express();

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar el servidor en el puerto 8080
app.listen(8080, () => {
  console.log('Server running on port 8080');
});
