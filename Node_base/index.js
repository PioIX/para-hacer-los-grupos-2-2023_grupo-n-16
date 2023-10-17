
//Cargo librerías instaladas y necesarias
const express = require('express'); //Para el manejo del servidor Web
const exphbs  = require('express-handlebars'); //Para el manejo de los HTML
const bodyParser = require('body-parser'); //Para el manejo de los strings JSON
const MySQL = require('./modulos/mysql'); //Añado el archivo mysql.js presente en la carpeta módulos
//const session = require('express-session')

const session = require('express-session'); //Para usar variables de sesión
const app = express(); //Inicializo express para el manejo de las peticiones
app.use(express.static('public')); //Expongo al lado cliente la carpeta "public"

app.use(bodyParser.urlencoded({ extended: false })); //Inicializo el parser JSON
app.use(bodyParser.json());

app.engine('handlebars', exphbs({defaultLayout: 'main'})); //Inicializo Handlebars. Utilizo como base el layout "Main".
app.set('view engine', 'handlebars'); //Inicializo Handlebars

const Listen_Port = 3000; //Puerto por el que estoy ejecutando la página Web

const server=app.listen(Listen_Port, function() {
    console.log('Servidor NodeJS corriendo en http://localhost:' + Listen_Port + '/');
});

const io= require('socket.io')(server);

const sessionMiddleware=session({
    secret: 'sararasthastka',
    resave: true,
    saveUninitialized:  false,
});

app.use(sessionMiddleware);

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(session({secret: '123456', resave: true, saveUninitialized: true}));
/*
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
    A PARTIR DE ESTE PUNTO GENERAREMOS NUESTRO CÓDIGO (PARA RECIBIR PETICIONES, MANEJO DB, ETC.)
*/

app.get('/', async function(req, res)
{
    //Petición GET con URL = "/", lease, página principal.
    console.log("Arranca la página", req.query); //En req.query vamos a obtener el objeto con los parámetros enviados desde el frontend por método GET
    res.render('login',null ); //Renderizo página "login" sin pasar ningún objeto a Handlebars
});
app.post('/iralogin', function(req, res){
    console.log("Soy un pedido POST/irALogin", req.body);  //Renderizo página "home" sin pasar ningún objeto a Handlebars
    res.render('login', null);
});

//--------------
app.get('/login', function(req, res)
{
    //Petición GET con URL = "/login"
    console.log("Soy un pedido GET", req.query); 
    res.render('inicio', null); //Renderizo página "home" sin pasar ningún objeto a Handlebars
});
app.post('/login', async function(req, res)
{
    console.log("Soy un pedido POST/login", req.body); 
    let chats = await MySQL.realizarQuery('SELECT * FROM Chats');
    let userLoggeado= await MySQL.realizarQuery(`SELECT * FROM Contactos WHERE usuario= "${req.body.usuario}" and contraseña="${req.body.contraseña}"`)
    //Chequeo el largo del vector a ver si tiene datos
    if (userLoggeado.length > 0) {
        req.session.idUsuario=userLoggeado[0].idContacto
        console.log(req.session.idUsuario)
        //Armo un objeto para responder
        res.render('inicio',{chats:chats} );
        console.log(chats);   
    }
    else{
        res.send({validar:false})    
    }
});

app.put('/login', function(req, res) {
    //Petición PUT con URL = "/login"
    console.log("Soy un pedido PUT", req.body); //En req.body vamos a obtener el objeto con los parámetros enviados desde el frontend por método PUT
    res.send(null);
});

app.delete('/login', function(req, res) {
    //Petición DELETE con URL = "/login"
    console.log("Soy un pedido DELETE", req.body); //En req.body vamos a obtener el objeto con los parámetros enviados desde el frontend por método DELETE
    res.send(null);
});
     //HOME renderisa a home
 app.post('/inicio', function(req, res){
    console.log("Soy un pedido POST/home", req.body);  
    res.render('inicio', null);
});

/* REGISTRO*/
app.get('/botonRegistrarse', function(req, res)
{
    console.log("Soy un pedido GET/botonRegistrarse", req.query); 
    res.render('registro', null); 
});

app.post('/enviarRegistro', async function(req, res){
    console.log("Soy un pedido POST/enviarRegistro", req.body);
    await MySQL.realizarQuery(`INSERT INTO Contactos(usuario, contraseña) VALUES("${req.body.usuario}", "${req.body.contraseña}") `)
    console.log(await (MySQL.realizarQuery("SELECT * FROM Contactos")))        
    res.render('inicio', {usuario:req.body.usuario});
});
        

//WEB SOCKET
io.on("connection", (socket) => {
    //Esta línea es para compatibilizar con lo que venimos escribiendo
    const req = socket.request;

    //Esto serìa el equivalente a un app.post, app.get...
    socket.on('incoming-message', data => {
        console.log("INCOMING MESSAGE:", data);
        console.log("SALA: ", req.session.roomName);
        io.to(req.session.roomName).emit("server-message", {mensaje:"MENSAJE DE SERVIDOR"})
    });

    socket.on('nameRoom', (data) => {
        console.log("Se conectó a una sala:", data.roomName);
        socket.join(data.roomName);
        req.session.roomName=data.roomName
        req.session.roomId=data.roomId
        //req.session.save();
        io.to(data.roomName).emit("server-message", { mensaje: "Holiii" });
    });

    socket.emit('mensajes', async (mensajes)=>{
        await MySQL.realizarQuery(`SELECT * FROM Mensajes WHERE idContacto=${req.session.idUsuario} AND idChat=${req.session.idRoom}`)
    });

    socket.on('nuevoMensaje', async (data) => {
        console.log("Se envió el mensaje: ", data.mensaje, "a la sala", req.session.roomName);
        io.to(req.session.roomName).emit("server-message", { mensajes: data.mensaje });
        await MySQL.realizarQuery(`INSERT INTO Mensajes(idChat, idContacto, fecha, mensaje) VALUES (${req.session.roomId}, ${req.session.idUsuario}, NOW(), "${data.mensaje}")`);
    });
});

setInterval(() => io.emit("server-message", { mensaje: "MENSAJE DEL SERVIDOR" }), 2000);