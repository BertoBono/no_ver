socket = io();

function unirse1() {
  mostrarMensaje(1);
  socket.emit('join', {room: "room1", partida: 1});
  socket.emit('registro', {partida: 1})
}

function unirse2() {
  mostrarMensaje(2);
  socket.emit('join', {room: "room2", partida: 2});
  socket.emit('registro', {partida: 2})
}

function unirse3() {
  mostrarMensaje(3);
  socket.emit('join', {room: "room3", partida: 3});
  socket.emit('registro', {partida: 3})
}

function unirse4() {
  mostrarMensaje(4);
  socket.emit('join', {room: "room4", partida: 4});
  socket.emit('registro', {partida: 4})
}

function unirse5() {
  mostrarMensaje(5);
  socket.emit('join', {room: "room5", partida: 5});
  socket.emit('registro', {partida: 5})
}

function salir1() {
  socket.emit('leave', {room: "room1", partida: 1})  
  socket.emit('registro', {partida: 1})
}

function salir2() {
  socket.emit('leave', {room: "room2", partida: 2})  
  socket.emit('registro', {partida: 2})
}

function salir3() {
  socket.emit('leave', {room: "room3", partida: 3})  
  socket.emit('registro', {partida: 3})
}

function salir4() {
  socket.emit('leave', {room: "room4", partida: 4})  
  socket.emit('registro', {partida: 4})
}

function salir5() {
  socket.emit('leave', {room: "room5", partida: 5})  
  socket.emit('registro', {partida: 5})
}

function mostrarMensaje(num) {
  document.getElementById(`esperando${num}`).classList.add('mostrar');
}

socket.on('join', function(data) {
  var jugador1 = document.getElementById(`partida${data["partida"]}Jug1`);
  var jugador2 = document.getElementById(`partida${data["partida"]}Jug2`);
  var contador = document.getElementById(`cantJugPart${data["partida"]}`);
  if(jugador1.value == "") {
    jugador1.value = `${data["username"]}`;
    contador.innerHTML = `1`;
  }
  else {
    jugador2.value = `${data["username"]}`;
    contador.innerHTML = `2`;
    room = 'room' + data["partida"]
    socket.emit('enviarPartida', {"jugador1": jugador1.value, "jugador2": jugador2.value, "room": room, "partida": data["partida"]})
    socket.on('iniciarPartida', function(data) {
      var boton = document.getElementById(`partida${data["partida"]}Boton`);
      var boton_bkp = boton.innerHTML
      boton.innerHTML = "";
      socket.emit('deshabilitar', data["partida"]);
      setTimeout(function() {
        document.getElementById(`formJuego${data["partida"]}`).submit();
      }, 3001);
    });
  }
});

socket.on('leave', function(data) {
  var esperando = document.getElementById(`esperando${data["partida"]}`);
  esperando.classList.remove('mostrar');
  var jugador1 = document.getElementById(`partida${data["partida"]}Jug1`);
  jugador1.value = "";
  var contador = document.getElementById(`cantJugPart${data["partida"]}`);
  contador.innerHTML = `0`;
})

socket.on('deshabilitación', function(par) {
  var unirse = document.getElementById(`unirse${par}`);
  unirse.disabled = true;
})

socket.on('registro', function(partida) {
  var jug1 = document.getElementById(`partida${partida}Jug1`).value;
  var jug2 = document.getElementById(`partida${partida}Jug2`).value;
  var botonUnirse = document.getElementById(`unirse${partida}`);

  if(jug1 != "" && jug2 != "") {
    comenzada = 1;
  }
  else {
    comenzada = 0;
  }

  console.log(partida + ' ' + jug1 + ' ' + jug2 + ' ' + comenzada)
  
  $.ajax({
    url: "/sub_conexion",
    type: "PUT",
    data: {"partida": partida, "jug_1": jug1, "jug_2": jug2, "comenzada": comenzada},
    success: function(response) {
      console.log('Los datos se han actualizado correctamente');
    },
    error: function(error) {
      console.log(error);
    }
  });
});

socket.on('connect', function() {
  $.ajax({
    url: "/sub_conexion",
    type: "GET",
    success: function(response) {
      console.log(response)
      for(let i = 1 ; i <= 5 ; i++) {
        var jug1 = document.getElementById(`partida${i}Jug1`);
        var jug2 = document.getElementById(`partida${i}Jug2`);
        var botonUnirse = document.getElementById(`unirse${i}`);
        var contador = document.getElementById(`cantJugPart${i}`)
        jug1.value = response[i-1][1];
        jug2.value = response[i-1][2];
        if(response[i-1][3] == 1) {
          botonUnirse.disabled = true;
        }
        else {
          botonUnirse.disabled = false;
        }
        if(jug1.value != "") {
          contador.innerHTML = '1';
        }
        if(jug2.value != "") {
          contador.innerHTML = '2';
        }
      }
    },
    error: function(error) {
      console.log(error);
    }
  });
});