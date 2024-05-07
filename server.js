const express = require("express");
const app = express();
const cors = require("cors");
const server = require('http').Server(app);
const PORT = 8082;

const { sequelize} = require('./models/index')
const {OPCUAClient,AttributeIds} = require("node-opcua");
const {getServerConnections} = require('./controller/controller');
const serverConnection = require("./modelos/serverConnectioModel");



app.use(express.urlencoded({extended: false}));
app.use(express.json ());
app.use(cors());
app.use("/api/opcUa",require("./routes/opcUaRouter"));


const io = require('socket.io')(server, {
    cors: {
        //origins: ['http://192.168.200.23:3001']
        origins: ['http://localhost:3001']

    }
})


const connectDB = async () => {
    try{
        await sequelize.authenticate()
        console.log('Conectado a BBDD')
    }catch(e){
        console.log('Conexion fallid', e);
        process.exit(1);
    }
}

( async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`Server run ${PORT}.`);
    })
})();


  
  // Arreglo para almacenar clientes y sesiones
   const clientSessions = [];

   async function connectToServer(serverEndpoint) {
    const { id, connectionString, socketTag, Entities } = serverEndpoint;
    let existingSession = clientSessions.find(session => session.id === id);
console.log(existingSession.id);
    if (existingSession) {
        console.log(`Ya existe una sesión para el servidor ${id}. Actualizando la sesión existente...`);
        const { client, session } = existingSession;
        try {
            await session.close(); // Cerrar la sesión existente
            console.log(`Sesión cerrada para el servidor ${id}.`);
            // Conectar nuevamente y crear una nueva sesión
            await client.connect(connectionString);
            const newSession = await client.createSession();
            existingSession.session = newSession; // Actualizar la sesión existente
            console.log(`Nueva sesión creada para el servidor ${id}.`);
        } catch (error) {
            console.error(`Error actualizando la sesión para el servidor ${id}:`, error);
            return; // Salir de la función si hay un error
        }
    } else {
        // Crear una nueva conexión y sesión
        const client = OPCUAClient.create({ endpointMustExist: false });
        try {
            await client.connect(connectionString);
            const session = await client.createSession();
            clientSessions.push({ id: id, client: client, session: session });
            console.log(`Conectado al servidor ${id}.`);
        } catch (err) {
            console.error(`Error conectando a ${connectionString}:`, err);
            return; // Salir de la función si hay un error
        }
    }

    // Configurar el intervalo para leer y emitir datos
    const intervalId = setInterval(async () => {
        let nodes_to_read = [];
        let arrayOfValues = [];

        Entities.forEach(element => {
            element.Variables.forEach(variable => {
                arrayOfValues.push(variable.ValoresPLC.dataValues);
                nodes_to_read.push({ nodeId: variable.ValoresPLC.variableString, AttributeIds: AttributeIds.Value });
            });
        });

        let max_age = 0;
        try {
            let plcsValues = await existingSession.session.read(nodes_to_read, max_age);
            let arrayPlcValuesOF = plcsValues.map(value => value.value.value);
            let totalArrayPlcValues = arrayOfValues.map((item, indice) => ({ ...item, plcValues: arrayPlcValuesOF[indice] }));
            io.emit(socketTag, { data: totalArrayPlcValues });
        } catch (readErr) {
            console.error(`Error leyendo datos del servidor ${id}:`, readErr);
            clearInterval(intervalId); // Detener el intervalo
            await tryReconnect(serverEndpoint); // Intentar reconexión
        }
    }, 5000);
    console.log(`Conectado a socket: ${socketTag}`);
}
async function tryReconnect(serverEndpoint) {
   const {id} = serverConnection
    console.log(serverEndpoint);
           console.log(`Intentando reconectar al servidor ${id}...`);
        try {

            console.log('entra al try')
            await connectToServer(serverEndpoint)
        } catch (reconnectErr) {
            console.error(`Error al intentar reconectar al servidor ${id}:`, reconnectErr);
            // Esperar un tiempo antes de intentar nuevamente la reconexión
            setTimeout(async () => {
                await tryReconnect(serverEndpoint);
            }, 5000);
        }
    }
    

let previousServerConnections = [];

  // Conectarse a todos los servidores
  async function connectToAllServers() {
    try {
        // Obtener las conexiones actuales del servidor
        const serverEndpoints = await getServerConnections();

        // Comparar con las conexiones anteriores
        const hasChanges = checkForChanges(previousServerConnections, serverEndpoints);
        previousServerConnections = serverEndpoints;
        // Actualizar las conexiones anteriores

        // Si hay cambios, realizar alguna acción
        if (hasChanges) {
            //Desconecarse de todos los clientes.
            console.log("Se encontraron cambios en la base de datos.");
        } else {
            //Llamar a la funcion normal 
            console.log("No se encontraron cambios en la base de datos.");
            await Promise.all(serverEndpoints.map(connectToServer));

        }

        // Conectar a todos los servidores
    } catch (err) {
        console.error("Error conectando a los servidores:", err);
    }
}
function checkForChanges(previousConnections, currentConnections) {
    // Convertir los arrays en objetos para facilitar la comparación
    const previousMap = arrayToObject(previousConnections);
    const currentMap = arrayToObject(currentConnections);

    // Comparar las conexiones anteriores y actuales
    const hasChanges = JSON.stringify(previousMap) !== JSON.stringify(currentMap);
    return hasChanges;
}

