import Link from "next/link";
import Layout from "../components/layout/MainLayout";
import ArticleFilters from "../components/article/ArticleFilters";
import ArticlePagination from "../components/article/ArticlePagination";

export const metadata = {
  title: "Articles",
  description: "Tous les articles publiés.",
};

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function fetchArticles(searchParams) {
  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.tag) params.set("tag", searchParams.tag);
  params.set("page", searchParams.page || "1");
  params.set("pageSize", "10");

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

  let result;
  let error;
  try {
    result = await fetchArticles(searchParams);
  } catch (err) {
    error = err;
  }

  const { categories, tags } = await fetchFilterOptions();

  if (error) {
    return (
      <Layout currentPage={"ArticleList"}>
        <div className="container mt-4">
          <div className="alert alert-danger">Erreur lors du chargement des articles : {String(error.message || error)}</div>
        </div>
      </Layout>
    );
  }

  const articles = result?.data ?? [];
  const page = result?.page ?? 1;
  const totalPages = result?.totalPages ?? 1;

  return (
    <Layout currentPage={"ArticleList"}>
      <div className="container mt-4">
        <h1>Articles</h1>
        <ArticleFilters categories={categories} tags={tags} />
        {articles.length === 0 ? (
          <p>Aucun article ne correspond à votre recherche.</p>
        ) : (
          <div className="list-group mb-4">
            {articles.map((a) => (
              <Link href={`/article/${a.slug}`} key={a.id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">{a.title}</h5>
                  <small>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : ""}</small>
                </div>
                <p className="mb-1">{(a.body || "").replace(/<[^>]+>/g, "").slice(0, 200)}{(a.body || "").length > 200 ? "..." : ""}</p>
                <small>
                  By {a.authorId || 'unknown'}
                  {a.category ? ` · ${a.category}` : ""}
                  {a.tags ? ` · ${a.tags}` : ""}
                </small>
              </Link>
            ))}
          </div>
        )}
        <ArticlePagination page={page} totalPages={totalPages} searchParams={searchParams} />
      </div>
    </Layout>
  );
}
