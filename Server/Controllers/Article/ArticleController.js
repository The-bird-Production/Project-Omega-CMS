const { prisma } = require("../../lib/prisma");

exports.createArticle = async (req, res) => {
  try {
    const { title, body, authorId, slug } = req.body;

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
        image: req.file ? req.file.path : null,
        publishedAt: req.body.publishedAt || new Date(), // Set the current date as publishedAt
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.modifyArticle = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, body } = req.body;
    // Validate input
    if (!title && !content) {
      return res.status(400).json({ message: "Title or content is required" });
    }
    // Update article
    const article = await prisma.article.update({
      where: { slug: slug },
      data: {
        title,
        body,
      },
    });
    res.status(200).json(article);
  } catch (error) {
    console.error("Error modifying article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveArticle = async (req, res) => {
  try {
    const { draftId, title, content, slug, authorId } = req.body;

    const article = await prisma.articleSaved.upsert({
      where: { draftId },
      update: {
        title,
        body: content,
        slug,
        updatedAt: new Date(),
      },
      create: {
        draftId,
        title,
        body: content,
        slug,
        authorId,
      },
    });

    res.json(article);
  } catch (err) {
    console.error("Error saving article:", err);
    res.status(500).json({ error: "Failed to save article" });
  }
};


exports.deleteArticle = async (req, res) => {
  try {
    const { slug } = req.params;

    await prisma.article.delete({
      where: { id: parseInt(slug) },
    });
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const currentDate = new Date();
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: {
        slug,
        publishedAt:
          publishedAt.getTime() <= currentDate.getTime() ? publishedAt : null,
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
exports.getAllArticles = async (req, res) => {
  const currentDate = new Date();
  try {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { lte: currentDate } },
    });
    if (!articles) {
      return res.status(404).json({ message: "No articles found" });
    }
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getArticleBySlug = async (req, res) => {
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
