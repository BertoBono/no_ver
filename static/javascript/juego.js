const socket = io();

listaPalabras = new Array();
var listaPalabrasUsadas = [['a', true]];
var numerosAleatoriosUsados = [0];

var puntosJug1 = 0;
var puntosJug2 = 0;

$.ajax({
  url: "/sub_juego",
  type: "GET",
  success: function(response) {
    var datos = JSON.parse(response)
    datos = JSON.parse(datos)

    if(datos["soy_jugador"] == 1) {
      document.getElementById('nombreJug1').value = datos["jugador_1"];
      document.getElementById('nombreJug2').value = datos["jugador_2"];
    }
    else if(datos["soy_jugador"] == 2) {
      document.getElementById('nombreJug1').value = datos["jugador_2"];
      document.getElementById('nombreJug2').value = datos["jugador_1"];
    }
    setTimeout(function() {
      socket.emit('conectado');
    }, 1000);
  },
  error: function(error) {
    console.log(error);
  }
});

$.ajax({
  url: "obtener_palabras",
  type: "GET",
  success: function(response) {
    var datos = JSON.parse(response)
    datos = datos.toString().split(',');
    console.log(datos);
    listaPalabras = datos;
    for(let i = 1 ; i < listaPalabras.length ; i++) {
      listaPalabrasUsadas.push([listaPalabras[i], false])
    }
  },
  error: function(error) {
    console.log(error);
  }
});

var datosJugador = document.getElementById('datosJugador').value;

datosJugador = JSON.parse(datosJugador)
datosJugador = JSON.parse(datosJugador)

socket.emit('join', {room: datosJugador["nombre"], partida: document.getElementById('numPartida').value});

socket.on('palabra', function(silaba) {
  var silabaJug1 = document.getElementById('silabaJug1');
  silabaJug1.innerHTML = silaba;
  setTimeout(function() {
    socket.emit('enviar_silaba', {"silaba": silaba, "room": document.getElementById('nombreJug2').value});
  }, 800);
});

socket.on('recibir_silaba', function(silaba) {
  var silabaJug2 = document.getElementById('silabaJug2');
  silabaJug2.innerHTML = silaba;
});

function ingreso() {
  var palabra = document.getElementById('inputJug1').value;
  socket.emit('enviar_palabra', {"palabra": palabra, "room": document.getElementById('nombreJug2').value})
  verificarPalabra(palabra);
}

socket.on('recibir_palabra', function(palabra) {
  var inputJug2 = document.getElementById('inputJug2');
  inputJug2.value = palabra;
});

socket.on('conectado', function() {
  var reenvio = true
  var conectado = true;
  console.log(conectado)
  socket.emit('preguntar', {"conectado": conectado, "room": document.getElementById('nombreJug2').value});
  socket.on('respuesta', function(otroJugadorConectado) {
    console.log(otroJugadorConectado)
    if(conectado == true && otroJugadorConectado == true) {
      if(reenvio == true) {
        socket.emit('preguntar', {"conectado": conectado, "room": document.getElementById('nombreJug2').value});
        index = pedirIndex()
        console.log(numerosAleatoriosUsados)
        socket.emit('pedir_palabra', {"listaPalabras": listaPalabras, "index": index})
        reenvio = false;
      }
      var esperando = document.getElementById('esperando');
      esperando.classList.remove('mostrar');
      console.log(esperando.classList);
    }
    else {
      socket.emit('preguntar', {"conectado": conectado, "room": document.getElementById('nombreJug2').value});
    }
  });
});

socket.on('devolver_palabra', function(palabra) {
  socket.emit('palabra', palabra);
});

function verificarPalabra(palabra) {
  var silaba = document.getElementById('silabaJug1').innerHTML;
  var foto = document.getElementById('fotoJug1');

  palabra = palabra.toLowerCase()
  
  if(listaPalabras.indexOf(palabra) in listaPalabras) {
    if(palabra.includes(silaba)) {
      if(listaPalabrasUsadas[listaPalabras.indexOf(palabra)][1] == false) {
        socket.emit('buena_palabra', {"room": document.getElementById('nombreJug2').value})
        foto.src = './static/img/correcto.jpg'
        listaPalabrasUsadas[listaPalabras.indexOf(palabra)][1] = true;
        puntosJug1 += palabra.length;
        document.getElementById('puntosJug1').value = puntosJug1;
        socket.emit('enviar_puntos', {"puntos": palabra.length, "room": document.getElementById('nombreJug2').value})
        document.getElementById('inputJug1').value = "";
        index = pedirIndex()
        socket.emit('pedir_palabra', {"listaPalabras": listaPalabras, "index": index})
      }
      else {
        socket.emit('mala_palabra', {"room": document.getElementById('nombreJug2').value})
        foto.src = './static/img/incorrecto.jpg'
      }
    }
    else {
      socket.emit('mala_palabra', {"room": document.getElementById('nombreJug2').value})
      foto.src = './static/img/incorrecto.jpg'
    }
  }
  else {
    socket.emit('mala_palabra', {"room": document.getElementById('nombreJug2').value})
    foto.src = './static/img/incorrecto.jpg'
  }
}

