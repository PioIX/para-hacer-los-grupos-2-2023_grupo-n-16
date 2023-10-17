const IP = "ws://localhost:3000";//aca esta el servidor
const socket = io(IP);

//ESTO ES UN LISTENER
socket.on("connect", () => {
    console.log("Me conecté a WS");
});//listener:función que esta esperando a escuchar algo

socket.on("server-message", data => {
    console.log("Me llego del servidor", data);
});

function funcionPrueba(){
    socket.emit("incoming-message", {mensaje:" prueba"})
}
function unirseASala(button) {
    console.log("ID del boton: ", button.nombre);
    socket.emit("nameRoom", {roomName : button.name, roomId: button.id})
}

function recibirMensaje(mensaje){
    socket.emit('nuevoMensaje', {mensaje: mensaje});
    console.log("El cliente mandó: ", mensaje);
}
 /*function render(msj){
    var html= ` <div class="message received">
                    <strong>${msj.usuario}</strong>
                    <p>${msj.mensaje}</p>
                </div>`
    document.getElementsByClassName("chat-container").innerHTML += html
 }*/