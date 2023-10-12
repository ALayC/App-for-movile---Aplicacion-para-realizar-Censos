const MENU= document.querySelector("#menu")
const ROUTER= document.querySelector("#ruteo")
const HOME= document.querySelector("#pantalla-home")
const LOGIN= document.querySelector("#pantalla-login")
const REGISTRO= document.querySelector("#pantalla-registro")
const CENSAR= document.querySelector("#pantalla-censar")
const LOGOUT= document.querySelector("#pantalla-logout")
const LISTAR= document.querySelector("#pantalla-listar")
const ESTADISTICAS= document.querySelector("#pantalla-estadisticas")
const MAPA= document.querySelector("#pantalla-mapa")

const URLBASE= "https://censo.develotion.com/"

let valorSelectSeleccionado = 0;
let respuestaGuardada = null;
let idUsuario= null;
let lasOcupaciones = [];
let idDeCiudadesConCesos = [];
let map; 
let latitudLugaresCensados = [];
let longituLugaresCensados = [];
let miLatitud;
let miLongitud;
let distanciaIngresada = 0;
let distanciaEntreMiUbicacionYLugarCensado = [];


inicio()

function inicio(){
    chequearSesion()
    eventos()
    getMiPosicion()
    //previaHacerListado()




}

function chequearSesion(){
    ocultarBotonesMenu()
    idUsuario= localStorage.getItem("iduser")
    if (idUsuario==null){
        mostrarMenuAnonimo()
    } else {
        mostrarMenuPro()
    }
}

function ocultarBotonesMenu(){
    document.querySelector("#btnHome").style.display="none"
    document.querySelector("#btnLogin").style.display="none"
    document.querySelector("#btnRegistro").style.display="none"
    document.querySelector("#btnCensar").style.display="none"
    document.querySelector("#btnListar").style.display="none"
    document.querySelector("#btnEstadistica").style.display="none"
    document.querySelector("#btnMapa").style.display="none"
    document.querySelector("#btnLogout").style.display="none"
}

function mostrarMenuAnonimo(){
    ocultarBotonesMenu()
    document.querySelector("#btnHome").style.display="block"
    document.querySelector("#btnLogin").style.display="block"
    document.querySelector("#btnRegistro").style.display="block"

}

function mostrarMenuPro(){
    ocultarBotonesMenu()
    document.querySelector("#btnHome").style.display="block"
    document.querySelector("#btnCensar").style.display="block"
    document.querySelector("#btnListar").style.display="block"
    document.querySelector("#btnEstadistica").style.display="block"
    document.querySelector("#btnMapa").style.display="block"
    document.querySelector("#btnLogout").style.display="block"

}

function eventos(){
    ROUTER.addEventListener("ionRouteDidChange",navegar)
    document.querySelector("#btnHacerLogin").addEventListener("click",previaHacerLogin)
    document.querySelector("#btnCensar").addEventListener("click",previaCargarDepartamentos)
    document.querySelector("#btnHacerCenso").addEventListener("click",previaHacerCenso)
    document.querySelector("#btnLogout").addEventListener("click",hacerLogout);
    document.querySelector("#btnRegistrarNuevoUsuario").addEventListener("click",previaRegistrarNuevoUsuario);
    document.querySelector("#btnListar").addEventListener("click",previaHacerListado)
    document.querySelector("#btnEstadistica").addEventListener("click", previaEstadisticas)
    document.querySelector("#btnFiltrarMapa").addEventListener("click", previaDistanciaIngresada )

}

function navegar(evt){

    ocultarPantallas()
    if (evt.detail.to=="/") {HOME.style.display="block"}
    if (evt.detail.to=="/login") {LOGIN.style.display="block"}
    if (evt.detail.to=="/registro") {REGISTRO.style.display="block"}
    if (evt.detail.to=="/censar") {CENSAR.style.display="block"}
    if (evt.detail.to=="/logout") {LOGOUT.style.display="block"}
    if (evt.detail.to=="/listar") {LISTAR.style.display="block"}
    if (evt.detail.to=="/estadisticas") {ESTADISTICAS.style.display="block"}
    if (evt.detail.to=="/mapa") {MAPA.style.display="block"}
}

function ocultarPantallas(){
    HOME.style.display="none"
    LOGIN.style.display="none"
    REGISTRO.style.display="none"
    CENSAR.style.display="none"
    LOGOUT.style.display="none"
    LISTAR.style.display="none"
    ESTADISTICAS.style.display="none"
    MAPA.style.display="none"

}

function cerrarMenu(){
    MENU.close()
}

