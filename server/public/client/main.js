const tetrisManager = new TetrisManager(document)
const localTetris = tetrisManager.createPlayer()
localTetris.element.classList.add('local')
localTetris.run()
let startTime;

let timerInterval;
const connectionManager = new ConnectionManager(tetrisManager)
connectionManager.connect('ws://localhost:8080')

const keyListener = (event) => {
  [
    [65, 68, 81, 69, 83],
    [72, 75, 89, 73, 74],
  ].forEach((key, index) => {
    const player = localTetris.player

    if (event.type === 'keydown') {
      if (event.keyCode === key[0]) { // left
        player.move(-1)
      } else if (event.keyCode === key[1]) { // right
        player.move(1)
      } else if (event.keyCode === key[2]) { // q
        player.rotate(-1)
      } else if (event.keyCode === key[3]) { // w
        player.rotate(1)
      }
    }

    if (event.keyCode === key[4]) {
      if (event.type === 'keydown') {
        if (player.dropInterval !== player.DROP_FAST) {
          player.drop()
          player.dropInterval = player.DROP_FAST
        }
      } else {
        player.dropInterval = player.DROP_SLOW
      }
    }
  })
}
// Inicializa el cronómetro
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000); // Actualiza cada segundo
}

// Actualiza el cronómetro en el DOM

function updateTimer() {
  const player = localTetris.player

  if (player.lose ){
    player.lose =  false
    startTime = new Date()
    
  }
  const currentTime = new Date();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Tiempo en segundos

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  // Formatea el tiempo
  const formattedTime = `${pad(minutes)}:${pad(seconds)}`;
  document.getElementById('time').textContent = formattedTime;
}

// Añade ceros a la izquierda para un formato de dos dígitos
function pad(number) {
  return number.toString().padStart(2, '0');
}

// Detiene el cronómetro
function stopTimer() {
  clearInterval(timerInterval);
}

// Inicia el cronómetro cuando se carga la página
window.addEventListener('load', startTimer);
document.addEventListener('keydown', keyListener)
document.addEventListener('keyup', keyListener)
