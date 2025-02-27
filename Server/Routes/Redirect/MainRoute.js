const express = require('express')
const router = new express.Router()
const VerifyPermissions = require('../../Middleware/VerifyPermissions')
const Auth = require('../../Middleware/Auth')
const AddLogs = require('../../Functions/AddLogs')

const { getAllRedirects, getSpecificRedirect, addRedirect } = require('../../Controllers/Redirect/RedirectController')


router.post('/add', Auth, VerifyPermissions('canAddRedirects'), AddLogs('Add Redirect', 'green'), addRedirect)
router.get('/all', Auth, VerifyPermissions('canGetRedirects'), getAllRedirects)
router.get('/get/:slug', Auth, VerifyPermissions('canGetRedirects'), getSpecificRedirect)



module.exports = router






