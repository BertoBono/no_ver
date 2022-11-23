socket = io();

function modificarFormAction(pagina) {
  var form = document.getElementById('formMenu');

  form.setAttribute("action", pagina);
  form.submit();
}

socket.emit('usuario_conectado');

$.ajax({
  url: "/recuperar_victorias",
  type: "POST",
  success: function(response) {
    console.log("Se han recuperado las victorias correctamente");
  },
  error: function(error) {
    console.log(error);
  }
})