socket.on('recibir_puntos', function(puntos) {
  puntosJug2 += puntos;
  document.getElementById('puntosJug2').value = puntosJug2;
  if(puntosJug1 + puntosJug2 >= 175 && (puntosJug1 + puntosJug2)%2 != 0) {
    var ganador = ""
    var foto = document.getElementById('fotoJug1');
  
    if(puntosJug1 > puntosJug2) {
      console.log('ganaste');
      ganador = document.getElementById('nombreJug1').value;
    }
    else if(puntosJug2 > puntosJug1) {
      console.log('perdiste');
      ganador = document.getElementById('nombreJug2').value;
    }
    finalizar(ganador)
  }
  console.log(document.getElementById('puntosJug1').value)
  console.log(document.getElementById('puntosJug2').value)
})

function pedirIndex() {
  do {
    var index = Math.floor(Math.random() * 55093);
  }while(index in numerosAleatoriosUsados)
  numerosAleatoriosUsados.push(index);
  iniciarTemporizador(15);
  var barraChicaJug1 = document.getElementById('barraChicaJug1');
  barraChicaJug1.classList.add('animacionBarra');
  barraChicaJug1.classList.remove('animacionBarra');
  barraChicaJug1.offsetWidth = barraChicaJug1.offsetWidth;
  barraChicaJug1.classList.add('animacionBarra');
  return index;
}

const iniciarTemporizador = (segundos) => {
  var corte = false;
  const milisegundos = segundos * 1000;
  fechaFuturo = new Date(new Date().getTime() + milisegundos);
  idInterval = setInterval(() => {
    const tiempoRestante = fechaFuturo.getTime() - new Date().getTime();
    if(tiempoRestante <= 0 && corte == false) {
      corte = true;
      console.log('nueva silaba')
      index = pedirIndex()
      setTimeout(function() {
        socket.emit('pedir_palabra', {"listaPalabras": listaPalabras, "index": index})
      }, 500);
    }
  }, 25);
}

function finalizar(ganador) {
  socket.emit('modal_final', {"ganador": ganador, "room": document.getElementById('nombreJug1').value})
  socket.emit('modal_final', {"ganador": ganador, "room": document.getElementById('nombreJug2').value})
}

socket.on('terminar_partida', function() {
  $.ajax({
    url: "/ajax_partidas",
    type: "PUT",
    data: {"partida": document.getElementById('numPartida').value},
    succss: function(response) {
      console.log('La partida se reseteo correctamente');
    },
    error: function(error) {
      console.log(error);
    }
  });
  setTimeout(function() {
    socket.emit('finalizacion', {"room": document.getElementById('nombreJug1').value})
    socket.emit('finalizacion', {"room": document.getElementById('nombreJug2').value})
  }, 300)
});

socket.on('finalizacion', function() {
  setTimeout(function() {
    document.getElementById('formSalida').submit()
  }, 200)
})

socket.on('intento', function(rutaFoto) {
  var foto = document.getElementById('fotoJug2');
  foto.src = rutaFoto;
})

socket.on('modal_final', function(ganador) {
  document.getElementById('inputJug1').disabled = true;
  var resultadoContenedor = document.getElementById('resultado');
  var subtitulo = document.getElementById('subtituloResultado');
  if(ganador == document.getElementById('nombreJug1').value) {
    subtitulo.innerHTML = '¡GANASTE!<br>Felicidades, sumaste una victoria<br>Esta notificación se cierra en 5 segundos';
    $.ajax({
    url: "/finalizar_partida",
    type: "PUT",
    data: {"ganador": ganador},
    success: function(response) {
      console.log('se termino')
    },
    error: function(error) {
      console.log(error);
    }
  });
  }
  else {
    subtitulo.innerHTML = '¡PERDISTE!<br>Que lástima, más suerte la próxima<br>Esta notificación se cierra en 5 segundos'
  }
  resultadoContenedor.classList.add('mostrar')
  setTimeout(function() {
    socket.emit('terminar_partida', {"room": document.getElementById('nombreJug2').value});
    resultadoContenedor.classList.remove('mostrar')
  }, 5000)
})