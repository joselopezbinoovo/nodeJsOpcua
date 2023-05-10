let express = require('express'); 
let router = express.Router(); 


const {getAll,getOne, opc} =require('../controller/controller')



router.get('/getAll',getAll); 
router.get('/getOne/:id',getOne);
router.get('/getOpc',opc);


module.exports = router;