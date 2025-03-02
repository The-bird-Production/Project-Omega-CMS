const express = require('express')
const router = new express.Router()
const VerifyPermissions = require('../../Middleware/VerifyPermissions')
const Auth = require('../../Middleware/Auth')
const AddLogs = require('../../Functions/AddLogs')

const { getAllRedirects, getSpecificRedirect, addRedirect, deleteRedirect } = require('../../Controllers/Redirect/RedirectController')


router.post('/add', Auth, VerifyPermissions('canManageRedirects'), AddLogs('Add Redirect', 'green'), addRedirect)
router.get('/all', Auth, VerifyPermissions('canManageRedirects'), getAllRedirects)
router.get('/get/:slug', getSpecificRedirect)
router.delete('/delete/:id', Auth, VerifyPermissions('canManageRedirects'), AddLogs('Delete Redirect', 'red'), deleteRedirect)



module.exports = router






