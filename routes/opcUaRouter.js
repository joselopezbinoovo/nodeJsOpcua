let express = require('express'); 
let router = express.Router(); 


const {getAll,getOne, opc,getArrayOfVariablesString} =require('../controller/controller')



router.get('/getAll',getArrayOfVariablesString); 
router.get('/getOne/:id',getOne);
router.get('/getOpc',opc);


module.exports = router;