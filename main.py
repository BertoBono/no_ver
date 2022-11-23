from flask import Flask, render_template, session, request, json
from flask_socketio import SocketIO, emit, join_room, leave_room
import sqlite3
import math

diccionario = []

app = Flask(__name__)
app.secret_key = "juego_de_generar_una_palabra_a_partir_de_dos_letras"
app.config['SECRET_KEY'] = 'PLATINUM_DELUXE_2022_DIRECTOR’S_CUT_-_PRE_ORDER_BONUS_INCLUDED_-_GOTY_2023_EDITION_-_(INCLUIDO_EL_PARCHE_27.2_CON_BUGS_DE_MULTIJUGADOR_CORREGIDOS)_-_EPIC_GAMES_EDITION'

socketio = SocketIO(app)

jugadores = {}
jugadoresUsuarios = []

@app.route('/')
def index():
  return render_template('./html/index.html')

@app.route('/sub_inicio', methods=['GET', 'POST'])
def sub_inicio():
  if request.method == "POST":
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

    q = f"""
          INSERT OR IGNORE INTO Palabras (palabra)
          VALUES ('{request.form["palabra"]}')
        """
    
    conn.execute(q)
    conn.commit()

    return 'true'

@app.route('/iniciar_sesion')
def iniciarSesion():
  return render_template('./html/login.html')

@app.route('/registrarse')
def registrarUsuario():
  return render_template('./html/registro.html')

@app.route('/sub_login', methods=['GET', 'POST'])
def verificarUsuario():
  session['nomUsuario'] = request.form['nombre']
  session['conUsuario'] = request.form['contraseña']

  conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  cur = conn.cursor()

  q = f"""
        SELECT *
        FROM Jugadores
        WHERE nombre = '{session['nomUsuario']}' AND contraseña = '{session['conUsuario']}'
        ;
      """

  cur.execute(q)
  usu = cur.fetchall()
  conn.close()

  if session['nomUsuario'] == 'admin':
    session['jugAdministrador'] = True
  else:
    session['jugAdministrador'] = False
  
  if usu != []:
    if session['jugAdministrador']:
      return json.dumps('{"sesion":true, "action":"/admin"}')
    else:
      return json.dumps('{"sesion":true, "action":"/inicio"}')
      
  else:
    return json.dumps('{"sesion":false, "action":"/"}')

@app.route('/sub_registro', methods=['GET', 'POST'])
def confirmarRegistro():
  session['nomUsuario'] = request.form['nombre']
  session['conUsuario'] = request.form['contraseña']

  conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  cur = conn.cursor()

  q = f"""
        SELECT *
        FROM Jugadores
        WHERE nombre = '{session['nomUsuario']}'
        ;
      """

  cur.execute(q)
  usu = cur.fetchall()
  conn.close()

  if usu == []:
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

    q = f"""
          INSERT INTO Jugadores (nombre, contraseña, victorias, url_foto)
          VALUES ('{session['nomUsuario']}', '{session['conUsuario']}', 0, './static/img/perfildefault.png')
          ;
        """

    conn.execute(q)
    conn.commit()
    conn.close()

    return 'True'
  else:
    return 'False'

@app.route('/inicio', methods=['GET', 'POST'])
def inicio():
  return render_template('./html/menu.html')

@app.route('/admin', methods=['GET', 'POST', 'PUT', 'DELETE'])
def panelAdministrador():
  return render_template('./html/panelAdministrador.html', listaJugadores = devolverJugadores())

def devolverJugadores():
  conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  lista = []
  
  q = """
        SELECT nombre
        FROM Jugadores
        ORDER BY id ASC
        ;
      """

  resu = conn.execute(q)
  for fila in resu:
    lista.append(fila[0])

  conn.close()

  return lista

