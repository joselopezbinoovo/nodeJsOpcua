let express = require('express'); 
let router = express.Router(); 


const {getOne, opc,getArrayOfVariablesString,getServerConnectionsPrueba} =require('../controller/controller')



router.get('/getAll',getArrayOfVariablesString); 
router.get('/getOne/:id',getOne);
router.get('/getOpc',opc);
router.get('/getServerConn',getServerConnectionsPrueba)


module.exports = router;