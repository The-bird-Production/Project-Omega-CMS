const { prisma } = require("../../lib/prisma");

exports.createArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;

    // Validate input
    if (!title || !content || !authorId) {
      return res
        .status(400)
        .json({ message: "Title, content, and authorId are required" });
    }

    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        content,
        authorId,
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
    const { id } = req.params;
    const { title, content } = req.body;
    // Validate input
    if (!title && !content) {
      return res.status(400).json({ message: "Title or content is required" });
    }
    // Update article
    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
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
    const { id } = req.params;
    const { title, content } = req.body;
    // Validate input
    if (!title && !content) {
      return res.status(400).json({ message: "Title or content is required" });
    }

    if (!id) {
      const article = await prisma.articleSaved.create({
        data: {
          title,
          content,
          image: req.file ? req.file.path : null,
        },
      });
      return res.status(201).json(article);
    }
    // Save article
    const article = await prisma.articleSaved.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
      },
    });
    res.status(200).json(article);
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getArticle = async (req, res) => {
  try {
    const currentDate = new Date();
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: {
        id: parseInt(id),
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
  try {
    const articles = await prisma.article.findMany({
      where: { publishedAt: (publishedAt.getTime() <= currentDate.getTime() ? publishedAt : null && { lte: new Date() })  },
    });
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error retrieving articles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getArticleBySlug = async (req, res) => {
  try {
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
    console.error("Error retrieving article by slug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
