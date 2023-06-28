const express = require("express");
const app = express();
const cors = require("cors");
const async = require('async')
const server = require('http').Server(app);
const PORT = 8080;


const { sequelize} = require('./models/index')
const {OPCUAClient,AttributeIds} = require("node-opcua");

const {getArrayOfVariablesString} = require('./controller/controller');



app.use(express.urlencoded({extended: false}));
app.use(express.json ());
app.use(cors());
app.use("/api/opcUa",require("./routes/opcUaRouter"));


const io = require('socket.io')(server, {
    cors: {
        origins: ['http://localhost:3000']
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


const endPointOPc = 'opc.tcp://192.168.200.197:49320'
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
                    //console.log(value.value.value);
                    arrayPlcValuesOF.push(value.value.value)
                })

            let totalArrayPlcValues = arrayOfValues.map((item, indice) => ({...item, plcValues: arrayPlcValuesOF[indice]}))
              socket.emit('push',{data:totalArrayPlcValues });
               },1000) 
        })
        })
    } 
])    

 





