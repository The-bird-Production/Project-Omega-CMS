import { getTranslations } from "next-intl/server";
import { Link } from "../../../i18n/navigation";
import Layout from "../../components/layout/MainLayout";
import ArticleFilters from "../../components/article/ArticleFilters";
import ArticlePagination from "../../components/article/ArticlePagination";
import ArticleCard from "../../components/article/ArticleCard";

export async function generateMetadata() {
  const t = await getTranslations("ArticleList");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function fetchArticles(searchParams, locale) {
  const params = new URLSearchParams();
  params.set("locale", locale);
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.tag) params.set("tag", searchParams.tag);
  params.set("page", searchParams.page || "1");
  params.set("pageSize", "12");

  return fetchJson(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/search?${params.toString()}`);
}

async function fetchFilterOptions() {
  const [categories, tags] = await Promise.all([
    fetchJson(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/categories`).catch(() => ({ data: [] })),
    fetchJson(`${process.env.NEXT_PUBLIC_BACKEND_URL}/article/tags`).catch(() => ({ data: [] })),
  ]);
  return { categories: categories.data ?? [], tags: tags.data ?? [] };
}

export default async function ArticleListPage(props) {
  const searchParams = await props.searchParams;
  const { locale } = await props.params;
  const t = await getTranslations("ArticleList");

  let result;
  let error;
  try {
    result = await fetchArticles(searchParams, locale);
  } catch (err) {
    error = err;
  }

  const { categories, tags } = await fetchFilterOptions();

  if (error) {
    return (
      <Layout pathname="/article">
        <div className="container mt-4">
          <div className="alert alert-danger">{t("loadError")} {String(error.message || error)}</div>
        </div>
      </Layout>
    );
  }

  const articles = result?.data ?? [];
  const page = result?.page ?? 1;
  const totalPages = result?.totalPages ?? 1;

  return (
    <Layout pathname="/article">
      <div className="container mt-4">
        <h1>{t("title")}</h1>
        <ArticleFilters categories={categories} tags={tags} />
        {articles.length === 0 ? (
          <p>{t("noResults")}</p>
        ) : (
          <div className="omega-article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} href={`/article/${a.slug}`} buttonLabel={t("readMore")} LinkComponent={Link} />
            ))}
          </div>
        )}
        <ArticlePagination page={page} totalPages={totalPages} searchParams={searchParams} />
      </div>
    </Layout>
  );
}