@app.route('/recepcionAjax', methods=['GET', 'POST', 'PUT', 'DELETE'])
def atencionAjax():
  if request.method == 'POST':
    session['admin_jug'] = request.form['jugador']

    return 'true'
  if request.method == 'GET':
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

    datos = devolverTodo(session['admin_jug'])[0]

    print(datos)

    texto = '{"id": "' + str(datos[0]) + '", "nombre": "' + datos[1] + '", "contraseña": "' + datos[2] + '", "victorias": "' + str(datos[3]) + '"}'
        
    return json.dumps(texto)

  elif request.method == 'PUT':
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

    q = f"""
          UPDATE Jugadores
          SET victorias = '{request.form['modVictorias']}'
          WHERE nombre = '{request.form['nomModificar']}'
          ;
        """

    conn.execute(q)
    conn.commit()

    conn.close()

    return 'true'
    
  elif request.method == 'DELETE':
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  
    q = f"""
          DELETE FROM Jugadores
          WHERE nombre = '{request.form['nomBorrar']}'
          ;
        """

    conn.execute(q)
    conn.commit()

    conn.close()
    
    return 'true'

@app.route('/ajax_partidas', methods=['GET', 'POST', 'PUT'])
def partidasAjax():
  if request.method == "POST":
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  
    q = """
          INSERT OR IGNORE INTO Partidas (partida, jugador_1, jugador_2, comenzada)
          VALUES (1, "", "", 0)
          ;
        """
    conn.execute(q)
    conn.commit()
  
    
    q = """
          INSERT OR IGNORE INTO Partidas (partida, jugador_1, jugador_2, comenzada)
          VALUES (2, "", "", 0)
          ;
        """
    conn.execute(q)
    conn.commit()
    
    q = """
          INSERT OR IGNORE INTO Partidas (partida, jugador_1, jugador_2, comenzada)
          VALUES (3, "", "", 0)
          ;
        """
    conn.execute(q)
    conn.commit()
  
    q = """
          INSERT OR IGNORE INTO Partidas (partida, jugador_1, jugador_2, comenzada)
          VALUES (4, "", "", 0)
          ;
        """
    conn.execute(q)
    conn.commit()
  
    q = """
          INSERT OR IGNORE INTO Partidas (partida, jugador_1, jugador_2, comenzada)
          VALUES (5, "", "", 0)
          ;
        """
    conn.execute(q)
    conn.commit()
  
    conn.close()
  
    return 'true'
  elif request.method == "PUT":
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  
    q = f"""
          UPDATE Partidas
          SET jugador_1 = "", jugador_2 = "", comenzada = 0
          WHERE partida = {request.form['partida']}
          ;
        """
    conn.execute(q)
    conn.commit()

    conn.close()
      
    return 'true'

@app.route('/recuperar_victorias', methods=['GET', 'POST'])
def recuperarVictorias():
  conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

  lista = []
  
  q = f"""
        SELECT victorias
        FROM Jugadores
        WHERE nombre = '{session['nomUsuario']}'
      """

  resu = conn.execute(q)
  for fila in resu:
    lista.append(fila)
  conn.close()

  victorias = lista[0]

  res = ""
  for x in victorias:
    res += str(x)
  res = int(res)

  session["vicUsuario"] = res

  return 'true'
  
@app.route('/instrucciones', methods=['GET', 'POST'])
def instrucciones():
  return render_template('./html/instrucciones.html')

@app.route('/ranking', methods=['GET', 'POST'])
def ranking():
  return render_template('./html/ranking.html')

@app.route('/sub_ranking', methods=['GET', 'POST'])
def devolverRanking():
  if request.method == 'GET':
  
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
    lista = []
      
    q = """
          SELECT nombre, victorias
          FROM Jugadores
          ORDER BY victorias DESC
          LIMIT 10
          ;
        """
  
    resu = conn.execute(q)
  
    for fila in resu:
      lista.append(fila)
  
    conn.close()
  
    texto = '['
    i = 0
    while i < len(lista)-1:
      texto += '{"nombre": "' + lista[i][0] + '", "victorias": ' + str(lista[i][1]) + '}, '
      i += 1
    texto += '{"nombre": "' + lista[i][0] + '", "victorias": ' + str(lista[i][1]) + '}]'
  
    return json.dumps(texto)
    
@app.route('/creditos')
def creditos():
  return render_template('./html/creditos.html')

@app.route('/conexion', methods=['GET', 'POST'])
def conexion():
  print(session['nomUsuario'])
  datos = devolverTodo(session['nomUsuario'])[0]

  dic = {"id": datos[0], "nombre": datos[1], "contraseña": datos[2], "victorias": datos[3], "url_foto": datos[4]}
  
  return render_template('./html/conexion.html', jugador = dic)

