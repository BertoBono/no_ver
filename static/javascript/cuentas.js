socket = io();

function repeticionContraseña() {
  nombre = document.getElementById('nombre').value
  contraseña = document.getElementById('contraseña').value;
  contraseñaRepetida = document.getElementById('repetirContraseña').value;
  
  if(contraseña != contraseñaRepetida) {
    contraseña = "";
    contraseñaRepetida = "";
    var noCoinciden = document.getElementById('noCoinciden');
    noCoinciden.classList.add('mostrar')
    setTimeout(function() {
      noCoinciden.classList.remove('mostrar')
    }, 1500)
  }
  else if(nombre == "" || contraseña == "" && contraseñaRepetida == "") {
    var completarTodo = document.getElementById('completarTodo');
    completarTodo.classList.add('mostrar')
    setTimeout(function() {
      completarTodo.classList.remove('mostrar')
    }, 1500)
  }
  else {
    verificarRegistro()
  }
}

function verificarRegistro() {
  var nombre = document.getElementById('nombre').value
  var contraseña = document.getElementById('contraseña').value

  console.log(nombre, contraseña)
  $.ajax({
    url:"/sub_registro", 
    type:"POST",
    data:{nombre: nombre, contraseña: contraseña},
    success: function(response) {
      if(response == 'True') {
        form = document.getElementById('formRegistro');
        form.removeAttribute('action');
        form.setAttribute("action", "/inicio")
        form.submit()
      }
      else {
        var usado = document.getElementById('nombreEnUso');
        usado.classList.add('mostrar')
        setTimeout(function() {
          usado.classList.remove('mostrar')
        }, 1500)
      }
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function verificarLogin() {
  var nombre = document.getElementById('nombre').value;
  var contraseña = document.getElementById('contraseña').value;
  var conectado = false;

  socket.emit('lista_jugadores')
  
  socket.on('lista_jugadores', function(response) {
    for(let i = 0 ; i < response.length ; i++) {
      if(nombre == response[i]) {
        conectado = true;
      }
    }  
  });

  setTimeout(function() {
    if(nombre != "" && contraseña != "" && conectado != true) {
      $.ajax({
        url:"/sub_login",
        type:"POST",
        data:{nombre: nombre, contraseña: contraseña},
        success: function(response) {
          datos = JSON.parse(response);
          datos = JSON.parse(datos);
          if(datos['sesion'] == true) {
            form = document.getElementById('formLogin');
            form.removeAttribute('action');
            form.setAttribute("action", `${datos['action']}`);
            form.submit()
          }
          else {
            var incorrecto = document.getElementById('contraIncorrecta');
            incorrecto.classList.add('mostrar')
            setTimeout(function() {
              incorrecto.classList.remove('mostrar')
            }, 1500)
          }
        },
        error: function(error) {
          console.log(error);
        }
      });
    }
    else if(conectado == true) {
      var enLinea = document.getElementById('enLinea');
      var subtituloEnLinea = document.getElementById('subtituloEnLinea');
      subtituloEnLinea.innerHTML = `¡${nombre} ya se encuentra en linea!`;
      enLinea.classList.add('mostrar')
      setTimeout(function() {
        enLinea.classList.remove('mostrar')
      }, 1500)
      
    }
    else {
      var completar = document.getElementById('completarDatos');
      completar.classList.add('mostrar')
      setTimeout(function() {
        completar.classList.remove('mostrar')
      }, 1500)
    }
  }, 500);
}
