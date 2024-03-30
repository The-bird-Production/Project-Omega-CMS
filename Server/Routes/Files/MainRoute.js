const express = require('express')
const router = express.Router() ; 

//Security MiddleWare
const VerifyToken = require('../../Middleware/VerifyToken')
const AuthenticateSession = require('../../Middleware/AuthenticateSession');

//Controller
const UpdateFile = require('../../Controllers/Files/UpdateFileController')
const CreateFile = require('../../Controllers/Files/CreateFileController');
const DeleteFIle = require('../../Controllers/Files/DeleteFileController');

router.post('/new', VerifyToken, AuthenticateSession, CreateFile)
router.put('/update/:id', VerifyToken,AuthenticateSession, UpdateFile)
router.delete('/delete/:id', VerifyToken, AuthenticateSession, DeleteFIle)



module.exports = router