@app.route('/sub_conexion', methods=['GET', 'POST', 'PUT'])
def manejarPartidas():
  if request.method == 'PUT':
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
    
    print('partida: ' + str(request.form["partida"]) + ' jug1: ' + request.form["jug_1"] + ' jug2: ' + request.form["jug_2"] + ' comenzada: ' + str(request.form["comenzada"]))
    
    q = f"""
          UPDATE Partidas
          SET jugador_1 = '{request.form["jug_1"]}', jugador_2 = '{request.form["jug_2"]}', comenzada = {request.form["comenzada"]}
          WHERE partida = {request.form["partida"]}
          ;
        """
  
    conn.execute(q)
    conn.commit()
  
    conn.close()
  
    return 'true'
  elif request.method == 'GET':
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
    lista = []
    
    
    q = """
          SELECT *
          FROM Partidas
          ;
        """

    resu = conn.execute(q)
    for fila in resu:
      lista.append(fila)
    conn.close()

    print(lista)
    
    return lista

@app.route('/juego', methods=['GET', 'POST'])
def juego():
  datos = devolverTodo(session['nomUsuario'])[0]

  conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

  lista = []
  
  q = f"""
        SELECT partida
        FROM Partidas
        WHERE jugador_1 = '{datos[1]}' OR jugador_2 = '{datos[1]}'
        ;
      """

  resu = conn.execute(q)
  for fila in resu:
    lista.append(fila)
  conn.close()
  
  texto = '{"nombre": "' + datos[1] + '", "url_foto": "' + datos[4] + '"}'
  
  return render_template('./html/juego.html', datosJugador = json.dumps(texto), partida = lista[0][0])

@app.route('/sub_juego', methods=['GET', 'POST'])
def juegoAjax():
  if request.method == 'GET':
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
    
    datos = devolverTodo(session['nomUsuario'])[0]

    lista = []

    q = f"""
        SELECT partida
        FROM Partidas
        WHERE jugador_1 = '{datos[1]}' OR jugador_2 = '{datos[1]}'
        ;
      """

    resu = conn.execute(q)
    for fila in resu:
      lista.append(fila)

    partida = lista[0][0]
    lista.clear()
    
    q = f"""
          SELECT jugador_1, jugador_2
          FROM Partidas
          WHERE partida = {partida}
          ;
        """
    
    resu = conn.execute(q)
    for fila in resu:
      lista.append(fila)
    conn.close()

    if lista[0][0] == session['nomUsuario']:
      miJugador = 1
    else:
      miJugador = 2
      
    texto = '{"jugador_1": "' + lista[0][0] + '", "jugador_2": "' + lista[0][1] + '", "soy_jugador": ' + str(miJugador) + '}'
    
    return json.dumps(texto)

@app.route('/obtener_palabras', methods=['GET', 'POST'])
def devolverPalabras():
  if request.method == "GET":
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
    lista = []
    
    q = """
          SELECT sin_acentos
          FROM Palabras
          ;
        """
  
    resu = conn.execute(q)
    for fila in resu:
      lista.append(fila)
    conn.close()
  
    texto = '['
    
    i = 0;
    while i < len(lista)-1:
      texto += '{"%i": "%s"}, ' % (i, lista[i])
      i += 1
    texto += '{"%i": "%s"}]' % (i, lista[i])
    
    return json.dumps(lista) 

@app.route('/finalizar_partida', methods=['GET', 'POST', 'PUT'])
def finalizarPartida():
  if request.method == 'PUT':
    session["vicUsuario"] += 1
    print("victorias del usuario: " + str(session["vicUsuario"]))
    
    conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')

    q = f"""
          UPDATE Jugadores
          SET victorias = {session["vicUsuario"]}
          WHERE nombre = '{request.form["ganador"]}'
          ;
        """

    conn.execute(q)
    conn.commit()

    conn.close()

    return 'true'

def devolverTodo(jugador):
  conn = sqlite3.connect('./BaseDeDatos/base_de_datos.db')
  lista = []
  
  q = f"""
        SELECT *
        FROM Jugadores
        WHERE nombre = '{jugador}'
        ;
      """

  resu = conn.execute(q)

  for fila in resu:
    lista.append(fila)
  conn.close()
  
  return lista

