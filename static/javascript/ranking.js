$.ajax({
  url: "/sub_ranking",
  type: "GET",
  success: function(response) {
    datos = JSON.parse(response)
    datos = JSON.parse(datos)

    var tabla = document.getElementById('tablaRanking');

    tabla.innerHTML =
    `
      <tr class="thead">
        <th>Posición</th>
        <th>Nombre</th>
        <th>Victorias</th>
      </tr>
    `
    for(let i = 0 ; i < datos.length && i < 10 ; i++) {
      tabla.innerHTML += 
      `
        <tr>
          <td>${i+1}</td>
          <td>${datos[i]["nombre"]}</td>
          <td>${datos[i]["victorias"]}</td>
        </tr>
      `
    }
  },
  error: function(error) {
    console.log(error);
  }
});