const express = require("express");
const app = express();
const cors = require("cors");
const async = require('async')
const { sequelize} = require('./models/index')
const {OPCUAClient,AttributeIds} = require("node-opcua");
const {getArrayOfVariablesString} = require('./controller/controller');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = 8080;


app.use(express.urlencoded({extended: false}));
app.use(express.json ());
app.use(cors());
app.use("/api/opcUa",require("./routes/opcUaRouter"));

io.on('connection', (socket) => {
    console.log(socket);
    console.log('user connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  })




const connectDB = async () => {
    console.log('Checkeando conexion');
    try{
        await sequelize.authenticate()
        console.log('Conexion establecida')
    }catch(e){
        console.log('Conexion fallid', e);
        process.exit(1);
    }
}

( async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    })
})();


const endPointOPc = 'opc.tcp://192.168.200.197:49320'
const client = OPCUAClient.create({endpointMustExist: false});
 async.series([
    function(callback){
        client.connect(endPointOPc,(err)=>{
            if (err){
                console.log(`No se puede connectar al endpoint:${endPointOPc}`);
            }else{console.log("Conectado")}
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
                nodes_to_read.push({ nodeId: entry, AttributeIds: AttributeIds.Value });
           });
           var max_age = 0;
           setInterval(async()=>{
            let plcsValues = await the_session.read(nodes_to_read, max_age)
            plcsValues.forEach(value=> {
                    console.log(value.value.value);
            })

           },1000)     

        })
    } 
])   

 





