const express = require('express')
const router = express.Router()
const { Register } =require('../../Controllers/Auth/RegisterController')

router.post('/', Register); 


module.exports = router