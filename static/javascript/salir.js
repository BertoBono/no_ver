socket = io();

function cerrarSesion() {
  socket.emit('cerrar_sesion');
  setTimeout(function() {
    document.getElementById('formSalir').submit()
  }, 500);
}