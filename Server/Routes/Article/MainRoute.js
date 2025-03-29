const express = require('express');
const router = express.Router();

//Middleware 
const Auth = require('../../Middleware/Auth')
const VerifiyPermissions = require('../../Middleware/VerifyPermissions')


router.post('/create', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').createArticle);
router.put('/update/:id', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').modifyArticle);
router.get('/all', Auth, VerifiyPermissions, require('../../Controllers/Article/ArticleController').getAllArticles);
router.get('/:slug', Auth, VerifiyPermissions, require('../../Controllers/Article/ArticleController').getArticleBySlug);
router.delete('/delete/:id', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').deleteArticle);
router.post('/save/:id', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').saveArticle);



module.exports = router;