function previaRegistrarNuevoUsuario(){
    let unUsuario= document.querySelector("#txtNuevoUsuario").value
    let unPassword= document.querySelector("#txtNuevoPassword").value

    let unNuevoCensista= new Object()
    unNuevoCensista.usuario= unUsuario
    unNuevoCensista.password= unPassword
    registrarNuevoCensista(unNuevoCensista)
}

function registrarNuevoCensista(unNuevoCensista){
    let nombreRegistrado= document.querySelector("#txtNuevoUsuario").value
    fetch (`${URLBASE}usuarios.php`,{
        method:'POST',
        headers:{
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(unNuevoCensista)
        })
        .then(function (response){
        return response.json()
        })
        .then(function(data){

        localStorage.setItem("usuario",data.usuario)
        localStorage.setItem("password",data.apiKey)
        if(data.codigo != 200){
            mostrarMensaje("ERROR","Censista no fue correctamente registrado",`Usted se ha intentado registrarse con el usuario : ${nombreRegistrado}`, 5000)
        }else{
            mostrarMensaje("SUCCESS","Censista correctamente registrado",`Usted se ha registrado con el usuario : ${nombreRegistrado}`, 5000)
        }

        })
        .catch(function(error){


        })

}

function previaHacerLogin(){

    let unUsuario= document.querySelector("#txtUsuario").value
    let unPassword= document.querySelector("#txtPassword").value

    let unCensista= new Object()
    unCensista.usuario= unUsuario
    unCensista.password= unPassword

     hacerLogin(unCensista)
}

function hacerLogin(unCensista){
    let nombreRegistrado= document.querySelector("#txtUsuario").value
    fetch (`${URLBASE}login.php`,{
        method:'POST',
        headers:{
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(unCensista)
        })
        .then(function (response){
        return response.json()
        })
        .then(function(data){


        if(data.codigo!=200){
            mostrarMensaje("ERROR","Error en sus credenciales",`Usted se ha intentado loggear con el usuario : ${nombreRegistrado}, por favor intente nuevamente`, 5000)

        }else{

            mostrarMensaje("SUCCESS","Loggeo exitoso",`Bienvenido : ${nombreRegistrado}`, 5000)
                        localStorage.setItem("iduser",data.id)
            localStorage.setItem("apiKey",data.apiKey)
            ocultarPantallas()
            HOME.style.display="block"
            mostrarMenuPro()
            obtenerOcupaciones()
            previaHacerListado()


        }

        })
        .catch(function(error){

        })
}

function hacerLogout() {

    localStorage.removeItem("apiKey");
    localStorage.removeItem("iduser");
    ocultarPantallas()
    mostrarMenuAnonimo()
    window.location.href = "/index.html";
}

function previaCargarDepartamentos(){
    fetch (`${URLBASE}departamentos.php`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(respuesta){

        mostrarDepartamentos(respuesta)
        })
        .catch(function(error){

        })

}

function mostrarDepartamentos(respuesta){
    let miSelect=""
    for (let unD of respuesta.departamentos){

        miSelect+=`<ion-select-option value=${unD.id}>${unD.nombre}</ion-select-option>`
    }
    document.querySelector("#slcDepartamento").innerHTML= miSelect


}

function obtenerCiudades(){

    let idDepartamento= document.querySelector("#slcDepartamento").value


    fetch (`${URLBASE}ciudades.php?idDepartamento=${idDepartamento}`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(respuesta){

        mostrarCiudades(respuesta)
        })
        .catch(function(error){

        })
}

function validarEdad() {
    var esMayor = false;
    let fechaNacimiento= document.querySelector("#fechaNac").value;
    let fechaNacimientoDate = new Date(fechaNacimiento);
    let fechaActual = new Date();
    let diferenciaAnios = fechaActual.getFullYear() - fechaNacimientoDate.getFullYear();

    if (fechaActual.getMonth() < fechaNacimientoDate.getMonth() ||
            (fechaActual.getMonth() == fechaNacimientoDate.getMonth() && fechaActual.getDate() < fechaNacimientoDate.getDate())) {
            diferenciaAnios--;
     }


    if (diferenciaAnios >= 18){
        esMayor = true

    }
    obtenerOcupaciones(esMayor)
    return esMayor;

}

function mostrarCiudades(respuesta){
    let miSelect=""
    for (let unaC of respuesta.ciudades){

        miSelect+=`<ion-select-option value=${unaC.id}>${unaC.nombre}</ion-select-option>`
    }
    document.querySelector("#slcCiudad").innerHTML= miSelect

}

function obtenerOcupaciones(esMayor){
    fetch (`${URLBASE}ocupaciones.php`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(respuesta){

        mostrarOcupaciones(respuesta,esMayor)
        })
        .catch(function(error){

        })

}


function mostrarOcupaciones(respuesta,esMayor){
    lasOcupaciones = respuesta.ocupaciones
    let miSelect = "";

    let todasLasOcupaciones = respuesta.ocupaciones;

    let ocupacionMenorDeEdad = [{id: 5, ocupacion: "Estudiante"}];

    let ocupacionesAMostrar;


    if (esMayor) {
        ocupacionesAMostrar = todasLasOcupaciones;
    } else {
        ocupacionesAMostrar = ocupacionMenorDeEdad;
    }

    for (let unaO of ocupacionesAMostrar){
        miSelect += `<ion-select-option value=${unaO.id}>${unaO.ocupacion}</ion-select-option>`;
    }

    document.querySelector("#slcOcupacion").innerHTML = miSelect;
}

function previaHacerCenso(){
    let nombre= document.querySelector("#txtCensarNombre").value
    let departamento= document.querySelector("#slcDepartamento").value
    let ciudad= document.querySelector("#slcCiudad").value
    let ocupacion= document.querySelector("#slcOcupacion").value
    let fecha= document.querySelector("#fechaNac").value
    let idUsuario= localStorage.getItem("iduser")
    nuevoCensado= new Object()
    nuevoCensado.idUsuario=idUsuario
    nuevoCensado.nombre=nombre
    nuevoCensado.departamento=departamento
    nuevoCensado.ciudad=ciudad
    nuevoCensado.ocupacion=ocupacion
    nuevoCensado.fechaNacimiento=fecha
    hacerCenso(nuevoCensado)
}

function hacerCenso(nuevoCensado){

    fetch (`${URLBASE}personas.php`,{
        method:'POST',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        },
        body: JSON.stringify(nuevoCensado)
        })
        .then(function (response){
        return response.json()
        })
        .then(function(data){
            if (data && data.codigo>399) {
                throw data.error;
            } else {

                mostrarMensaje("SUCCESS","Persona censada","La persona ha sido censada correctamente", 3000)
                //ocultarPantallas()
                HOME.style.display="block"
                document.getElementById('txtCensarNombre').value = '';
                document.getElementById('slcDepartamento').value = null;
                document.getElementById('slcCiudad').value = null;
                document.getElementById('fechaNac').value = '';
                document.getElementById('slcOcupacion').value = null;

            }


        })
        .catch(function(error){

        })


}

function previaHacerListado(){
    let idUsuario= localStorage.getItem("iduser")


    fetch (`${URLBASE}personas.php?idUsuario=${idUsuario}`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(respuesta){
        hacerListado(respuesta)
        estadisticas(respuesta)

        })
        .catch(function(error){

        })
}

function hacerListado(respuesta){
    let unaPersona=""
    let listaAuxiliardeIdPersonas= new Array()

    for (let unaP of respuesta.personas){

        if (valorSelectSeleccionado != 0 && unaP.ocupacion != valorSelectSeleccionado) {
            continue;
        }
        listaAuxiliardeIdPersonas.push(unaP.id)
        unaPersona+=`<ion-item>
            <ion-label>
                <h3>Nombre: ${unaP.nombre} </h3>
                <h3>Fecha de nacimiento: ${unaP.fechaNacimiento} </h3>
                <h3>Ocupacion: ${darNombreOcupacion(unaP.ocupacion)}</h3>
            </ion-label>
            <ion-button id="persona-${unaP.id}">Eliminar </ion-button>
        </ion-item>`
        }
    document.querySelector("#listadoPersonas").innerHTML=unaPersona

    for (let id of listaAuxiliardeIdPersonas){
        let botonEliminar= document.querySelector("#persona-"+id)
        botonEliminar.onclick= function(){eliminarMovimiento(id)}
    }
    respuestaGuardada  = respuesta

}

//aca capturo el valor del select despues de que se carga la lista con los censados
window.addEventListener('DOMContentLoaded', (event) => {
    let selectElement = document.querySelector("#slcListadoOcupacion");
    selectElement.addEventListener('ionChange', valorSelectOcupacion);
});

//aca le asigno el valor del select a la variable global valorSelectSeleccionado asi puedo usarla para filtrar dentro de la funcion hacer listado.
function valorSelectOcupacion(event) {
    let valorSelect = event.detail.value;
    valorSelectSeleccionado = valorSelect

    hacerListado(respuestaGuardada);

}

function eliminarMovimiento(id){


    fetch (`${URLBASE}personas.php?idCenso=${id}`,{
        method:'DELETE',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(data){
        if (data.codigo !=200){
            mostrarMensaje("ERROR",null,data.mensaje, 2000)
        } else {
            mostrarMensaje("SUCESS",null,"Persona eliminada con éxito", 2000)
            previaHacerListado();
        }
        })
        .catch(function(error){

        })

}

function darNombreOcupacion(id){

      for (let unaO of lasOcupaciones){
          if(unaO.id==id){
              return unaO.ocupacion
          }
      }
      return null
  }

function mostrarMensaje(tipo, titulo, texto, duracion) {
    const toast = document.createElement('ion-toast');
    toast.header = titulo;
    toast.message = texto;
    if (!duracion) {
    duracion = 2000;
    }
    toast.duration = duracion;
    if (tipo === "ERROR") {
    toast.color = 'danger';
    toast.icon = "alert-circle-outline";
    } else if (tipo === "WARNING") {
    toast.color = 'warning';
    toast.icon = "warning-outline";
    } else if (tipo === "SUCCESS") {
    toast.color = 'success';
    toast.icon = "checkmark-circle-outline";
    }
    document.body.appendChild(toast);
    toast.present();
}

function previaEstadisticas(){
    let idUsuario= localStorage.getItem("iduser")


    fetch (`${URLBASE}personas.php?idUsuario=${idUsuario}`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(respuesta){
            estadisticas(respuesta)
        })
        .catch(function(error){

        })

}

function estadisticas(respuesta){

    let censadosMvdeo = 0;
    let censadosInterior = 0;
    for(let unC of respuesta.personas){
        if(unC.departamento == 3218){
            censadosMvdeo++;
        }else{
            censadosInterior++;
        }
    }
    document.querySelector("#censadosMontevideo").value=censadosMvdeo;
    document.querySelector("#censadosRestoPais").value=censadosInterior;
}

function getMiPosicion(){
    navigator.geolocation.getCurrentPosition(miUbicacion)
}

function miUbicacion(position){
    miLatitud= position.coords.latitude
    miLongitud= position.coords.longitude
    
}

function calcularDistancia(puntoInicial, puntoFinal) {
    let distancia = map.distance(puntoInicial, puntoFinal) / 1000; // Calcula la distancia y la convierte a km
    return +distancia.toFixed(2); // Redondea a dos decimales y convierte nuevamente a número
}

function previaDistanciaIngresada(){

    let idUsuario= localStorage.getItem("iduser")
    distanciaIngresada = document.querySelector("#txtDistancia").value;
    //previaHacerListado();



    fetch (`${URLBASE}personas.php?idUsuario=${idUsuario}`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){

        return response.json()
        })
        .then(function(respuesta){
            console.log(respuesta)
            console.log(distanciaIngresada)
            previaMapa(distanciaIngresada,respuesta);

        })
        .catch(function(error){

        })


}

//en esta funcion tengo que obtener lat y long de los lugares con censos hechos.

function previaMapa(distanciaIngresada, respuestaParaMapa){



    //obtengo ids de ciudades censadas
    for(let unaUbi of respuestaParaMapa.personas){
        if(!idDeCiudadesConCesos.includes(unaUbi.ciudad)) {
            idDeCiudadesConCesos.push(unaUbi.ciudad);
        }
    }

    fetch (`${URLBASE}ciudades.php`,{
        method:'GET',
        headers:{
        'Content-Type': 'application/json',
        'apikey':localStorage.getItem("apiKey"),
        'iduser':localStorage.getItem("iduser")
        }
        })
        .then(function (response){
            return response.json()
        })
        .then(function(respuesta){

            armarMapa(respuesta,distanciaIngresada)
        })
        .catch(function(error){
        })
}

function armarMapa(respuesta, distanciaIngresada) {

    if (map) { 
        map.remove(); 
    }

    map = L.map('map').setView([miLatitud, miLongitud], 18);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 16,
        attribution: '@ OpenStreetMap '
    }).addTo(map);


    // Itero en respuesta y obtengo lat y long de todas las ciudades.
    // Si algun id de ciudad está en mi array idDeCiudadesConCesos guardo esas coordenadas
    for (let unaCor of respuesta.ciudades) {

        if (unaCor.id && idDeCiudadesConCesos.includes(unaCor.id)) {

            latitudLugaresCensados = unaCor.latitud;
            longituLugaresCensados = unaCor.longitud;

            let diferencia = calcularDistancia([miLatitud, miLongitud], [latitudLugaresCensados, longituLugaresCensados]);
            if (diferencia <= distanciaIngresada) {
    
                let markerCensado = L.marker([latitudLugaresCensados, longituLugaresCensados]).addTo(map);
                markerCensado.bindPopup("<b>Censado</b><br>Censado").openPopup();
                var markerMiUbicacion = L.marker([miLatitud, miLongitud]).addTo(map);
                markerMiUbicacion.bindPopup("<b>Ubicación</b><br>Mi ubicación").openPopup();
            }

        }
    }

}








