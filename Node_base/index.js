
//Cargo librerías instaladas y necesarias
const express = require('express'); //Para el manejo del servidor Web
const exphbs  = require('express-handlebars'); //Para el manejo de los HTML
const bodyParser = require('body-parser'); //Para el manejo de los strings JSON
const MySQL = require('./modulos/mysql'); //Añado el archivo mysql.js presente en la carpeta módulos
//const session = require('express-session')

const app = express(); //Inicializo express para el manejo de las peticiones
const session = require('express-session');
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
    saveUnintialized: false,
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

app.get('/login', async function(req, res)
{
    //Petición GET con URL = "/login"
    console.log("Soy un pedido GET/login", req.query);  
    let chats = await MySQL.realizarQuery('SELECT nombre FROM Chats');
    let userLoggeado= await MySQL.realizarQuery(`SELECT * FROM Contactos WHERE usuario= "${req.query.usuario}" and contraseña="${req.query.contraseña}"`)
    console.log(userLoggeado);
    if(userLoggeado){
        let idUsuario=await MySQL.realizarQuery(`SELECT idContacto FROM Contactos WHERE usuario="${req.query.usuario}"`)
        req.session.idUsuario=idUsuario
        console.log(req.session.idUsuario)
        res.render('inicio',{chats:chats} );
    } else{
        console.log("Datos incorrectos")
    }
});

app.post('/login', function(req, res)
{
    //Petición POST con URL = "/login"
    console.log("Soy un pedido POST", req.body); 
    //En req.body vamos a obtener el objeto con los parámetros enviados desde el frontend por método POST
    //res.render('home', { mensaje: "Hola mundo!", usuario: req.body.usuario}); //Renderizo página "home" enviando un objeto de 2 parámetros a Handlebars
    res.render('inicio', null); //Renderizo página "home" sin pasar ningún objeto a Handlebars
});
app.get('/inicio', async function(req, res)
{
    //Petición GET con URL = "/", lease, página principal.
    console.log("Arranca la página", req.query); //En req.query vamos a obtener el objeto con los parámetros enviados desde el frontend por método GET
    let chats = await MySQL.realizarQuery('SELECT nombre FROM Chats');
    
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

//  chat
app.post('/enviarMensaje', async function(req, res){
    console.log("Soy un pedido Enviar Mensaje", req.body.mensaje);
    await MySQL.realizarQuery(`INSERT INTO Mensajes(idContacto, mensaje, fecha) VALUES (${req.session.idUsuario}, "${req.body.mensaje}", ${Date()})`);
    res.render('inicio', null);
})

io.on("connection", (socket) => {
    //Esta línea es para compatibilizar con lo que venimos escribiendo
    const req = socket.request;

    //Esto serìa el equivalente a un app.post, app.get...
    socket.on('incoming-message', data => {
        console.log("INCOMING MESSAGE:", data);
        console.log("SALA: ", req.session.roomName);
        io.to(req.session.roomName).emit("server-message", {mensaje:"MENSAJE DE SERVIDOR"})
    });

    socket.on("nameRoom", data => {
        console.log("Se conectó a una sala:", data.roomName);
        socket.join(data.roomName);
        req.session.roomName = data.roomName;
        io.to(data.roomName).emit("server-message", { mensaje: "Holiii" });
    });

    socket.on('mensaje', data => {
        console.log("Se envió el mensaje: ", data.mensaje);
        io.to(req.session.roomName).emit("server-message", { mensaje: data.mensaje });
    });
});

setInterval(() => io.emit("server-message", { mensaje: "MENSAJE DEL SERVIDOR" }), 2000);