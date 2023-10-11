function unirseASala(button) {
    console.log("ID del boton: ", button.id);
    socket.emit("nameRoom", {roomName : button.id})
}

