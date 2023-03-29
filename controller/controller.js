const opcUa = require('../modelos/opcUaModel');
const async = require('async')

const {
    OPCUAServer,
    OPCUAClient,
    AttributeIds,
    StatusCode,
    TimestampsToReturn
} = require("node-opcua");
const endPointOPc = 'opc.tcp://192.168.200.197:49320'
const client = OPCUAClient.create({
    endpointMustExist: false
});
const getAll = async (req, res) => {

    try {

        const OpcuA = await opcUa.findAll();
        res.status(200).json({
            ok: true,
            msg: 'Datos obtenidos',
            data: OpcuA
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error',
        })
    }
}

const getOne = async (req, res) => {

    try {
        const id = req.params.id
        const OpcUaById = await opcUa.findOne({
            where: {
                id: id
            }
        })
        const nodeId = OpcUaById.dataValues.variableString;

        const cliet = OPCUAClient.create();
        cliet.on("backoff", (retry, delay) => {
            console.log("Intentado conectar ", endPointOPc, "attempt", retry);
        });

        await client.connect(endPointOPc)
        console.log("Connect to", (endPointOPc));
        const session = await  client.createSession();
        let plcValues = await session.read({nodeId:nodeId,AttributeId: AttributeIds.Value,TimestampsToReturn:TimestampsToReturn.Both});
        const plcValue= plcValues.value.value 

        res.status(200).json({
            ok: true,
            msg: 'Dato recibido',
            data: plcValue
        })

    await session.close(); 
    await client.disconnect();

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error',
        })

    }
}



const opc = async (req, res) => {
    
    try {
        /*     let node_to_read=[]
    array.forEach((entry)=> {
     node_to_read.push({nodeId:entry,AttributeId: AttributeIds.Value})
    })
    console.log(node_to_read); 

    let plcValue = await session.read(node_to_read,max_age,function(err,node_to_read,dataValues){
        if (!err) {
            for(var i;i<dataValues.length;i++) {
                   console.log(entry , dataValues[i].toString());
             }
        }
    }) */
       
        const myOpcVariable = await opcUa.findAll()

        const cliet = OPCUAClient.create();
        cliet.on("backoff", (retry, delay) => {
            console.log("Intentado conectar ", endPointOPc, "attempt", retry);
        })

        await client.connect(endPointOPc)
        console.log("Connect to", (endPointOPc));
        const session = await  client.createSession();


        const array = []
        myOpcVariable.forEach(element => {
        array.push(element.dataValues.variableString)
       });
         

        let ArrayplcValues = await Promise.all(array.map( async (nodeId) => {
        let plcValue = await session.read({nodeId:nodeId,AttributeId: AttributeIds.Value,TimestampsToReturn:TimestampsToReturn.Both}); 
        return plcValue.value.value
    }));  //montar en segundo plano   

       const arrayOfVariableNames=[]
        myOpcVariable.forEach(element => {
            arrayOfVariableNames.push({name:element.dataValues.variableName});
        });
        const ValueObject = arrayOfVariableNames.map((item,indice) => ({...item,valuePLC:ArrayplcValues[indice] }))
      
 
        res.status(200).json({
            msg: 'FUNCIONA',
            data: ValueObject
        })

    await session.close(); 
    await client.disconnect(); 
    
    } catch (error) {
        res.status(500).json({
            error: error,
            msg: 'No funciona'
        })
    }
}

const getArrayOfVariablesString = async()=> {
    const myOpcVariable = await opcUa.findAll()
    const array = []
    myOpcVariable.forEach(element => {
    array.push(element.dataValues.variableString)
});

return array

} 
module.exports = {
    getAll,
    getOne,
    opc,
    getArrayOfVariablesString
}