const express = require("express");
const app = express();
const cors = require("cors");
const async = require('async')
const server = require('http').Server(app);
const PORT = 8082;


const { sequelize} = require('./models/index')
const {OPCUAClient,AttributeIds} = require("node-opcua");
const opcua = require('node-opcua')
const {getArrayOfVariablesString,getServerConnections} = require('./controller/controller');



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

  // Función para conectarse a un servidor
  async function connectToServer(serverEndpoint) {
    const { connectionString ,Entities} = serverEndpoint; // Extraer la propiedad endpoint del objeto
    
    const client = OPCUAClient.create({endpointMustExist: false});
    try {
      await client.connect(connectionString);
      console.log(`Conectado a ${connectionString}`);
      
      const session = await client.createSession();
      clientSessions.push({ client, session });

      let nodes_to_read = []; 
      Entities.forEach(async element => {
        element.Variables.forEach(variable => {
           console.log( variable.ValoresPLC.variableString)
           nodes_to_read.push({ nodeId: variable.ValoresPLC.variableString, AttributeIds: AttributeIds.Value });
        })

        let max_age  = 0

        let plcsValues = await session.read(nodes_to_read, max_age)
        let arrayPlcValuesOF  = []; 
        plcsValues.forEach(value=> {
            console.log('====================================');
            console.log(value.value.value);
            console.log('====================================');

            arrayPlcValuesOF.push(value.value.value)
        })
      });




    } catch(err) {
      console.error(`Error conectando a ${connectionString}:`, err);
    }
  }
  
  // Conectarse a todos los servidores
  async function connectToAllServers() {
    try {
        const serverEndpoints = await getServerConnections(); // Obtener los endpoints de los servidores
        // Conectar a todos los servidores
        await Promise.all(serverEndpoints.map(connectToServer));
    } catch (err) {
        console.error("Error conectando a los servidores:", err);
    }
}
// Llamar a la función principal para iniciar la conexión con todos los servidores
connectToAllServers();
 



























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

       
              socket.emit('push',{data:totalArrayPlcValues });
               },5000) 
               
        })
        })
    }   
])     */

 

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


