const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const {crearMensaje} =require('../utilidades/utilidades.js')

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        // console.log(data)

        if(!data.nombre || !data.sala){
            return callback({
                error:true,
                mensaje:'El nombre y la sala son necesarios'
            });
        }

        client.join(data.sala,function(){
            // console.log("Socket now in rooms", client.rooms)
        });

        usuarios.agregarPersona(client.id, data.nombre,data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas',usuarios.getPersonasPorSala(data.sala))

        callback(usuarios.getPersonasPorSala(data.sala));

    });

    client.on('crearMensaje',(data)=>{
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(persona.sala).emit('crearMensaje',crearMensaje(persona.nombre,data.mensaje));
    })    


    client.on('disconnect', () =>{
        let personaBorrada = usuarios.borrarPersona(client.id);
        // console.log(personaBorrada)
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Adminstrador',`${personaBorrada.nombre} salio`))
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas',usuarios.getPersonasPorSala())

    });

    client.on('mensajePrivado',(data)=>{
        let persona = usuarios.getPersona(client.id)
        client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persona.nombre,data.mensaje))

    })

});