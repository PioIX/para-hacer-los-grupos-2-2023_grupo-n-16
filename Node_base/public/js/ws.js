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

socket.on("mensajes", data => {
    render(data.msjs)
    console.log(data.mjs)
})

function render(msj){
    var html=""
    for (let i = 0; i<msj.length; i++){
        html+=` <div class="message received">
                    <strong>${msj[i].usuario}</strong>
                    <p>${msj[i].mensaje}</p>
                </div>`
    }
    document.getElementById("chat-messages").innerHTML += html
 }