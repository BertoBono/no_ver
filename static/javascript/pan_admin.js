function completarSelect(jugadores, sel) {
  var select = document.getElementById(sel);
  for(let i = 0 ; i < jugadores.length ; i++) {
  select.innerHTML +=
  `
  <option value='${jugadores[i]}'>${jugadores[i]}</option>
  `
  }
}

function devolverJugador() {
  var jug = document.getElementById('devolver').value;
  $.ajax({
    url: "/recepcionAjax",
    type: "POST",
    data: {"jugador": jug},
    success: function(response) {
      $.ajax({
        url: "/recepcionAjax",
        type: "GET",
        success: function(response) {
          datos = JSON.parse(response);
          datos = JSON.parse(datos);
          console.log(`Información del jugador:\n
    id: ${datos['id']}\n
    nombre: ${datos['nombre']}\n
    contraseña: ${datos['contraseña']}\n
    victorias: ${datos['victorias']}\n\n`);
        },
        error: function(error) {
          console.log(error);
        }
      });
    },
    error: function(error) {
      console.log(error)
    }
  })
}

function modificarJugador() {
  var jug = document.getElementById('modificar').value;
  var vic = document.getElementById('modVictorias').value;
  
  $.ajax({
    url: "/recepcionAjax",
    type: "PUT",
    data: {nomModificar: jug, modVictorias: vic},
    success: function(response) {
      alert(`El nuevo valor de victorias del jugador '${jug}' ahora ha pasado a ser: '${vic}'`);
    },
    error: function(response) {
      console.log(error)
    }
  });
}

function borrarJugador() {
  var jug = document.getElementById('borrar').value;
  
  $.ajax({
    url: "/recepcionAjax",
    type: "DELETE",
    data: {nomBorrar: jug},
    success: function(response) {
      alert(`El jugador '${jug}' ha sido borrado correctamente`);
      location.reload(true);
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function crearPartidas() {
  $.ajax({
    url: "/ajax_partidas",
    type: "POST",
    success: function(response) {
      console.log("Las partidas se han creado exitosamente")
    },
    error: function(error) {
      console.log(error)
    }
  });
}

function vaciarPartidas() {
  var partida = document.getElementById('vaciar').value;
  
  $.ajax({
    url: "/ajax_partidas",
    type: "PUT",
    data: {"partida": partida},
    success: function(response) {
      console.log(`La partida n: ${partida} se ha vaciado exitosamente`);
    },
    error: function(error) {
      console.log(error);
    }
  })
}