import type { Request, Response } from "express";
import { prisma } from "@omega/db";

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, body, authorId, slug, category, tags } = req.body;
    // Validate input
    if (!title || !body || !authorId || !slug) {
      return res
        .status(400)
        .json({ message: "Title, content, and authorId are required" });
    }
    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        body,
        authorId,
        slug,
        category: category || null,
        tags: tags || null,
        image: (req as any).file ? (req as any).file.path : null,
        publishedAt: req.body.publishedAt || new Date(), // Set the current date as publishedAt
      },
    });
    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const modifyArticle = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, body, category, tags } = req.body;
    // Validate input
    if (!title && !body) {
      return res.status(400).json({ message: "Title or content is required" });
    }
    // Update article
    const article = await prisma.article.update({
      where: { slug: slug },
      data: {
        title,
        body,
        category: category || null,
        tags: tags || null,
      },
    });
    res.status(200).json(article);
  } catch (error) {
    console.error("Error modifying article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const saveDraft = async (req: Request, res: Response) => {
  try {
    const { draftId, title, body, authorId, slug } = req.body;

    // Vérification des champs requis
    if (!title && !body) {
      return res.status(400).json({ message: "Title or body is required" });
    }

    if (!draftId) {
      return res.status(400).json({ message: "Draft ID is required" });
    }

    // Cherche le brouillon existant par draftId
    const existingDraft = await prisma.articleSaved.findFirst({
      where: { draftId },
    });

    let draft;
    if (existingDraft) {
      // Si existe, update
      draft = await prisma.articleSaved.update({
        where: { id: existingDraft.id },
        data: {
          title,
          body,
          authorId,
          slug,
        },
      });
    } else {
      // Sinon, create
      draft = await prisma.articleSaved.create({
        data: {
          draftId,
          title,
          body,
          authorId,
          slug,
        },
      });
    }

    res.status(200).json(draft);
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    await prisma.article.delete({
      where: { slug: slug },
    });
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteArticleDraft = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    await prisma.articleSaved.delete({
      where: { draftId: slug },
    });
    res.status(200).json({ message: "Article draft deleted successfully" });
  } catch (error) {
    console.error("Error deleting article draft:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getDraftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = await prisma.articleSaved.findUnique({
      where: {
        draftId: id,
      },
    });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error("Error retrieving article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllArticles = async (req: Request, res: Response) => {
  const currentDate = new Date();
  try {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { lte: currentDate } },
    });

    if (articles.length === 0) {
      return res.status(404).json({ message: "No articles found" });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllDrafts = async (req: Request, res: Response) => {
  try {
    const articles = await prisma.articleSaved.findMany();

    if (articles.length === 0) {
      return res.status(404).json({ message: "No articles found" });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const searchArticles = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const tag = typeof req.query.tag === "string" ? req.query.tag.trim() : "";
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string, 10) || 10));

    const where: Record<string, unknown> = { publishedAt: { lte: currentDate } };
    if (category) where.category = category;
    if (tag) where.tags = { contains: tag };
    if (q) {
      where.OR = [{ title: { contains: q } }, { body: { contains: q } }];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    res.status(200).json({
      data: articles,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Error searching articles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getArticleCategories = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const rows = await prisma.article.findMany({
      where: { publishedAt: { lte: currentDate }, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    const categories = rows.map((r: { category: string | null }) => r.category as string).sort();
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Error retrieving article categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getArticleTags = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const rows = await prisma.article.findMany({
      where: { publishedAt: { lte: currentDate }, tags: { not: null } },
      select: { tags: true },
    });
    const tagSet = new Set<string>();
    for (const row of rows) {
      (row.tags ?? "")
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
        .forEach((t: string) => tagSet.add(t));
    }
    res.status(200).json({ data: Array.from(tagSet).sort() });
  } catch (error) {
    console.error("Error retrieving article tags:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getArticleBySlug = async (req: Request, res: Response) => {
  const currentDate = new Date();
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: {
        slug,
        publishedAt: { lte: currentDate },
      },
    });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error("Error retrieving article by slug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
