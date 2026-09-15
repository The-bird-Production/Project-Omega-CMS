import Layout from "../../components/layout/MainLayout";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import BlockContent from "../../components/BlockContent";
import { blocksToPlainText } from "../../../lib/blocks/text";

async function fetchArticle(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Article fetch failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return { error: err };
  }
}

// Génère des métadonnées SEO pour la page d'article (Next.js App Router)
export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;
  const t = await getTranslations("ArticleDetail");
  try {
    const article = await fetchArticle(slug);
    if (!article || article.error) {
      return {
        title: t("notFound"),
        description: t("notFound"),
      };
    }

    const text = blocksToPlainText(article.body);
    const description = (text && text.length > 160) ? `${text.slice(0, 157)}...` : text;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const pageUrl = siteUrl ? `${siteUrl.replace(/\/$/, "")}/article/${encodeURIComponent(slug)}` : undefined;

    return {
      title: article.title || "Article",
      description: description || article.title || "Article",
      alternates: pageUrl ? { canonical: pageUrl } : undefined,
      openGraph: {
        title: article.title || "Article",
        description: description || article.title || "Article",
        url: pageUrl,
        images: article.image ? [article.image] : undefined,
      },
      twitter: {
        card: article.image ? "summary_large_image" : "summary",
        title: article.title || "Article",
        description: description || article.title || "Article",
        images: article.image ? [article.image] : undefined,
      },
      robots: {
        index: true,
        follow: true,
      },
      // You can add more fields: authors, metadataBase, alternates, etc.
    };
  } catch (e) {
    return {
      title: "Article",
      description: "Article",
    };
  }
}

export default async function ArticlePage(props) {
  const params = await props.params;
  const { slug } = params;
  const data = await fetchArticle(slug);
  const t = await getTranslations("ArticleDetail");

  if (data && data.error) {
    return (
      <Layout currentPage={"ArticleDetail"}>
        <div className="container mt-4">
          <div className="alert alert-danger">{t("loadError")} {String(data.error.message || data.error)}</div>
        </div>
      </Layout>
    );
  }

  const article = data;
  if (!article || Object.keys(article).length === 0) {
    return (
      <Layout currentPage={"ArticleDetail"}>
        <div className="container mt-4">
          <h2>{t("notFound")}</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage={"ArticleDetail"}>
      <div className="container mt-4">
        <h1>{article.title}</h1>
        <p className="text-muted">{t("publishedOn")} {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : ""}</p>
        {article.image ? (
          // Next/Image requires a remote pattern or loader configured; use a simple img fallback to be safe
          <img src={article.image} alt={article.title} className="img-fluid mb-3" />
        ) : null}
        <BlockContent body={article.body} />
      </div>
    </Layout>
  );
}
