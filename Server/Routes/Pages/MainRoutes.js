const express = require('express')
const router = express.Router()


//Security MiddleWare 

const Auth = require('../../Middleware/Auth')
const VerifyPermissions = require('../../Middleware/VerifyPermissions')

//Controllers 




module.exports = router 