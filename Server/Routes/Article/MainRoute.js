const express = require('express');
const router = express.Router();

//Middleware 
const Auth = require('../../Middleware/Auth')
const VerifiyPermissions = require('../../Middleware/VerifyPermissions')

router.get('/get/all', require('../../Controllers/Article/ArticleController').getAllArticles);
router.post('/create', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').createArticle);
router.put('/update/:slug', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').modifyArticle);
router.delete('/delete/:slug', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').deleteArticle);
router.post('/draft/', Auth, VerifiyPermissions("canManageArticle"), require('../../Controllers/Article/ArticleController').saveArticle);
router.get('/:slug', require('../../Controllers/Article/ArticleController').getArticleBySlug);



module.exports = router;