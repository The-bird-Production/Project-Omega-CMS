import * as express from "express";
import VerifiyPermissions from "../../Middleware/VerifyPermissions.js";
import { getAllArticles } from "../../Controllers/Article/ArticleController.js";
import { createArticle } from "../../Controllers/Article/ArticleController.js";
import { modifyArticle } from "../../Controllers/Article/ArticleController.js";
import { deleteArticle } from "../../Controllers/Article/ArticleController.js";
import { saveDraft} from "../../Controllers/Article/ArticleController.js";
import { getArticleBySlug } from "../../Controllers/Article/ArticleController.js";
import { getAllDrafts } from "../../Controllers/Article/ArticleController.js";
import { deleteArticleDraft } from "../../Controllers/Article/ArticleController.js";
import { getDraftById } from "../../Controllers/Article/ArticleController.js";
const router = express.Router();
router.get('/get/all', { getAllArticles }.getAllArticles);
router.post('/create', VerifiyPermissions("admin"), { createArticle }.createArticle);
router.put('/update/:slug',VerifiyPermissions("admin"), { modifyArticle }.modifyArticle);
router.delete('/delete/:slug', VerifiyPermissions("admin"), { deleteArticle }.deleteArticle);
router.post('/draft/', VerifiyPermissions("admin"), { saveDraft }.saveDraft);

router.get('/:slug', { getArticleBySlug }.getArticleBySlug);

//Drafts
router.get('/get/all/drafts', VerifiyPermissions("admin"), { getAllDrafts }.getAllDrafts);
router.delete('/delete/draft/:slug', VerifiyPermissions("admin"), { deleteArticleDraft }.deleteArticleDraft);
router.get('/draft/:id', VerifiyPermissions("admin"), { getDraftById }.getDraftById);
export default router;