function arrayToObject(array) {
    return array.reduce((obj, item) => {
        obj[item.id] = item;
        return obj;
    }, {});
}
// Llamar a la función principal para iniciar la conexión con todos los servidores
  
setInterval(connectToAllServers,10000)


/*   // Arreglo para almacenar clientes y sesiones
  const clientSessions = [];

  async function connectToServer(serverEndpoint) {
      const { connectionString, socketTag, Entities } = serverEndpoint;
      const client = OPCUAClient.create({ endpointMustExist: false });
      
      try {
          await client.connect(connectionString);
          const session = await client.createSession();
          clientSessions.push({ client, session });
  
          let nodes_to_read = [];
          let arrayOfValues = [];
  
          Entities.forEach(async element => {
              element.Variables.forEach(variable => {
                  arrayOfValues.push(variable.ValoresPLC.dataValues)
                  nodes_to_read.push({ nodeId: variable.ValoresPLC.variableString, AttributeIds: AttributeIds.Value });
              });
          });
  
          // Configura el intervalo para leer y emitir datos
          setInterval(async () => {
              let max_age = 0;
              let plcsValues = await session.read(nodes_to_read, max_age);
              let arrayPlcValuesOF = [];
              plcsValues.forEach(value => {
                  arrayPlcValuesOF.push(value.value.value);
              });
              let totalArrayPlcValues = arrayOfValues.map((item, indice) => ({ ...item, plcValues: arrayPlcValuesOF[indice] }));
              io.emit(socketTag, { data: totalArrayPlcValues });
          }, 5000);
          console.log(`Conectado a socket: ${socketTag}`);
      } catch (err) {
          console.error(`Error conectando a ${connectionString}:`, err);
      }
  }
   */






   // Función para conectarse a un servidor
/*   async function connectToServer(serverEndpoint) {
    const { connectionString, socketTag, Entities } = serverEndpoint; // Extraer la propiedad endpoint del objeto
    const client = OPCUAClient.create({ endpointMustExist: false });
    try {
        await client.connect(connectionString);
        //  console.log(`Conectado a ${connectionString}`);

        const session = await client.createSession();
        clientSessions.push({ client, session });

        let nodes_to_read = [];
        let arrayOfValues = [];
        Entities.forEach(async element => {
            element.Variables.forEach(variable => {
                arrayOfValues.push(variable.ValoresPLC.dataValues)
                nodes_to_read.push({ nodeId: variable.ValoresPLC.variableString, AttributeIds: AttributeIds.Value });
            });

            io.on('connection', (socket) => {
                console.log('conectado a socket');
                setInterval(async () => {
                    let max_age = 0;
                    let plcsValues = await session.read(nodes_to_read, max_age);
                    let arrayPlcValuesOF = [];
                    plcsValues.forEach(value => {
                        arrayPlcValuesOF.push(value.value.value);
                    });
                    let totalArrayPlcValues = arrayOfValues.map((item, indice) => ({ ...item, plcValues: arrayPlcValuesOF[indice] }));
                  socket.emit(socketTag, { data: totalArrayPlcValues });

                }, 5000);
            });
        });
    } catch (err) {
        console.error(`Error conectando a ${connectionString}:`, err);
    }
}
   */



















 
/*  const endPointOPc = 'opc.tcp://192.168.200.197:49320'
const client = OPCUAClient.create({endpointMustExist: false});
 async.series([
    function(callback){
        client.connect(endPointOPc,(err)=>{
            if (err){
                console.log(`No se puede connectar al endpoint:${endPointOPc}`);
            }else{console.log("Conectado al PLC")}
            callback()
        })
    },
    function(cb){
        client.createSession((err,session)=>{
            if(err) {return}
            the_session = session
            cb()
        })
    },
    async function(){ 
        getArrayOfVariablesString().then((res)=>{
            let nodes_to_read = [];
            res.forEach(function(entry) {
              
                nodes_to_read.push({ nodeId: entry.variableString, AttributeIds: AttributeIds.Value });
           });
      
           const arrayOfValues  = res; 
           var max_age = 0;
           io.on('connection',(socket)=> {
            console.log('conectado a socket');
            setInterval(async()=>{
                let plcsValues = await the_session.read(nodes_to_read, max_age)
                let arrayPlcValuesOF  = []; 
                plcsValues.forEach(value=> {

                    arrayPlcValuesOF.push(value.value.value)


                })
            let totalArrayPlcValues = arrayOfValues.map((item, indice) => ({...item, plcValues: arrayPlcValuesOF[indice]}))
            console.log('====================================');
            console.log(totalArrayPlcValues);
            console.log('====================================');
              socket.emit('push',{data:totalArrayPlcValues });
               },5000) 
               
        })
        })
    }   
])       

  */

/* function senData(socket){
    if ( x ){
        socket.emit('data1', Array.from({length:8},() => Math.floor(Math.random()* 590) +10));
        x = !x
    }else{
        socket.emit('data2', Array.from({length:8},() => Math.floor(Math.random()* 590) +10));
        x = !x
    }
    console.log(`data is ${x}`);
    setTimeout( ()=> {
        senData(socket)
    },3000)
}
 */


