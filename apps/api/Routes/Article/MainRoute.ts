import * as express from "express";
import VerifiyPermissions from "../../Middleware/VerifyPermissions.js";
import { getAllArticles, createArticle, modifyArticle, deleteArticle, saveDraft, getArticleBySlug, getAllDrafts, deleteArticleDraft, getDraftById, searchArticles, getArticleCategories, getArticleTags } from "../../Controllers/Article/ArticleController.js";
const router = express.Router();
router.get('/get/all', getAllArticles);
router.get('/search', searchArticles);
router.get('/categories', getArticleCategories);
router.get('/tags', getArticleTags);
router.post('/create', VerifiyPermissions("admin"), createArticle);
router.put('/update/:slug', VerifiyPermissions("admin"), modifyArticle);
router.delete('/delete/:slug', VerifiyPermissions("admin"), deleteArticle);
router.post('/draft/', VerifiyPermissions("admin"), saveDraft);

router.get('/:slug', getArticleBySlug);

//Drafts
router.get('/get/all/drafts', VerifiyPermissions("admin"), getAllDrafts);
router.delete('/delete/draft/:slug', VerifiyPermissions("admin"), deleteArticleDraft);
router.get('/draft/:id', VerifiyPermissions("admin"), getDraftById);
export default router;
