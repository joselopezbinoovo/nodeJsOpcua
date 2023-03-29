const express = require("express");
const app = express();
const cors = require("cors");
const async = require('async')
const { sequelize} = require('./models/index')
const {OPCUAServer,OPCUAClient,AttributeIds,StatusCode,TimestampsToReturn} = require("node-opcua");
const endPointOPc = 'opc.tcp://192.168.200.197:49320'
const client = OPCUAClient.create({endpointMustExist: false});
const {getArrayOfVariablesString} = require('./controller/controller');
const mqtt=require('mqtt');



app.use(express.urlencoded({extended: false}));
app.use(express.json ());
 app.use(cors());

app.use("/api/opcUa",require("./routes/opcUaRouter"));

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
const PORT = 8080;
( async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    })
})();

/* var clienMqtt  = mqtt.connect("mqtt://test.mosquitto.org",{clientId:"mqttjs01"});


clienMqtt.on('connect', function () {
    clienMqtt.subscribe('presence', function (err) {
      if (!err) {
        clienMqtt.publish('presence', 'Hello mqtt')
      }
    })
  })
  
  clienMqtt.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    clienMqtt.end()
  }) */

  const getArrayPlc = async.series([
    function(callback){
        console.log(callback);
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
    function(){ 
        let array = []
        getArrayOfVariablesString().then((res)=> {
            console.log(res)
            array = res
        })

             setInterval(async ()=>{             
                await Promise.all(array.map( async (nodeId) => {
                    let plcValue = await the_session.read({nodeId:nodeId,AttributeId: AttributeIds.Value,TimestampsToReturn:TimestampsToReturn.Both}); 
                    console.log(plcValue.value.value);
                    return plcValue.value.value
                })); 

        },1000)
    } 
]) 


/* const triggersOPs=[
    'ns=2;s=Simulation_Examples.Functions.Ramp1',
    'ns=2;s=Simulation_Examples.Functions.Ramp2',
    'ns=2;s=Simulation_Examples.Functions.Ramp3',
    'ns=2;s=Simulation_Examples.Functions.Ramp4',
    'ns=2;s=Simulation_Examples.Functions.Ramp5',
    'ns=2;s=Simulation_Examples.Functions.Ramp6',
    'ns=2;s=Simulation_Examples.Functions.Ramp7',
    'ns=2;s=Simulation_Examples.Functions.Ramp8',
    'ns=2;s=Simulation_Examples.Functions.Random1',
    'ns=2;s=Simulation_Examples.Functions.Random2',
    'ns=2;s=Simulation_Examples.Functions.Random3',
    'ns=2;s=Simulation_Examples.Functions.Random4',
    'ns=2;s=Simulation_Examples.Functions.Random5',
    'ns=2;s=Simulation_Examples.Functions.Random6',
    'ns=2;s=Simulation_Examples.Functions.Random7',
    'ns=2;s=Simulation_Examples.Functions.Random8',
    'ns=2;s=Simulation_Examples.Functions.Sine1',
    'ns=2;s=Simulation_Examples.Functions.Sine2',
    'ns=2;s=Simulation_Examples.Functions.Sine3',
    'ns=2;s=Simulation_Examples.Functions.Sine4',
    'ns=2;s=Simulation_Examples.Functions.User1',
    'ns=2;s=Simulation_Examples.Functions.User2',
    'ns=2;s=Simulation_Examples.Functions.User3',
    'ns=2;s=Simulation_Examples.Functions.User4'
  ] */


/* async.series([
    function(callback){
        console.log(callback);
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
    function(callback){ 
       let array = []
        getArrayOfVariablesString().then((res)=> {
            array = res
        }) 
        var err;    
        var nodes_to_read = [  ];
             
                triggersOPs.forEach(function(entry) {
                    nodes_to_read.push({ nodeId: entry, AttributeIds: AttributeIds.Value });
               });
               console.log(nodes_to_read);
               var max_age = 0;
               the_session.read(nodes_to_read, max_age, function(err,nodes_to_read,dataValues) {
                   if (!err) {
                       for(var i;i<dataValues.length;i++) {
                              console.log(entry , dataValues[i].toString());
                        }
                   }
                   // now callback is called once
                   callback(err);
             });
    } 
])   */

 
//module.exports = getArrayPlc