@socketio.on('usuario_conectado')
def agregarUsuario():
  repetido = False  
  i = 0
  while i < len(jugadores):
    if jugadoresUsuarios[i] == session['nomUsuario']:
      repetido = True
    i += 1
  if repetido == False:
    jugadores[session['nomUsuario']] = request.sid
    jugadoresUsuarios.append(session['nomUsuario'])
  print(jugadores)
  print(jugadoresUsuarios)

@socketio.on('cerrar_sesion')
def cerrarSesion():
  jugadores.pop(session['nomUsuario'])
  jugadoresUsuarios.remove(session['nomUsuario'])
  session['nomUsuario'] = ""
  print(jugadores)
  print(jugadoresUsuarios)

@socketio.on('lista_jugadores')
def devolverListaJugadores():
  emit('lista_jugadores', jugadoresUsuarios)

@socketio.on('join')
def join(data):
  print("Join")
  print(data["room"])
  join_room(data['room'])
  emit('join', {"username": session['nomUsuario'], "partida": data["partida"]}, broadcast = True)

@socketio.on('leave')
def leave(data):
  print("Leave")
  leave_room(data['room'])
  emit('leave', {"username": session['nomUsuario'], "partida": data["partida"]}, broadcast = True)

@socketio.on('deshabilitar')
def deshabilitar(partida):
  print("deshabilitando botón de unirse de partida: " + str(partida))
  emit('deshabilitación', partida, broadcast = True)

@socketio.on('enviarPartida')
def inicioPartida(data):
  print(data["jugador1"] + ' y ' + data["jugador2"] + ' fueron enviados a una partida en ' + str(data["partida"]))
  emit('iniciarPartida', data, to=data["room"])

@socketio.on('registro')
def handlePartidas(partida):
  print('Se van a actualizar los datos de la partida: ' + str(partida['partida']))
  session['partidaUnido'] = partida["partida"]
  emit('registro', partida['partida'], broadcast = True)

@socketio.on('palabra')
def autoEnviarPalabra(palabra):
  silaba = obtenerSilaba(palabra)
  emit('palabra', silaba)

@socketio.on('enviar_silaba')
def handleSilaba(datos):
  print(str(datos["silaba"]) + ' ' + str(datos["room"]))
  silaba = datos["silaba"]
  emit('recibir_silaba', silaba, to=datos["room"])

def obtenerSilaba(palabra):
  silaba = ""
  cantidadLetras = len(palabra)
  mitadLetras = math.trunc(cantidadLetras/2)
  silaba = palabra[mitadLetras-1:mitadLetras+1]
  print(silaba)
  return silaba

@socketio.on('enviar_palabra')
def handlePalabra(datos):
  palabra = datos["palabra"]
  print(str(datos["palabra"]) + ' ' + str(datos["room"]))
  emit('recibir_palabra', palabra, to=datos["room"])

@socketio.on('conectado')
def conectarse():
  emit('conectado')

@socketio.on('preguntar')
def handleConexion(datos):
  print("enviando estado: " + str(datos["conectado"]) + " al jugador: " + str(datos["room"]))
  emit('respuesta', datos["conectado"], to=datos["room"])

@socketio.on('pedir_palabra')
def pedidoPalabra(datos):
  listaPalabras = datos["listaPalabras"]
  print("tocó la palabra: " + str(listaPalabras[datos["index"]]))
  emit('devolver_palabra', listaPalabras[datos["index"]])

@socketio.on('terminar_partida')
def terminarPartida(datos):
  print("terminando partida")
  emit('terminar_partida', to=datos["room"])

@socketio.on('enviar_puntos')
def handlePuntos(datos):
  print("El jugador suma: " + str(datos["puntos"]) + " puntos")
  emit('recibir_puntos', datos["puntos"], to=datos["room"])

@socketio.on('finalizacion')
def finalizacion(datos):
  emit('finalizacion', to=datos["room"])

@socketio.on('buena_palabra')
def buenIntento(datos):
  emit('intento', './static/img/correcto.jpg', to=datos["room"])

@socketio.on('mala_palabra')
def malIntento(datos):
  emit('intento', './static/img/incorrecto.jpg', to=datos["room"])

@socketio.on('modal_final')
def alerta(datos):
  emit('modal_final', datos["ganador"], to=datos["room"])

if __name__ == '__main__':
  socketio.run(app, host='0.0.0.0', port=81)