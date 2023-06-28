const opcUa = require('../modelos/opcUaModel');

const {
    OPCUAClient,
    AttributeIds,
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

        const myOpcVariable = await opcUa.findAll()
            console.log(myOpcVariable);
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
       let nodes_to_read=[]; 
       array.forEach((nodeId)=>{
            nodes_to_read.push({nodeId:nodeId,AttributeIds: AttributeIds.Value})
       })
       let max_age = 0; 
       let plcsValues = await session.read(nodes_to_read, max_age)

       let ArrayplcValues = []
        plcsValues.forEach((index)=>{
            console.log(index.value.value);
            return ArrayplcValues.push(index.value.value)
        })

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
/*      var obj = {variableString:'',variableName:'',id_variable:0};
     console.log('====================================');
     console.log(obj);
     console.log('===================================='); */
  /*   let array = myOpcVariable.forEach(element => {
        obj.variableString = element.dataValues.variableString;
        obj.variableName = element.dataValues.variableName;
        obj.id_variable = element.dataValues.id_variable
    //array.push(obj)
}); */
for(const [key, value] of Object.entries(myOpcVariable)){
    array.push(value.dataValues)
  }
return array
} 
module.exports = {
    getAll,
    getOne,
    opc,
    getArrayOfVariablesString
}